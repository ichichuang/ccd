import type { ThemeConfig } from './types'

/**
 * 处理饼图数据项，支持多种数据格式
 */
function processPieDataItem(item: any, dataIndex: number, colors: string[]): any {
  // 处理不同的数据格式
  let dataItem: any

  if (typeof item === 'object' && item !== null && item.value !== undefined) {
    // 对象格式: { name: '产品A', value: 30 }
    dataItem = { ...item }
  } else if (Array.isArray(item)) {
    // 数组格式: ['产品A', 30]
    dataItem = { name: item[0], value: item[1] }
  } else {
    // 简单值格式: 30
    dataItem = { value: item }
  }

  // 应用颜色样式（如果未设置）
  if (!dataItem.itemStyle) {
    dataItem.itemStyle = {}
  }
  if (!dataItem.itemStyle.color) {
    dataItem.itemStyle = {
      ...dataItem.itemStyle,
      color: colors[dataIndex % colors.length],
    }
  }

  return dataItem
}

/**
 * 应用饼图样式
 * 采用函数式编程，返回新的 series 对象
 */
export const applyPieStyles = (series: any, themeConfig: ThemeConfig): any => {
  if (!series || series.type !== 'pie') {
    return series
  }

  // 如果数据不是数组，直接返回
  if (!Array.isArray(series.data)) {
    return series
  }

  // 处理数据项，为每个数据项应用主题颜色
  const processedData = series.data.map((item: any, dataIndex: number) =>
    processPieDataItem(item, dataIndex, themeConfig.color.colors)
  )

  // 返回新的 series 对象
  return {
    ...series,
    data: processedData,
  }
}
