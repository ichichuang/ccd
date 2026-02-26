---
description: UI 架构规范：UnoCSS、PrimeVue 与组件系统
globs: **/*.vue, **/*.tsx, **/*.ts
alwaysApply: true
---

# UI 架构与样式规则

## 0. 颜色语义权威（配色决策必读）

**颜色语义决策以 `src/constants/theme/colorUsage.ts` 为准（SSOT）**，详见 `.cursor/rules/21-color-authority.mdc`、`21-color-semantic-usage.mdc`。primary=品牌，primary-hover=悬停，primary-light=聚焦预选，accent=独立互补高亮（Tab 指示线/特殊标记），ring=focus ring。hover/active 使用 primary-hover 系列。

## 1. UnoCSS（唯一的样式方式）

- **语义类**：优先使用语义类而不是原始工具类。
  - ✅ `text-primary`、`bg-card`；边框可见时用快捷类：`component-border`、`border-b-default`、`border-t-default`
  - ❌ `text-[#333]`、`bg-white`、`border-gray-200`；❌ 仅写 `border border-border`（缺 border-solid 不显示）
- **尺寸比例**：使用项目的尺寸比例（`xs` 到 `5xl`）。
  - ✅ `p-md`、`m-lg`、`gap-sm`、`rounded-md`、`fs-xl`
  - ❌ `p-[10px]`、`m-20px`、`gap-4`（除非匹配到比例，否则通常禁止使用 Tailwind 风格的数字）
- **布局变量**：使用 `uno.config.ts` 中的严格布局键。
  - ✅ `w-sidebarWidth`、`h-headerHeight`
- **快捷方式**：使用 `uno.config.ts` 中定义的快捷方式处理常见模式。
  - `row-center`、`column-center`、`interactive-hover`；边框：`component-border`、`border-b-default`、`border-t-default`

- **Agent 全局视觉硬编码禁令**：
  - 生成或编辑 UI 代码时，不得在模板、TSX、CSS/SCSS 或 PrimeVue `pt` 配置中引入任何硬编码的视觉值（间距、尺寸、字体大小、颜色、圆角、阴影或媒体查询的 px/rem/hex）。
  - 所有视觉决策必须通过主题/尺寸/布局系统 + UnoCSS 语义类和 CSS 变量来表达（例如 `px-padding-lg`、`m-margin-md`、`gap-xl`、`fs-sm`、`w-sidebarWidth`、`h-headerHeight`、`text-foreground`、`bg-surface-ground`、`rounded-scale`、`md:...`）。
  - 你生成的 UnoCSS 类名必须根据 `uno.config.ts` 的模式和快捷方式有效（语义尺寸/布局/颜色模式、fs-\*、布局变量、定义的快捷方式等）。
  - 未在 `uno.config.ts` 中明确映射的 Tailwind 风格数字工具类或任意值类（例如 `p-4`、`mt-6`、`w-[240px]`）被视为无效且被禁止。

## 2. 项目封装组件（优先复用）

- **滚动容器**：`<CScrollbar>`（`src/components/CScrollbar`），替代 `overflow-auto`
- **动画包装**：`<AnimateWrapper>`（`src/components/AnimateWrapper`），进场/离场动画（布局切换、动态列表项等）
- **图标**：`<Icons name="..." />`
- **图表**：`<UseEcharts>`（见 §2d）

## 2a. PrimeVue 集成

- **无样式模式**：我们在无样式模式或使用 PassThrough 的情况下使用 PrimeVue。
- **全局组件**：`AppPrimeVueGlobals.vue` 处理全局 Toast/Dialog/Confirm。
- **自定义包装器**：
  - **Dialog**：对于动态内容，必须使用 `useDialog()` Hook，而不是直接使用 `<Dialog>` 组件。
  - **Icons**：必须使用 `<Icons name="..." />` 组件。

## 2b. Schema 驱动表单

- **SchemaForm**：当任务涉及多字段、校验、分步、分组或动态 schema 时，必须使用 SchemaForm（`@/components/SchemaForm`）+ useSchemaForm（`@/hooks/modules/useSchemaForm`）。
- **简单表单**：1–2 个字段时可直接使用 PrimeVue InputText、Select 等。
- 详细用法见 `docs/SCHEMA_FORM_COMPONENT.md`。

## 2c. 表格

- **DataTable**：当任务涉及**交互式数据表格**（分页、排序、筛选、导出、API 加载）时，必须使用 DataTable（`@/components/DataTable`）。
- 简单静态表格、一次性展示可用 PrimeVue `<DataTable>`；需分页/排序/筛选/导出/API 时必须用 DataTable。
- 详细用法见 `docs/DataTable_COMPONENT.md`。

## 2d. 图表

- **UseEcharts**：当任务涉及**任何图表场景**时，必须使用 UseEcharts（`@/components/UseEcharts`）。
- **FORBIDDEN**：手动实例化 ECharts 或直接使用 vue-echarts。
- **FORBIDDEN**：在 ECharts option 中硬编码颜色值 → `UseEcharts` 自动集成 `useChartTheme`。
- **FORBIDDEN**：手动监听 ThemeStore 来更新图表 → `UseEcharts` 自动响应主题切换。
- **组件特性**：
  - 自动主题集成（ThemeStore/SizeStore）
  - 响应式主题切换
  - 多图表联动（通过 `group` 或 `connectConfig`）
  - 事件处理（60+ ECharts 事件通过 `on*` props）
  - 暴露方法（通过 ref：`getEchartsInstance`、`setOption`、`resize`、`clear`、`dispose`、`triggerConnect` 等）
- **支持的图表类型**：Bar、Line、Scatter、Pie、Radar、Gauge、Funnel、Graph、Tree、Treemap、Sunburst、Heatmap、Boxplot、Candlestick、Parallel、ThemeRiver、Sankey、EffectScatter、PictorialBar、Lines 等 20+ 种。
- **useChartTheme Hook**：提供响应式主题化能力，支持透明度配置、尺寸系统集成、高级配置合并。
- 详细用法见 `docs/ECHARTS_THEME.md`。

## 3. 组件结构（Vue 3 SBA）

- **Script**：`<script setup lang="ts">`（仅 Composition API）。
- **Template**：保持简洁。将复杂逻辑移至 `computed` 或 `hooks`。
- **Style**：
  - 避免使用 `<style>` 标签。使用 UnoCSS 类。
  - 如果 `<style>` 是必需的（复杂动画），使用 `<style lang="scss" scoped>`。
  - 使用 `:deep()` 覆盖子组件样式。

## 4. 图标策略

- **组件**：始终使用 `@/components/Icons/Icons.vue`。
- **命名**：
  - Lucide（首选）：`i-lucide-home`
  - MDI：`i-mdi-account`
  - 自定义：`i-custom:xxx`（注意冒号，不要写成 `i-custom-xxx`）
- **安全列表**：确保正确命名的图标，以便 `uno-icons.ts` 可以检测到它们。

### 4.1 颜色与权重（Icons 颜色定制必读）

当通过 `class` 自定义 Icons 颜色时，若样式不生效，需为类名加 UnoCSS `!` 修饰符或改用 `color` prop。

**根因**：Icons 在未传 `color` 时会添加 `text-foreground`；在 PrimeVue/父级内时，父级样式权重更高，普通 `text-*` 易被覆盖。

**决策规则（AI 必按此选）：**

| 场景                 | 方式           | 示例                                        |
| -------------------- | -------------- | ------------------------------------------- |
| 需强制覆盖且避免 `!` | `color` prop   | `color="rgb(var(--primary))"`               |
| 需覆盖且用 class     | 颜色类加 `!`   | `class="text-primary!"`                     |
| hover / group-hover  | 状态类加 `!`   | `group-hover:text-accent-light-foreground!` |
| opacity 被覆盖       | `opacity-*!`   | `opacity-100!`                              |
| 继承父级颜色         | `text-current` | `class="text-current"`                      |

**禁止**：在 `color` prop 中使用 hex；使用 `var(--primary)` 而非 `rgb(var(--primary))`。

## 5. 交互过渡（Transition）— AI 必读

使用 `hover:`、`active:`、`focus:`、`group-hover:` 等交互状态时，**必须**搭配 transition 过渡类，避免状态切换生硬。过渡类来自 `uno.config.ts`，禁止硬编码时长。

**决策规则（AI 按场景选）：**

| 场景                | 推荐                                               | 说明                                      |
| ------------------- | -------------------------------------------------- | ----------------------------------------- |
| 可悬停卡片/按钮     | `interactive-hover` 或 `behavior-hover-transition` | 含 transition-all + duration-scale-md     |
| 点击反馈（scale）   | `interactive-click`                                | 含 transition-transform duration-scale-xs |
| 自定义过渡          | `transition-all duration-scale-{xs~5xl}`           | 阶梯：xs 75ms ~ 5xl 1500ms                |
| 宽度/单属性         | `transition-[width] duration-scale-lg ease-in-out` | 侧栏等                                    |
| PrimeVue pt content | `transition-colors duration-scale-md hover:...`    | pt 中的 hover/active 同样需 transition    |

**duration-scale 搭配**：`duration-scale-*` 必须与 transition* 搭配；transition* 也必须配合 duration-scale-\*。禁止单独写 duration-scale 或 transition。

**Icons 特殊（必读）**：Icons 使用 `group-hover:` 颜色/透明度时，transition 必须写在 **Icons 的 class 上**，父容器 transition 无效。

**禁止**：`hover:`/`active:`/`focus:` 不加 transition；`duration-scale-*` 单独使用；硬编码 duration。

**SSOT**：`src/constants/sizeScale.ts` TRANSITION_SCALE_VALUES；`docs/UNOCSS_AND_ICONS.md` §2.7、§2.7.1、§6.3.2。
