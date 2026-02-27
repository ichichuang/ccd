# Skill 09: UseEcharts Component Usage

## Goal

When the task involves any chart scenario, use the UseEcharts component; do NOT manually instantiate ECharts or use vue-echarts directly.

## Pre-check

- `@docs/ai-specs/ECHARTS_THEME.md`
- `@.cursor/rules/18-components-and-icons.mdc`

## Decision criteria

| Scenario                        | Use                                                      |
| ------------------------------- | -------------------------------------------------------- |
| Any chart scenario              | **UseEcharts component**                                 |
| Need programmatic chart control | Get `ChartInstance` via ref, call `getEchartsInstance()` |

## Output

- Use `<UseEcharts>` component, pass `option` prop
- Import types from `@/components/UseEcharts`: UseEchartsProps, ChartInstance, ChartEventParams, ChartEventHandlers, EChartsOption, etc.
- **Theme integration**: Auto-integrates `useChartTheme` by default; can disable via `themeConfig.enableTheme`
- **Events**: Use `on*` props (e.g. onClick, onLegendSelectChanged, onDataZoom) or `onEvents` prop
- **Multi-chart sync**: Use `group` prop or `connectConfig`
- **Programmatic control**: Get ChartInstance via ref, call getEchartsInstance(), setOption(), resize(), triggerConnect(), etc.

## Forbidden

- Manually instantiating ECharts or using vue-echarts directly
- Hardcoding colors in ECharts option
- Manually listening to ThemeStore to update charts
- Importing from `src/views/example/use-echarts` (example dir may be removed later)

## Examples

### Basic usage

```vue
<template>
  <UseEcharts :option="chartOption" />
</template>

<script setup lang="ts">
import type { EChartsOption } from 'echarts'

const chartOption = ref<EChartsOption>({
  xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed'] },
  yAxis: { type: 'value' },
  series: [{ data: [120, 200, 150], type: 'line' }],
})
</script>
```

### Event handling

```vue
<template>
  <UseEcharts
    :option="chartOption"
    @click="handleClick"
    @legend-select-changed="handleLegendChange"
  />
</template>

<script setup lang="ts">
import type { ChartMouseEventParams, ChartLegendEventParams } from '@/components/UseEcharts'

function handleClick(params: ChartMouseEventParams) {
  console.log('click', params)
}

function handleLegendChange(params: ChartLegendEventParams) {
  console.log('legend change', params.selected)
}
</script>
```

### Programmatic control

```vue
<template>
  <UseEcharts
    ref="chartRef"
    :option="chartOption"
  />
  <Button @click="highlightData">Highlight data</Button>
</template>

<script setup lang="ts">
import type { ChartInstance } from '@/components/UseEcharts'

const chartRef = ref<ChartInstance | null>(null)

function highlightData() {
  const instance = chartRef.value?.getEchartsInstance()
  if (instance && typeof instance === 'object') {
    const echartsInst = instance as { dispatchAction?: (action: any) => void }
    echartsInst.dispatchAction?.({
      type: 'highlight',
      seriesIndex: 0,
      dataIndex: 2,
    })
  }
}
</script>
```

### Multi-chart sync

```vue
<template>
  <UseEcharts
    group="sync-group"
    :option="option1"
  />
  <UseEcharts
    group="sync-group"
    :option="option2"
  />
</template>
```
