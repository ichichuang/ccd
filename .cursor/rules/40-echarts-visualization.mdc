---
description: ECharts premium visualization rules; Apple-level fluidity, Glassmorphism, data-driven
globs: src/**/*.{vue,ts,tsx}
---

# ECharts Visualization Rules (V2 Engine)

## 1. Chart Wrapper (BaseChart / UseEcharts)

- MUST use `UseEcharts` for ALL chart rendering; FORBIDDEN vue-echarts, raw ECharts, manual init
- UseEcharts IS the BaseChart: handles resize (autoResize), theme (ThemeStore/SizeStore), Vue reactivity
- In A3-stats-grid: wrap each chart in a card with `surface-elevated` or `glass-surface` per archetype

## 2. Canvas Color Injection (UnoCSS → ECharts)

- ECharts renders in Canvas/SVG; it CANNOT use UnoCSS classes (e.g. bg-white/70)
- All chart colors MUST come from `getChartSystemVariables()` / useChartTheme ThemeConfig
- FORBIDDEN: hex (#xxx), hardcoded rgb() in option.series, option.tooltip, option.title, etc.
- When ThemeStore.isGlassMode: chart backgroundColor MAY use withAlpha(background, 0.x); tooltip MUST use translucent card (`withAlpha(config.card, 0.92)`) for Glassmorphism aesthetic

## 3. Animation & Fluidity (Apple-Level)

- Chart animation MUST use design system easing: `cubic-bezier(0.16, 1, 0.3, 1)` (ease-out-expo)
- **Mandated ChartAnimationConfig:**
  - `animationEasing: 'cubic-bezier(0.16, 1, 0.3, 1)'`
  - `animationDuration: 1000`
  - `animationDurationUpdate: 400`
  - `animationEasingUpdate: 'cubic-bezier(0.16, 1, 0.3, 1)'`
- Tooltip transitions MUST be fluid: `transitionDuration: 0.3` (300ms), use background alphas for Glassmorphism
- Reference: uno.config.ts `transition-fluid`, `ease-out-expo`; data-region-transitions.scss

## 4. Data-Driven Chart Options

- Chart option generators MUST accept BaseBusinessDTO / API DTO as input; output EChartsOption
- FORBIDDEN: hardcoding series structure, colors, labels inside business logic (e.g. useFeatureLogic)
- Option builder: `(dto: XxxDTO) => EChartsOption`; UI constants (e.g. chart type, palette index) in config/schema, not in hooks

## 5. Reference

- ECHARTS_THEME.md
- ARCHETYPE_SPEC.md (A3-stats-grid)
- 20-ui-styling.mdc (glass-surface, transition-fluid)
- src/utils/theme/chartUtils.ts
