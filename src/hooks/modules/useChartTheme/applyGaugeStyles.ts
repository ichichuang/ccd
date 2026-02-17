// ECharts 系列样式边界：参数与 ECharts gauge 系列一致，内部使用 any 避免强依赖 echarts 内部类型。
import type { ThemeConfig } from './types'

/**
 * 应用仪表盘样式
 * 采用函数式编程，返回新的 series 对象
 */
export const applyGaugeStyles = (series: any, index: number, themeConfig: ThemeConfig): any => {
  if (!series || series.type !== 'gauge') {
    return series
  }

  const gaugeColor = themeConfig.color.colors[index % themeConfig.color.colors.length]
  const newSeries = { ...series }

  // 设置进度条颜色
  if (!newSeries.progress) {
    newSeries.progress = {}
  }
  if (!newSeries.progress.itemStyle) {
    newSeries.progress = {
      ...newSeries.progress,
      itemStyle: {},
    }
  }
  if (!newSeries.progress.itemStyle.color) {
    newSeries.progress = {
      ...newSeries.progress,
      itemStyle: {
        ...newSeries.progress.itemStyle,
        color: gaugeColor,
      },
    }
  }

  // 设置指针颜色
  if (!newSeries.pointer) {
    newSeries.pointer = {}
  }
  if (!newSeries.pointer.itemStyle) {
    newSeries.pointer = {
      ...newSeries.pointer,
      itemStyle: {},
    }
  }
  if (!newSeries.pointer.itemStyle.color) {
    newSeries.pointer = {
      ...newSeries.pointer,
      itemStyle: {
        ...newSeries.pointer.itemStyle,
        color: gaugeColor,
      },
    }
  }

  // 设置轴线颜色（显示进度高亮效果）
  if (!newSeries.axisLine) {
    newSeries.axisLine = {}
  }
  if (!newSeries.axisLine.lineStyle) {
    newSeries.axisLine = {
      ...newSeries.axisLine,
      lineStyle: {},
    }
  }
  if (!newSeries.axisLine.lineStyle.color) {
    const gaugeValue = newSeries.data?.[0]?.value || 0
    const maxValue = newSeries.max || 100
    const progress = gaugeValue / maxValue

    newSeries.axisLine = {
      ...newSeries.axisLine,
      lineStyle: {
        ...newSeries.axisLine.lineStyle,
        color: [
          [progress, gaugeColor],
          [1, themeConfig.card],
        ],
        width: newSeries.axisLine.lineStyle.width ?? themeConfig.size.strokeSeries,
      },
    }
  }

  // 设置刻度线颜色
  if (!newSeries.axisTick) {
    newSeries.axisTick = {}
  }
  if (!newSeries.axisTick.lineStyle) {
    newSeries.axisTick = {
      ...newSeries.axisTick,
      lineStyle: {},
    }
  }
  if (!newSeries.axisTick.lineStyle.color) {
    newSeries.axisTick = {
      ...newSeries.axisTick,
      lineStyle: {
        ...newSeries.axisTick.lineStyle,
        color: themeConfig.mutedForeground,
        width: newSeries.axisTick.lineStyle.width ?? themeConfig.size.strokeHairline,
      },
    }
  }
  if (!newSeries.axisTick.length) {
    newSeries.axisTick.length = themeConfig.size.tickLen
  }

  // 设置分隔线颜色
  if (!newSeries.splitLine) {
    newSeries.splitLine = {}
  }
  if (!newSeries.splitLine.lineStyle) {
    newSeries.splitLine = {
      ...newSeries.splitLine,
      lineStyle: {},
    }
  }
  if (!newSeries.splitLine.lineStyle.color) {
    newSeries.splitLine = {
      ...newSeries.splitLine,
      lineStyle: {
        ...newSeries.splitLine.lineStyle,
        color: themeConfig.mutedForeground,
        width: newSeries.splitLine.lineStyle.width ?? themeConfig.size.strokeGrid,
      },
    }
  }

  // 设置刻度标签颜色
  if (!newSeries.axisLabel) {
    newSeries.axisLabel = {}
  }
  if (!newSeries.axisLabel.color) {
    newSeries.axisLabel = {
      ...newSeries.axisLabel,
      color: themeConfig.mutedForeground,
      fontSize: newSeries.axisLabel.fontSize ?? themeConfig.size.fontSm,
    }
  }

  // 设置数值文本颜色
  if (!newSeries.detail) {
    newSeries.detail = {}
  }
  if (!newSeries.detail.color) {
    newSeries.detail = {
      ...newSeries.detail,
      color: themeConfig.foreground,
      fontSize: newSeries.detail.fontSize ?? themeConfig.size.fontMd,
    }
  }

  // 设置标题颜色
  if (!newSeries.title) {
    newSeries.title = {}
  }
  if (!newSeries.title.color) {
    newSeries.title = {
      ...newSeries.title,
      color: themeConfig.mutedForeground,
      fontSize: newSeries.title.fontSize ?? themeConfig.size.fontSm,
    }
  }

  return newSeries
}
