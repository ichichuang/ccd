# UseEcharts

基于 vue-echarts 的 ECharts 图表封装组件，与项目主题系统（useChartTheme）联动，支持主题色、透明度、动画与高级配置（工具箱、标记点线、画刷等）。

**依赖**：vue-echarts、echarts；项目内依赖 `@/hooks/modules/useChartTheme`、`@/utils/lodashes`。

## 基本用法

```vue
<template>
  <UseEcharts :option="chartOption" />
</template>

<script setup lang="ts">
import type { EChartsOption } from 'echarts'

const chartOption: EChartsOption = {
  xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed'] },
  yAxis: { type: 'value' },
  series: [{ data: [120, 200, 150], type: 'line' }],
}
</script>
```

## Props

部分 props 支持「对象」或「返回对象的函数」（与默认值工厂一致，便于按需计算）。

| Prop                                                                                                             | 说明                                                               | 默认                      |
| ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------- |
| `option`                                                                                                         | ECharts 配置对象                                                   | -                         |
| `width`                                                                                                          | 宽度（如 `'100%'`、`800`）                                         | `'100%'`                  |
| `height`                                                                                                         | 高度（如 `'30vh'`、`600`）                                         | `'30vh'`                  |
| `theme`                                                                                                          | ECharts 主题名                                                     | `'default'`               |
| `renderer`                                                                                                       | 渲染方式：`'canvas'` \| `'svg'`                                    | `'canvas'`                |
| `themeConfig`                                                                                                    | 主题开关与透明度（`enableTheme`、`opacity`）                       | 启用主题 + 默认透明度     |
| `style`                                                                                                          | 容器样式对象或返回该对象的函数                                     | -                         |
| `backgroundColor`                                                                                                | 图表背景色                                                         | `'transparent'`           |
| `autoResize`                                                                                                     | 是否随容器尺寸变化自动 resize                                      | `true`                    |
| `loading`                                                                                                        | 是否显示加载遮罩                                                   | `false`                   |
| `loadingOptions`                                                                                                 | 加载遮罩配置（vue-echarts）                                        | -                         |
| `lazyLoad`                                                                                                       | 是否懒加载（进入视口再初始化）                                     | `false`                   |
| `manualUpdate`                                                                                                   | 为 true 时由外部驱动更新，内部仅监听 mergedOption 变化并 setOption | `false`                   |
| `group`                                                                                                          | 联动组 ID（与 `connectConfig.groupId` 等价，便于简写）             | -                         |
| `connectConfig`                                                                                                  | 多图联动（`enabled`、`groupId`、`events` 等）                      | -                         |
| `animationConfig`                                                                                                | 动画配置                                                           | 见 useChartTheme/defaults |
| `toolboxConfig` / `markPointConfig` / `markLineConfig` / `visualMapConfig` / `brushConfig` / `axisPointerConfig` | 工具箱、标记点线、可视化映射、画刷、坐标轴指示器                   | 见 useChartTheme/defaults |
| `legendHoverLink`                                                                                                | 图例悬停是否联动高亮系列                                           | `true`                    |
| `onEvents`                                                                                                       | 自定义事件名 → 处理函数的映射（或返回该映射的函数）                | -                         |

所有 ECharts 事件均支持通过 **on\*** 命名 props 传递（如 `onClick`、`onLegendSelectChanged`、`onDataZoom`、`onBrush` 等），见类型 `ChartEventHandlers`。

## 与 useChartTheme 的关系

当 `themeConfig.enableTheme !== false` 时，组件内部会使用 `useChartTheme(option, themeConfig?.opacity, advancedConfig)` 将当前主题（ThemeStore/SizeStore）与透明度、动画、工具箱等配置合并到 `option`，再交给 vue-echarts 渲染。关闭主题时直接使用传入的 `option`。

## 事件

- **finished**：图表动画结束（无参数）。
- **chartReady**：图表实例就绪，参数为 `(instance: unknown, id?: string)`，可用于调用 `setOption`、`resize`、`dispatchAction` 等。

其余 ECharts 事件通过 **on\*** props 或 **onEvents** 传入（如 `onClick`、`onLegendSelectChanged`）。

## 暴露方法（ref）

通过模板 ref 可调用：

| 方法                                                                                 | 说明                                                           |
| ------------------------------------------------------------------------------------ | -------------------------------------------------------------- |
| `getChartInstance()`                                                                 | 获取 vue-echarts 根组件引用                                    |
| `getEchartsInstance()`                                                               | 获取 ECharts 实例（用于 setOption、resize、dispatchAction 等） |
| `setOption(option, notMerge?)`                                                       | 设置配置（option 类型为 EChartsOption）                        |
| `resize()` / `clear()` / `dispose()`                                                 | 调整大小、清空、销毁                                           |
| `getConnectState()` / `setConnectState(state)` / `triggerConnect(eventType, params)` | 联动状态读写与触发                                             |

## 类型与引用

- **组件**与 **类型** 从 `@/components/UseEcharts` 引入（类型由 `index.ts` 通过 `export * from './utils/types'` 再导出）：

```ts
import { UseEcharts } from '@/components/UseEcharts'
import type {
  UseEchartsProps,
  ChartInstance,
  ChartEventParams,
  ChartEventHandlers,
  ChartConnectConfig,
  ChartConnectState,
  ChartToolboxConfig,
  ChartMarkPointConfig,
  ChartMarkLineConfig,
  ChartVisualMapConfig,
  ChartBrushConfig,
  ChartAxisPointerConfig,
  ChartOnEvents,
  ChartRenderer,
  ChartAnimationConfig,
} from '@/components/UseEcharts'
```

- **默认 props 工厂与图表类型常量** 未从 index 导出，需从 utils 路径引用：

```ts
import {
  createDefaultUseEchartsProps,
  TRANSPARENT_CHART_TYPES,
  SOLID_CHART_TYPES,
  ALL_CHART_TYPES,
} from '@/components/UseEcharts/utils/constants'
import type {
  TransparentChartType,
  SolidChartType,
  AllChartType,
} from '@/components/UseEcharts/utils/constants'
```
