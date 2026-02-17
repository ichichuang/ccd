---
description: 图表任务：使用 UseEcharts 组件，不手动实例化 ECharts
globs: src/views/**/*.vue, src/components/**/*.vue
---

# UseEcharts 图表组件 Skill

## 1. Goal

当任务涉及**任何图表场景**时，优先使用 UseEcharts 组件，不手动实例化 ECharts 或直接使用 vue-echarts。

## 2. Pre-check

- **必读**：`docs/ECHARTS_THEME.md`
- **规则**：`.agent/rules/10-ui-architecture.md` §2d

## 3. 判断标准

| 场景               | 使用                                                       |
| ------------------ | ---------------------------------------------------------- |
| 任何图表场景       | **UseEcharts 组件**                                        |
| 需要程序化控制图表 | 通过 ref 获取 `ChartInstance`，调用 `getEchartsInstance()` |

## 4. Steps

### Step 1: 确认是否属于图表场景

- 若为图表展示/交互 → 进入 Step 2。
- 若为其他 UI 组件 → 无需本 Skill。

### Step 2: 阅读文档并选用组件

- 打开 `docs/ECHARTS_THEME.md`，确认 UseEcharts 组件的完整 API。
- 类型从 `@/components/UseEcharts` 导入：`UseEchartsProps`、`ChartInstance`、`ChartEventParams`、`ChartEventHandlers`、`EChartsOption` 等。

### Step 3: 实现图表

- 使用 `<UseEcharts>` 组件，传入 `option` prop（类型为 `EChartsOption`）。
- **主题集成**：默认自动集成 `useChartTheme`，可通过 `themeConfig.enableTheme` 关闭。
- **事件处理**：使用 `on*` props（如 `onClick`、`onLegendSelectChanged`、`onDataZoom`）或 `onEvents` prop。
- **多图表联动**：使用 `group` prop 或 `connectConfig` 配置。
- **程序化控制**：通过 ref 获取 `ChartInstance`，调用 `getEchartsInstance()`、`setOption()`、`resize()`、`triggerConnect()` 等。

### Step 4: 禁止项

- 禁止手动实例化 ECharts 或直接使用 vue-echarts。
- 禁止在 ECharts option 中硬编码颜色值。
- 禁止手动监听 ThemeStore 来更新图表。
- 禁止引用 `src/views/example/use-echarts` 作为业务代码依赖（示例目录后期可能删除）。

## 5. 参考

- 组件：`src/components/UseEcharts`
- Hook：`src/hooks/modules/useChartTheme`
- 类型：`src/components/UseEcharts/utils/types.ts`
- 文档：`docs/ECHARTS_THEME.md`

## 6. 示例

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
