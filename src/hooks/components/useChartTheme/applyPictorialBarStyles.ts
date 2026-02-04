import type { ThemeConfig } from './types'

/**
 * 应用象形柱图样式
 * 采用函数式编程，返回新的 series 对象
 */
export const applyPictorialBarStyles = (
  series: any,
  themeConfig: ThemeConfig,
  index: number
): any => {
  if (!series || series.type !== 'pictorialBar') {
    return series
  }

  const seriesColor = themeConfig.color.colors[index % themeConfig.color.colors.length]
  const newSeries = { ...series }

  // 颜色与点样式
  if (!newSeries.itemStyle) {
    newSeries.itemStyle = {}
  }
  if (!newSeries.itemStyle.color) {
    newSeries.itemStyle = {
      ...newSeries.itemStyle,
      color: seriesColor,
    }
  }

  // 标签样式
  if (!newSeries.label) {
    newSeries.label = {}
  }
  const labelUpdates: any = {}
  if (!newSeries.label.color) {
    labelUpdates.color = themeConfig.textColor100
  }
  if (!newSeries.label.fontSize) {
    labelUpdates.fontSize = themeConfig.font.fontSizeSmall
  }
  if (Object.keys(labelUpdates).length > 0) {
    newSeries.label = {
      ...newSeries.label,
      ...labelUpdates,
    }
  }

  return newSeries
}
