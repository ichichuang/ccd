# Skill 09：UseEcharts 图表组件使用

## Goal

当任务涉及任何图表场景时，使用 UseEcharts 组件，不手动实例化 ECharts 或直接使用 vue-echarts。

## Pre-check

- `@docs/ECHARTS_THEME.md`
- `@.cursor/rules/18-components-and-icons.mdc`

## 判断标准

| 场景               | 使用                                                       |
| ------------------ | ---------------------------------------------------------- |
| 任何图表场景       | **UseEcharts 组件**                                        |
| 需要程序化控制图表 | 通过 ref 获取 `ChartInstance`，调用 `getEchartsInstance()` |

## Output

- 使用 `<UseEcharts>` 组件，传入 `option` prop
- 类型从 `@/components/UseEcharts` 导入：`UseEchartsProps`、`ChartInstance`、`ChartEventParams`、`ChartEventHandlers`、`EChartsOption` 等
- **主题集成**：默认自动集成 `useChartTheme`，可通过 `themeConfig.enableTheme` 关闭
- **事件处理**：使用 `on*` props（如 `onClick`、`onLegendSelectChanged`、`onDataZoom`）或 `onEvents` prop
- **多图表联动**：使用 `group` prop 或 `connectConfig` 配置
- **程序化控制**：通过 ref 获取 `ChartInstance`，调用 `getEchartsInstance()`、`setOption()`、`resize()`、`triggerConnect()` 等

## 禁止

- 禁止手动实例化 ECharts 或直接使用 vue-echarts
- 禁止在 ECharts option 中硬编码颜色值
- 禁止手动监听 ThemeStore 来更新图表
- 禁止引用 `src/views/example/use-echarts`（示例目录后期可能删除）

## 示例

### 基础用法

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

### 事件处理

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
  console.log('点击', params)
}

function handleLegendChange(params: ChartLegendEventParams) {
  console.log('图例变化', params.selected)
}
</script>
```

### 程序化控制

```vue
<template>
  <UseEcharts
    ref="chartRef"
    :option="chartOption"
  />
  <Button @click="highlightData">高亮数据</Button>
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

### 多图表联动

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
