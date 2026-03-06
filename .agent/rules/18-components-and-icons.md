---
description: Component and icon rules: prefer src/components (Icons/CScrollbar/UseEcharts); icons must use Icons + iconify/custom
globs: src/**/*.{vue,tsx}
alwaysApply: true
---

# Components & Icons Policy (UI Must Follow)

## 1. Primary Directive

When generating or editing UI pages/components, you MUST:

1. Prefer using existing components in `src/components/` over re-implementing UI patterns.
2. Use the project's `Icons` component for ALL icons.
3. Follow the design system rules (UnoCSS semantic classes, no hardcoding).

## 2. Component Reuse Map (Must Use First)

### Scroll container

- Use `CScrollbar` (`src/components/CScrollbar`); write `<CScrollbar>` in template
- Do NOT replace it with ad-hoc `overflow-auto` containers unless explicitly requested.

### Animation wrapper

- Use `AnimateWrapper` (`src/components/AnimateWrapper`) for enter/leave animations (animate.css)
- Use cases: layout transitions, dynamic list add/remove, dynamic form field display
- Props: `animateName`, `tag`, `duration`; see `AnimateWrapper/utils/types.ts`

### Empty state

- Use `EmptyState` (`src/components/EmptyState`) when tables, charts, or overview areas have no data.
- Props: `icon`, `title`, `description`, optional `actionLabel` + `actionTo`. See `docs/ai-specs/EMPTY_STATE_AND_ROBUSTNESS.md`.
- FORBIDDEN: blank screens or single-line "no data" text; use EmptyState structure (icon + title + description).

### Icons

- Use `Icons` (`src/components/Icons`)
- FORBIDDEN: writing raw `<svg>` icons, external icon URLs, base64 icon images.

### Charts

- **MUST use `UseEcharts`** (`src/components/UseEcharts/UseEcharts.vue`) for ALL chart scenarios.
- **FORBIDDEN**: manually instantiating ECharts directly in a page, or using vue-echarts directly.
- **FORBIDDEN**: hardcoding colors in ECharts option → `UseEcharts` automatically integrates `useChartTheme`.
- **FORBIDDEN**: manually listening to ThemeStore to update charts → `UseEcharts` automatically responds to theme changes.
- **Component features**:
  - Automatic theme integration (ThemeStore/SizeStore)
  - Responsive theme switching
  - Multi-chart linkage (via `group` or `connectConfig`)
  - Event handling (60+ ECharts events via `on*` props)
  - Exposed methods via ref (`getEchartsInstance`, `setOption`, `resize`, `clear`, `dispose`, `triggerConnect`, etc.)
- **Usage**: See `docs/ai-specs/ECHARTS_THEME.md` for complete API and examples.

### PrimeVue UI Components

- For **forms & inputs** (text, password, number, checkbox, radio, select, multi-select, date, switch):
  - **Multi-field, validation/steps/groups/dynamic schema**: MUST use SchemaForm (`@/components/SchemaForm`) + useSchemaForm (`@/hooks/modules/useSchemaForm`); see `docs/ai-specs/SCHEMA_FORM_COMPONENT.md`.
  - Simple 1–2 fields: use PrimeVue v4 components directly: `<InputText>`, `<Password>`, `<InputNumber>`, `<Checkbox>`, `<RadioButton>`, `<Select>`, `<MultiSelect>`, `<DatePicker>`, `<ToggleSwitch>`. FORBIDDEN: v3 deprecated names (`Dropdown`, `Calendar`, `InputSwitch`). See `docs/ai-specs/PRIMEVUE_V4_API.md`.
- For **actions/buttons**:
  - MUST use `<Button>` for primary/secondary actions instead of styling raw `<button>` or `<a>`.
  - Button colors controlled by `src/utils/theme/primevuePreset.ts`; Primary text/outlined hover uses accent-light, others use `*-light`; do NOT use `*-foreground` as background. See `docs/ai-specs/PRIMEVUE_THEME.md`.
- For **tables/lists**:
  - **Interactive data tables**: MUST use **DataTable** (`@/components/DataTable`); see `docs/ai-specs/DataTable_COMPONENT.md`.
  - Simple static tables / one-off display may use PrimeVue `<DataTable>`; for pagination/sort/filter/export/API MUST use DataTable.
  - FORBIDDEN: Using raw PrimeVue DataTable or hand-written `<table>` when pagination/sort/filter/export/API is needed.
- For **dialogs/overlays**:
  - MUST use `<Dialog>` / `<Drawer>` (PrimeVue v4 side drawer) instead of ad-hoc fixed modals. FORBIDDEN: v3 `Sidebar`, `OverlayPanel`; v4 uses `Drawer`, `Popover`.
  - **Project wrapper PrimeDialog**: For custom dialogs, feedback, confirm dialogs, MUST use `useDialog()` (`@/hooks/modules/useDialog`). `PrimeVueDialog` is mounted in `AppPrimeVueGlobals.vue` (via `App.vue`); call `info`, `success`, `warn`, `danger`, `confirm`, `confirmDelete`, `openDialog`. Advanced: `contentRenderer`, `headerRenderer`, `footerRenderer`, `footerButtons`, `beforeSure`, `beforeCancel`, `sureBtnLoading`. See `docs/ai-specs/DIALOG_COMPONENT.md`.
  - Simple confirm: PrimeVue `useConfirm().require()`; complex custom/multi-layer dialogs: `useDialog()`. FORBIDDEN: instantiating PrimeVue `<Dialog>` directly in business code.
- For **Toast / Message**:
  - **Inside components** (lightweight): use PrimeVue `useToast()`.
  - **Non-component** (interceptors, errorHandler, utils): MUST use `window.$toast` / `window.$message`; see `docs/ai-specs/TOAST_AND_MESSAGE.md`. FORBIDDEN: custom global Toast/Message or DOM-based notifications in business code.
  - **$message**: centered, no close button, auto-dismiss after life. **$toast**: positionable, with close button. See `docs/ai-specs/TOAST_AND_MESSAGE.md` for style overrides.

Styling PrimeVue components:

- MUST style them using UnoCSS classes on the component and/or `pt` (PassThrough) configuration.
- FORBIDDEN: adding custom CSS rules to control layout/spacing/colors for PrimeVue components when the same can be achieved by UnoCSS semantic classes and design system variables.

## 3. Auto Import Awareness

This project auto-imports components/functions and generates:

- `src/types/auto-imports.d.ts`
- `src/types/components.d.ts`

**Full config**: imports and dirs in `docs/ai-specs/BUILD_SYSTEM.md` §2; component scan scope (only `src/components`, exclude `src/layouts`, PrimeVue on-demand) in §3.

Rules:

- Prefer relying on auto-imports (avoid redundant manual imports) unless the file requires explicit imports.

## 4. Icons: Smart Selection Rules

### 4.1 Default preference order

1. **Lucide** (recommended default): `i-lucide-...`
2. **MDI** (fallback for missing lucide): `i-mdi-...`
3. **Logos** (brands): `i-logos-...`
4. **Custom SVG** (when no suitable icon exists):
   - Place SVG under `src/assets/icons/**`
   - Use `i-custom:...` naming (custom collection)
   - Custom icon loading/safelist is handled by `build/uno-icons.ts` + `uno.config.ts`

### 4.2 Usage requirements

- Always render icons via `<Icons name="..." />`.
- **Size**:
  - Prefer semantic sizing (`size="xs|sm|md|lg|xl|2xl|3xl|4xl|5xl"`) over hardcoded pixel sizes.
  - Custom sizes (`size={24}` or `size="2rem"`) only when semantic sizes don't fit.
- **Color**:
  - **Static**: Use semantic classes via UnoCSS; in PrimeVue/parent-heavy styles, add `!` or use `color` prop if class is overridden.
  - **Dynamic/theme vars**: Use `color` prop (`color="rgb(var(--primary))"`).
  - **Format**: `color` MUST use `rgb(var(--primary))`, not `var(--primary)`; no hex.
  - **Class specificity**: When `class="text-primary"` etc. does not apply, add `!` (e.g. `text-primary!`, `group-hover:text-accent-light-foreground!`) or use `color` prop.
  - **Inherit parent**: Use `class="text-current"` when matching parent text color.
  - See `docs/ai-specs/UNOCSS_AND_ICONS.md` §6.3.1.
- **Animation/transform**: See `docs/ai-specs/UNOCSS_AND_ICONS.md` §6.4 for `animation`, `flip`, `rotate`, `scale`.
- **Icons + transition**: When Icons use `group-hover:`/`hover:` color or opacity, transition MUST be on Icons class; parent transition does not apply. See §2.7.1, §6.3.2.

## 5. Forbidden Patterns

- FORBIDDEN: Hand-writing PrimeVue form components when multi-field/validation/steps/groups/dynamic schema is needed; use SchemaForm + useSchemaForm; see `docs/ai-specs/SCHEMA_FORM_COMPONENT.md`.
- FORBIDDEN: raw `<svg>` icon markup in templates.
- FORBIDDEN: Instantiating PrimeVue `<Dialog>` directly in business code; use `useDialog()`; see `docs/ai-specs/DIALOG_COMPONENT.md`.
- FORBIDDEN: Custom global Toast/Message outside components; use `window.$toast` / `window.$message`; see `docs/ai-specs/TOAST_AND_MESSAGE.md`.
- FORBIDDEN: adding custom CSS for icon sizing/colors; use UnoCSS + `Icons` props/classes.
- FORBIDDEN: bypassing `UseEcharts` for charts when it can be used.
- FORBIDDEN: Using raw PrimeVue DataTable or hand-written `<table>` when pagination/sort/filter/export/API is needed; use DataTable; see `docs/ai-specs/DataTable_COMPONENT.md`.
