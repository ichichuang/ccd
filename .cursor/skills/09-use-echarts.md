---
description: Chart tasks: use UseEcharts component, do not instantiate ECharts manually
globs: src/views/**/*.vue, src/components/**/*.vue
---

# UseEcharts Skill

## 1. Goal

When the task involves **any chart scenario**, prefer UseEcharts component; do NOT instantiate ECharts manually or use vue-echarts directly.

## 2. Pre-check

- **Required reading**: `docs/ai-specs/ECHARTS_THEME.md`
- **Rules**:
  - `.cursor/rules/40-echarts-visualization.mdc`
  - `.cursor/rules/18-components-and-icons.mdc`

## 3. Decision Criteria

| Scenario                  | Use                                                      |
| ------------------------- | -------------------------------------------------------- |
| Any chart scenario        | **UseEcharts component**                                 |
| Need programmatic control | Get `ChartInstance` via ref, call `getEchartsInstance()` |

## 4. Steps

### Step 1: Confirm Chart Scenario

- If chart display/interaction → proceed to Step 2.
- If other UI → this Skill is not needed.

### Step 2: Read Doc and Choose Component

- Open `docs/ai-specs/ECHARTS_THEME.md`, confirm full UseEcharts API.
- Import types from `@/components/UseEcharts`: `UseEchartsProps`, `ChartInstance`, `ChartEventParams`, `ChartEventHandlers`, `EChartsOption`, etc.

### Step 3: Implement Chart

- Use `<UseEcharts>` with `option` prop (`EChartsOption`).
- **Theme integration**: Auto-integrates `useChartTheme` by default; set `themeConfig.enableTheme` to false to disable.
- **Events**: Use `on*` props (e.g. `onClick`, `onLegendSelectChanged`, `onDataZoom`) or `onEvents`.
- **Multi-chart sync**: Use `group` or `connectConfig`.
- **Programmatic control**: Get `ChartInstance` via ref, call `getEchartsInstance()`, `setOption()`, `resize()`, `triggerConnect()`, etc.

### Step 4: Forbidden

- Do NOT instantiate ECharts manually or use vue-echarts directly.
- Do NOT hardcode colors in ECharts option.
- Do NOT manually listen to ThemeStore to update charts.
- Do NOT reference `src/views/example/use-echarts` as a business dependency (example dir may be removed).

## 5. Reference

- Component: `src/components/UseEcharts`
- Hook: `src/hooks/modules/useChartTheme`
- Types: `src/components/UseEcharts/utils/types.ts`
- Doc: `docs/ai-specs/ECHARTS_THEME.md`

## 6. Examples

### Basic

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

### Events

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

### Programmatic Control

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

### Multi-Chart Sync

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
