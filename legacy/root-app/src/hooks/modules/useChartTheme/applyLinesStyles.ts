// ECharts 系列样式边界：参数与 ECharts lines 系列一致，内部使用 any 避免强依赖 echarts 内部类型。
import type { ThemeConfig } from './types'

/**
 * 应用线图层样式
 * 采用函数式编程，返回新的 series 对象
 */
export const applyLinesStyles = (series: any, themeConfig: ThemeConfig, index: number): any => {
  if (!series || series.type !== 'lines') {
    return series
  }

  const seriesColor = themeConfig.color.colors[index % themeConfig.color.colors.length]
  const newSeries = { ...series }

  // 主折线样式
  if (!newSeries.lineStyle) {
    newSeries.lineStyle = {}
  }
  const lineStyleUpdates: any = {}
  if (!newSeries.lineStyle.color) {
    lineStyleUpdates.color = seriesColor
  }
  if (!newSeries.lineStyle.width) {
    lineStyleUpdates.width = themeConfig.size.strokeSeries
  }
  if (newSeries.lineStyle.opacity === undefined) {
    lineStyleUpdates.opacity = 0.6
  }
  if (Object.keys(lineStyleUpdates).length > 0) {
    newSeries.lineStyle = {
      ...newSeries.lineStyle,
      ...lineStyleUpdates,
    }
  }

  // 轨迹效果
  if (!newSeries.effect) {
    newSeries.effect = {}
  }
  const effectUpdates: any = {}
  if (newSeries.effect.show === undefined) {
    effectUpdates.show = true
  }
  if (!newSeries.effect.color) {
    effectUpdates.color = themeConfig.primaryForeground || themeConfig.background
  }
  if (newSeries.effect.symbolSize === undefined) {
    effectUpdates.symbolSize = themeConfig.size.symbolSm
  }
  if (Object.keys(effectUpdates).length > 0) {
    newSeries.effect = {
      ...newSeries.effect,
      ...effectUpdates,
    }
  }

  return newSeries
}
