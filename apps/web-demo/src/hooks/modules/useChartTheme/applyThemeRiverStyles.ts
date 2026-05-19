// ECharts 系列样式边界：参数与 ECharts themeRiver 系列一致，内部使用 any 避免强依赖 echarts 内部类型。
import type { ThemeConfig } from './types'

/**
 * 应用主题河流图样式
 * 采用函数式编程，返回新的 series 对象
 */
export const applyThemeRiverStyles = (series: any, themeConfig: ThemeConfig): any => {
  if (!series || series.type !== 'themeRiver') {
    return series
  }

  // 如果数据不是数组，直接返回
  if (!Array.isArray(series.data)) {
    return series
  }

  // 收集所有类别
  const categories = new Set<string>()
  series.data.forEach((item: any) => {
    if (Array.isArray(item) && item[2]) {
      categories.add(item[2])
    }
  })

  // 为主题河流图使用高对比度的颜色，确保视觉区分明显
  const highContrastColors = [
    themeConfig.color.primaryColors[0], // 主色
    themeConfig.color.successColors[0], // 成功色（绿色）
    themeConfig.color.infoColors[0], // 信息色（蓝色）
    themeConfig.color.warnColors[0], // 警告色（橙色）
    themeConfig.color.dangerColors[0], // 危险色（红色）
    themeConfig.color.helpColors[0], // 帮助色（紫色）
  ]

  // 为每个类别分配颜色
  const categoryColors: { [key: string]: string } = {}
  Array.from(categories).forEach((category, catIndex) => {
    const colorIndex = catIndex % highContrastColors.length
    categoryColors[category] = highContrastColors[colorIndex]
  })

  // 创建颜色函数，确保每个数据项都有正确的颜色
  const colorFunction = (params: any) => {
    const data = params.data
    if (Array.isArray(data) && data[2]) {
      const category = data[2]
      return categoryColors[category] || themeConfig.color.colors[0]
    }
    return themeConfig.color.colors[0]
  }

  // 构建新的 series 对象
  const newSeries = {
    ...series,
    // 强制设置系列级别的颜色数组，这是主题河流图的关键配置
    color: Array.from(categories).map(category => categoryColors[category]),
    itemStyle: {
      ...series.itemStyle,
      // 强制设置颜色函数
      color: colorFunction,
    },
  }

  // 主题河流图需要特殊的 tooltip 配置
  // 由于 ECharts 的 tooltip 机制问题，我们需要在系列级别配置 tooltip
  if (!newSeries.tooltip) {
    newSeries.tooltip = {}
  }

  return newSeries
}
