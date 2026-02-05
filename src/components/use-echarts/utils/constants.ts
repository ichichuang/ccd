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

// 默认组件 Props（UseEcharts 专用，默认配置由 useChartTheme/defaults 提供）
export const createDefaultUseEchartsProps = () => ({
  option: () => ({}),
  width: '100%',
  height: '30vh',
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
  animationConfig: () => DEFAULT_ANIMATION_CONFIG,
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
