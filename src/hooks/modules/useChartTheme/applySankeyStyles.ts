import type { ThemeConfig } from './types'

/**
 * 应用桑基图样式
 * 采用函数式编程，返回新的 series 对象
 */
export const applySankeyStyles = (series: any, themeConfig: ThemeConfig): any => {
  if (!series || series.type !== 'sankey') {
    return series
  }

  const newSeries = { ...series }

  // 设置桑基图的节点样式
  if (!newSeries.itemStyle) {
    newSeries.itemStyle = {}
  }
  if (!newSeries.itemStyle.color) {
    newSeries.itemStyle = {
      ...newSeries.itemStyle,
      color: themeConfig.color.colors[0],
    }
  }

  // 设置桑基图的线条样式
  if (!newSeries.lineStyle) {
    newSeries.lineStyle = {}
  }
  if (!newSeries.lineStyle.color) {
    newSeries.lineStyle = {
      ...newSeries.lineStyle,
      color: 'gradient',
    }
  }

  // 设置桑基图的标签样式
  if (!newSeries.label) {
    newSeries.label = {}
  }
  if (!newSeries.label.color) {
    newSeries.label = {
      ...newSeries.label,
      color: themeConfig.textColor100,
      fontSize: themeConfig.font.fontSizeSmall,
    }
  }

  return newSeries
}
