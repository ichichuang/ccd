import type { ThemeConfig } from './types'

/**
 * 应用热力图样式
 * 采用函数式编程，返回新的 series 对象
 */
export const applyHeatmapStyles = (series: any, themeConfig: ThemeConfig): any => {
  if (!series || series.type !== 'heatmap') {
    return series
  }

  const newSeries = { ...series }

  // 计算数据范围
  let minValue = 0
  let maxValue = 100

  if (Array.isArray(newSeries.data) && newSeries.data.length > 0) {
    const values = newSeries.data
      .filter((item: any) => Array.isArray(item) && item.length >= 3)
      .map((item: any) => item[2])

    if (values.length > 0) {
      minValue = Math.min(...values)
      maxValue = Math.max(...values)
    }
  }

  // 设置热力图的视觉映射
  if (!newSeries.visualMap) {
    newSeries.visualMap = {
      min: minValue,
      max: maxValue,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '15%',
      inRange: {
        color: themeConfig.color.colors.slice(0, 4), // 使用前4个颜色作为热力图渐变
      },
      textStyle: {
        color: themeConfig.textColor100,
        fontSize: themeConfig.font.fontSizeSmall,
      },
    }
  }

  // 确保热力图有正确的配置
  if (!newSeries.coordinateSystem) {
    newSeries.coordinateSystem = 'cartesian2d'
  }

  // 设置热力图的标签样式
  if (!newSeries.label) {
    newSeries.label = {
      show: false, // 默认不显示标签，避免过于拥挤
    }
  }

  // 设置热力图的强调样式
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
        borderColor: themeConfig.textColor100,
        borderWidth: 1,
      },
    }
  }
  if (!newSeries.emphasis.label) {
    newSeries.emphasis = {
      ...newSeries.emphasis,
      label: {
        show: true,
        color: themeConfig.textColor100,
        fontSize: themeConfig.font.fontSizeSmall,
      },
    }
  }

  return newSeries
}
