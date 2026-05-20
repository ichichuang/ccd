import { DEFAULT_OPACITY_VALUES } from '../../useChartTheme/constants'
import {
  DEFAULT_ANIMATION_CONFIG,
  getDefaultAxisPointerConfig,
  getDefaultBrushConfig,
  getDefaultMarkLineConfig,
  getDefaultMarkPointConfig,
  getDefaultToolboxConfig,
  getDefaultVisualMapConfig,
} from '../../useChartTheme/defaults'
import type { ChartAnimationConfig } from './types'

// 默认组件 Props（UseEcharts 专用，默认配置由 useChartTheme/defaults 提供）
export const createDefaultUseEchartsProps = () => ({
  option: () => ({}),
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
 * `series.type` -> `echarts/charts` 模块导出名映射（参考文档）
 *
 * 实际图表注册已迁移至 echarts-setup.ts 的静态 import。
 * 此映射保留用于文档参考和主题系统类型判断。
 * 新增图表类型时，需同步在 echarts-setup.ts 中添加对应的 import。
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
