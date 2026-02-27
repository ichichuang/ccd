---
description: UI architecture: UnoCSS, PrimeVue, component system
globs: **/*.vue, **/*.tsx, **/*.ts
alwaysApply: true
---

# UI Architecture and Style Rules

## 0. Color Semantic Authority (read before color decisions)

**Color semantic decisions follow `src/constants/theme/colorUsage.ts` (SSOT)**; see `.cursor/rules/21-color-authority.mdc`, `21-color-semantic-usage.mdc`. primary=brand, primary-hover=hover, primary-light=focus preselect, accent=independent complementary highlight (Tab indicator/special markers), ring=focus ring. Use primary-hover family for hover/active.

## 1. UnoCSS (the only styling approach)

- **Semantic classes**: Prefer semantic classes over raw utilities.
  - ✅ `text-primary`, `bg-card`; borders: `component-border`, `border-b-default`, `border-t-default`
  - ❌ `text-[#333]`, `bg-white`, `border-gray-200`; ❌ only `border border-border` (no border-style, won't show)
- **Size scale**: Use project scale (`xs` to `5xl`).
  - ✅ `p-md`, `m-lg`, `gap-sm`, `rounded-md`, `fs-xl`
  - ❌ `p-[10px]`, `m-20px`, `gap-4` (Tailwind-style numbers usually forbidden unless matching scale)
- **Layout variables**: Use strict layout keys from `uno.config.ts`.
  - ✅ `w-sidebarWidth`, `h-headerHeight`
- **Shortcuts**: Use shortcuts from `uno.config.ts` for common patterns.
  - `row-center`, `column-center`, `interactive-hover`; borders: `component-border`, `border-b-default`, `border-t-default`

- **Agent global visual hardcoding ban**:
  - When generating/editing UI code, do NOT introduce any hardcoded visual values (spacing, size, font-size, color, radius, shadow, or media query px/rem/hex) in template, TSX, CSS/SCSS, or PrimeVue `pt`.
  - All visual decisions must be expressed via theme/size/layout system + UnoCSS semantic classes and CSS variables (e.g. `px-padding-lg`, `m-margin-md`, `gap-xl`, `fs-sm`, `w-sidebarWidth`, `h-headerHeight`, `text-foreground`, `bg-surface-ground`, `rounded-scale`, `md:...`).
  - UnoCSS class names must be valid per `uno.config.ts` patterns (semantic size/layout/color, fs-\*, layout vars, shortcuts).
  - Tailwind-style numeric utilities or arbitrary classes (e.g. `p-4`, `mt-6`, `w-[240px]`) not mapped in `uno.config.ts` are invalid and forbidden.

## 2. Project Components (reuse first)

- **Scroll container**: `<CScrollbar>` (`src/components/CScrollbar`), replace `overflow-auto`
- **Animation wrapper**: `<AnimateWrapper>` (`src/components/AnimateWrapper`) for enter/leave (layout transitions, dynamic list items, etc.)
- **Empty state**: `<EmptyState>` (`src/components/EmptyState`) for tables/charts/overview when no data; see `docs/ai-specs/EMPTY_STATE_AND_ROBUSTNESS.md`
- **Icons**: `<Icons name="..." />`
- **Charts**: `<UseEcharts>` (see §2d)

## 2a. PrimeVue Integration

- **Version & API**: This project uses PrimeVue v4; reference `docs/ai-specs/PRIMEVUE_V4_API.md` and https://primevue.org/ when generating PrimeVue code. FORBIDDEN v3 deprecated names: `Dropdown`→`Select`, `Calendar`→`DatePicker`, `InputSwitch`→`ToggleSwitch`, `Sidebar`→`Drawer`, `OverlayPanel`→`Popover`.
- **Unstyled mode**: PrimeVue is used in unstyled mode or with PassThrough.
- **Global components**: `AppPrimeVueGlobals.vue` handles global Toast/Dialog/Confirm.
- **Custom wrappers**:
  - **Dialog**: For dynamic content, MUST use `useDialog()` Hook, not raw `<Dialog>`.
  - **Icons**: MUST use `<Icons name="..." />`.

## 2b. Schema-driven Forms

- **SchemaForm**: When task involves multi-field, validation, steps, groups, or dynamic schema, MUST use SchemaForm (`@/components/SchemaForm`) + useSchemaForm (`@/hooks/modules/useSchemaForm`).
- **Simple forms**: 1–2 fields may use PrimeVue InputText, Select, etc. directly.
- See `docs/ai-specs/SCHEMA_FORM_COMPONENT.md` for details.

## 2c. Tables

- **DataTable**: When task involves **interactive data tables** (pagination, sort, filter, export, API load), MUST use DataTable (`@/components/DataTable`).
- Simple static tables or one-off display may use PrimeVue `<DataTable>`; for pagination/sort/filter/export/API MUST use DataTable.
- **Column body/renderer**: When returning VNode, MUST use TSX (JSX), not template strings; if JSX in .vue, MUST use `lang="tsx"`. MUST reference `docs/ai-specs/GOLDEN_SAMPLES/DataTableBodyColumn.vue`. See `docs/ai-specs/DataTable_COMPONENT.md` §7.1, `docs/ai-specs/AI_CODING_PROTOCOL.md`.

## 2d. Charts

- **UseEcharts**: When task involves **any chart scenario**, MUST use UseEcharts (`@/components/UseEcharts`).
- **FORBIDDEN**: Manually instantiating ECharts or using vue-echarts directly.
- **FORBIDDEN**: Hardcoding colors in ECharts option → UseEcharts auto-integrates `useChartTheme`.
- **FORBIDDEN**: Manually listening to ThemeStore to update charts → UseEcharts responds to theme switch.
- **Component features**: Auto theme integration (ThemeStore/SizeStore), responsive theme switching, multi-chart sync (group/connectConfig), event handling (60+ ECharts events via on\* props), exposed methods via ref (getEchartsInstance, setOption, resize, clear, dispose, triggerConnect).
- **Chart types**: Bar, Line, Scatter, Pie, Radar, Gauge, Funnel, Graph, Tree, Treemap, Sunburst, Heatmap, Boxplot, Candlestick, Parallel, ThemeRiver, Sankey, EffectScatter, PictorialBar, Lines, etc. (20+).
- **useChartTheme Hook**: Reactive theming with opacity, size system, advanced config merge.
- See `docs/ai-specs/ECHARTS_THEME.md` for details.

## 3. Component Structure (Vue 3 SBA)

- **Script**: Default `<script setup lang="ts">` (Composition API only); when script uses JSX (body/formatter/contentRenderer returning VNode), MUST use `lang="tsx"`.
- **Template**: Keep concise. Move complex logic to `computed` or hooks.
- **Style**: Avoid `<style>`; use UnoCSS classes. If `<style>` is required (complex animation), use `<style lang="scss" scoped>`. Use `:deep()` for child component overrides.

## 4. Icon Strategy

- **Component**: Always use `@/components/Icons/Icons.vue`.
- **Naming**: Lucide (preferred) `i-lucide-home`; MDI `i-mdi-account`; Custom `i-custom:xxx` (note colon, not `i-custom-xxx`).
- **Safelist**: Ensure correct naming so `uno-icons.ts` can detect icons.

### 4.1 Color and Specificity (Icons color customization — required reading)

When customizing Icons color via `class` and it doesn't apply, add UnoCSS `!` modifier or use `color` prop.

**Root cause**: Icons adds `text-foreground` when `color` is not passed; inside PrimeVue/parent, parent styles have higher specificity, so plain `text-*` is overridden.

**Decision rules (AI must follow):**

| Scenario                 | Approach         | Example                                     |
| ------------------------ | ---------------- | ------------------------------------------- |
| Need override, avoid `!` | `color` prop     | `color="rgb(var(--primary))"`               |
| Need override with class | Add `!` to class | `class="text-primary!"`                     |
| hover / group-hover      | Add `!` to state | `group-hover:text-accent-light-foreground!` |
| opacity overridden       | `opacity-*!`     | `opacity-100!`                              |
| Inherit parent color     | `text-current`   | `class="text-current"`                      |

**Forbidden**: hex in `color` prop; `var(--primary)` instead of `rgb(var(--primary))`.

## 5. Interaction Transitions — required reading for AI

When using `hover:`, `active:`, `focus:`, `group-hover:`, etc., **MUST** pair with transition classes to avoid abrupt state changes. Transition classes come from `uno.config.ts`; hardcoded durations forbidden.

**Decision rules (AI choose by scenario):**

| Scenario               | Recommendation                                     | Notes                                           |
| ---------------------- | -------------------------------------------------- | ----------------------------------------------- |
| Hoverable card/button  | `interactive-hover` or `behavior-hover-transition` | Includes transition-all + duration-scale-md     |
| Click feedback (scale) | `interactive-click`                                | Includes transition-transform duration-scale-md |
| Custom transition      | `transition-all duration-scale-{xs~5xl}`           | Scale: xs 100ms ~ 5xl 2000ms                    |
| Width/single property  | `transition-[width] duration-scale-md ease-in-out` | Sidebar etc.                                    |
| PrimeVue pt content    | `transition-colors duration-scale-md hover:...`    | hover/active in pt also need transition         |

**duration-scale pairing**: `duration-scale-*` MUST pair with transition*; transition* must pair with duration-scale-\*. Forbidden: duration-scale or transition alone.

**Icons (required)**: When Icons use `group-hover:` color/opacity, transition MUST be on **Icons class**; parent transition does not apply.

**Forbidden**: hover/active/focus without transition; duration-scale-\* alone; hardcoded duration.

**SSOT**: `src/constants/sizeScale.ts` TRANSITION_SCALE_VALUES; `docs/ai-specs/UNOCSS_AND_ICONS.md` §2.7, §2.7.1, §6.3.2.
