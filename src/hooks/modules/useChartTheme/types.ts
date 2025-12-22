// 主题配置相关类型定义

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
