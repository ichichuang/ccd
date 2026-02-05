import type { ThemeConfig } from './types'

/**
 * 应用K线图样式
 * K线图主要使用基础系列样式，这里提供一些额外的配置
 * 采用函数式编程，返回新的 series 对象
 */
export const applyCandlestickStyles = (series: any, themeConfig: ThemeConfig): any => {
  if (!series || series.type !== 'candlestick') {
    return series
  }

  const newSeries = { ...series }

  // K线图的颜色配置（上涨/下跌）
  if (!newSeries.itemStyle) {
    newSeries.itemStyle = {}
  }

  // 上涨颜色（默认使用成功色）
  if (!newSeries.itemStyle.color) {
    newSeries.itemStyle.color = themeConfig.color.successColors[0] || themeConfig.color.colors[1]
  }

  // 下跌颜色（默认使用危险色）
  if (!newSeries.itemStyle.color0) {
    newSeries.itemStyle.color0 = themeConfig.color.dangerColors[0] || themeConfig.color.colors[0]
  }

  // 边框颜色
  if (!newSeries.itemStyle.borderColor) {
    newSeries.itemStyle.borderColor =
      themeConfig.color.successColors[0] || themeConfig.color.colors[1]
  }

  if (!newSeries.itemStyle.borderColor0) {
    newSeries.itemStyle.borderColor0 =
      themeConfig.color.dangerColors[0] || themeConfig.color.colors[0]
  }

  // 标签样式
  if (!newSeries.label) {
    newSeries.label = {}
  }
  if (!newSeries.label.color) {
    newSeries.label = {
      ...newSeries.label,
      color: themeConfig.textColor100,
    }
  }

  return newSeries
}
