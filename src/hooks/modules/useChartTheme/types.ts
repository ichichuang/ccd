// 主题配置相关类型定义

// ---------------------------------------------------------------------------
// 通用图表配置类型（供 useChartTheme 与 UseEcharts 共同使用）
// ---------------------------------------------------------------------------

// 图表透明度配置类型
export interface ChartOpacityConfig {
  /** 折线图区域填充透明度 (0-1) */
  lineArea?: number
  /** 面积图透明度 (0-1) */
  area?: number
  /** 柱状图透明度 (0-1) */
  bar?: number
  /** 散点图透明度 (0-1) */
  scatter?: number
  /** 特效散点图透明度 (0-1) */
  effectScatter?: number
  /** 雷达图透明度 (0-1) */
  radar?: number
  /** 漏斗图透明度 (0-1) */
  funnel?: number
  /** 仪表盘透明度 (0-1) */
  gauge?: number
}

// 图表主题配置类型
export interface ChartThemeConfig {
  /** 是否启用主题合并 */
  enableTheme?: boolean
  /** 透明度配置 */
  opacity?: ChartOpacityConfig
}

// 前向声明：在组件层定义的高级配置类型，仅在此处引用其名称
// 这样可以避免在 Hooks 层重复声明过多与组件强相关的字段
export interface ChartAnimationConfig {
  animation?: boolean
  duration?: number
  easing?: string
  delay?: number
  animationUpdate?: boolean
  animationDurationUpdate?: number
  animationEasingUpdate?: string
}

export interface ChartToolboxConfig {
  show?: boolean
  left?: string | number
  right?: string | number
  top?: string | number
  bottom?: string | number
  width?: string | number
  height?: string | number
  feature?: Record<string, any>
  iconStyle?: any
  emphasis?: any
  textStyle?: any
}

export interface ChartMarkPointConfig {
  show?: boolean
  data?: Array<Record<string, any>>
  itemStyle?: any
  label?: any
  emphasis?: any
}

export interface ChartMarkLineConfig {
  show?: boolean
  data?: Array<Record<string, any>>
  lineStyle?: any
  label?: any
  emphasis?: any
}

export interface ChartVisualMapConfig {
  show?: boolean
  type?: 'continuous' | 'piecewise'
  min?: number
  max?: number
  dimension?: number
  inRange?: any
  outOfRange?: any
  left?: string | number
  right?: string | number
  top?: string | number
  bottom?: string | number
  orient?: 'horizontal' | 'vertical'
  textStyle?: any
}

export interface ChartBrushConfig {
  show?: boolean
  brushType?: 'rect' | 'polygon' | 'lineX' | 'lineY' | 'keep' | 'clear'
  brushStyle?: any
  areas?: any[]
  left?: string | number
  right?: string | number
  top?: string | number
  bottom?: string | number
  width?: string | number
  height?: string | number
}

export interface ChartAxisPointerConfig {
  show?: boolean
  type?: 'line' | 'shadow' | 'none'
  lineStyle?: any
  shadowStyle?: any
  label?: any
  triggerTooltip?: boolean
  triggerOn?: 'mousemove' | 'click' | 'mousemove|click' | 'none'
  axis?: 'auto' | 'x' | 'y' | 'angle' | 'radius'
  animation?: boolean
  animationDuration?: number
  animationEasing?: string
}

// 图表高级配置类型（用于合并到 useChartTheme）
export interface ChartAdvancedConfig {
  animationConfig?: ChartAnimationConfig
  toolboxConfig?: ChartToolboxConfig
  markPointConfig?: ChartMarkPointConfig
  markLineConfig?: ChartMarkLineConfig
  visualMapConfig?: ChartVisualMapConfig
  brushConfig?: ChartBrushConfig
  axisPointerConfig?: ChartAxisPointerConfig
  legendHoverLink?: boolean
  backgroundColor?: string
}

// 透明度默认值类型
export type DefaultOpacityValues = Required<ChartOpacityConfig>

// 字体配置接口
export interface FontConfig {
  textColor: string
  textColorSecondary: string
  fontSize: number
  fontSizeSmall: number
}

// 颜色配置接口
export interface ColorConfig {
  colors: string[]
  primaryColors: string[]
  successColors: string[]
  infoColors: string[]
  warnColors: string[]
  dangerColors: string[]
  helpColors: string[]
  contrastColors: string[]
  secondaryColors: string[]
}

// 主题配置接口
export interface ThemeConfig {
  font: FontConfig
  color: ColorConfig
  opacity: any // ChartOpacityConfig
  paddings: number
  gap: number
  gapl: number
  textColor100: string
  textColor200: string
  bgColor200: string
  bgColor300: string
  accent100: string
}
