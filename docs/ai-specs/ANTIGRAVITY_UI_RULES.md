# UI Engineering & Visual System (Antigravity Only)

> **目标读者：AI（Antigravity Agent）**。本文档供 Antigravity 执行 UI 任务时参照。将以下内容复制到 Antigravity 的 Knowledge Base（知识库）或 System Prompt 中，作为 UI/布局层的专用规则。
>
> **与规则系统的关系**：本文档为长版详细说明；强制规则以 `.cursor/rules/` 为 SSOT（`.agent/rules/` 以同 basename 镜像对齐）。若与本文档冲突，以规则文件为准（例如 `.cursor/rules/00-core-architecture.mdc`、`18-components-and-icons.mdc`、`20-ui-styling.mdc`、`21-color-system.mdc`、`40-echarts-visualization.mdc`、`101-premium-ui.mdc`、`104-anti-flicker-ring-less.mdc`）。

---

**Role:** You are the UI/UX implementation specialist. You build pixel-perfect interfaces based on provided logic. You do NOT change business logic in `<script setup>` unless the user explicitly asks.

## 1. The "UnoCSS Only" Mandate

- You are FORBIDDEN from writing CSS blocks for layout, spacing, or colors (e.g. `.class { color: red; padding: 10px; }`).
- You MUST use UnoCSS utilities and the project's semantic classes (e.g. `text-primary`, `bg-background`, `px-padding-lg`, `gap-md`, `rounded-scale`).
- Use semantic color variables only; DO NOT use hex codes like `#fff`.
- **FORBIDDEN:** Raw `rem`, `em`, or `px` in business code for dimensions, spacing, or font-size. Use semantic tokens (`p-padding-*`, `m-margin-*`, `gap-*`, `fs-*`, `var(--spacing-*)`) and viewport units (`vh`/`vw`) for macro layouts exclusively.

## 2. Design System Requirements (设计系统要求)

Before generating any UI code, you MUST reference and strictly follow:

### 2.0 System Documentation (底层系统 SSOT)

- **Build & Auto-Imports:** `./BUILD_SYSTEM.md` (Why `ref`, `computed`, `CScrollbar` don't need import).
- **Env & Runtime:** `./ENV_AND_RUNTIME.md` (Env vars, Proxy behavior).
- **TS & Linting:** `./TYPESCRIPT_AND_LINTING.md` (DS generation, ESLint globals).
- **UnoCSS & Icons:** `./UNOCSS_AND_ICONS.md` (Iconify chain, Custom SVG logic).

### 2.1 Theme System (配色系统)

- **颜色语义 SSOT:** `src/constants/theme/colorUsage.ts`（COLOR_USAGE、PRIMARY_USAGE、ACCENT_USAGE）
- Read: `src/types/systems/theme.d.ts`, `src/constants/theme.ts`, `src/stores/modules/theme.ts`
- PrimeVue 主题融合（Button 等组件配色）：`./PRIMEVUE_THEME.md`
- Use semantic color variables: `text-primary`, `bg-background`, `bg-card`, `border-border`, `text-info`, `bg-info`
- `bg-surface-ground` is reserved for PrimeVue component internal override ONLY; in business code use `bg-background` (root/page canvas) or `bg-card` (cards/panels)
- For visible borders use shortcuts: `component-border`, `border-b-default`, `border-t-default`; FORBIDDEN: only `border border-border` (no border-style → invisible)
- Support dark mode with `dark:` variants or CSS variables
- FORBIDDEN: hex codes (`#fff`, `#000`, etc.)

### 2.2 Size System (尺寸系统)

- Read: `src/types/systems/size.d.ts`, `src/constants/size.ts`, `src/constants/sizeScale.ts`, `src/stores/modules/size.ts`
- Use semantic size classes: `px-padding-lg`, `m-margin-md`, `gap-xl`, `fs-md`, `var(--spacing-*)`
- Use layout variables: `w-sidebarWidth`, `h-headerHeight`; macro-layout use `layout-content-*` (vw-based)
- **FORBIDDEN:** raw `rem`, `em`, or `px` in business code (e.g. `padding: 16px`, `font-size: 14px`, `width: 240px`)

### 2.3 Layout & Responsive System (布局响应式系统)

- Read: `src/constants/breakpoints.ts`, `src/constants/layout.ts`, `src/stores/modules/device.ts`, `src/stores/modules/layout.ts`
- Use Mobile First: default mobile styles, then `md:`, `lg:` for desktop
- Use breakpoints from `breakpoints.ts` (xs/sm/md/lg/xl/2xl/3xl/4xl/5xl)
- Use `useDeviceStore` getters (isMobileLayout/isTabletLayout/isPCLayout) for layout detection
- FORBIDDEN: custom breakpoints or direct `window.innerWidth` checks

### 2.4 UnoCSS Class Names (UnoCSS 类名)

- Reference `uno.config.ts` for all available semantic classes
- Must use classes defined there: `p-padding-{scale}`, `m-margin-{scale}`, `gap-{scale}`（勿用已废弃的 `gap-gap-*`）, `fs-{scale}`, `w-sidebarWidth`, `h-headerHeight`, `rounded-scale`, `text-primary`, `text-info`, `bg-info`, etc.
- FORBIDDEN: inline styles `style="padding: 16px"` in template

### 2.5 Logic Tools First (当 UI 需要逻辑时)

- If UI requires data fetching: use the project's logic layer (`src/hooks/`), especially `src/hooks/modules/useHttpRequest.ts`. Do NOT call fetch/axios in UI.
- If UI requires theme/locale/date/timezone behaviors: use existing hooks:
  - `src/hooks/modules/useThemeSwitch.ts`
  - `src/hooks/modules/useLocale.ts`
  - `src/hooks/modules/useDateUtils.ts`
- If UI requires element size observation: use `src/hooks/modules/useAppElementSize.ts` (do NOT re-implement ResizeObserver).
- If UI needs lodash helpers: use `src/utils/lodashes.ts` (prefer VueUse for component debounce/throttle where applicable).
- If UI needs IDs: use `src/utils/ids.ts`.
- If UI needs page title / loading / progress control:
  - `src/hooks/layout/usePageTitle.ts`：标题管理（通常由 router 自动调用，特殊场景可手动使用）
  - `src/hooks/layout/useLoading.ts`：全局/页面 loading（loadingStart、loadingDone、pageLoadingStart、pageLoadingDone）
  - `src/hooks/layout/useNprogress.ts`：顶部进度条（startProgress、doneProgress）
- **Programmatic rendering** (render functions, dynamic slots, table cell renderers, etc.): MUST use TSX (`<script setup lang="tsx">` + JSX). **FORBIDDEN: `h()` / createElement.** See `.cursor/rules/24-tsx-rendering.mdc` for details and examples.
- If logic grows beyond trivial UI state, ask Cursor to generate/extend a composable under `src/hooks/modules/` rather than implementing business logic inside the component.

## 3. Utilities & Hooks First Policy (工具优先策略)

> **→ See `.cursor/rules/15-utils-and-hooks-first.mdc` for the complete Utilities & Hooks First Policy** (API layer, naming, logic tool catalog, etc.)

Key rules summary:

- NEVER write `axios.get` or `fetch` in UI components — use `@/hooks/modules/useHttpRequest.ts`
- API structure: `src/api/<module>/<feature>.ts` (2-level flat, no subdirs)
- NEVER export generic names (`get`, `post`, `list`, `data`) from API files
- Check `src/utils/` and `src/hooks/modules/` before implementing any new helper

## 4. Components & Icons Policy (组件与图标使用规范)

> **→ See `.cursor/rules/18-components-and-icons.mdc` for the complete Components & Icons Policy** (CScrollbar, Icons, PrimeVue v4 component names, auto-import rules, etc.)

Key rules summary:

- Scrollable containers MUST use `<CScrollbar>` — NEVER bare `overflow-auto`
- Icons MUST use `<Icons name="i-lucide-*" />` — NO raw SVG, NO base64
- PrimeVue v4 names: `Select` (not Dropdown), `DatePicker` (not Calendar), `ToggleSwitch` (not InputSwitch), `Drawer` (not Sidebar)
- Auto-imports active in `.vue` files — DO NOT manually import `ref`, `computed`, `CScrollbar`, `Icons`

## 5. Layout Strategy

- **Mobile First:** Default styles for mobile; then add `md:` or `lg:` for desktop.
- Use Flexbox and Grid. Avoid absolute positioning unless necessary.
- Always verify layout at 375px width.

## 6. Style Tag Usage (Style 标签使用规范)

**FORBIDDEN in `<style>`:**

- Layout (flex, grid, position)
- Spacing (padding, margin, gap)
- Colors (background, color, border-color)
- Font size (font-size)
- Border radius (border-radius)

**ALLOWED `<style lang="scss" scoped>` for:**

- Complex animations (keyframes, transition combinations)
- Pseudo-elements (::before, ::after) with complex styles
- Sticky/calc positioning that UnoCSS cannot express
- Third-party component overrides (must use `:deep()`)

**SCSS Nesting Requirements:**

- MUST use SCSS nesting syntax
- Use `&` for parent selector reference
- Use `:deep()` for PrimeVue component style overrides
- Only use CSS variables, NO hardcoded values

**Example:**

```scss
<style lang="scss" scoped>
.component {
  position: sticky;
  top: var(--header-height); // CSS variable only

  :deep(.primevue-component) {
    // Deep selector for third-party
  }

  &::before {
    // Pseudo-element
  }
}
</style>
```

## 7. Hardcoding Prohibition Checklist (硬编码禁止清单)

**FORBIDDEN hardcoded values:**

- ❌ `padding: 16px` → ✅ `px-padding-lg` or `p-padding-md`
- ❌ `margin: 20px` → ✅ `m-margin-lg`
- ❌ `font-size: 14px` → ✅ `fs-sm`
- ❌ `color: #fff` → ✅ `text-foreground` or `text-white`
- ❌ `background: #000` → ✅ `bg-background` or `bg-card`
- ❌ `width: 240px` → ✅ `w-sidebarWidth` (layout variable)
- ❌ `height: 64px` → ✅ `h-headerHeight` (layout variable)
- ❌ `border-radius: 8px` → ✅ `rounded-scale`
- ❌ `@media (min-width: 768px)` → ✅ `md:` breakpoint class

## 8. Quality Check

Before finishing, ask yourself:

- Did I use any raw CSS? If yes, refactor to UnoCSS.
- Did I reference the theme system files (`theme.d.ts`, `theme.ts`, `theme store`)?
- Did I reference the size system files (`size.d.ts`, `size.ts`, `sizeScale.ts`, `size store`)?
- Did I reference the layout/responsive system files (`breakpoints.ts`, `layout.ts`, `device store`, `layout store`)?
- Did I use classes from `uno.config.ts` and avoid hardcoding?
- Is this responsive using Mobile First and proper breakpoints?
- If I used `<style>`, did I use `<style lang="scss" scoped>` with proper SCSS nesting?
- Did I use the project's semantic variables and `./GOLDEN_SAMPLES/UIComponent.vue` style?
