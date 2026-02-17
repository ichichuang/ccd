---
description: UI 架构规范：UnoCSS、PrimeVue 与组件系统
globs: **/*.vue, **/*.tsx, **/*.ts
alwaysApply: true
---

# UI 架构与样式规则

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
  - 自定义：`i-custom-xxx`
- **安全列表**：确保正确命名的图标，以便 `uno-icons.ts` 可以检测到它们。
