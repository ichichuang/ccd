# Project Protocol: Enterprise Vue 3 Architecture

> **目标读者：AI**。本文档是 Cursor 与 Antigravity 的**单一真理来源（SSOT）**。AI 在代码生成前必须阅读并严格遵循。

## 0. 进一步阅读（底层系统 SSOT 索引）

- `docs/BUILD_SYSTEM.md`：构建系统与自动导入（为什么 `ref/computed` 可以不 import）
- `docs/ENV_AND_RUNTIME.md`：环境变量与运行时行为（dev/prod 差异、proxy/timeout）
- `docs/TYPESCRIPT_AND_LINTING.md`：TS 项目引用与 ESLint（自动导入 globals、生成 d.ts 的纳入）
- `docs/VUE_TEMPLATE_ANTIPATTERNS.md`：Vue 模板反模式（多语句内联处理器、模板中 TS 语法、readonly 数组 includes）
- `docs/UNOCSS_AND_ICONS.md`：UnoCSS 语义类与图标体系（iconify + custom SVG + safelist）
- `docs/PROJECT_PROTOCOL.md` §11 + `.cursor/rules/22-layouts.mdc`：Layouts 系统（LayoutMode、AdminLayoutMode、布局壳扩展）
- `docs/ADAPTIVE_LAYOUT.md`：布局适配系统（PC/Tablet/Mobile、断点、有效显隐、userAdjusted）
- `docs/PROJECT_PROTOCOL.md` §5.1 + `.cursor/rules/24-tsx-rendering.mdc`：TSX 渲染规范（程序化渲染用 TSX，禁止 h()）
- `docs/DIALOG_COMPONENT.md`：PrimeDialog 二次封装（useDialog、便捷方法、高级用法）
- `docs/DataTable_COMPONENT.md`：DataTable 表格封装（列配置、API、分页/无限滚动、选择、导出、列持久化）
- `docs/SCHEMA_FORM_COMPONENT.md`：SchemaForm 表单组件（Schema 驱动、useSchemaForm、动态字段、分步/分组）
- `docs/TOAST_AND_MESSAGE.md`：全局 Toast / Message（window.$toast、window.$message，非组件环境轻量通知）
- `docs/TOAST_UI_OVERRIDES.md`：Toast 样式覆盖说明（居中 Message、关闭按钮位置、内边距）
- `docs/AUTH_AND_LOGIN_FLOW.md`：登录与鉴权流程（登录/登出、路由守卫、401、动态路由、存储清理）

## 1. 技术栈核心 (Tech Stack)

- **Framework:** Vue 3.5+（仅允许 Script Setup）
- **Language:** TypeScript（严格模式；**业务代码禁止 `any`**，边界封装层允许受控例外）
- **Build:** Vite 7
- **Package Manager:** pnpm
  - 执行 install/dev/build/lint 等命令时，**优先使用 pnpm**（如 `pnpm install`、`pnpm dev`、`pnpm build`）；若环境无 pnpm 再使用 npm
  - AI 生成命令/文档时：默认输出 `pnpm xxx`，不要默认输出 `npm run xxx`
- **Styling:** UnoCSS（Utility-First）。**禁止在 `<style>` 中写常规布局/间距/颜色**
- **UI Lib:** PrimeVue（Unstyled/PassThrough 优先，样式用 UnoCSS 或 `pt`）
- **Network:** Alova.js（通过 `@/utils/http`）。**禁止在业务代码中直接使用 axios/fetch**
- **State:** Pinia

## 1.1 PrimeVue 使用策略 (UI Component Policy)

- **组件选择优先级（从高到低）：**
  1. PrimeVue 组件（结合 UnoCSS 类与 `pt` 配置）
  2. 项目内的通用组件（`src/components/**`）
  3. 原生 HTML 元素（仅用于极轻量、非交互性场景）

- **强制规则（Must）：**
  - 表单字段（输入/选择/日期/开关）：
    - **多字段、需校验/分步/分组/动态 schema**：MUST 使用 SchemaForm + useSchemaForm（见 `docs/SCHEMA_FORM_COMPONENT.md`）。
    - 简单 1–2 个字段：直接使用 PrimeVue 组件：`<InputText>` / `<Password>` / `<InputNumber>` / `<Checkbox>` / `<RadioButton>` / `<Dropdown>` / `<MultiSelect>` / `<Calendar>` / `<ToggleSwitch>` 等。
  - 操作按钮：
    - 使用 `<Button>` 作为主要/次要操作按钮，而不是手写 `<button>` 样式。
  - 列表/表格：
    - 交互性数据列表优先使用 **DataTable**（`@/components/DataTable`），详见 `docs/DataTable_COMPONENT.md`；避免从零写 `<table>` 或裸用 PrimeVue DataTable 实现分页/排序/筛选/导出等复杂逻辑。
  - 弹窗/抽屉：
    - 自定义弹窗、反馈提示、确认对话框优先使用 `useDialog()`（见 `docs/DIALOG_COMPONENT.md`）。侧边抽屉使用 `<Sidebar>`。禁止用 `position: fixed` 的 div 临时拼装。
  - 消息/确认：
    - **组件内**轻量通知：可使用 PrimeVue `useToast()`。
    - **非组件环境**（如 HTTP 拦截器、全局错误处理）：使用 `window.$toast` / `window.$message`（见 `docs/TOAST_AND_MESSAGE.md`、`docs/TOAST_UI_OVERRIDES.md`）。禁止在业务中自建全局通知系统。

- **样式与扩展：**
  - PrimeVue 的外观定制必须通过：
    - `class="..."` 中使用 UnoCSS 语义类；以及/或者
    - `pt`（PassThrough）配置对象来控制内部结构 class。
  - 仅当 UnoCSS + `pt` 无法覆盖的极端情况，才允许在 `<style lang="scss" scoped">` 中使用 `:deep()` 做适配，且仍禁止写死布局/间距/颜色/字体大小/圆角等硬编码值。

## 2. 架构铁律 (Architecture Rules)

- **逻辑与 UI 分离**
  - 业务逻辑必须抽离到 `src/hooks/`（Composables）
  - 组件（`src/components/`）只负责渲染与简单 UI 状态
  - 页面（`src/views/`）仅作容器，组合 hooks + components
- **类型安全**
  - **业务代码严禁 `any`**。类型定义优先放在 `src/types/` 或与文件同级（colocated）
  - **边界封装层允许受控例外（严格白名单）**：
    - `src/hooks/modules/useHttpRequest.ts`：对 Alova 泛型与 Method 的胶水封装
    - `src/utils/lodashes.ts`：对 lodash-es 的通用函数包装
    - `src/utils/safeStorage/**`：加密、压缩、Pinia 序列化等存储适配层
    - `src/utils/date.ts`：对 dayjs / date-holidays 等第三方日期库的深度适配
    - `src/components/UseEcharts/**`：ECharts 组件与事件/option 类型边界（与 ECharts API 对齐）
    - `src/hooks/modules/useChartTheme/**`：图表主题与 ECharts option 主题化边界（配置结构复杂、多版本兼容）
  - **规则**：
    - 上述白名单文件之外新增 `any` 一律视为违例，需通过重构/提炼类型消除；
    - 即便在白名单文件中使用 `any`，也必须：
      - 将 `any` 限制在最小作用域（例如内部实现细节，而不是公共导出类型）；
      - 用简短注释解释原因 & 期望的理想类型形状（方便未来进一步收紧类型）。
    - 上述图表边界层（UseEcharts / useChartTheme）内，any 仅允许在最小作用域使用，且需注释说明与 ECharts API/option 的对应关系；对外暴露的 Props、Emit、Expose、类型定义应尽量使用具体类型或 `unknown`。
- **状态管理**
  - 使用 Pinia（state/getters/actions + persist）。避免深层 Props Drilling
- **请求层**
  - 所有接口请求必须通过 `alovaInstance` 或 `useHttpRequest`（`@/hooks/modules/useHttpRequest`），禁止直接 `fetch`/`axios`

## 3. 目录职责 (Directory Roles)

| 目录                  | 职责                                                  |
| --------------------- | ----------------------------------------------------- |
| `src/api/`            | 接口定义层 SSOT（DTO + Method 构建），扁平两级        |
| `src/components/`     | 纯 UI 组件                                            |
| `src/constants/`      | 常量与 SSOT（如 breakpoints、size、theme）            |
| `src/hooks/`          | 纯逻辑（Composables），如 useHttpRequest、useLocale   |
| `src/layouts/`        | 布局壳（Admin/FullScreen/Ratio），由 meta.parent 驱动 |
| `src/stores/modules/` | Pinia 状态                                            |
| `src/types/`          | 全局/模块类型（含 `systems/*.d.ts`）                  |
| `src/utils/http/`     | HTTP 唯一入口（Alova instance + 封装）                |
| `src/views/`          | 页面容器，仅组合 hooks + components                   |

### 3.1 状态层 Stores 索引（AI 查找用）

| Store                | 路径                               | 职责                                   |
| -------------------- | ---------------------------------- | -------------------------------------- |
| `useThemeStore`      | `src/stores/modules/theme.ts`      | 主题模式、预设、过渡、CSS 变量         |
| `useSizeStore`       | `src/stores/modules/size.ts`       | 尺寸预设、根字号、布局变量             |
| `useDeviceStore`     | `src/stores/modules/device.ts`     | 设备类型、断点、视口、方向             |
| `useLayoutStore`     | `src/stores/modules/layout.ts`     | 布局 mode、侧栏收展、显隐、适配方法    |
| `useLocaleStore`     | `src/stores/modules/locale.ts`     | 当前语言                               |
| `useUserStore`       | `src/stores/modules/user.ts`       | 用户信息、token、login/logout          |
| `usePermissionStore` | `src/stores/modules/permission.ts` | 静态/动态路由、tabs、windows           |
| `useDataTableStore`  | `src/stores/modules/dataTable.ts`  | DataTable 列持久化（顺序/列宽/隐藏列） |

> 需要全局状态时，优先查上表复用；新增 store 前确认无重叠职责。

## 4. 文件命名 (Naming)

- 组件：`PascalCase.vue`（如 `UserCard.vue`）
- Composables：`camelCase.ts`（如 `useUserAuth.ts`）
- Store：`camelCase.ts`（如 `theme.ts`）
- 目录：尽可能扁平化

## 5. Vue 与 TS 硬性约束

- **Vue：** 一律使用 `<script setup lang="ts">`；禁止 Options API 与 `this`
- **Props：** 使用 `withDefaults(defineProps<Props>(), { ... })`
- **样式：** 使用 UnoCSS 工具类；若必须写 `<style>`，仅用于 sticky/calc 等 Uno 无法表达的例外，且只使用项目 CSS 变量，不写固定 px 颜色/间距
- **语义类：** 使用项目定义的语义类（如 `px-padding-lg`、`gap-md`、`rounded-scale`、`text-primary`），SSOT 在 `src/constants/` 与 `uno.config.ts`

### 5.1 TSX 渲染规范（强制）

**判断标准：** 凡在 script 中需要返回或构造 VNode 的场景（render 函数、动态 slot、表格单元格渲染等），一律用 TSX，禁止用 `h()`。

当需要**程序化渲染**（render 函数、动态 VNode、slot 内容、复杂条件渲染等）时：

- **必须**使用 TSX：`<script setup lang="tsx">`，在 script 内直接写 JSX（如 `() => <div class="text-primary">...</div>`）
- **禁止**使用 `h()`（createElement）手写 VNode

**示例：**

```vue
<script setup lang="tsx">
const renderSlot = () => <span class="text-muted-foreground">动态内容</span>
</script>
<template>
  <SomeComponent v-slot="{ default: renderSlot }" />
</template>
```

**配置支持：** `tsconfig.app.json`（jsx: preserve, jsxImportSource: vue）、`@vitejs/plugin-vue-jsx`、独立 `.tsx` 组件。

## 6. 设计系统与样式规范 (Design System & Styling Rules)

### 6.1 配色系统 (Theme System) - 必须遵循

生成任何 UI 代码前，必须参考并严格遵循项目的配色系统：

- **类型定义：** `src/types/systems/theme.d.ts`（ThemeMode、ThemePreset、ThemeCssVars 等）
- **预设常量：** `src/constants/theme.ts`（THEME_PRESETS、DEFAULT_THEME_NAME）
- **状态管理：** `src/stores/modules/theme.ts`（useThemeStore）
- **PrimeVue 融合：** `src/utils/theme/primevue-preset.ts` 将 ThemeCssVars 注入 PrimeVue 组件；Button 等配色规则见 `docs/PRIMEVUE_THEME.md`

**规则：**

- 颜色必须使用语义变量（如 `text-primary`、`bg-surface-ground`、`border-border`、`text-info`、`bg-info`），禁止硬编码 hex（如 `#fff`、`#000`）。边框若需可见须用快捷类：`component-border`、`border-b-default`、`border-t-default`，禁止仅写 `border border-border`（未设 border-style 不显示）
- 支持暗黑模式，使用 `dark:` 变体或 CSS 变量自动切换
- 所有颜色值必须来自 `uno.config.ts` 中定义的语义类或 CSS 变量

### 6.2 尺寸系统 (Size System) - 必须遵循

生成任何 UI 代码前，必须参考并严格遵循项目的尺寸系统：

- **类型定义：** `src/types/systems/size.d.ts`（SizeMode、SizePreset、SizeCssVars 等）
- **预设常量：** `src/constants/size.ts`（SIZE_PRESETS、LAYOUT_DIMENSION_KEYS）
- **尺寸阶梯：** `src/constants/sizeScale.ts`（SIZE_SCALE_KEYS、FONT_SCALE_RATIOS、SPACING_SCALE_RATIOS）
- **状态管理：** `src/stores/modules/size.ts`（useSizeStore）

**规则：**

- 间距必须使用语义类（如 `px-padding-lg`、`m-margin-md`、`gap-xl`），禁止硬编码 px（如 `padding: 16px`）
- 字体大小必须使用语义类（如 `fs-md`、`fs-lg`），禁止硬编码 px
- 布局尺寸必须使用 CSS 变量（如 `w-sidebarWidth`、`h-headerHeight`），禁止硬编码 px
- 所有尺寸值必须来自 `uno.config.ts` 中定义的语义类或 CSS 变量

### 6.3 布局响应式系统 (Layout & Responsive System) - 必须遵循

生成任何 UI 代码前，必须参考并严格遵循项目的布局响应式系统：

- **断点定义：** `src/constants/breakpoints.ts`（BREAKPOINTS，xs/sm/md/lg/xl/2xl/3xl/4xl/5xl）
- **布局常量：** `src/constants/layout.ts`（DEFAULT_LAYOUT_SETTING）
- **设备状态：** `src/stores/modules/device.ts`（useDeviceStore，见下方 6.3.1）
- **布局状态：** `src/stores/modules/layout.ts`（useLayoutStore，mode/sidebarCollapse 等）

#### 6.3.1 设备检测与适配能力

`src/stores/modules/device.ts`（useDeviceStore）负责检测运行设备与窗口信息，供布局与平台适配使用：

- **设备类型**：Mobile / Tablet / PC（基于 UA）
- **OS**：Windows / MacOS / Android / iOS / Linux
- **视口**：width、height、currentBreakpoint
- **屏幕**：screenWidth、screenHeight、方向、pixelRatio
- **移动端 UI**：navHeight、tabHeight（iOS/Android 安全区等）
- **触摸**：isTouchDevice

类型定义见 `src/types/systems/device.d.ts`（DeviceState、DeviceType、OsType）。

**规则：**

- 响应式必须使用 Mobile First 策略，默认移动端样式，再用 `md:`、`lg:` 等断点适配桌面
- 断点必须使用 `src/constants/breakpoints.ts` 中定义的值，禁止自定义断点
- 布局判定必须使用 `useDeviceStore` 的 getters（isMobileLayout/isTabletLayout/isPCLayout），禁止直接判断 window.innerWidth

#### 6.3.2 布局自适应逻辑（必读）

布局 mode、侧栏收展、侧栏/面包屑/Tabs/Footer 显隐由 **LayoutAdmin.runAdaptive** 统一驱动，具体规则见 `docs/ADAPTIVE_LAYOUT.md`。

- **禁止**：在业务代码中直接调用 `adaptToMobile`、`adaptToTablet`、`adaptPcByOrientation`、`adaptPcByBreakpoint`，或直接修改 `layoutStore.mode` / `layoutStore.sidebarCollapse` 以实现「响应式布局」。
- **必须**：在 LayoutAdmin 壳内展示侧栏/面包屑/Tabs/Footer 时使用 `showSidebarEffective` 等有效显隐，不得绕过。

### 6.4 UnoCSS 类名规范 - 必须遵循

生成任何 UI 代码前，必须参考 `uno.config.ts` 中定义的类名规则：

- **语义化尺寸类：** `p-padding-{scale}`、`m-margin-{scale}`、`gap-{scale}`（仅支持 `gap-*`/`gap-x-*`/`gap-y-*`；scale: xs/sm/md/lg/xl/2xl/3xl/4xl/5xl）
- **布局变量类：** `w-sidebarWidth`、`h-headerHeight`、`w-sidebarCollapsedWidth` 等
- **字体阶梯类：** `fs-xs`、`fs-sm`、`fs-md`、`fs-lg`、`fs-xl`、`fs-2xl`、`fs-3xl`、`fs-4xl`、`fs-5xl`
- **圆角类：** `rounded-scale`（使用 CSS 变量 `--radius-md`）
- **配色类：** `text-primary`、`bg-surface-ground`、`border-border`、`text-info`、`bg-info` 等（使用 CSS 变量）
- **边框快捷类：** 四边 `component-border`，底边 `border-b-default`，顶边 `border-t-default`；禁止仅写 `border border-border`

**规则：**

- 必须使用 `uno.config.ts` 中定义的语义类，禁止硬编码任何 px、rem、颜色值
- 禁止在 template 中写内联样式（`style="padding: 16px"`），必须使用 UnoCSS 类名
- 禁止在 template 中使用 TypeScript 语法（如 `:prop="value as any"`、`:prop="value as MyType"`、`:prop="value: Type"`）；必须在 `<script setup>` 中定义好类型，模板中直接使用变量
- 若 `uno.config.ts` 中没有对应的类名，优先扩展 `uno.config.ts` 而非写 `<style>`

### 6.5 Style 标签使用规范

**禁止使用 `<style>` 的场景：**

- 布局（flex、grid、position）
- 间距（padding、margin、gap）
- 颜色（background、color、border-color）
- 字体大小（font-size）
- 圆角（border-radius）

**允许使用 `<style lang="scss" scoped>` 的场景：**

- 复杂动画（keyframes、transition 组合）
- 伪元素（::before、::after）复杂样式
- sticky/calc 等 UnoCSS 无法表达的定位计算
- 第三方组件样式覆盖（必须使用深度选择器 `:deep()`）

**SCSS 嵌套要求：**

- 必须使用 SCSS 嵌套语法，保持层级清晰
- 使用 `&` 引用父选择器
- 使用 `:deep()` 覆盖 PrimeVue 组件样式
- 示例：

```scss
<style lang="scss" scoped>
.component {
  // 只使用 CSS 变量，不写固定值
  position: sticky;
  top: var(--header-height);

  :deep(.primevue-component) {
    // 深度选择器覆盖第三方组件
  }

  &::before {
    // 伪元素
  }
}
</style>
```

### 6.6 硬编码禁止清单

**绝对禁止硬编码：**

- ❌ `padding: 16px` → ✅ `px-padding-lg` 或 `p-padding-md`
- ❌ `margin: 20px` → ✅ `m-margin-lg`
- ❌ `font-size: 14px` → ✅ `fs-sm`
- ❌ `color: #fff` → ✅ `text-foreground` 或 `text-white`
- ❌ `background: #000` → ✅ `bg-background` 或 `bg-surface-ground`
- ❌ `width: 240px` → ✅ `w-sidebarWidth`（布局变量）
- ❌ `height: 64px` → ✅ `h-headerHeight`（布局变量）
- ❌ `border-radius: 8px` → ✅ `rounded-scale`
- ❌ `@media (min-width: 768px)` → ✅ `md:` 断点类

## 7. 黄金样本 (Golden Samples)

生成任何逻辑或 UI 前，必须参考 `docs/GOLDEN_SAMPLES/` 中的文件并**严格模仿**其结构与风格：

- `useFeatureLogic.ts` — Composables 与 Alova 请求封装
- `StoreExample.ts` — Pinia Store 写法
- `UIComponent.vue` — Script Setup + UnoCSS + PrimeVue 组件写法
- `ApiModuleExample.ts` — API 模块定义（DTO 类型、Method builder、便捷函数）

生成后自审：

1. 本次输出是否与黄金样本的风格一致？
2. 是否遵循了配色系统（theme.d.ts、theme.ts、theme store）？
3. 是否遵循了尺寸系统（size.d.ts、size.ts、sizeScale.ts、size store）？
4. 是否遵循了布局响应式系统（breakpoints.ts、layout.ts、device store、layout store）？
5. 是否使用了 `uno.config.ts` 中定义的类名，杜绝了硬编码？
6. 若使用了 `<style>`，是否使用了 `<style lang="scss" scoped>` 并遵循了 SCSS 嵌套？

若不确定应主动说明。

## 8. 工具优先级 (Utilities & Hooks First Policy)

### 8.1 总原则（强制）

当实现/修复任何功能时，必须遵循以下优先级：

1. **优先复用现有工具**（`src/utils/*`、`src/hooks/*`、`src/hooks/modules/*`）。
2. 若现有工具覆盖 80% 需求：**在原工具上做最小扩展**，禁止在业务代码里复制粘贴同类逻辑。
3. 若确实需要新增工具方法：
   - **必须按类型归档**到对应工具文件；
   - 若不存在合适的工具文件，才允许创建新文件（新文件必须放在 `src/utils/` 或 `src/hooks/modules/`，并遵循命名/导出规范）。

目标：保持“单一真理来源”，避免同类逻辑散落在 views/components 里。

### 8.2 工具清单（遇到相关需求必须优先取用）

#### HTTP / 请求（禁止 raw axios/fetch）

- `src/utils/http/*`：全局 Alova 实例、拦截器、方法封装等
- `src/hooks/modules/useHttpRequest.ts`：业务请求 Hook 封装（优先使用）

#### 安全存储 / 加密持久化

- `src/utils/safeStorage/*`：加密存储、序列化、持久化相关（禁止自行写 crypto/storage 逻辑）

#### 全局事件（发布订阅）

- `src/utils/mitt.ts`：全局事件总线/插件（禁止重复封装）

#### Lodash 方法使用（防腐层）

- `src/utils/lodashes.ts`：lodash 方法统一入口（避免项目直接耦合 lodash-es）
  - **数据处理**（Store、纯 TS 逻辑）：优先使用 `deepClone/deepEqual/deepMerge/objectPick/objectOmit`
  - **UI 交互**（组件内 debounce/throttle）：优先使用 `@vueuse/core` 的 `useDebounceFn/useThrottleFn`，其次才考虑 `debounceFn/throttleFn`

#### 随机数 / ID

- `src/utils/ids.ts`：ID 生成（优先使用 `generateUniqueId/generateIdFromKey`，禁止自行写 uuid 或 Math.random 拼接）

#### 日期 / 时区

- `src/utils/date.ts`：日期工具函数（格式化/解析等）
- `src/hooks/modules/useDateUtils.ts`：时区、可用时区列表、与 locale 联动等（优先使用）

#### 字符串工具

- `src/utils/strings.ts`：字符串处理（禁止散落正则/trim/slug 等重复逻辑）

#### 浏览器环境/能力检测

- `src/utils/browser.ts`：浏览器/终端/平台差异处理（禁止在业务中写 UA/平台判断）

#### 元素尺寸监听/容器尺寸

- `src/hooks/modules/useAppElementSize.ts`：元素尺寸监听、响应式尺寸（优先使用，禁止重复写 ResizeObserver）

#### 系统核心：主题/语言

- `src/hooks/modules/useThemeSwitch.ts`：颜色模式切换/动画锁等（主题切换必须走它）
- `src/hooks/modules/useLocale.ts`：多语言切换（语言切换必须走它）

### 8.3 新增工具方法的归档规则（强制）

- **HTTP 相关**：优先扩展 `src/utils/http/` 或按 `useHttpRequest` 模式新增 composable；不要在业务组件里封装请求
- **安全存储**：落到 `src/utils/safeStorage/` 对应模块
- **字符串/ID/浏览器/日期**：分别落到 `src/utils/strings.ts`、`src/utils/ids.ts`、`src/utils/browser.ts`、`src/utils/date.ts`
- **跨组件逻辑/页面逻辑**：落到 `src/hooks/modules/`（命名 `useXxx.ts`）
- 若必须创建新工具文件：必须在文件头写清楚“职责/边界/禁止用途”，并保持导出风格与同目录一致

### 8.4 函数级工具目录（从文件级升级为函数级）

> 规则：当遇到对应需求时，**必须优先使用下列“指定函数/导出”**。禁止在业务代码中重复实现同类逻辑。

#### 8.4.1 Lodash 防腐层（`src/utils/lodashes.ts`）

- **深拷贝**：`deepClone<T>(obj: T): T`
- **深度比较**：`deepEqual(value, other): boolean`
- **深度合并**：`deepMerge(object, ...sources): any`
- **对象摘取**：`objectPick(object, paths): Pick<...>`
- **对象剔除**：`objectOmit(object, paths): Omit<...>`
- **防抖/节流（次选）**：`debounceFn` / `throttleFn`
  - 组件内 debounce/throttle **优先** `@vueuse/core`：`useDebounceFn` / `useThrottleFn`

#### 8.4.2 ID 生成（`src/utils/ids.ts`）

- **唯一 ID**：`generateUniqueId(): string`
- **稳定 ID（按 key）**：`generateIdFromKey(key): string`

#### 8.4.3 字符串工具（`src/utils/strings.ts`）

- **驼峰转 kebab-case**：`toKebabCase(str, start?, end?): string`

#### 8.4.4 浏览器/系统能力（`src/utils/browser.ts`）

- **系统颜色模式**：`getSystemColorMode(): 'light' | 'dark'`

#### 8.4.5 全局事件总线（`src/utils/mitt.ts`）

- **强类型事件映射**：`Events`（type）
- **事件 API**：`useMitt()` → `on/off/emit/onAll/offAll/clear`

#### 8.4.6 HTTP / 请求（`src/utils/http/*` + `src/hooks/modules/useHttpRequest.ts`）

- **优先 Hook 封装**：`useHttpRequest<TData>(buildMethod, options?)`
- **Alova 实例**：`alovaInstance`（`src/utils/http/instance.ts`）
- **通用请求方法（必要时）**：`get/post/put/del/patch/head/uploadFile/uploadFiles/downloadFile`（`src/utils/http/methods.ts`）
- **错误与守卫**：`HttpRequestError`、`isHttpRequestError`（`src/utils/http/errors.ts`）
- **ConnectionManager**（`src/utils/http/connection.ts`）：网络状态监听、自动重连、健康检查；需网络状态/离线提示时使用
- **UploadManager**（`src/utils/http/uploadManager.ts`）：大文件分片上传、断点续传、暂停/恢复；需大文件上传或精细控制时使用

#### 8.4.7 安全存储（`src/utils/safeStorage/*`）

- **加密/解密**：`encrypt/decrypt/encryptSync/decryptSync`（`crypto.ts`）
- **压缩/解压**：`compress/decompress`（`lzstring.ts`）
- **打包/解包**：`packData/packDataSync/unpackData/unpackDataSync`（`core.ts`）
- **友好别名**：`encryptAndCompress/...`（`safeStorage.ts`）
- **Pinia 序列化器**：`createPiniaEncryptedSerializer(secret?)`（`piniaSerializer.ts`）

#### 8.4.8 日期/时区（`src/utils/date.ts` + `src/hooks/modules/useDateUtils.ts`）

- **默认入口（推荐）**：`useDateUtils()`（响应式代理层：locale/timezone 同步、格式化等）
- **底层能力（必要时）**：`DateUtils`（default export，`src/utils/date.ts`）

#### 8.4.9 元素尺寸监听（`src/hooks/modules/useAppElementSize.ts`）

- `useAppElementSize(targetRef, callback?, options?)` → `{ width, height }`
- `UseElementSizeOptions`（interface）

#### 8.4.10 主题/多语言（核心系统 hooks）

- **主题切换**：`useThemeSwitch()`；动画锁：`isThemeLocked()`（`src/hooks/modules/useThemeSwitch.ts`）
- **多语言**：`useLocale()`（`src/hooks/modules/useLocale.ts`）

#### 8.4.11 页面标题（`src/hooks/layout/usePageTitle.ts`）

- **标题计算**：`calculatePageTitle(route, appTitle, t): string`
- **标题管理**：`usePageTitle(router?)`

#### 8.4.12 禁止清单（与函数级目录配套）

- ❌ 业务代码中直接 `import { debounce } from 'lodash-es'` → ✅ `@vueuse/core` 的 `useDebounceFn` 或 `debounceFn`
- ❌ 业务代码中直接 `new mitt()` → ✅ `useMitt()` / `src/utils/mitt.ts` 单例
- ❌ 自己拼 UUID / Math.random → ✅ `generateUniqueId` / `generateIdFromKey`
- ❌ 组件内直接 `fetch/axios` → ✅ `useHttpRequest` / `src/utils/http/*`

### 8.4a 方法查找与归档决策流程（AI 必须执行）

当需要某个方法实现功能时：

**1. 强制查找顺序**

- **领域 Hooks**（任务涉及 SchemaForm 时）：`src/components/SchemaForm/hooks/` — useFormSync、useFormActions、useFormMemory、useLayout、useValidation、usePersistence、useSteps、useSubmit、useLifecycle 等
- **全局工具**：`src/utils/` — lodashes、date、strings、ids、browser、safeStorage、http/\*、mitt、deviceSync 等

在实现前用 grep/codebase_search 按函数名或语义搜索，确认是否已存在。

**2. 找到 → 直接使用**

从已有模块导入，禁止复制等价逻辑。

**3. 未找到 → 分析并告知用户**

在行内实现或新建文件前：

- **分析**是否适合全局复用：多处复用 / 纯函数无耦合 → 倾向全局；仅 SchemaForm 使用 → 倾向 `src/components/SchemaForm/hooks/` 或 `utils/`；单处使用且强耦合 → 可保留局部
- **向用户输出**：方法用途、是否适合全局（是/否 + 理由）、建议放置位置
- **明确询问**："是否放入 utils/hooks 目录，还是保留在使用处？"
- **等待用户决策**后再落位

## 8.5 组件与图标使用规范 (Components & Icons Policy)

> 核心规则：生成页面/组件时，必须**优先复用 `src/components/` 中的封装组件**；需要图标时必须通过 `Icons` 组件与 UnoCSS iconify 体系完成，禁止手写/硬编码 SVG。

### 8.5.1 组件优先复用（强制）

当前已封装组件（遇到对应需求必须优先使用）：

- **滚动容器**：`src/components/CScrollbar`（模板中使用 `<CScrollbar>`）
  - 用于替代原生 `overflow-auto` 容器，自动接入主题与尺寸系统（CSS 变量 `--muted/--primary/--radius-md`）
- **动画包装**：`src/components/AnimateWrapper`
  - 进场/离场动画（基于 animate.css），适用布局切换、动态列表项、动态表单字段等
- **图标**：`src/components/Icons`
  - 统一图标入口（UnoCSS preset-icons），支持 iconify 集合与本地自定义 SVG
- **图表**：`src/components/UseEcharts/UseEcharts.vue`
  - 基于 `vue-echarts` 的二次封装，已接入主题与尺寸（内部使用 `useChartTheme`）

### 8.5.2 自动引入（强制遵循现有工程化）

项目已在 `build/` 中配置自动引入组件与函数，并自动生成：

- `src/types/auto-imports.d.ts`
- `src/types/components.d.ts`

规则：

- 生成代码时**优先使用已配置的自动引入组件/函数**，不要手写重复 import（除非该文件/场景明确要求）

### 8.5.3 Icons 组件：图标命名与智能选用（强制）

#### (A) 基本原则

- UI 需要图标时，必须使用 `<Icons />`，禁止直接写 `<svg>`、禁止外链图标、禁止 base64 图标
- 优先使用已安装 iconify 集合（见 `package.json` 的 `@iconify-json/*`）
- 若 iconify 集合没有合适图标，才新增本地自定义 SVG（放 `src/assets/icons/`）

#### (B) name 的推荐写法（按优先级）

1. **Lucide（默认/推荐）**：线性、统一风格
   - 写法：`i-lucide-xxx`（例如：`i-lucide-user`、`i-lucide-settings`）
2. **MDI（补充）**：图标更丰富
   - 写法：`i-mdi-xxx`（例如：`i-mdi-home`）
3. **Logos（品牌）**：品牌/Logo
   - 写法：`i-logos-xxx`（例如：`i-logos-vue`）
4. **自定义 SVG（custom collection）**：
   - SVG 放置：`src/assets/icons/**/*.svg`
   - 写法：`i-custom:xxx-yyy`（例如：`i-custom:custom-juejin`）

> 自定义 SVG 的加载/注入与 safelist 由 `build/uno-icons.ts` 与 `uno.config.ts` 负责，无需手工维护 safelist。

#### (C) size / color / 动画

- `size`：
  - **标准阶梯（推荐）**：`xs~5xl`（映射 `fs-*`，联动 SizeStore，响应式适配更好）
  - **自定义尺寸（特殊场景）**：
    - 数字：`size={24}` → `24px`
    - 字符串：`size="2rem"` / `size="50%"` → 支持任意 CSS 单位
  - **何时使用自定义尺寸**：仅在标准阶梯无法满足设计需求时使用
- `color`：
  - **语义类（推荐，静态颜色）**：通过 `class="text-primary"` 等 UnoCSS 类
  - **color prop（动态/主题变量）**：`color="rgb(var(--primary))"`（注意使用 `rgb()` 格式）
  - 禁止硬编码 hex
- **动画与变换**：
  - 动画：`animation="spin|pulse|spin-pulse"`
  - 翻转：`flip="horizontal|vertical|both"`
  - 旋转：`rotate="90"` 或 `rotate={90}`（单位：deg）
  - 缩放：`scale={1.5}`（数字值）
  - 详见 `docs/UNOCSS_AND_ICONS.md` §6.4

### 8.5.4 新增图标/组件的落点（强制）

- 新增自定义 SVG 图标：放 `src/assets/icons/`（按业务域分子目录允许，但必须保持命名语义清晰）
- 新增通用组件：放 `src/components/`（保持目录尽可能扁平化）；目录名使用 PascalCase（如 SchemaForm、PrimeDialog、DataTable、UseEcharts）
- 新增配套逻辑/Hook：放 `src/hooks/modules/`（命名 `useXxx.ts`），并遵循“工具优先复用”规则

### 8.5.5 右键菜单（ContextMenuProvider）

- **组件**：`src/layouts/components/ContextMenuProvider.vue`
- **职责**：拦截 contextmenu 事件，渲染自定义右键菜单
- **作用域**：`scope` 为 `local`（仅对 Provider 包裹区域生效）或 `global`（整站生效，建议挂载在 layouts/index.vue 等常驻节点）
- **插槽**：`menu` 自定义菜单内容（slot context 含 x、y、event、target、close）
- **说明**：布局层已挂载，业务通过 slot 或作用域使用；详见组件内注释

## 9. API Layer Policy（新增接口必须先落到 src/api，且目录扁平化）

`src/api/` 目录已预置，详见 `src/api/README.md`。新增接口必须落在此处。

> 核心规则：当需求涉及“新增接口/对接后端/新增请求”时，**必须先在 `src/api/<module>/` 落地类型与服务层**，随后才允许在 hooks/页面中使用。
> 目的：接口“单一真理来源”，避免 URL/参数/响应解析散落在页面与组件中。

### 9.1 目录与职责（强制｜扁平化两级）

**只允许两级结构：**

- ✅ `src/api/<module>/<feature>.ts`
- ❌ 禁止任何三级目录：`src/api/<module>/<subdir>/...`

`<module>` 必须按页面/业务域划分（如 `user`、`dashboard`、`system`），禁止把所有接口塞进单一文件。

**每个 `src/api/<module>/<feature>.ts` 文件必须同时包含：**

1. 该 feature 的请求/响应类型（Request DTO / Response DTO / 分页类型等，业务代码禁止 `any`；边界封装层例外见“类型安全”小节）
2. 该 feature 的接口方法（构建 Alova Method 或封装调用）

### 9.2 新增接口的标准流程（强制）

1. **先落 API 文件**：创建/扩展 `src/api/<module>/<feature>.ts`
   - 先写 DTO 类型（业务代码禁止 `any`；边界封装层例外见“类型安全”小节）
   - 再写 API 方法（推荐 `buildXxxMethod(client)` 返回 `Method<T>`，便于与 `useHttpRequest` 配合）
   - 可选：提供 `requestXxx(params)` 便捷函数（内部必须使用 `@/utils/http/*`/`alovaInstance`，禁止 fetch/axios）
2. **再写业务 hook**：在 `src/hooks/modules/useXxx.ts` 组织业务状态（loading/data/error/pagination 等），并调用 `src/api/<module>/<feature>.ts`
3. **最后在页面/组件中消费**：页面只绑定 hook 的状态与事件，不包含 URL/参数 schema/响应解析

### 9.3 禁止项（强制）

- ❌ 禁止在 `src/views/**`、`src/components/**` 里直接写 URL、直接构建 `alovaInstance.Get/Post`、或直接调用 `get/post/...`
- ❌ 禁止新增接口只写 hook 不写 `src/api/<module>/<feature>.ts`
- ❌ 禁止在 `src/api/<module>/` 下创建任何子目录（禁止三级目录）
- ✅ 允许在 `src/api/**` 与 `src/hooks/**` 中使用 `useHttpRequest` / `@/utils/http/*`

### 9.3.1 API 导出命名与 default export 规则（强制｜防止 AutoImport 污染）

由于构建侧 AutoImport 会扫描 `src/api/**/*`，因此 API 文件必须遵循以下约束以避免全局命名空间污染与冲突：

- ❌ 禁止 `export default`（API 文件只允许 **named exports**）
- ❌ 禁止导出通用顶层名字（例如 `get/list/data/request/config/params` 等）
- ✅ 必须使用“域前缀 + 语义化命名”
  - Method builder（推荐）：`build<Domain><Feature>Method`（如 `buildUserLoginMethod`）
  - 可选请求函数：`request<Domain><Feature>`（如 `requestUserLogin`）
  - 类型命名：`<Domain><Feature>Req/Res/DTO`（如 `UserLoginReq/UserLoginRes`）

### 9.4 与现有架构工具的关系（强制）

- `src/api/**`：负责“接口定义与服务层”（类型、URL、Method 构建、底层调用）
- `src/hooks/**`：负责“业务状态与流程”（组合 service、分页、筛选、错误提示策略）
- UI（views/components）：只负责展示与交互绑定

## 10. 路由系统 (Router System)

> 目标：统一路由定义方式，集中路由工具与守卫逻辑，避免在业务代码中散落 `router.addRoute` / 权限判断 / 菜单生成等零碎实现。
> 当任务涉及“新增/修改路由、菜单、面包屑、守卫、动态路由”等时，必须先阅读本节并遵循。

### 10.1 核心类型与文件 (SSOT)

- **类型声明（必须先看）**：`src/types/modules/router.d.ts`
  - `RouteMeta`: 集中定义所有路由元信息字段（`title/titleKey/parent/ratio/parentPaths/icon/showLink/rank/roles/auths/keepAlive/hideBreadcrumb/isLink/linkUrl/activeMenu/backstage/hiddenTag/fixedTag/reuseWindow/transition` 等）。
  - `RouteConfig`: 业务层路由配置类型（基于 `RouteRecordRaw`，统一使用它作为“路由源”）。
  - `BackendRouteConfig`: 后端返回的动态路由 DTO 形状。
  - `RouteModule`: 路由模块导出类型（`RouteConfig | RouteConfig[]`）。
  - `MenuItem` / `TabItem` / `RouteUtils` / `DynamicRouteManager`: 用于菜单、标签页、路由工具集、动态路由管理的结构定义。
- **常量**：`src/constants/router.ts`
  - `routeWhitePathList/routeWhiteNameList`: 登录白名单。
  - `errorPagesPathList/errorPagesNameList`: 错误页集合。
  - `rootRedirect: RouteConfig[]`: 404/403/500 + CatchAll 通配路由。

> 规则：所有路由相关的类型和常量必须与上述 SSOT 文件保持一致，禁止在其它地方重复定义 Meta 字段或手写白名单。

### 10.2 静态路由模块规范 (`src/router/modules/*.ts`)

- 每个模块文件（如 `core.ts`、`dashboard.ts`）必须：
  - 导出 `RouteConfig[]` 或单个 `RouteConfig`（通过 `default` 导出），类型满足 `RouteModule`；
  - 使用 `meta` 字段承载页面信息（标题、布局、权限、缓存等），不得在视图/组件里“补充 Meta”。
- **新增静态路由的流程：**
  1. 在合适的模块下（`core.ts/dashboard.ts/...`）新增 `RouteConfig`（或补充到现有 children）；
  2. 为页面配置合理的 `meta`：
     - 菜单/面包屑：`titleKey`（优先）或 `title`、`icon`、`rank`、`showLink`；
     - 布局：`parent: 'admin' | 'fullscreen' | 'ratio'`，如为 `ratio`，`ratio` 可留空由系统默认 `16:9`；
     - 权限：`roles`（页面级）、`auths`（按钮级）；
     - 缓存：`keepAlive: true` 且必须有 `name`；
     - 标签行为：`hiddenTag/fixedTag`；
     - 外链：`isLink/linkUrl`（仅用于外链路由）。
  3. 静态路由会通过 `router/index.ts` 中的 `processRouteModules + sortRoutes + addParentPathsToLeafRoutes + normalizeRatioMetaOnRoutes` 自动收敛。

> 禁止：在页面/组件中直接调用 `createRouter` 或散布 `router.addRoute` 增加静态路由。静态路由的**唯一入口**是 `src/router/modules`。

### 10.3 后端动态路由（BackendRouteConfig + processAsyncRoutes）

- 后端返回路由必须符合 `BackendRouteConfig` 形状（参见类型声明）：
  - 必须有 `path` 和 `meta`；
  - `component` 为相对于 `src/views` 的字符串标识（如 `login` / `system/user-list` / `@module/...`）。
- 架构层统一通过 `processAsyncRoutes(backendRoutes: BackendRouteConfig[]): RouteConfig[]` 做转换：
  - 自动补充 `name`（若为空则使用 `generateNameByPath` 基于 path 生成稳定名称）；
  - 为所有动态路由打标 `meta.backstage = true`；
  - 规范化 `meta.title/showLink/ratio` 等字段；
  - 使用 `loadView(component: string)` 将后端的 `component` 字符串映射到实际 Vue 组件（支持多种命名规范 + 404 回退）。

> 规则：业务代码/Hook/Store **不得**自己手动把 `BackendRouteConfig` 转成 `RouteConfig`，必须交给 `processAsyncRoutes` 完成，并通过 `DynamicRouteManager` 注入。

### 10.4 Router 工具层 (`src/router/utils/common.ts`)

通用工具统一收敛在 `common.ts`，主要包括：

- 结构加工：
  - `filterShowLinkMenus` / `filterEmptyChildren` / `filterNoPermissionTree`：用于按 `showLink` 和权限裁剪菜单树。
  - `addParentPathsToLeafRoutes` / `addParentPathsToBackendRoutes`：为叶子路由写入 `meta.parentPaths`。
  - `formatTwoStageRoutes` / `formatFlatteningRoutes` / `flattenRoutes`：多级路由 flatten/二级限制。
- 权限与按钮权限：
  - `checkRoutePermission` / `filterAuthorizedRoutes`：基于 `roles` 的页面权限；
  - `getAuths` / `hasAuth`：基于 `auths` 的按钮权限（含超级权限 `*:*:*`）。
- 菜单与面包屑：
  - `generateMenuTree(routes): MenuItem[]`：由 `RouteConfig` 生成菜单树；
  - `generateBreadcrumbMap(routes): Map<string, string[]>`：按 `titleKey/title` + `hideBreadcrumb` 生成面包屑映射；
  - `sortRoutes`：根据 `meta.rank` 排序。
- 动态路由处理：
  - `processAsyncRoutes` / `loadView`：统一处理后端动态路由与组件字符串映射；
  - `normalizeRatioMetaOnRoutes`：归一化 `ratio` 默认值；
  - `getKeepAliveNames`：生成需要缓存的页面 name 列表。
- 工具聚合：
  - `createRouteUtils(routes): RouteUtils`：生成并维护 `flatRoutes/menuTree/breadcrumbMap/keepAliveNames`，并提供 `updateRouteUtils` 做动态更新。
- 动态路由管理：
  - `createDynamicRouteManager(router): DynamicRouteManager`：唯一允许在运行时 add/remove 动态路由的入口。

> 规则：当需要**菜单树、面包屑、keepAlive 列表、权限裁剪**等能力时，必须优先调用 `RouteUtils` 与 `common.ts` 中已有方法，禁止在业务代码中重新实现 flatten/权限过滤等逻辑。

### 10.5 Router 运行时 (`src/router/index.ts` + 守卫 + 权限 Store)

- `src/router/index.ts`：
  - 自动加载 `src/router/modules/**/*.ts` 为静态路由；
  - 通过 `normalizedStaticRoutes` 构造 `routeUtils`（菜单/面包屑/keepAlive）与 `initialRoutes`（Vue Router 兼容结构）；
  - 创建 `router` 与 `dynamicRouteManager`，并调用 `registerRouterGuards` 注册守卫。
- `src/router/utils/guards.ts`：
  - `registerRouterGuards({ router, routeUtils, staticRoutes, dynamicRouteManager })` 负责：
    - 声明 `initDynamicRoutes()`：调用 `permissionStore.fetchDynamicRoutes()` → `processAsyncRoutes` → `dynamicRouteManager.addRoutes` → `routeUtils.updateRouteUtils`；
    - 调用 `usePermissionGuard` 注册全局前/后置守卫（登录校验、白名单、动态路由初始化、Loading/NProgress、标题更新）。
- `src/stores/modules/permission.ts`：
  - 维护 `staticRoutes/dynamicRoutes/isDynamicRoutesLoaded/tabs/windows` 等状态；
  - 提供标签页管理、窗口元数据管理方法（与 `helper.ts` 的多窗口逻辑协作）。

> 规则：**全局前/后置守卫只能在 `src/router/utils/guards.ts` 中定义**。业务代码不得新建全局守卫；与登录/权限/动态路由相关的逻辑必须走 `usePermissionGuard + registerRouterGuards` 链路。

### 10.6 导航与窗口管理 (`src/router/utils/helper.ts` + `src/router/utils/permission.ts`)

- 导航工具：
  - `goBack()`：智能返回。
  - `goToRoute(nameOrPath, query?, newWindow?, checkPermission?)`：统一处理 name/path、外链、新窗口/复用窗口等逻辑。
  - `replaceRoute(path, query?)` / `refreshCurrentRoute()`。
- 路由查询：
  - `getFlatRouteList/menuTree/getRouteByName/getRouteByPath/getRouteConfig/getCurrentRoute/getCurrentRouteMeta` 等。
- 菜单/标签页辅助：
  - `getMenuTree/getFlatMenuTree/getAuthorizedMenuTree/checkCurrentRoutePermission`。
- 多窗口：
  - `generateWindowKey/getRouteWindowRef/setRouteWindowRef` + `BroadcastChannel` 协调，与 `permissionStore.registerWindow/markWindowClosed` 配合。
- 辅助路径：
  - `getFullRoutePath(route)`：使用 `meta.parentPaths` 计算完整层级路径；
  - `getActiveMenuPath(route)`：若存在 `meta.activeMenu` 则优先返回，用于菜单高亮。

> 规则：业务代码在做“跳转/返回/刷新/新窗口打开/窗口复用”时，必须优先使用 `helper.ts` 中已封装的方法，不要在各处手写 `window.open/history.back` 等逻辑。

### 10.7 AI 生成代码时的 Router 特别指引

当任务涉及以下任一内容时，AI 必须先回顾本节与 `src/types/modules/router.d.ts`，并遵守：

1. **新增/修改路由：**
   - 静态路由 → 只在 `src/router/modules/*.ts` 中改动，使用 `RouteConfig`；
   - 动态路由 → 只通过 `BackendRouteConfig` 与 `processAsyncRoutes` + `DynamicRouteManager` 注入；
   - 禁止直接手写 `router.addRoute/removeRoute`，必须通过 `createDynamicRouteManager` 返回的实例操作。
2. **菜单/面包屑/keepAlive：**
   - 必须使用 `routeUtils.menuTree/breadcrumbMap/keepAliveNames` 或 `common.ts` 中的帮助函数；
   - 禁止在视图/组件中重新实现 flatten 或面包屑生成。
3. **权限控制：**
   - 页面级权限 → 使用 `roles` + `checkRoutePermission/filterAuthorizedRoutes/checkCurrentRoutePermission`；
   - 按钮级权限 → 使用 `auths` + `getAuths/hasAuth`。
4. **守卫与登录流：**
   - 扩展守卫逻辑时，只能在 `src/router/utils/guards.ts` 内修改；
   - 必须通过 `registerRouterGuards + usePermissionGuard` 与 `permissionStore` 协作。
5. **导航与多窗口：**
   - 跳转/新窗口逻辑一律通过 `goToRoute/goBack/refreshCurrentRoute/replaceRoute`；
   - 窗口复用场景必须利用 `reuseWindow`、窗口 key 与 `permissionStore` 的窗口元数据。

## 11. Layouts 系统 (Layout System)

> 当任务涉及「布局壳选择、Admin 子模式、新增布局」时，必须先阅读 `.cursor/rules/22-layouts.mdc` 并遵循。

### 11.1 双层概念

- **LayoutMode**（`meta.parent`）：`admin` | `fullscreen` | `ratio`，选择布局壳
- **AdminLayoutMode**（`LayoutSetting.mode`）：`vertical` | `horizontal` | `mix`，仅 admin 壳有效

### 11.2 类型与常量 SSOT

- 类型：`src/types/systems/layout.d.ts`（LayoutMode、AdminLayoutMode、LayoutSetting）
- 默认值：`src/constants/layout.ts`（DEFAULT_LAYOUT_SETTING）

### 11.3 扩展

- 新壳：扩展 LayoutMode，新建 `LayoutXxx.vue` 或 `LayoutXxx.tsx`，修改 `src/layouts/index.vue`
- 新 admin 子模式：扩展 AdminLayoutMode，修改 `LayoutAdmin.tsx`

### 11.4 布局自适应

Admin 壳下 mode、侧栏收展、侧栏/面包屑/Tabs/Footer 显隐由适配系统控制，详见 `docs/ADAPTIVE_LAYOUT.md`。修改 LayoutAdmin 或 layout store 的适配逻辑时须遵循该文档，不得绕过 runAdaptive 或有效显隐。
