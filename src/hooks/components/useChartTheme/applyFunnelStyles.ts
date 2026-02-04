import type { ThemeConfig } from './types'

/**
 * 应用漏斗图样式
 * 采用函数式编程，返回新的 series 对象
 */
export const applyFunnelStyles = (series: any, themeConfig: ThemeConfig): any => {
  if (!series || series.type !== 'funnel') {
    return series
  }

  const newSeries = { ...series }

  // 系列级边框样式（未自定义时融合系统变量）
  if (!newSeries.itemStyle) {
    newSeries.itemStyle = {}
  }
  if (!newSeries.itemStyle.borderColor) {
    newSeries.itemStyle = {
      ...newSeries.itemStyle,
      borderColor: 'transparent',
    }
  }
  if (newSeries.itemStyle.borderWidth === undefined) {
    newSeries.itemStyle = {
      ...newSeries.itemStyle,
      borderWidth: 0,
    }
  }

  // 强调样式
  if (!newSeries.emphasis) {
    newSeries.emphasis = {}
  }
  if (!newSeries.emphasis.itemStyle) {
    newSeries.emphasis.itemStyle = {}
  }
  if (!newSeries.emphasis.itemStyle.borderColor) {
    newSeries.emphasis = {
      ...newSeries.emphasis,
      itemStyle: {
        ...newSeries.emphasis.itemStyle,
        borderColor: 'transparent',
      },
    }
  }
  if (newSeries.emphasis.itemStyle.borderWidth === undefined) {
    newSeries.emphasis = {
      ...newSeries.emphasis,
      itemStyle: {
        ...newSeries.emphasis.itemStyle,
        borderWidth: 0,
      },
    }
  }

  // 处理数据项
  if (Array.isArray(newSeries.data)) {
    newSeries.data = newSeries.data.map((item: any, dataIndex: number) => {
      const newItem = { ...item }

      if (!newItem.itemStyle) {
        newItem.itemStyle = {}
      }

      const itemStyleUpdates: any = {}

      if (!newItem.itemStyle.color) {
        itemStyleUpdates.color =
          themeConfig.color.colors[dataIndex % themeConfig.color.colors.length]
      }
      if (!newItem.itemStyle.borderColor) {
        itemStyleUpdates.borderColor = 'transparent'
      }
      if (newItem.itemStyle.borderWidth === undefined) {
        itemStyleUpdates.borderWidth = 0
      }

      if (Object.keys(itemStyleUpdates).length > 0) {
        newItem.itemStyle = {
          ...newItem.itemStyle,
          ...itemStyleUpdates,
        }
      }

      return newItem
    })
  }

  // 标签引导线颜色（融合系统变量）
  if (!newSeries.labelLine) {
    newSeries.labelLine = {}
  }
  if (!newSeries.labelLine.lineStyle) {
    newSeries.labelLine = {
      ...newSeries.labelLine,
      lineStyle: {},
    }
  }
  if (!newSeries.labelLine.lineStyle.color) {
    newSeries.labelLine = {
      ...newSeries.labelLine,
      lineStyle: {
        ...newSeries.labelLine.lineStyle,
        color: themeConfig.textColor200,
      },
    }
  }

  return newSeries
}
