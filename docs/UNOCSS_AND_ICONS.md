# UnoCSS & Icons System (SSOT)

> **目标读者：AI**。本文档供 AI 在代码生成时参照，涉及样式编写、图标使用时必读。

本文档描述项目的 UnoCSS 语义类、SSOT 推导机制，以及 iconify + 自定义 SVG 的完整链路。UI 相关输出必须遵循。

## 1. UnoCSS 的 SSOT 驱动

核心文件：`uno.config.ts`

它直接引用并以其为唯一真理来源（SSOT）：

- `src/constants/breakpoints.ts` → breakpoints
- `src/constants/size.ts` → `LAYOUT_DIMENSION_KEYS`（布局变量白名单）
- `src/constants/sizeScale.ts` → `SIZE_SCALE_KEYS`（xs→5xl 阶梯）
- `src/utils/theme/metadata.ts` → 主题相关元数据（quadFamilies 含 primary、accent、danger、warn、success、info，对应语义类如 `bg-primary`、`text-info` 等）

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
- 状态色：`bg-primary` / `bg-accent` / `bg-danger` / `bg-warn` / `bg-success` / `bg-info` 及其 `-hover` / `-light`
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

### 2.6 边框（Border）

四边/单边边框须使用 `uno.config.ts` 中的**边框快捷类**，避免仅设 width+color 未设 style 导致不显示：

- **四边**：`component-border`（= `border border-solid border-border`）
- **底边**：`border-b-default`；**顶边**：`border-t-default`
- **禁止**：仅写 `border border-border`（未设置 border-style，边框不显示）。带透明度或其它 style（如 `border-dashed`）时单独写 `border border-solid border-border/50` 等。

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

**推荐：统一使用完整类名**

- 业务代码中推荐始终使用以 `i-` 开头的完整类名，避免歧义与转换边界情况：
  - Iconify：`i-lucide-xxx`、`i-mdi-xxx`、`i-logos-xxx`
  - 自定义：`i-custom:xxx`（注意 custom 使用冒号，不要写成 `i-custom-xxx`）
- PrimeVue 图标与上述不同，需通过 `import X from '@primevue/icons/xxx'` 使用组件，示例页中 PrimeVue 标签页仅展示名称与说明，不通过字符串渲染。

禁止：

- 手写 `<svg>` 图标
- 外链 icon URL
- base64 图标

## 6. Icons 组件完整使用指南

### 6.1 基础使用

```vue
<!-- 基础用法 -->
<Icons name="i-lucide-user" />

<!-- 自定义图标（子目录参与命名：custom/juejin.svg → i-custom:custom-juejin） -->
<Icons name="i-custom:custom-juejin" size="xl" />
```

### 6.2 尺寸控制

**标准阶梯（推荐）：**

- 使用语义尺寸：`xs` | `sm` | `md` | `lg` | `xl` | `2xl` | `3xl` | `4xl` | `5xl`
- 这些尺寸通过 `fs-*` 类名映射到 `--font-size-*` CSS 变量，联动 SizeStore
- 示例：`<Icons name="i-lucide-check" size="lg" />`

**自定义尺寸（特殊场景）：**

- 数字：`size={24}` → `24px`
- 字符串：`size="2rem"` / `size="50%"` → 支持任意 CSS 单位
- **何时使用自定义尺寸**：仅在标准阶梯无法满足设计需求时使用
- 示例：`<Icons name="i-lucide-star" size="1.5rem" />`

### 6.3 颜色控制

**两种方式：**

1. **语义类（推荐，静态颜色）**：
   - 通过 `class="text-primary"` 等 UnoCSS 类控制颜色
   - 示例：`<Icons name="i-lucide-check" class="text-primary" />`

2. **color prop（动态/主题变量）**：
   - 当需要动态颜色或使用 CSS 变量时使用 `color` prop
   - 示例：`<Icons name="i-lucide-check" color="rgb(var(--primary))" />`
   - **注意**：使用 `color` prop 时，组件会自动去掉默认 `text-foreground` 类，确保自定义颜色生效
   - **格式要求**：使用 `rgb(var(--primary))` 而不是 `var(--primary)`（因为主题变量是空格分隔的 RGB 三元组）

**最佳实践：**

- 静态颜色 → 使用语义类（`class="text-primary"`）
- 动态颜色/主题变量 → 使用 `color` prop（`color="rgb(var(--primary))"`）

### 6.4 动画与变换

#### 6.4.1 动画 (animation)

- `animation="spin"`：旋转动画（常用于加载状态）
- `animation="pulse"`：脉冲动画（常用于提示/通知）
- `animation="spin-pulse"`：旋转+脉冲组合动画

```vue
<!-- 旋转的加载图标 -->
<Icons name="i-lucide-loader" animation="spin" />

<!-- 脉冲提示图标 -->
<Icons name="i-lucide-bell" animation="pulse" />
```

#### 6.4.2 翻转 (flip)

- `flip="horizontal"`：水平翻转
- `flip="vertical"`：垂直翻转
- `flip="both"`：双向翻转

```vue
<!-- 水平翻转的箭头 -->
<Icons name="i-lucide-arrow-right" flip="horizontal" />
```

#### 6.4.3 旋转 (rotate)

- `rotate="90"` 或 `rotate={90}`：旋转 90 度
- 支持任意角度值（单位：deg）

```vue
<!-- 旋转 90 度的箭头 -->
<Icons name="i-lucide-arrow-up" rotate="90" />
```

#### 6.4.4 缩放 (scale)

- `scale={1.5}`：缩放 1.5 倍
- 支持任意数字值

```vue
<!-- 放大 1.5 倍的图标 -->
<Icons name="i-lucide-star" scale="{1.5}" />
```

#### 6.4.5 组合使用

```vue
<!-- 旋转 90 度并放大 -->
<Icons name="i-lucide-arrow-up" rotate="90" scale="{1.5}" />

<!-- 水平翻转 + 旋转 + 动画 -->
<Icons name="i-lucide-refresh" flip="horizontal" rotate="180" animation="spin" />
```

### 6.5 无障碍支持

- `label`：无障碍标签（`aria-label`）
- `title`：标题提示（`title` 属性）

```vue
<Icons name="i-lucide-user" label="用户图标" title="点击查看用户信息" />
```

### 6.6 类型定义参考

完整的类型定义见：`src/components/Icons/utils/types.ts`

- `IconsProps`：组件 Props 接口
- `IconSize`：尺寸类型（`SizeScaleKey | number | string`）
- `IconAnimation`：动画类型（`'spin' | 'pulse' | 'spin-pulse'`）
- `FlipDirection`：翻转方向类型（`'horizontal' | 'vertical' | 'both'`）

### 6.7 示例页面

项目提供了完整的图标示例页面：`src/views/example/Icons/IconsExample.vue`

**功能：**

- 浏览所有图标库（Lucide、MDI、Logos、Custom）
- 实时预览图标效果
- 测试尺寸、颜色、动画、翻转、旋转、缩放等功能
- 复制代码示例

**访问路径：** `/example/icons`

### 6.8 常见问题

#### Q: 为什么设置了 color prop 但颜色不生效？

A: 确保使用 `rgb(var(--primary))` 格式，而不是 `var(--primary)`。
组件会自动处理：当有 `color` prop 时，会移除默认的 `text-foreground` 类，确保自定义颜色生效。

#### Q: 何时使用语义尺寸 vs 自定义尺寸？

A:

- **语义尺寸（推荐）**：大多数场景使用 `xs~5xl`，这些尺寸会联动 SizeStore，响应式适配更好
- **自定义尺寸**：仅在标准阶梯无法满足设计需求时使用（如需要精确的 `1.5rem`、`50%` 等）

#### Q: 如何选择合适的图标库？

A: 按优先级选择：

1. **Lucide**（推荐默认）：现代、简洁、图标丰富
2. **MDI**（补充）：当 Lucide 没有合适图标时
3. **Logos**（品牌）：品牌/公司 logo
4. **Custom SVG**（最后选择）：当所有集合都没有合适图标时
