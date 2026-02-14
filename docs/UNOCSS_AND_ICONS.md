# UnoCSS & Icons System (SSOT)

本文档描述项目的 UnoCSS 语义类、SSOT 推导机制，以及 iconify + 自定义 SVG 的完整链路。UI 相关输出必须遵循。

## 1. UnoCSS 的 SSOT 驱动

核心文件：`uno.config.ts`

它直接引用并以其为唯一真理来源（SSOT）：

- `src/constants/breakpoints.ts` → breakpoints
- `src/constants/size.ts` → `LAYOUT_DIMENSION_KEYS`（布局变量白名单）
- `src/constants/sizeScale.ts` → `SIZE_SCALE_KEYS`（xs→5xl 阶梯）
- `src/utils/theme/metadata.ts` → 主题相关元数据（quadFamilies 含 primary、accent、destructive、warn、success、info，对应语义类如 `bg-primary`、`text-info` 等）

结论：

- 断点、尺寸阶梯、布局变量、语义类的生成，全部由 SSOT 推导
- UI 代码禁止硬编码 px/rem/hex；必须使用语义类/变量

## 2. 语义类的核心能力（示例）

> 具体类名以 `uno.config.ts` 的规则引擎为准，这里只列“必须优先使用”的模式。

### 2.1 尺寸语义类（Spacing）

- padding：`p-padding-{scale}` / `px-padding-{scale}` / `py-padding-{scale}`
- margin：`m-margin-{scale}` / `mx-margin-{scale}` / `my-margin-{scale}`
- gap：`gap-{scale}` / `gap-x-{scale}` / `gap-y-{scale}`（仅支持此三种形式；已废弃的 `gap-gap-*` 勿再使用）

其中 `scale` 只能是 `xs|sm|md|lg|xl|2xl|3xl|4xl|5xl`（来自 `SIZE_SCALE_KEYS`）。

### 2.2 字体阶梯（Font）

- `fs-xs ... fs-5xl` → 映射到 `--font-size-*` CSS 变量

### 2.3 布局变量类（Layout Variables）

`uno.config.ts` 会把 `LAYOUT_DIMENSION_KEYS` 映射成 CSS 变量类（如 width/height）：

- `w-sidebarWidth`
- `w-sidebarCollapsedWidth`
- `h-headerHeight`
- `h-breadcrumbHeight`
- `h-footerHeight`
- `h-tabsHeight`

### 2.4 背景色使用规范（禁止自造 surface-\*）

本项目的背景色全部通过设计系统/主题系统生成，**不使用 Tailwind / PrimeVue 默认的 `surface-*` 数字分级类**。

**推荐语义：**

- 页面/根容器：`bg-background`
- 卡片/面板：`bg-card`
- 弱对比信息块/提示：`bg-muted`
- 状态色：`bg-primary` / `bg-accent` / `bg-destructive` / `bg-warn` / `bg-success` / `bg-info` 及其 `-hover` / `-light`
- 侧边栏区域：`bg-sidebar` 家族
- PrimeVue 主题兼容保留：`bg-surface-ground`（仅此一个 `surface-*` 语义允许）

**禁止示例（不要再出现在业务代码）：**

| ❌ 不允许                | ✅ 推荐写法                       | 说明                        |
| ------------------------ | --------------------------------- | --------------------------- |
| `bg-surface-100`         | `bg-muted`                        | 代码块、弱对比背景          |
| `bg-surface-200`         | `bg-card`                         | 卡片、面板                  |
| `bg-surface-ground`      | `bg-background` / `bg-card`       | 视实际语义选择              |
| `bg-surface-ground/50`   | `bg-card` / `bg-primary/5`        | 顶部栏浅背景                |
| `dark:bg-surface-700`    | 依赖 token 自动切换               | 深浅模式由 CSS 变量统一控制 |
| `hover:bg-surface-hover` | `hover:bg-accent` 或交互 shortcut | 悬停态统一用语义类          |

如确有新的语义需求，请**先更新主题系统（`metadata.ts` + `uno.config.ts`）**再在 UI 中使用对应 token，禁止直接在模板里创造新的 `bg-*` 类名。

### 2.5 内容宽度规范（禁止 Tailwind 默认 max-w-\*）

UnoCSS 内置的 `presetUno` 会提供 Tailwind 风格的 `max-w-2xl` / `max-w-7xl` 等类，这些类对应固定的 `rem` 宽度，仅适合通用 Tailwind 项目。

在本项目中：

- **内容宽度必须基于视口或布局变量，而不是固定 rem：**
  - 居中宽容器：`w-full max-w-[80vw] mx-auto`
  - 文档/配置页面：`w-full max-w-[90vw] mx-auto`
  - 窄内容区（如描述、弹窗文案）：`w-full max-w-[60vw] mx-auto`

- **禁止直接使用的类（示例）：**

| ❌ 不允许   | ✅ 推荐写法                   | 场景示例            |
| ----------- | ----------------------------- | ------------------- |
| `max-w-7xl` | `w-full max-w-[90vw] mx-auto` | 系统配置文档页      |
| `max-w-6xl` | `w-full max-w-[80vw] mx-auto` | PrimeVue 组件示例页 |
| `max-w-2xl` | `w-full max-w-[60vw] mx-auto` | 表格/消息示例块     |

- 如需统一的「内容区域宽度」语义（例如 `contentNarrow` / `contentWide`），推荐：
  1. 在 `LAYOUT_DIMENSION_KEYS` 中为这些宽度定义 CSS 变量；
  2. 在 `uno.config.ts` 的布局变量规则中映射为 `w-contentWide` / `max-w-contentNarrow`；
  3. 视图中使用这些语义类，而不是继续依赖 `max-w-?xl`。

## 3. 图标系统：iconify + custom SVG

你项目的图标链路由三部分组成：

1. **依赖（iconify collections）**：`package.json` 中已包含 lucide/mdi/logos 等集合
2. **自定义 SVG（custom collection）**：放置于 `src/assets/icons/**`
3. **构建侧扫描与 safelist**：`build/uno-icons.ts` + `uno.config.ts`

## 4. `build/uno-icons.ts` 的真实行为

### 4.1 Route/API icon 扫描

会扫描：

- `src/router/**`（ts/vue）
- `src/api/**`（ts/vue）

并从源码中提取形如 `meta.icon` / `icon: '...'` 的字符串，纳入 safelist（过滤大量关键字/误匹配）。

### 4.2 Custom SVG loader

- 扫描 `src/assets/icons/**/*.svg`
- 将相对路径转为 name（子目录用 `-` 连接）：例如 `custom/juejin.svg` → `custom-juejin`
- 最终使用方式：`i-custom:custom-juejin`
- 并自动注入 `fill="currentColor"`，使图标继承文字颜色

## 5. UI 层使用规则（必须遵循）

- 所有图标必须通过 `Icons` 组件渲染（见 `src/components/Icons`）
- 优先顺序：
  1. `i-lucide-*`
  2. `i-mdi-*`
  3. `i-logos-*`
  4. `i-custom:*`（新增 SVG）

禁止：

- 手写 `<svg>` 图标
- 外链 icon URL
- base64 图标
