# UseEcharts

`UseEcharts` is the project-standard ECharts wrapper. Business code should render charts through this component and keep visual theming in `useChartTheme`.

## Rendering Contract

Charts are mounted only after the container has a non-zero size. Runtime rendering is guarded by `echarts-render-core`, a framework-agnostic scheduler that coordinates:

- `ResizeObserver` through `useAppElementSize` for parent, flex, grid, sidebar, and container size changes.
- `IntersectionObserver` for hidden or lazy-visible containers entering the viewport.
- `onActivated()` for KeepAlive restoration.
- A single `requestAnimationFrame` scheduling path for resize and pending option flushes.

This protects against common blank-rendering paths: `0x0` initialization, tab activation, `display:none -> block`, parent resize, and moved or reused containers.

## Required Usage

```vue
<script setup lang="ts">
import type { EChartsOption } from 'echarts'
import { useChartTheme } from '@/hooks/modules/useChartTheme'

const rawOption = computed<EChartsOption>(() => ({
  xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed'] },
  yAxis: { type: 'value' },
  series: [{ type: 'bar', data: [120, 200, 150] }],
}))

const { themedOption } = useChartTheme(rawOption)
</script>

<template>
  <UseEcharts :option="themedOption" />
</template>
```

Do not initialize `echarts` directly in views or business components.

## Public API

The component exposes:

- `getChartInstance()`: returns the `vue-echarts` component expose.
- `getEchartsInstance()`: returns the raw ECharts instance from `vue-echarts`.
- `setOption(option, opts)`: supports both legacy boolean and ECharts `SetOptionOpts` object.
- `resize()`: schedules a guarded resize through the render core.
- `clear()`
- `dispose()`
- `getConnectState()`
- `setConnectState(state)`
- `triggerConnect(eventType, params)`

## Internal Files

- `UseEcharts.vue`: Vue adapter, theme merge, event mapping, `vue-echarts` integration.
- `echarts-render-core.ts`: DOM and instance scheduler; no Vue dependency.
- `echarts-registry.ts`: ECharts module registration and series-type driven lazy registration.
- `echarts-setup.ts`: base registration bootstrap for `vue-echarts`.
- `utils/types.ts`: component and exposed API types.
- `utils/constants.ts`: default props and chart type maps.

## Validation

Targeted validation for this wrapper:

```bash
pnpm vitest run src/components/UseEcharts/echarts-render-core.spec.ts src/components/UseEcharts/UseEcharts.spec.ts
pnpm exec playwright test e2e/use-echarts-render.spec.ts --project=chromium
```

The Playwright suite verifies:

- visible canvas has real painted pixels
- chart renders after each Tabs panel becomes active
- parent container resize repaints the canvas
- `display:none -> block` repaint
- moved/reused container plus option update remains painted

## AI Rule

The canonical AI contract is `.ai/rules/components/03-echarts-theming.mdc`.
