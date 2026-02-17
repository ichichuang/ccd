// ECharts 系列样式边界：参数与 ECharts boxplot 系列一致，内部使用 any 避免强依赖 echarts 内部类型。
import type { ThemeConfig } from './types'

/**
 * 应用箱型图样式
 * 采用函数式编程，返回新的 series 对象
 */
export const applyBoxplotStyles = (series: any, themeConfig: ThemeConfig): any => {
  if (!series || series.type !== 'boxplot') {
    return series
  }

  // 如果数据不是数组，直接返回
  if (!Array.isArray(series.data)) {
    return series
  }

  // 处理数据项，为每个数据项应用主题颜色
  const processedData = series.data.map((item: any, dataIndex: number) => {
    if (Array.isArray(item)) {
      // 数组格式：直接包装为对象
      return {
        value: item,
        itemStyle: {
          color: themeConfig.color.colors[dataIndex % themeConfig.color.colors.length],
        },
      }
    } else if (item && typeof item === 'object' && !item.itemStyle?.color) {
      // 对象格式：添加颜色
      return {
        ...item,
        itemStyle: {
          ...item.itemStyle,
          color: themeConfig.color.colors[dataIndex % themeConfig.color.colors.length],
        },
      }
    }
    // 已有颜色或格式不支持，直接返回
    return item
  })

  // 返回新的 series 对象
  return {
    ...series,
    data: processedData,
  }
}
