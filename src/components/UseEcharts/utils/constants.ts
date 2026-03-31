import { DEFAULT_OPACITY_VALUES } from '@/hooks/modules/useChartTheme/constants'
import {
  DEFAULT_ANIMATION_CONFIG,
  getDefaultAxisPointerConfig,
  getDefaultBrushConfig,
  getDefaultMarkLineConfig,
  getDefaultMarkPointConfig,
  getDefaultToolboxConfig,
  getDefaultVisualMapConfig,
} from '@/hooks/modules/useChartTheme/defaults'
import type { ChartAnimationConfig } from './types'

// 默认组件 Props（UseEcharts 专用，默认配置由 useChartTheme/defaults 提供）
export const createDefaultUseEchartsProps = () => ({
  option: () => ({}),
  width: '100%',
  height: '100%',
  theme: 'default',
  renderer: 'canvas' as const,
  autoResize: true,
  style: () => ({}),
  backgroundColor: 'transparent',
  lazyLoad: false,
  loading: false,
  loadingOptions: () => ({}),
  manualUpdate: false,
  themeConfig: () => ({
    enableTheme: true,
    opacity: DEFAULT_OPACITY_VALUES,
  }),
  animationConfig: () => DEFAULT_ANIMATION_CONFIG as ChartAnimationConfig,
  onEvents: () => ({}),
  toolboxConfig: () => getDefaultToolboxConfig(),
  markPointConfig: () => getDefaultMarkPointConfig(),
  markLineConfig: () => getDefaultMarkLineConfig(),
  visualMapConfig: () => getDefaultVisualMapConfig(),
  brushConfig: () => getDefaultBrushConfig(),
  axisPointerConfig: () => getDefaultAxisPointerConfig(),
  legendHoverLink: true,
})

// 支持透明度的图表类型
export const TRANSPARENT_CHART_TYPES = [
  'line',
  'area',
  'scatter',
  'effectScatter',
  'radar',
  'funnel',
] as const

// 实色图表类型（不需要透明度）
export const SOLID_CHART_TYPES = ['bar', 'gauge'] as const

// 所有支持的图表类型
export const ALL_CHART_TYPES = [...TRANSPARENT_CHART_TYPES, ...SOLID_CHART_TYPES] as const

export type TransparentChartType = (typeof TRANSPARENT_CHART_TYPES)[number]
export type SolidChartType = (typeof SOLID_CHART_TYPES)[number]
export type AllChartType = (typeof ALL_CHART_TYPES)[number]

/**
 * `series.type` -> `echarts/charts` 模块导出名映射（用于按需注册）
 *
 * 说明：
 * - ECharts 的按模块加载通常需要你把对应的 Chart 类传给 `echarts.use([...])`
 * - 这里存的是“导出名”，在运行时通过 `import('echarts/charts')` 的返回对象取到真实类
 */
export const SERIES_TYPE_TO_ECHARTS_CHART_EXPORT = {
  // 兼容：项目把 `area` 当作折线面积分类，但 ECharts 实际 series.type 仍为 `line`
  area: 'LineChart',
  line: 'LineChart',

  // scatter 系列
  scatter: 'ScatterChart',
  effectScatter: 'EffectScatterChart',

  // 基础柱/饼/雷达/漏斗/仪表
  bar: 'BarChart',
  pie: 'PieChart',
  radar: 'RadarChart',
  funnel: 'FunnelChart',
  gauge: 'GaugeChart',

  // ECharts 其它在 UseEcharts 中支持的类型（按需注册时兜底）
  boxplot: 'BoxplotChart',
  candlestick: 'CandlestickChart',
  graph: 'GraphChart',
  heatmap: 'HeatmapChart',
  lines: 'LinesChart',
  parallel: 'ParallelChart',
  pictorialBar: 'PictorialBarChart',
  sankey: 'SankeyChart',
  sunburst: 'SunburstChart',
  themeRiver: 'ThemeRiverChart',
  tree: 'TreeChart',
  treemap: 'TreemapChart',
} as const

export type SeriesTypeToExportName =
  (typeof SERIES_TYPE_TO_ECHARTS_CHART_EXPORT)[keyof typeof SERIES_TYPE_TO_ECHARTS_CHART_EXPORT]
