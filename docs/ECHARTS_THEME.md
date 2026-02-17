# ECharts 组件与主题系统 (SSOT)

> **目标读者：AI**。本文档供 AI 在代码生成时参照，涉及图表开发时必读。

本文档说明项目的 ECharts 图表组件（UseEcharts）和主题子系统（useChartTheme）。当需要**创建或修改图表**时，必须使用此系统，禁止手动设置图表颜色或直接使用 vue-echarts。

## 1. 架构概览

```
UseEcharts 组件 (src/components/UseEcharts/)
  ├─ 封装 vue-echarts
  ├─ 自动集成 useChartTheme
  ├─ 响应式主题切换
  ├─ 联动功能（多图表同步）
  └─ 暴露 ECharts 实例方法

useChartTheme Hook (src/hooks/modules/useChartTheme/)
  ├─ buildThemeConfig()       → 从 ThemeStore/SizeStore 读取当前配色
  ├─ applyThemeToOption()     → 将主题应用到 ECharts option
  └─ 20+ apply*Styles 模块   → 各图表类型的样式注入
```

核心文件：

- **组件**：`src/components/UseEcharts/`
- **Hook**：`src/hooks/modules/useChartTheme/`

---

## 2. UseEcharts 组件

### 2.1 基本用法

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

### 2.2 Props 完整列表

| Prop                | 类型                                                                           | 默认值                                  | 说明                                                               |
| ------------------- | ------------------------------------------------------------------------------ | --------------------------------------- | ------------------------------------------------------------------ |
| `option`            | `EChartsOption`                                                                | -                                       | ECharts 配置对象                                                   |
| `width`             | `string \| number`                                                             | `'100%'`                                | 宽度（如 `'100%'`、`800`）                                         |
| `height`            | `string \| number`                                                             | `'30vh'`                                | 高度（如 `'30vh'`、`600`）                                         |
| `theme`             | `string`                                                                       | `'default'`                             | ECharts 主题名                                                     |
| `renderer`          | `'canvas' \| 'svg'`                                                            | `'canvas'`                              | 渲染方式                                                           |
| `themeConfig`       | `ChartThemeConfig`                                                             | `{ enableTheme: true, opacity: {...} }` | 主题开关与透明度配置                                               |
| `style`             | `Record<string, string \| number> \| (() => Record<string, string \| number>)` | -                                       | 容器样式对象或返回该对象的函数                                     |
| `backgroundColor`   | `string`                                                                       | `'transparent'`                         | 图表背景色                                                         |
| `autoResize`        | `boolean`                                                                      | `true`                                  | 是否随容器尺寸变化自动 resize                                      |
| `loading`           | `boolean`                                                                      | `false`                                 | 是否显示加载遮罩                                                   |
| `loadingOptions`    | `Record<string, unknown> \| (() => Record<string, unknown>)`                   | -                                       | 加载遮罩配置（vue-echarts），支持主题色自动融合                    |
| `lazyLoad`          | `boolean`                                                                      | `false`                                 | 是否懒加载（进入视口再初始化）                                     |
| `manualUpdate`      | `boolean`                                                                      | `false`                                 | 为 true 时由外部驱动更新，内部仅监听 mergedOption 变化并 setOption |
| `group`             | `string`                                                                       | -                                       | 联动组 ID（与 `connectConfig.groupId` 等价，便于简写）             |
| `connectConfig`     | `ChartConnectConfig`                                                           | -                                       | 多图联动配置（`enabled`、`groupId`、`events` 等）                  |
| `animationConfig`   | `ChartAnimationConfig`                                                         | 见 useChartTheme/defaults               | 动画配置                                                           |
| `toolboxConfig`     | `ChartToolboxConfig`                                                           | 见 useChartTheme/defaults               | 工具箱配置                                                         |
| `markPointConfig`   | `ChartMarkPointConfig`                                                         | 见 useChartTheme/defaults               | 标记点配置                                                         |
| `markLineConfig`    | `ChartMarkLineConfig`                                                          | 见 useChartTheme/defaults               | 标记线配置                                                         |
| `visualMapConfig`   | `ChartVisualMapConfig`                                                         | 见 useChartTheme/defaults               | 可视化映射配置                                                     |
| `brushConfig`       | `ChartBrushConfig`                                                             | 见 useChartTheme/defaults               | 画刷配置                                                           |
| `axisPointerConfig` | `ChartAxisPointerConfig`                                                       | 见 useChartTheme/defaults               | 坐标轴指示器配置                                                   |
| `legendHoverLink`   | `boolean`                                                                      | `true`                                  | 图例悬停是否联动高亮系列                                           |
| `onEvents`          | `ChartOnEvents \| (() => ChartOnEvents)`                                       | -                                       | 自定义事件名 → 处理函数的映射                                      |

**事件 Props**：所有 ECharts 事件均支持通过 **on\*** 命名 props 传递（如 `onClick`、`onLegendSelectChanged`、`onDataZoom`、`onBrush` 等），见类型 `ChartEventHandlers`（60+ 事件）。

### 2.3 事件

#### 组件事件

- **`finished`**：图表动画结束（无参数）
- **`chartReady`**：图表实例就绪，参数为 `(instance: unknown, id?: string)`，可用于调用 `setOption`、`resize`、`dispatchAction` 等

#### ECharts 事件

所有 ECharts 事件通过 **on\*** props 或 **onEvents** 传入，包括：

- **鼠标事件**：`onClick`、`onDblClick`、`onMouseDown`、`onMouseMove`、`onMouseUp`、`onMouseOver`、`onMouseOut`、`onGlobalOut`、`onContextMenu`
- **图例事件**：`onLegendSelectChanged`、`onLegendSelected`、`onLegendUnSelected`、`onLegendSelectAll`、`onLegendInverseSelect`、`onLegendScroll`
- **数据区域缩放**：`onDataZoom`、`onDataRangeSelected`
- **时间轴**：`onTimelineChanged`、`onTimelinePlayChanged`
- **画刷**：`onBrush`、`onBrushEnd`、`onBrushSelected`
- **地图**：`onGeoSelectChanged`、`onGeoSelected`、`onGeoUnSelected`、`onGeoRoam`
- **图形元素**：`onSelectChanged`、`onHighlight`、`onDownplay`
- **动画**：`onFinished`、`onRendered`
- **其他**：`onRestore`、`onMagicTypeChanged`、`onDataViewChanged`、`onAxisAreaSelected`、`onFocusNodeAdjacency`、`onUnfocusNodeAdjacency`、`onTreeExpand`、`onTreeCollapse`、`onTreemapZoom`、`onParallelAxisSelected`、`onLoad`

### 2.4 暴露方法（ref）

通过模板 ref 可调用以下方法：

| 方法                                | 说明                                                           |
| ----------------------------------- | -------------------------------------------------------------- |
| `getChartInstance()`                | 获取 vue-echarts 根组件引用                                    |
| `getEchartsInstance()`              | 获取 ECharts 实例（用于 setOption、resize、dispatchAction 等） |
| `setOption(option, notMerge?)`      | 设置配置（option 类型为 EChartsOption）                        |
| `resize()`                          | 调整图表大小                                                   |
| `clear()`                           | 清空图表                                                       |
| `dispose()`                         | 销毁图表                                                       |
| `getConnectState()`                 | 获取联动状态                                                   |
| `setConnectState(state)`            | 设置联动状态                                                   |
| `triggerConnect(eventType, params)` | 触发联动事件                                                   |

**使用示例**：

```vue
<template>
  <UseEcharts
    ref="chartRef"
    :option="chartOption"
  />
  <Button @click="handleResize">调整大小</Button>
</template>

<script setup lang="ts">
const chartRef = ref<ChartInstance | null>(null)

function handleResize() {
  chartRef.value?.resize()
}

function handleSetOption() {
  chartRef.value?.setOption(
    {
      xAxis: { type: 'category', data: ['新A', '新B', '新C'] },
      yAxis: { type: 'value' },
      series: [{ type: 'bar', data: [5, 15, 25] }],
    },
    true
  )
}

function handleDispatchAction() {
  const instance = chartRef.value?.getEchartsInstance()
  if (instance && typeof instance === 'object') {
    const echartsInst = instance as { dispatchAction?: (action: any) => void }
    echartsInst.dispatchAction?.({ type: 'highlight', seriesIndex: 0, dataIndex: 2 })
  }
}
</script>
```

### 2.5 联动功能

UseEcharts 支持多图表联动，通过 `group` 或 `connectConfig` 启用：

```vue
<template>
  <!-- 方式 1：使用 group prop（简写） -->
  <UseEcharts
    group="my-group"
    :option="option1"
  />
  <UseEcharts
    group="my-group"
    :option="option2"
  />

  <!-- 方式 2：使用 connectConfig（完整配置） -->
  <UseEcharts
    :connect-config="{
      enabled: true,
      groupId: 'my-group',
      events: ['highlight', 'dataZoom', 'brush'],
      dataZoomSync: true,
      brushSync: true,
      legendSync: true,
    }"
    :option="option1"
  />
</template>
```

**联动配置**（`ChartConnectConfig`）：

| 属性           | 类型                                                                               | 说明                 |
| -------------- | ---------------------------------------------------------------------------------- | -------------------- |
| `enabled`      | `boolean`                                                                          | 是否启用联动         |
| `groupId`      | `string`                                                                           | 联动组 ID            |
| `events`       | `('highlight' \| 'downplay' \| 'select' \| 'unselect' \| 'dataZoom' \| 'brush')[]` | 联动事件类型         |
| `delay`        | `number`                                                                           | 联动延迟时间 (ms)    |
| `dataZoomSync` | `boolean`                                                                          | 是否启用数据缩放联动 |
| `brushSync`    | `boolean`                                                                          | 是否启用画刷联动     |
| `legendSync`   | `boolean`                                                                          | 是否启用图例联动     |

**联动状态管理**：

```typescript
// 获取联动状态
const state = chartRef.value?.getConnectState()
// { highlightedDataIndex?: number, selectedDataIndex?: number, dataZoomState?: {...}, brushState?: unknown }

// 设置联动状态
chartRef.value?.setConnectState({ highlightedDataIndex: 2 })

// 触发联动事件
chartRef.value?.triggerConnect('highlight', { seriesIndex: 0, dataIndex: 2 })
```

### 2.6 与 useChartTheme 的关系

当 `themeConfig.enableTheme !== false` 时，组件内部会使用 `useChartTheme(option, themeConfig?.opacity, advancedConfig)` 将当前主题（ThemeStore/SizeStore）与透明度、动画、工具箱等配置合并到 `option`，再交给 vue-echarts 渲染。关闭主题时直接使用传入的 `option`。

**主题配置示例**：

```vue
<template>
  <UseEcharts
    :option="chartOption"
    :theme-config="{
      enableTheme: true,
      opacity: {
        lineArea: 0.3,
        area: 0.3,
        bar: 1,
        scatter: 0.6,
        effectScatter: 0.6,
        radar: 0.2,
        funnel: 0.8,
        gauge: 1,
      },
    }"
  />
</template>
```

### 2.7 类型与引用

**组件与类型导入**：

```typescript
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

**默认 props 工厂与图表类型常量**：

```typescript
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

---

## 3. useChartTheme Hook

### 3.1 响应式 Hook（推荐）

当主题切换时，图表配置自动重新计算：

```typescript
import { useChartTheme } from '@/hooks/modules/useChartTheme'

const originalOption = ref({
  /* ECharts option */
})

// 返回 computed，主题变化时自动更新
const { themedOption } = useChartTheme(originalOption)

// 可选：透明度配置和高级配置
const { themedOption } = useChartTheme(originalOption, opacityConfig, advancedConfig)
```

**参数说明**：

- `originalOption`: `Ref<EChartsOption> | ComputedRef<EChartsOption> | EChartsOption` - 原始 ECharts 配置
- `opacityConfig?`: `Ref<ChartOpacityConfig> | ComputedRef<ChartOpacityConfig> | ChartOpacityConfig` - 透明度配置（可选）
- `advancedConfig?`: `Ref<ChartAdvancedConfig> | ComputedRef<ChartAdvancedConfig> | ChartAdvancedConfig` - 高级配置（可选）

**返回值**：

- `themedOption`: `ComputedRef<EChartsOption>` - 主题化后的 ECharts 配置

### 3.2 函数式调用（非响应式场景）

```typescript
import { applyThemeToOption } from '@/hooks/modules/useChartTheme'

const themedOption = applyThemeToOption(
  rawOption,
  opacityConfig?,
  advancedConfig?
)
```

### 3.3 支持的图表类型

系统内置了以下图表类型的主题适配：

#### 基础系列

| 模块                | 图表类型                    |
| ------------------- | --------------------------- |
| `applySeriesStyles` | Bar、Line、Scatter 基础系列 |

#### 特殊图表类型

| 模块                       | 图表类型               |
| -------------------------- | ---------------------- |
| `applyPieStyles`           | Pie 饼图               |
| `applyRadarStyles`         | Radar 雷达图           |
| `applyGaugeStyles`         | Gauge 仪表盘           |
| `applyFunnelStyles`        | Funnel 漏斗图          |
| `applyGraphStyles`         | Graph 关系图           |
| `applyTreeStyles`          | Tree 树图              |
| `applyTreemapStyles`       | Treemap 矩形树图       |
| `applySunburstStyles`      | Sunburst 旭日图        |
| `applyHeatmapStyles`       | Heatmap 热力图         |
| `applyBoxplotStyles`       | Boxplot 箱线图         |
| `applyCandlestickStyles`   | K 线图                 |
| `applyParallelStyles`      | Parallel 平行坐标      |
| `applyThemeRiverStyles`    | ThemeRiver 主题河流图  |
| `applySankeyStyles`        | Sankey 桑基图          |
| `applyEffectScatterStyles` | EffectScatter 涟漪散点 |
| `applyPictorialBarStyles`  | PictorialBar 象形柱图  |
| `applyLinesStyles`         | Lines 线条图           |

#### 通用模块

| 模块                   | 职责         |
| ---------------------- | ------------ |
| `applyAxisStyles`      | X/Y 轴样式   |
| `applyTooltipStyles`   | 提示框样式   |
| `applyFontStyles`      | 字体样式     |
| `applyTitleStyles`     | 标题样式     |
| `applyLegendStyles`    | 图例样式     |
| `applyDataZoomStyles`  | 数据缩放组件 |
| `applyVisualMapStyles` | 可视化映射   |
| `applyToolboxStyles`   | 工具箱       |
| `applyBrushStyles`     | 画刷         |

### 3.4 主题化配置

#### 透明度配置（ChartOpacityConfig）

| 属性            | 类型     | 默认值 | 说明                       |
| --------------- | -------- | ------ | -------------------------- |
| `lineArea`      | `number` | `0.3`  | 折线图区域填充透明度 (0-1) |
| `area`          | `number` | `0.3`  | 面积图透明度 (0-1)         |
| `bar`           | `number` | `1`    | 柱状图透明度（实色）       |
| `scatter`       | `number` | `0.6`  | 散点图透明度 (0-1)         |
| `effectScatter` | `number` | `0.6`  | 特效散点图透明度 (0-1)     |
| `radar`         | `number` | `0.2`  | 雷达图透明度 (0-1)         |
| `funnel`        | `number` | `0.8`  | 漏斗图透明度 (0-1)         |
| `gauge`         | `number` | `1`    | 仪表盘透明度（实色）       |

#### 高级配置（ChartAdvancedConfig）

| 属性                | 类型                     | 说明                     |
| ------------------- | ------------------------ | ------------------------ |
| `animationConfig`   | `ChartAnimationConfig`   | 动画配置                 |
| `toolboxConfig`     | `ChartToolboxConfig`     | 工具箱配置               |
| `markPointConfig`   | `ChartMarkPointConfig`   | 标记点配置               |
| `markLineConfig`    | `ChartMarkLineConfig`    | 标记线配置               |
| `visualMapConfig`   | `ChartVisualMapConfig`   | 可视化映射配置           |
| `brushConfig`       | `ChartBrushConfig`       | 画刷配置                 |
| `axisPointerConfig` | `ChartAxisPointerConfig` | 坐标轴指示器配置         |
| `legendHoverLink`   | `boolean`                | 图例悬停是否联动高亮系列 |
| `backgroundColor`   | `string`                 | 图表背景色               |

#### 主题化能力

- **颜色系统**：
  - 调色盘生成（24 色）
  - 语义色（primary/success/info/warn/danger/help）
  - 对比色（primaryForeground）
  - 次要色（secondary）
- **透明度配置**：8 种图表类型透明度
- **尺寸系统**：ChartSizeTokens（font/lineHeight/stroke/symbolSize），与 SizeMode 对齐
- **字体系统**：textColor, textColorSecondary, fontSize, fontSizeSmall

### 3.5 核心文件结构

| 文件                      | 职责                                                                    |
| ------------------------- | ----------------------------------------------------------------------- |
| `index.ts`                | 主入口，导出 `useChartTheme` Hook 和 `applyThemeToOption` 函数          |
| `types.ts`                | `ThemeConfig`、`ChartOpacityConfig`、`ChartAdvancedConfig` 类型         |
| `constants.ts`            | 图表相关常量（默认透明度值）                                            |
| `defaults.ts`             | 主题默认配置（动画、工具箱、标记点线等）                                |
| `utils.ts`                | 辅助工具（`withAlpha`、`deepCloneWithFunctions`、`applyStylesToArray`） |
| `apply*.ts`               | 各图表类型的样式应用模块（Series、Axis、Tooltip、Radar、Gauge 等）      |
| `mergeAdvancedConfigs.ts` | 高级配置合并逻辑                                                        |

---

## 4. 规则与最佳实践

### 4.1 强制规则

1. **禁止** 在 ECharts option 中硬编码颜色值 → 必须使用 `UseEcharts` 组件（自动集成 `useChartTheme`）
2. **禁止** 手动监听 ThemeStore 来更新图表 → `UseEcharts` 组件自动响应主题切换
3. **禁止** 直接使用 vue-echarts → 必须使用 `UseEcharts` 组件
4. **禁止** 手动实例化 ECharts → 必须通过 `UseEcharts` 组件
5. **新增图表类型** 时，在 `useChartTheme/` 下创建对应的 `apply*Styles.ts` 模块
6. 所有颜色必须来自 ThemeStore 的调色板，通过 `buildThemeConfig()` 获取

### 4.2 使用建议

1. **优先使用 UseEcharts 组件**：所有图表场景都应使用 `UseEcharts` 组件，它会自动处理主题集成
2. **响应式配置**：使用 `ref` 或 `computed` 包装 `option`，确保主题切换时自动更新
3. **联动功能**：多图表联动时使用 `group` prop 或 `connectConfig`
4. **事件处理**：使用 `on*` props 处理 ECharts 事件，避免手动绑定
5. **实例方法**：通过 `ref` 获取 `ChartInstance`，调用 `getEchartsInstance()` 获取 ECharts 实例进行高级操作

### 4.3 性能优化

1. **缓存机制**：`useChartTheme` 内置缓存，避免不必要的重算
2. **懒加载**：大图表使用 `lazyLoad` prop，进入视口再初始化
3. **手动更新**：频繁更新场景使用 `manualUpdate` prop，由外部控制更新时机
4. **自动 resize**：默认启用 `autoResize`，容器尺寸变化时自动调整

---

## 5. 示例

### 5.1 基础折线图

```vue
<template>
  <UseEcharts :option="lineOption" />
</template>

<script setup lang="ts">
import type { EChartsOption } from 'echarts'

const lineOption = ref<EChartsOption>({
  xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
  yAxis: { type: 'value' },
  series: [{ data: [120, 200, 150, 80, 70], type: 'line' }],
})
</script>
```

### 5.2 带主题配置的柱状图

```vue
<template>
  <UseEcharts
    :option="barOption"
    :theme-config="{
      enableTheme: true,
      opacity: { bar: 0.8 },
    }"
  />
</template>

<script setup lang="ts">
const barOption = ref<EChartsOption>({
  xAxis: { type: 'category', data: ['A', 'B', 'C'] },
  yAxis: { type: 'value' },
  series: [{ data: [10, 22, 18], type: 'bar' }],
})
</script>
```

### 5.3 多图表联动

```vue
<template>
  <div class="flex flex-col gap-md">
    <UseEcharts
      ref="chart1Ref"
      group="sync-group"
      :option="option1"
    />
    <UseEcharts
      ref="chart2Ref"
      group="sync-group"
      :option="option2"
    />
    <UseEcharts
      ref="chart3Ref"
      group="sync-group"
      :option="option3"
    />
  </div>
</template>

<script setup lang="ts">
const chart1Ref = ref<ChartInstance | null>(null)
const chart2Ref = ref<ChartInstance | null>(null)
const chart3Ref = ref<ChartInstance | null>(null)

const option1 = ref<EChartsOption>({
  /* ... */
})
const option2 = ref<EChartsOption>({
  /* ... */
})
const option3 = ref<EChartsOption>({
  /* ... */
})
</script>
```

### 5.4 事件处理

```vue
<template>
  <UseEcharts
    :option="chartOption"
    @click="handleClick"
    @legend-select-changed="handleLegendChange"
    @data-zoom="handleDataZoom"
  />
</template>

<script setup lang="ts">
function handleClick(params: ChartMouseEventParams) {
  console.log('点击事件', params)
}

function handleLegendChange(params: ChartLegendEventParams) {
  console.log('图例选择变化', params.selected)
}

function handleDataZoom(params: ChartDataZoomEventParams) {
  console.log('数据缩放', params.start, params.end)
}
</script>
```

### 5.5 程序化控制

```vue
<template>
  <UseEcharts
    ref="chartRef"
    :option="chartOption"
  />
  <div class="flex gap-md mt-md">
    <Button @click="highlightData">高亮数据</Button>
    <Button @click="resizeChart">调整大小</Button>
    <Button @click="updateOption">更新配置</Button>
  </div>
</template>

<script setup lang="ts">
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

function resizeChart() {
  chartRef.value?.resize()
}

function updateOption() {
  chartRef.value?.setOption(
    {
      xAxis: { type: 'category', data: ['新A', '新B', '新C'] },
      yAxis: { type: 'value' },
      series: [{ type: 'bar', data: [5, 15, 25] }],
    },
    true
  )
}
</script>
```

---

## 6. 相关文档

- **项目协议**：`docs/PROJECT_PROTOCOL.md`
- **组件使用规则**：`.cursor/rules/18-components-and-icons.mdc`
- **UI 架构规则**：`.agent/rules/10-ui-architecture.md`
- **UseEcharts README**：`src/components/UseEcharts/README.md`
