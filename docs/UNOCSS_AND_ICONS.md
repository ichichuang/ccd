# UnoCSS & Icons System (SSOT)

本文档描述项目的 UnoCSS 语义类、SSOT 推导机制，以及 iconify + 自定义 SVG 的完整链路。UI 相关输出必须遵循。

## 1. UnoCSS 的 SSOT 驱动

核心文件：`uno.config.ts`

它直接引用并以其为唯一真理来源（SSOT）：

- `src/constants/breakpoints.ts` → breakpoints
- `src/constants/size.ts` → `LAYOUT_DIMENSION_KEYS`（布局变量白名单）
- `src/constants/sizeScale.ts` → `SIZE_SCALE_KEYS`（xs→5xl 阶梯）
- `src/utils/theme/metadata.ts` → 主题相关元数据

结论：

- 断点、尺寸阶梯、布局变量、语义类的生成，全部由 SSOT 推导
- UI 代码禁止硬编码 px/rem/hex；必须使用语义类/变量

## 2. 语义类的核心能力（示例）

> 具体类名以 `uno.config.ts` 的规则引擎为准，这里只列“必须优先使用”的模式。

### 2.1 尺寸语义类（Spacing）

- padding：`p-padding-{scale}` / `px-padding-{scale}` / `py-padding-{scale}`
- margin：`m-margin-{scale}` / `mx-margin-{scale}` / `my-margin-{scale}`
- gap：`gap-gap-{scale}` / `gap-x-gap-{scale}` / `gap-y-gap-{scale}`

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
