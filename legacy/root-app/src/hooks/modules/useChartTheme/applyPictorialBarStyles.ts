// ECharts 系列样式边界：参数与 ECharts pictorialBar 系列一致，内部使用 any 避免强依赖 echarts 内部类型。
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
    labelUpdates.color = themeConfig.foreground
  }
  if (!newSeries.label.fontSize) {
    labelUpdates.fontSize = themeConfig.size.fontSm
  }
  if (!newSeries.label.lineHeight) {
    labelUpdates.lineHeight = themeConfig.size.lineHeightSm
  }
  if (Object.keys(labelUpdates).length > 0) {
    newSeries.label = {
      ...newSeries.label,
      ...labelUpdates,
    }
  }

  return newSeries
}
