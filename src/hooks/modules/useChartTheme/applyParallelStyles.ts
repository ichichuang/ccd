import type { ThemeConfig } from './types'

/**
 * 应用平行坐标图样式
 * 采用函数式编程，返回新的 series 对象
 */
export const applyParallelStyles = (series: any, themeConfig: ThemeConfig): any => {
  if (!series || series.type !== 'parallel') {
    return series
  }

  const palette = themeConfig.color.colors
  const newSeries = { ...series }

  // 处理数据项，为每条线应用颜色
  if (Array.isArray(newSeries.data)) {
    newSeries.data = newSeries.data.map((row: any, idx: number) => {
      // 使用更均匀的颜色分布算法
      const colorIndex = Math.floor((idx * palette.length) / newSeries.data.length) % palette.length
      const color = palette[colorIndex]

      if (Array.isArray(row)) {
        return {
          value: row,
          lineStyle: {
            color,
            width: 2,
            opacity: 0.7,
            type: 'solid',
          },
        }
      }
      if (row && typeof row === 'object') {
        return {
          ...row,
          lineStyle: {
            color: row.lineStyle?.color || color,
            width: row.lineStyle?.width ?? 2,
            opacity: row.lineStyle?.opacity ?? 0.7,
            type: row.lineStyle?.type || 'solid',
          },
        }
      }
      return row
    })
  }

  // 强调样式
  if (!newSeries.emphasis) {
    newSeries.emphasis = {}
  }
  const emphasisUpdates: any = {}
  if (!newSeries.emphasis.focus) {
    emphasisUpdates.focus = 'series'
  }
  if (!newSeries.emphasis.lineStyle) {
    newSeries.emphasis.lineStyle = {}
  }
  if (!newSeries.emphasis.lineStyle.width) {
    emphasisUpdates.lineStyle = {
      ...newSeries.emphasis.lineStyle,
      width: 3,
    }
  }
  if (!newSeries.emphasis.lineStyle.opacity) {
    emphasisUpdates.lineStyle = {
      ...(emphasisUpdates.lineStyle || newSeries.emphasis.lineStyle),
      opacity: 1,
    }
  }
  if (Object.keys(emphasisUpdates).length > 0) {
    newSeries.emphasis = {
      ...newSeries.emphasis,
      ...emphasisUpdates,
    }
  }

  return newSeries
}
