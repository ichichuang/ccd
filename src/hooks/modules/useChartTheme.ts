import { DEFAULT_OPACITY_VALUES } from '@/components/modules/use-echarts/utils/constants'
import type { ChartOpacityConfig } from '@/components/modules/use-echarts/utils/types'
import { useColorStore, useSizeStore } from '@/stores'
import { computed } from 'vue'

// 优化的深拷贝函数，保留函数引用，支持更多数据类型
function deepCloneWithFunctions(obj: any): any {
  // 处理基本类型和 null
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  // 保留函数引用
  if (typeof obj === 'function') {
    return obj
  }

  // 处理 Date 对象
  if (obj instanceof Date) {
    return new Date(obj.getTime())
  }

  // 处理 RegExp 对象
  if (obj instanceof RegExp) {
    return new RegExp(obj.source, obj.flags)
  }

  // 处理 Map 对象
  if (obj instanceof Map) {
    const clonedMap = new Map()
    for (const [key, value] of obj) {
      clonedMap.set(deepCloneWithFunctions(key), deepCloneWithFunctions(value))
    }
    return clonedMap
  }

  // 处理 Set 对象
  if (obj instanceof Set) {
    const clonedSet = new Set()
    for (const value of obj) {
      clonedSet.add(deepCloneWithFunctions(value))
    }
    return clonedSet
  }

  // 处理数组
  if (Array.isArray(obj)) {
    return obj.map(item => deepCloneWithFunctions(item))
  }

  // 处理普通对象
  if (typeof obj === 'object') {
    const cloned: any = {}
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        cloned[key] = deepCloneWithFunctions(obj[key])
      }
    }
    return cloned
  }

  return obj
}

// 字体配置接口
interface FontConfig {
  textColor: string
  textColorSecondary: string
  fontSize: number
  fontSizeSmall: number
}

// 颜色配置接口
interface ColorConfig {
  colors: string[]
  primaryColors: string[]
  successColors: string[]
  infoColors: string[]
  warnColors: string[]
  dangerColors: string[]
  helpColors: string[]
  contrastColors: string[]
  secondaryColors: string[]
}

// 主题配置接口
interface ThemeConfig {
  font: FontConfig
  color: ColorConfig
  opacity: ChartOpacityConfig
  paddings: number
  gap: number
  gapl: number
  textColor100: string
  textColor200: string
  bgColor200: string
  bgColor300: string
  accent100: string
}

// 字体样式应用函数
const applyFontStyles = (target: any, config: FontConfig) => {
  if (!target) {
    return
  }

  if (!target.textStyle) {
    target.textStyle = {}
  }
  if (!target.textStyle.color) {
    target.textStyle.color = config.textColor
  }
  if (!target.textStyle.fontSize) {
    target.textStyle.fontSize = config.fontSize
  }

  if (!target.label) {
    target.label = {}
  }
  if (!target.label.color) {
    target.label.color = config.textColor
  }
  if (!target.label.fontSize) {
    target.label.fontSize = config.fontSizeSmall
  }

  if (!target.axisLabel) {
    target.axisLabel = {}
  }
  if (!target.axisLabel.color) {
    target.axisLabel.color = config.textColorSecondary
  }
  if (!target.axisLabel.fontSize) {
    target.axisLabel.fontSize = config.fontSizeSmall
  }
}

// 通用字体样式应用函数，批量处理多个目标
const applyFontStylesToTargets = (targets: any[], config: FontConfig) => {
  targets.forEach(target => {
    if (target) {
      applyFontStyles(target, config)
    }
  })
}

// 通用样式应用函数，用于批量处理数组类型的配置
const applyStylesToArray = (items: any[], styleApplier: (item: any) => void) => {
  if (Array.isArray(items)) {
    items.forEach(styleApplier)
  }
}

// 通用样式应用函数，用于设置 itemStyle 和 label
const applyItemStyleAndLabel = (
  series: any,
  seriesColor: string,
  labelColor: string,
  fontSize: number
) => {
  if (!series.itemStyle) {
    series.itemStyle = {}
  }
  if (!series.itemStyle.color) {
    series.itemStyle.color = seriesColor
  }

  if (!series.label) {
    series.label = {}
  }
  if (!series.label.color) {
    series.label.color = labelColor
  }
  if (!series.label.fontSize) {
    series.label.fontSize = fontSize
  }
}

// 线条样式应用函数
const applyLineStyles = (series: any, seriesColor: string) => {
  if (series.type === 'line' || series.type === 'area') {
    if (!series.lineStyle) {
      series.lineStyle = {}
    }
    if (!series.lineStyle.color) {
      series.lineStyle.color = seriesColor
    }
    if (!series.lineStyle.width) {
      series.lineStyle.width = 2
    }
  }

  // 区域样式（面积图）
  if (series.type === 'line' && series.areaStyle) {
    if (!series.areaStyle.color) {
      series.areaStyle.color = seriesColor
    }
  }
}

// 基础系列样式应用函数
const applySeriesStyles = (series: any, index: number, config: ThemeConfig) => {
  const seriesColor = config.color.colors[index % config.color.colors.length]

  // 应用通用样式
  applyItemStyleAndLabel(series, seriesColor, config.textColor100, config.font.fontSizeSmall)

  // 应用线条样式
  applyLineStyles(series, seriesColor)

  // 应用透明度配置
  applyOpacityConfig(series, config.opacity)
}

// 透明度配置应用函数
const applyOpacityConfig = (series: any, opacityConfig: ChartOpacityConfig) => {
  if (!opacityConfig) {
    return
  }

  const type = series.type

  // 透明度配置映射表
  const opacityMap: { [key: string]: number } = {
    line: opacityConfig.lineArea || opacityConfig.area || 0.8,
    area: opacityConfig.area || 0.8,
    bar: opacityConfig.bar || 0.8,
    scatter: opacityConfig.scatter || 0.8,
    effectScatter: opacityConfig.scatter || 0.8,
    radar: opacityConfig.radar || 0.8,
    funnel: opacityConfig.funnel || 0.8,
    gauge: opacityConfig.gauge || 0.8,
    // 对于没有在 ChartOpacityConfig 中定义的图表类型，使用默认值
    pie: 0.8,
    heatmap: 0.8,
    treemap: 0.8,
    sunburst: 0.8,
    sankey: 0.8,
    themeRiver: 0.8,
    boxplot: 0.8,
    candlestick: 0.8,
    graph: 0.8,
    lines: 0.8,
    map: 0.8,
    parallel: 0.8,
    pictorialBar: 0.8,
    liquidFill: 0.8,
    wordCloud: 0.8,
  }

  const defaultOpacity = opacityMap[type] || 0.8

  // 应用透明度到不同的样式属性
  switch (type) {
    case 'line':
      if (series.areaStyle && !series.areaStyle.opacity) {
        series.areaStyle.opacity = defaultOpacity
      }
      break
    case 'area':
      if (series.areaStyle && !series.areaStyle.opacity) {
        series.areaStyle.opacity = defaultOpacity
      }
      break
    case 'radar':
      if (series.areaStyle && !series.areaStyle.opacity) {
        series.areaStyle.opacity = defaultOpacity
      }
      break
    default:
      // 对于其他类型，应用到 itemStyle
      if (!series.itemStyle?.opacity) {
        if (!series.itemStyle) {
          series.itemStyle = {}
        }
        series.itemStyle.opacity = defaultOpacity
      }
      break
  }

  // 特殊处理：为某些图表类型设置额外的透明度
  if (['heatmap', 'treemap', 'sunburst'].includes(type)) {
    if (!series.visualMap) {
      series.visualMap = {}
    }
    if (!series.visualMap.inRange) {
      series.visualMap.inRange = {}
    }
    if (!series.visualMap.inRange.opacity) {
      series.visualMap.inRange.opacity = defaultOpacity
    }
  }
}

// 仪表盘样式应用函数
const applyGaugeStyles = (series: any, index: number, config: ThemeConfig) => {
  const gaugeColor = config.color.colors[index % config.color.colors.length]

  // 设置进度条颜色
  if (!series.progress) {
    series.progress = {}
  }
  if (!series.progress.itemStyle) {
    series.progress.itemStyle = {}
  }
  if (!series.progress.itemStyle.color) {
    series.progress.itemStyle.color = gaugeColor
  }

  // 设置指针颜色
  if (!series.pointer) {
    series.pointer = {}
  }
  if (!series.pointer.itemStyle) {
    series.pointer.itemStyle = {}
  }
  if (!series.pointer.itemStyle.color) {
    series.pointer.itemStyle.color = gaugeColor
  }

  // 设置轴线颜色（显示进度高亮效果）
  if (!series.axisLine) {
    series.axisLine = {}
  }
  if (!series.axisLine.lineStyle) {
    series.axisLine.lineStyle = {}
  }
  if (!series.axisLine.lineStyle.color) {
    const gaugeValue = series.data?.[0]?.value || 0
    const maxValue = series.max || 100
    const progress = gaugeValue / maxValue

    series.axisLine.lineStyle.color = [
      [progress, gaugeColor],
      [1, config.bgColor300],
    ]
  }

  // 设置刻度线颜色
  if (!series.axisTick) {
    series.axisTick = {}
  }
  if (!series.axisTick.lineStyle) {
    series.axisTick.lineStyle = {}
  }
  if (!series.axisTick.lineStyle.color) {
    series.axisTick.lineStyle.color = config.textColor200
  }

  // 设置分隔线颜色
  if (!series.splitLine) {
    series.splitLine = {}
  }
  if (!series.splitLine.lineStyle) {
    series.splitLine.lineStyle = {}
  }
  if (!series.splitLine.lineStyle.color) {
    series.splitLine.lineStyle.color = config.textColor200
  }

  // 设置刻度标签颜色
  if (!series.axisLabel) {
    series.axisLabel = {}
  }
  if (!series.axisLabel.color) {
    series.axisLabel.color = config.textColor200
  }

  // 设置数值文本颜色
  if (!series.detail) {
    series.detail = {}
  }
  if (!series.detail.color) {
    series.detail.color = config.textColor100
  }

  // 设置标题颜色
  if (!series.title) {
    series.title = {}
  }
  if (!series.title.color) {
    series.title.color = config.textColor200
  }
}

// 饼图样式应用函数
const applyPieStyles = (series: any, config: ThemeConfig) => {
  if (Array.isArray(series.data)) {
    series.data.forEach((item: any, dataIndex: number) => {
      // 处理不同的数据格式
      let dataItem = item
      if (typeof item === 'object' && item.value !== undefined) {
        // 对象格式: { name: '产品A', value: 30 }
        dataItem = item
      } else if (Array.isArray(item)) {
        // 数组格式: ['产品A', 30]
        dataItem = { name: item[0], value: item[1] }
      } else {
        // 简单值格式: 30
        dataItem = { value: item }
      }

      if (!dataItem.itemStyle) {
        dataItem.itemStyle = {}
      }
      if (!dataItem.itemStyle.color) {
        dataItem.itemStyle.color = config.color.colors[dataIndex % config.color.colors.length]
      }

      // 更新原始数据
      if (typeof item === 'object' && item.value !== undefined) {
        Object.assign(item, dataItem)
      } else if (Array.isArray(item)) {
        series.data[dataIndex] = dataItem
      } else {
        series.data[dataIndex] = dataItem
      }
    })
  }
}

// 漏斗图样式应用函数
const applyFunnelStyles = (series: any, config: ThemeConfig) => {
  // 系列级边框样式（未自定义时融合系统变量）
  if (!series.itemStyle) {
    series.itemStyle = {}
  }
  if (!series.itemStyle.borderColor) {
    series.itemStyle.borderColor = 'transparent'
  }
  if (series.itemStyle.borderWidth === undefined) {
    series.itemStyle.borderWidth = 0
  }
  if (!series.emphasis) {
    series.emphasis = {}
  }
  if (!series.emphasis.itemStyle) {
    series.emphasis.itemStyle = {}
  }
  if (!series.emphasis.itemStyle.borderColor) {
    series.emphasis.itemStyle.borderColor = 'transparent'
  }
  if (series.emphasis.itemStyle.borderWidth === undefined) {
    series.emphasis.itemStyle.borderWidth = 0
  }

  if (Array.isArray(series.data)) {
    series.data.forEach((item: any, dataIndex: number) => {
      if (!item.itemStyle) {
        item.itemStyle = {}
      }
      if (!item.itemStyle.color) {
        item.itemStyle.color = config.color.colors[dataIndex % config.color.colors.length]
      }
      if (!item.itemStyle.borderColor) {
        item.itemStyle.borderColor = 'transparent'
      }
      if (item.itemStyle.borderWidth === undefined) {
        item.itemStyle.borderWidth = 0
      }
    })
  }

  // 标签引导线颜色（融合系统变量）
  if (!series.labelLine) {
    series.labelLine = {}
  }
  if (!series.labelLine.lineStyle) {
    series.labelLine.lineStyle = {}
  }
  if (!series.labelLine.lineStyle.color) {
    series.labelLine.lineStyle.color = config.textColor200
  }
}

// 雷达图样式应用函数
const applyRadarStyles = (series: any, config: ThemeConfig) => {
  if (Array.isArray(series.data)) {
    series.data.forEach((item: any, dataIndex: number) => {
      const radarColor = config.color.colors[dataIndex % config.color.colors.length]

      // 设置线条颜色
      if (!item.lineStyle) {
        item.lineStyle = {}
      }
      if (!item.lineStyle.color) {
        item.lineStyle.color = radarColor
      }

      // 设置区域填充颜色
      if (!item.areaStyle) {
        item.areaStyle = {}
      }
      if (!item.areaStyle.color) {
        item.areaStyle.color = radarColor
      }

      // 设置数据点颜色
      if (!item.itemStyle) {
        item.itemStyle = {}
      }
      if (!item.itemStyle.color) {
        item.itemStyle.color = radarColor
      }
    })
  }
}

// 箱型图样式应用函数
const applyBoxplotStyles = (series: any, config: ThemeConfig) => {
  if (Array.isArray(series.data)) {
    series.data = series.data.map((item: any, dataIndex: number) => {
      if (Array.isArray(item)) {
        return {
          value: item,
          itemStyle: {
            color: config.color.colors[dataIndex % config.color.colors.length],
          },
        }
      } else if (item && typeof item === 'object' && !item.itemStyle?.color) {
        return {
          ...item,
          itemStyle: {
            ...item.itemStyle,
            color: config.color.colors[dataIndex % config.color.colors.length],
          },
        }
      }
      return item
    })
  }
}

// 主题河流图样式应用函数
const applyThemeRiverStyles = (series: any, config: ThemeConfig) => {
  if (Array.isArray(series.data)) {
    const categories = new Set<string>()
    series.data.forEach((item: any) => {
      if (Array.isArray(item) && item[2]) {
        categories.add(item[2])
      }
    })

    const categoryColors: { [key: string]: string } = {}
    // 为主题河流图使用高对比度的颜色，确保视觉区分明显
    const highContrastColors = [
      config.color.primaryColors[0], // 主色
      config.color.successColors[0], // 成功色（绿色）
      config.color.infoColors[0], // 信息色（蓝色）
      config.color.warnColors[0], // 警告色（橙色）
      config.color.dangerColors[0], // 危险色（红色）
      config.color.helpColors[0], // 帮助色（紫色）
    ]

    Array.from(categories).forEach((category, catIndex) => {
      // 使用高对比度颜色，确保不同类别有明显的视觉差异
      const colorIndex = catIndex % highContrastColors.length
      categoryColors[category] = highContrastColors[colorIndex]
    })

    // 强制设置系列级别的颜色数组，这是主题河流图的关键配置
    series.color = Array.from(categories).map(category => categoryColors[category])

    // 设置颜色函数，确保每个数据项都有正确的颜色
    if (!series.itemStyle) {
      series.itemStyle = {}
    }

    // 强制设置颜色函数
    series.itemStyle.color = (params: any) => {
      // 从数据中获取类别信息
      const data = params.data
      if (Array.isArray(data) && data[2]) {
        const category = data[2]
        return categoryColors[category] || config.color.colors[0]
      }
      return config.color.colors[0]
    }

    // 主题河流图需要特殊的 tooltip 配置
    // 由于 ECharts 的 tooltip 机制问题，我们需要在系列级别配置 tooltip
    if (!series.tooltip) {
      series.tooltip = {}
    }

    // 设置系列级别的 tooltip formatter
    series.tooltip.formatter = (params: any) => {
      // 主题河流图的数据格式是 [time, value, category]
      if (Array.isArray(params.data) && params.data.length >= 3) {
        const category = params.data[2]
        const value = params.data[1]
        const time = params.data[0]

        // 尝试从原始数据中获取更准确的信息
        const seriesData = series.data
        if (Array.isArray(seriesData)) {
          // 查找同一时间点的所有数据
          const timeData = seriesData.filter((item: any) => Array.isArray(item) && item[0] === time)

          // 如果有多个类别在同一时间点，显示所有信息
          if (timeData.length > 1) {
            let result = `时间: ${time}<br/>`
            timeData.forEach((item: any) => {
              result += `${item[2]}: ${item[1]}<br/>`
            })
            return result
          }
        }

        return `${category}: ${value}<br/>时间: ${time}`
      }

      return params.name || '未知'
    }
  }
}

// 热力图样式应用函数
const applyHeatmapStyles = (series: any, config: ThemeConfig) => {
  // 计算数据范围
  let minValue = 0
  let maxValue = 100

  if (Array.isArray(series.data) && series.data.length > 0) {
    const values = series.data
      .filter((item: any) => Array.isArray(item) && item.length >= 3)
      .map((item: any) => item[2])

    if (values.length > 0) {
      minValue = Math.min(...values)
      maxValue = Math.max(...values)
    }
  }

  // 设置热力图的视觉映射
  if (!series.visualMap) {
    series.visualMap = {
      min: minValue,
      max: maxValue,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '15%',
      inRange: {
        color: config.color.colors.slice(0, 4), // 使用前4个颜色作为热力图渐变
      },
      textStyle: {
        color: config.textColor100,
        fontSize: config.font.fontSizeSmall,
      },
    }
  }

  // 确保热力图有正确的配置
  if (!series.coordinateSystem) {
    series.coordinateSystem = 'cartesian2d'
  }

  // 设置热力图的数据项样式
  if (Array.isArray(series.data)) {
    series.data.forEach((item: any) => {
      if (Array.isArray(item) && item.length >= 3) {
        // 热力图数据格式: [x, y, value]
        const value = item[2]
        // 确保值在有效范围内
        if (typeof value === 'number' && !isNaN(value)) {
          // 不需要手动设置颜色，让 visualMap 处理
          // 但确保数据格式正确
          if (item.length === 3) {
            // 标准格式: [x, y, value]
            return
          } else if (item.length === 4) {
            // 扩展格式: [x, y, value, extra]
            return
          }
        }
      }
    })
  }

  // 设置热力图的标签样式
  if (!series.label) {
    series.label = {
      show: false, // 默认不显示标签，避免过于拥挤
    }
  }

  // 设置热力图的强调样式
  if (!series.emphasis) {
    series.emphasis = {
      itemStyle: {
        borderColor: config.textColor100,
        borderWidth: 1,
      },
      label: {
        show: true,
        color: config.textColor100,
        fontSize: config.font.fontSizeSmall,
      },
    }
  }
}

// 树图样式应用函数（Treemap 完整颜色合并）
const applyTreemapStyles = (series: any, config: ThemeConfig) => {
  // 基础调色与映射策略
  if (!series.color) {
    series.color = config.color.colors
  }
  if (!series.colorMappingBy) {
    // 兄弟节点按索引取色，满足"按 length 区分颜色"
    series.colorMappingBy = 'index'
  }
  if (!series.colorSaturation) {
    series.colorSaturation = [0.45, 0.95]
  }
  if (series.visibleMin === undefined) {
    series.visibleMin = 0
  }
  if (series.childrenVisibleMin === undefined) {
    series.childrenVisibleMin = 0
  }

  // 视觉维度与可视范围（根据 value 动态计算）
  if (series.visualDimension === undefined) {
    series.visualDimension = 0
  }
  let vMin = Number.POSITIVE_INFINITY
  let vMax = Number.NEGATIVE_INFINITY
  const collectValues = (node: any) => {
    if (!node) {
      return
    }
    const val = Array.isArray(node.value) ? node.value[0] : node.value
    if (typeof val === 'number') {
      vMin = Math.min(vMin, val)
      vMax = Math.max(vMax, val)
    }
    if (Array.isArray(node.children)) {
      node.children.forEach(collectValues)
    }
  }
  if (Array.isArray(series.data)) {
    series.data.forEach(collectValues)
  }
  if (isFinite(vMin) && isFinite(vMax)) {
    if (series.visualMin === undefined) {
      series.visualMin = vMin
    }
    if (series.visualMax === undefined) {
      series.visualMax = vMax
    }
  }

  // 设置树图的视觉映射
  if (!series.visualMap) {
    series.visualMap = {
      type: 'continuous',
      min: 0,
      max: 100,
      inRange: {
        color: config.color.colors.slice(0, 6), // 使用前6个颜色
      },
    }
  }

  // 设置树图的标签样式
  if (!series.label) {
    series.label = {
      show: true,
      formatter: '{b}',
      color: config.textColor100,
      fontSize: config.font.fontSizeSmall,
    }
  }
  // 统一消除文字描边/阴影并合并系统配色（label）
  if (!series.label.rich) {
    series.label.rich = {}
  }
  if (!series.label.textBorderColor) {
    series.label.textBorderColor = 'transparent'
  }
  if (series.label.textBorderWidth === undefined) {
    series.label.textBorderWidth = 0
  }
  if (series.label.textShadowBlur === undefined) {
    series.label.textShadowBlur = 0
  }
  if (!series.label.textShadowColor) {
    series.label.textShadowColor = 'transparent'
  }
  if (!series.label.color) {
    series.label.color = config.textColor100
  }
  if (!series.label.fontSize) {
    series.label.fontSize = config.font.fontSizeSmall
  }

  // 顶层小标题 upperLabel 的颜色与描边
  if (!series.upperLabel) {
    series.upperLabel = {}
  }
  if (series.upperLabel.show === undefined) {
    series.upperLabel.show = true
  }
  if (!series.upperLabel.color) {
    series.upperLabel.color = config.textColor200
  }
  if (!series.upperLabel.textBorderColor) {
    series.upperLabel.textBorderColor = 'transparent'
  }
  if (series.upperLabel.textBorderWidth === undefined) {
    series.upperLabel.textBorderWidth = 0
  }
  if (series.upperLabel.textShadowBlur === undefined) {
    series.upperLabel.textShadowBlur = 0
  }
  if (!series.upperLabel.textShadowColor) {
    series.upperLabel.textShadowColor = 'transparent'
  }

  // 系列级 itemStyle 边框与间隔等默认样式
  if (!series.itemStyle) {
    series.itemStyle = {}
  }
  if (!series.itemStyle.borderColor) {
    series.itemStyle.borderColor = 'transparent'
  }
  if (series.itemStyle.borderWidth === undefined) {
    series.itemStyle.borderWidth = 0
  }
  if (series.itemStyle.gapWidth === undefined) {
    series.itemStyle.gapWidth = 0
  }
  if (series.itemStyle.borderRadius === undefined) {
    series.itemStyle.borderRadius = 2
  }

  // 强调态边框（高亮时更明显）
  if (!series.emphasis) {
    series.emphasis = {}
  }
  if (!series.emphasis.itemStyle) {
    series.emphasis.itemStyle = {}
  }
  if (!series.emphasis.itemStyle.borderColor) {
    series.emphasis.itemStyle.borderColor = 'transparent'
  }
  if (series.emphasis.itemStyle.borderWidth === undefined) {
    series.emphasis.itemStyle.borderWidth = 0
  }

  // 基础 levels（分层边框与间隔，未设置时提供合理默认）
  if (!series.levels) {
    series.levels = [
      { itemStyle: { borderColor: 'transparent', borderWidth: 0, gapWidth: 0 } },
      { itemStyle: { borderColor: 'transparent', borderWidth: 0, gapWidth: 0 } },
      { itemStyle: { borderColor: 'transparent', borderWidth: 0, gapWidth: 0 } },
    ]
  }

  // 改进的颜色分配逻辑：按层级和兄弟节点分配颜色
  const nameToColor: Record<string, string> = {}
  const assignColorsToNodes = (nodes: any[], colorIndex: number = 0, level: number = 0) => {
    if (!Array.isArray(nodes)) {
      return
    }

    nodes.forEach((node: any, index: number) => {
      if (!node.itemStyle) {
        node.itemStyle = {}
      }

      // 为每个节点分配颜色，确保兄弟节点有不同的颜色
      if (!node.itemStyle.color) {
        // 使用层级和索引的组合来确保颜色分布均匀
        const nodeColorIndex = (level * 3 + index) % config.color.colors.length
        node.itemStyle.color = config.color.colors[nodeColorIndex]
      }

      if (node.name) {
        nameToColor[node.name] = node.itemStyle.color
      }

      // 递归处理子节点
      if (Array.isArray(node.children)) {
        assignColorsToNodes(node.children, colorIndex + index + 1, level + 1)
      }
    })
  }

  if (Array.isArray(series.data)) {
    assignColorsToNodes(series.data, 0, 0)
  }

  // 设置面包屑导航样式
  if (!series.breadcrumb) {
    series.breadcrumb = {}
  }
  if (!series.breadcrumb.show) {
    series.breadcrumb.show = true
  }

  // 面包屑导航的样式配置
  if (!series.breadcrumb.itemStyle) {
    series.breadcrumb.itemStyle = {}
  }
  if (!series.breadcrumb.itemStyle.color) {
    series.breadcrumb.itemStyle.color = config.bgColor200
  }
  if (series.breadcrumb.itemStyle.opacity === undefined) {
    series.breadcrumb.itemStyle.opacity = 0.95
  }
  if (!series.breadcrumb.itemStyle.borderColor) {
    series.breadcrumb.itemStyle.borderColor = config.bgColor300
  }
  if (!series.breadcrumb.itemStyle.borderWidth) {
    series.breadcrumb.itemStyle.borderWidth = 1
  }
  if (!series.breadcrumb.itemStyle.borderRadius) {
    series.breadcrumb.itemStyle.borderRadius = 4
  }
  // 确保普通态文字颜色在 itemStyle 下也强制设置（ECharts 优先级有时以此为准）
  if (!series.breadcrumb.itemStyle.textStyle) {
    series.breadcrumb.itemStyle.textStyle = {}
  }
  if (!series.breadcrumb.itemStyle.textStyle.color) {
    series.breadcrumb.itemStyle.textStyle.color = config.textColor100
  }

  // 面包屑导航的文本样式
  if (!series.breadcrumb.textStyle) {
    series.breadcrumb.textStyle = {}
  }
  // 底部标签默认字体颜色：使用主题强调文本，保证可读性
  series.breadcrumb.textStyle.color = series.breadcrumb.textStyle.color || config.textColor100
  if (!series.breadcrumb.textStyle.fontSize) {
    series.breadcrumb.textStyle.fontSize = config.font.fontSizeSmall
  }
  if (!series.breadcrumb.separator) {
    series.breadcrumb.separator = '>'
  }
  if (!series.breadcrumb.separatorStyle) {
    series.breadcrumb.separatorStyle = {}
  }
  if (!series.breadcrumb.separatorStyle.color) {
    series.breadcrumb.separatorStyle.color = config.bgColor300
  }
  if (series.breadcrumb.separatorStyle.opacity === undefined) {
    series.breadcrumb.separatorStyle.opacity = 0.9
  }

  // 面包屑导航的强调样式
  if (!series.breadcrumb.emphasis) {
    series.breadcrumb.emphasis = {}
  }
  if (!series.breadcrumb.emphasis.itemStyle) {
    series.breadcrumb.emphasis.itemStyle = {}
  }
  if (!series.breadcrumb.emphasis.itemStyle.color) {
    // 悬停背景使用主题分隔背景色，稳定对比度
    series.breadcrumb.emphasis.itemStyle.color = config.bgColor300
  }
  // 悬停时边框与不透明度
  if (!series.breadcrumb.emphasis.itemStyle.borderColor) {
    series.breadcrumb.emphasis.itemStyle.borderColor = config.bgColor300
  }
  if (series.breadcrumb.emphasis.itemStyle.opacity === undefined) {
    series.breadcrumb.emphasis.itemStyle.opacity = 1
  }
  if (!series.breadcrumb.emphasis.textStyle) {
    series.breadcrumb.emphasis.textStyle = {}
  }
  if (!series.breadcrumb.emphasis.textStyle.color) {
    series.breadcrumb.emphasis.textStyle.color = config.textColor100
  }
}

// 桑基图样式应用函数
const applySankeyStyles = (series: any, config: ThemeConfig) => {
  // 设置桑基图的节点样式
  if (!series.itemStyle) {
    series.itemStyle = {}
  }
  if (!series.itemStyle.color) {
    series.itemStyle.color = config.color.colors[0]
  }

  // 设置桑基图的线条样式
  if (!series.lineStyle) {
    series.lineStyle = {}
  }
  if (!series.lineStyle.color) {
    series.lineStyle.color = 'gradient'
  }

  // 设置桑基图的标签样式
  if (!series.label) {
    series.label = {
      color: config.textColor100,
      fontSize: config.font.fontSizeSmall,
    }
  }
}

// 旭日图样式应用函数
const applySunburstStyles = (series: any, config: ThemeConfig) => {
  // 设置旭日图的标签样式
  if (!series.label) {
    series.label = {
      show: true,
      color: config.textColor100,
      fontSize: config.font.fontSizeSmall,
    }
  }

  // 系列级边框样式
  if (!series.itemStyle) {
    series.itemStyle = {}
  }
  if (!series.itemStyle.borderColor) {
    series.itemStyle.borderColor = 'transparent'
  }
  if (series.itemStyle.borderWidth === undefined) {
    series.itemStyle.borderWidth = 0
  }
  if (!series.emphasis) {
    series.emphasis = {}
  }
  if (!series.emphasis.itemStyle) {
    series.emphasis.itemStyle = {}
  }
  if (!series.emphasis.itemStyle.borderColor) {
    series.emphasis.itemStyle.borderColor = config.color.primaryColors[0]
  }
  if (series.emphasis.itemStyle.borderWidth === undefined) {
    series.emphasis.itemStyle.borderWidth = 2
  }

  // 设置旭日图的数据项样式
  if (Array.isArray(series.data)) {
    const applyColorToNode = (node: any, colorIndex: number = 0) => {
      if (!node.itemStyle) {
        node.itemStyle = {}
      }
      if (!node.itemStyle.color) {
        node.itemStyle.color = config.color.colors[colorIndex % config.color.colors.length]
      }
      if (!node.itemStyle.borderColor) {
        node.itemStyle.borderColor = 'transparent'
      }
      if (node.itemStyle.borderWidth === undefined) {
        node.itemStyle.borderWidth = 0
      }

      if (Array.isArray(node.children)) {
        node.children.forEach((child: any, childIndex: number) => {
          applyColorToNode(child, colorIndex + childIndex + 1)
        })
      }
    }

    series.data.forEach((node: any, index: number) => {
      applyColorToNode(node, index)
    })
  }

  // 分层 levels，补齐边框样式
  if (!series.levels) {
    series.levels = [
      { itemStyle: { borderColor: 'transparent', borderWidth: 0 } },
      { itemStyle: { borderColor: 'transparent', borderWidth: 0 } },
      { itemStyle: { borderColor: 'transparent', borderWidth: 0 } },
    ]
  }
}

// 网络关系图样式应用函数（按节点/类别长度分配颜色）
const applyGraphStyles = (series: any, config: ThemeConfig) => {
  const palette = config.color.colors

  // 给 categories 分配颜色，优先保证同类同色
  if (Array.isArray(series.categories)) {
    series.categories.forEach((cat: any, idx: number) => {
      if (!cat.itemStyle) {
        cat.itemStyle = {}
      }
      if (!cat.itemStyle.color) {
        cat.itemStyle.color = palette[idx % palette.length]
      }
    })
  }

  // 为每个节点着色：有 category 用 category 颜色；否则按节点索引
  if (Array.isArray(series.data)) {
    series.data.forEach((node: any, idx: number) => {
      if (!node.itemStyle) {
        node.itemStyle = {}
      }
      if (!node.itemStyle.color) {
        if (
          typeof node.category === 'number' &&
          Array.isArray(series.categories) &&
          series.categories[node.category]?.itemStyle?.color
        ) {
          node.itemStyle.color = series.categories[node.category].itemStyle.color
        } else {
          node.itemStyle.color = palette[idx % palette.length]
        }
      }
    })
  }

  // 为连线着色：根据连接的节点类别或使用渐变色
  if (Array.isArray(series.links)) {
    series.links.forEach((link: any, idx: number) => {
      if (!link.lineStyle) {
        link.lineStyle = {}
      }
      if (!link.lineStyle.color) {
        // 如果连线有源节点和目标节点，尝试使用它们的颜色
        const sourceNode = series.data?.find(
          (n: any) => n.id === link.source || n.name === link.source
        )
        const targetNode = series.data?.find(
          (n: any) => n.id === link.target || n.name === link.target
        )

        if (sourceNode?.itemStyle?.color && targetNode?.itemStyle?.color) {
          // 使用渐变色连接两个节点
          link.lineStyle.color = {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 1,
            y2: 0,
            colorStops: [
              { offset: 0, color: sourceNode.itemStyle.color },
              { offset: 1, color: targetNode.itemStyle.color },
            ],
          }
        } else {
          // 回退到默认颜色
          link.lineStyle.color = palette[idx % palette.length]
        }
      }
    })
  }

  // 标签样式
  if (!series.label) {
    series.label = {}
  }
  if (!series.label.color) {
    series.label.color = config.textColor100
  }
  if (!series.label.fontSize) {
    series.label.fontSize = config.font.fontSizeSmall
  }
}

// 树图样式应用函数（按每层 children 的 length 分配颜色）
const applyTreeStyles = (series: any, config: ThemeConfig) => {
  const palette = config.color.colors

  const colorize = (node: any, indexInSiblings: number = 0, level: number = 0) => {
    if (!node) {
      return
    }
    if (!node.itemStyle) {
      node.itemStyle = {}
    }
    if (!node.itemStyle.color) {
      // 使用层级和兄弟索引的组合来确保颜色分布更均匀
      const colorIndex = (level * 2 + indexInSiblings) % palette.length
      node.itemStyle.color = palette[colorIndex]
    }

    // 设置节点符号样式
    if (!node.symbol) {
      node.symbol = 'circle'
    }
    if (!node.symbolSize) {
      node.symbolSize = 8
    }

    // 设置连线样式
    if (!node.lineStyle) {
      node.lineStyle = {}
    }
    if (!node.lineStyle.color) {
      node.lineStyle.color = config.bgColor300
    }
    if (!node.lineStyle.width) {
      node.lineStyle.width = 1
    }

    if (Array.isArray(node.children)) {
      node.children.forEach((child: any, i: number) => colorize(child, i, level + 1))
    }
  }

  if (Array.isArray(series.data)) {
    series.data.forEach((root: any) => colorize(root, 0, 0))
  }

  // 统一标签样式
  if (!series.label) {
    series.label = {}
  }
  if (!series.label.color) {
    series.label.color = config.textColor100
  }
  if (!series.label.fontSize) {
    series.label.fontSize = config.font.fontSizeSmall
  }

  // 设置布局配置
  if (!series.layout) {
    series.layout = 'orthogonal'
  }
  if (!series.orient) {
    series.orient = 'LR'
  }
}

// 平行坐标图样式应用函数（每条线按数据条目长度着色）
const applyParallelStyles = (series: any, config: ThemeConfig) => {
  const palette = config.color.colors
  if (Array.isArray(series.data)) {
    series.data = series.data.map((row: any, idx: number) => {
      // 使用更均匀的颜色分布算法
      const colorIndex = Math.floor((idx * palette.length) / series.data.length) % palette.length
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
  if (!series.emphasis) {
    series.emphasis = {}
  }
  if (!series.emphasis.focus) {
    series.emphasis.focus = 'series'
  }
  if (!series.emphasis.lineStyle) {
    series.emphasis.lineStyle = {}
  }
  if (!series.emphasis.lineStyle.width) {
    series.emphasis.lineStyle.width = 3
  }
  if (!series.emphasis.lineStyle.opacity) {
    series.emphasis.lineStyle.opacity = 1
  }
}

// 带波纹散点图样式应用函数
const applyEffectScatterStyles = (series: any, config: ThemeConfig, index: number) => {
  // 颜色与点样式
  const seriesColor = config.color.colors[index % config.color.colors.length]
  if (!series.itemStyle) {
    series.itemStyle = {}
  }
  if (!series.itemStyle.color) {
    series.itemStyle.color = seriesColor
  }

  // 标签样式
  if (!series.label) {
    series.label = {}
  }
  if (!series.label.color) {
    series.label.color = config.textColor100
  }
  if (!series.label.fontSize) {
    series.label.fontSize = config.font.fontSizeSmall
  }

  // 涟漪效果默认值
  if (!series.rippleEffect) {
    series.rippleEffect = {}
  }
  if (!series.rippleEffect.brushType) {
    series.rippleEffect.brushType = 'stroke'
  }
  if (!series.showEffectOn) {
    series.showEffectOn = 'render'
  }

  // 强调样式
  if (!series.emphasis) {
    series.emphasis = {}
  }
  if (!series.emphasis.scale) {
    series.emphasis.scale = true
  }
}

// 象形柱图样式应用函数
const applyPictorialBarStyles = (series: any, config: ThemeConfig, index: number) => {
  const seriesColor = config.color.colors[index % config.color.colors.length]
  if (!series.itemStyle) {
    series.itemStyle = {}
  }
  if (!series.itemStyle.color) {
    series.itemStyle.color = seriesColor
  }

  // 标签样式
  if (!series.label) {
    series.label = {}
  }
  if (!series.label.color) {
    series.label.color = config.textColor100
  }
  if (!series.label.fontSize) {
    series.label.fontSize = config.font.fontSizeSmall
  }
}

// 线图层（lines）样式应用函数
const applyLinesStyles = (series: any, config: ThemeConfig, index: number) => {
  const seriesColor = config.color.colors[index % config.color.colors.length]

  // 主折线样式
  if (!series.lineStyle) {
    series.lineStyle = {}
  }
  if (!series.lineStyle.color) {
    series.lineStyle.color = seriesColor
  }
  if (!series.lineStyle.width) {
    series.lineStyle.width = 2
  }
  if (series.lineStyle.opacity === undefined) {
    series.lineStyle.opacity = 0.6
  }

  // 轨迹效果
  if (!series.effect) {
    series.effect = {}
  }
  if (series.effect.show === undefined) {
    series.effect.show = true
  }
  if (!series.effect.color) {
    series.effect.color = '#fff'
  }
  if (series.effect.symbolSize === undefined) {
    series.effect.symbolSize = 3
  }
}

/**
 * 应用主题样式到 ECharts tooltip
 * 仅负责融合颜色和尺寸，不改动 formatter 逻辑
 */
const applyTooltipStyles = (tooltip: Record<string, any> = {}, config: ThemeConfig) => {
  // 保证 tooltip 对象存在
  const t = tooltip

  // ===== 背景与边框颜色 =====
  t.backgroundColor ??= config.bgColor200
  t.borderColor ??= config.bgColor300

  // ===== 文本样式 =====
  t.textStyle ??= {}
  const ts = t.textStyle

  // 只在未定义时填充
  ts.color ??= config.textColor100
  ts.fontSize ??= config.font.fontSizeSmall

  // 不处理 formatter —— 避免污染全局 tooltip 逻辑
  return t
}

// 数据缩放样式应用函数
const applyDataZoomStyles = (dataZoom: any, config: ThemeConfig) => {
  if (!dataZoom) {
    return
  }

  // 基础文本样式
  if (!dataZoom.textStyle) {
    dataZoom.textStyle = {}
  }
  if (!dataZoom.textStyle.color) {
    dataZoom.textStyle.color = config.accent100
  }
  if (!dataZoom.textStyle.fontSize) {
    dataZoom.textStyle.fontSize = config.font.fontSizeSmall
  }

  // 背景和边框样式
  if (!dataZoom.backgroundColor) {
    dataZoom.backgroundColor = 'rgba(0, 0, 0, 0.05)'
  }
  if (!dataZoom.borderColor) {
    dataZoom.borderColor = 'rgba(0, 0, 0, 0.1)'
  }
  if (!dataZoom.borderWidth) {
    dataZoom.borderWidth = 1
  }

  // 填充区域样式
  if (!dataZoom.fillerColor) {
    dataZoom.fillerColor = `linear-gradient(90deg, ${config.color.primaryColors[0]}20, ${config.color.primaryColors[0]}40)`
  }
  if (!dataZoom.fillerOpacity) {
    dataZoom.fillerOpacity = 0.6
  }

  // 手柄样式
  if (!dataZoom.handleStyle) {
    dataZoom.handleStyle = {}
  }
  if (!dataZoom.handleStyle.color) {
    dataZoom.handleStyle.color = config.color.primaryColors[0]
  }
  if (!dataZoom.handleStyle.borderColor) {
    dataZoom.handleStyle.borderColor = config.color.primaryColors[0]
  }
  if (!dataZoom.handleStyle.borderWidth) {
    dataZoom.handleStyle.borderWidth = 2
  }
  if (!dataZoom.handleStyle.borderRadius) {
    dataZoom.handleStyle.borderRadius = 4
  }

  // 移动手柄样式
  if (!dataZoom.moveHandleStyle) {
    dataZoom.moveHandleStyle = {}
  }
  if (!dataZoom.moveHandleStyle.color) {
    dataZoom.moveHandleStyle.color = config.color.primaryColors[0]
  }
  if (!dataZoom.moveHandleStyle.borderColor) {
    dataZoom.moveHandleStyle.borderColor = config.color.primaryColors[0]
  }
  if (!dataZoom.moveHandleStyle.borderWidth) {
    dataZoom.moveHandleStyle.borderWidth = 2
  }
  if (!dataZoom.moveHandleStyle.borderRadius) {
    dataZoom.moveHandleStyle.borderRadius = 4
  }

  // 数据背景样式
  if (!dataZoom.dataBackground) {
    dataZoom.dataBackground = {}
  }
  if (!dataZoom.dataBackground.areaStyle) {
    dataZoom.dataBackground.areaStyle = {}
  }
  if (!dataZoom.dataBackground.areaStyle.color) {
    dataZoom.dataBackground.areaStyle.color = 'rgba(0, 0, 0, 0.08)'
  }
  if (!dataZoom.dataBackground.areaStyle.opacity) {
    dataZoom.dataBackground.areaStyle.opacity = 0.4
  }

  // 选中数据背景样式
  if (!dataZoom.selectedDataBackground) {
    dataZoom.selectedDataBackground = {}
  }
  if (!dataZoom.selectedDataBackground.areaStyle) {
    dataZoom.selectedDataBackground.areaStyle = {}
  }
  if (!dataZoom.selectedDataBackground.areaStyle.color) {
    dataZoom.selectedDataBackground.areaStyle.color = config.color.primaryColors[0]
  }
  if (!dataZoom.selectedDataBackground.areaStyle.opacity) {
    dataZoom.selectedDataBackground.areaStyle.opacity = 0.15
  }

  // 扩展配置：缩放锁定
  if (dataZoom.zoomLock === undefined) {
    dataZoom.zoomLock = false
  }

  // 扩展配置：显示数据阴影
  if (dataZoom.showDataShadow === undefined) {
    dataZoom.showDataShadow = true
  }

  // 扩展配置：显示详情
  if (dataZoom.showDetail === undefined) {
    dataZoom.showDetail = true
  }

  // 扩展配置：实时更新
  if (dataZoom.realtime === undefined) {
    dataZoom.realtime = true
  }

  // 扩展配置：过滤模式
  if (!dataZoom.filterMode) {
    dataZoom.filterMode = 'filter'
  }
}

export const useChartTheme = (option: any, opacityConfig?: ChartOpacityConfig) => {
  if (!option || typeof option !== 'object') {
    return option
  }

  // 在函数内部获取 store 实例
  const colorStore = useColorStore()
  const sizeStore = useSizeStore()

  // 获取主题颜色
  const textColor100 = computed(() => colorStore.getText100)
  const textColor200 = computed(() => colorStore.getText200)
  const bgColor200 = computed(() => colorStore.getBg200)
  const bgColor300 = computed(() => colorStore.getBg300)
  const accent100 = computed(() => colorStore.getAccent100)

  // 获取主题尺寸
  const paddings = computed(() => sizeStore.getPaddingsValue)
  const gap = computed(() => sizeStore.getGap)
  const gapl = computed(() => sizeStore.getGapl)
  const fontSize = computed(() => sizeStore.getFontSizeValue)
  const fontSizeSmall = computed(() => sizeStore.getFontSizesValue)

  // 获取颜色数组
  const primaryColors = computed(() => [
    colorStore.getPrimaryColor,
    colorStore.getPrimaryColorHover,
    colorStore.getPrimaryColorActive,
    colorStore.getPrimaryColorBorder,
  ])
  const successColors = computed(() => [
    colorStore.getSuccessColor,
    colorStore.getSuccessColorHover,
    colorStore.getSuccessColorActive,
    colorStore.getSuccessColorBorder,
  ])
  const infoColors = computed(() => [
    colorStore.getInfoColor,
    colorStore.getInfoColorHover,
    colorStore.getInfoColorActive,
    colorStore.getInfoColorBorder,
  ])
  const warnColors = computed(() => [
    colorStore.getWarnColor,
    colorStore.getWarnColorHover,
    colorStore.getWarnColorActive,
    colorStore.getWarnColorBorder,
  ])
  const dangerColors = computed(() => [
    colorStore.getDangerColor,
    colorStore.getDangerColorHover,
    colorStore.getDangerColorActive,
    colorStore.getDangerColorBorder,
  ])
  const helpColors = computed(() => [
    colorStore.getHelpColor,
    colorStore.getHelpColorHover,
    colorStore.getHelpColorActive,
    colorStore.getHelpColorBorder,
  ])
  const contrastColors = computed(() => [
    colorStore.getContrastColor,
    colorStore.getContrastColorHover,
    colorStore.getContrastColorActive,
    colorStore.getContrastColorBorder,
  ])
  const secondaryColors = computed(() => [
    colorStore.getSecondaryColor,
    colorStore.getSecondaryColorHover,
    colorStore.getSecondaryColorActive,
    colorStore.getSecondaryColorBorder,
  ])

  const colors = [
    primaryColors.value[0],
    successColors.value[0],
    infoColors.value[0],
    warnColors.value[0],
    dangerColors.value[0],
    helpColors.value[0],
    contrastColors.value[0],
    secondaryColors.value[0],
    primaryColors.value[1],
    secondaryColors.value[1],
    successColors.value[1],
    infoColors.value[1],
    warnColors.value[1],
    dangerColors.value[1],
    helpColors.value[1],
    contrastColors.value[1],
    primaryColors.value[2],
    successColors.value[2],
    infoColors.value[2],
    warnColors.value[2],
    dangerColors.value[2],
    helpColors.value[2],
    contrastColors.value[2],
    secondaryColors.value[2],
    primaryColors.value[3],
    successColors.value[3],
    infoColors.value[3],
    warnColors.value[3],
    dangerColors.value[3],
    helpColors.value[3],
    contrastColors.value[3],
    secondaryColors.value[3],
  ]

  // 深拷贝原始配置，避免修改原始对象，但保留函数引用
  const mergedOption = deepCloneWithFunctions(option)

  // 合并透明度配置
  const finalOpacityConfig = { ...DEFAULT_OPACITY_VALUES, ...opacityConfig }

  // 构建主题配置对象
  const themeConfig: ThemeConfig = {
    font: {
      textColor: textColor100.value,
      textColorSecondary: textColor200.value,
      fontSize: fontSize.value,
      fontSizeSmall: fontSizeSmall.value,
    },
    color: {
      colors,
      primaryColors: primaryColors.value,
      successColors: successColors.value,
      infoColors: infoColors.value,
      warnColors: warnColors.value,
      dangerColors: dangerColors.value,
      helpColors: helpColors.value,
      contrastColors: contrastColors.value,
      secondaryColors: secondaryColors.value,
    },
    opacity: finalOpacityConfig,
    paddings: paddings.value,
    gap: gap.value,
    gapl: gapl.value,
    textColor100: textColor100.value,
    textColor200: textColor200.value,
    bgColor200: bgColor200.value,
    bgColor300: bgColor300.value,
    accent100: accent100.value,
  }

  // 设置全局调色盘（用于饼图等自动着色）
  // 注意：不要覆盖已经设置的颜色配置
  // 兼容用户使用非标准键名 `colors` 的场景
  if (Array.isArray((mergedOption as any).colors) && !(mergedOption as any).color) {
    ;(mergedOption as any).color = (mergedOption as any).colors
  }
  if (!mergedOption.color) {
    mergedOption.color = themeConfig.color.colors
  }
  // 若用户提供了自定义 color，则将后续主题内部使用的调色盘切换为该自定义颜色
  if (Array.isArray(mergedOption.color) && mergedOption.color.length > 0) {
    themeConfig.color.colors = mergedOption.color as string[]
  }

  // 全局颜色分配优化：确保所有图表类型都能正确使用系统配色
  const ensureSystemColorIntegration = (option: any) => {
    // 为没有设置颜色的系列强制应用系统配色
    if (option.series && Array.isArray(option.series)) {
      option.series.forEach((series: any, _index: number) => {
        // 对于需要全局颜色的图表类型，确保使用系统配色
        const globalColorTypes = [
          'pie',
          'funnel',
          'sunburst',
          'treemap',
          'graph',
          'sankey',
          'heatmap',
        ]

        if (globalColorTypes.includes(series.type)) {
          // 确保系列级别的颜色配置
          if (!series.color) {
            series.color = themeConfig.color.colors
          }

          // 对于特定图表类型，确保数据项颜色正确分配
          if (series.type === 'pie' && Array.isArray(series.data)) {
            series.data.forEach((item: any, dataIndex: number) => {
              if (!item.itemStyle) {
                item.itemStyle = {}
              }
              if (!item.itemStyle.color) {
                item.itemStyle.color =
                  themeConfig.color.colors[dataIndex % themeConfig.color.colors.length]
              }
            })
          }

          if (series.type === 'funnel' && Array.isArray(series.data)) {
            series.data.forEach((item: any, dataIndex: number) => {
              if (!item.itemStyle) {
                item.itemStyle = {}
              }
              if (!item.itemStyle.color) {
                item.itemStyle.color =
                  themeConfig.color.colors[dataIndex % themeConfig.color.colors.length]
              }
            })
          }
        }
      })
    }
  }

  // 应用全局颜色集成优化
  ensureSystemColorIntegration(mergedOption)

  // 应用字体样式到标题和图例
  applyFontStylesToTargets([mergedOption.title, mergedOption.legend], themeConfig.font)

  // 标题特殊配置
  if (mergedOption.title) {
    if (!mergedOption.title.textStyle.fontSize) {
      mergedOption.title.textStyle.fontSize = themeConfig.font.fontSize * 1.3
    }
    if (!mergedOption.title.left) {
      mergedOption.title.left = 0
    }
    if (!mergedOption.title.top) {
      mergedOption.title.top = 0
    }
  }

  // 图例特殊配置
  if (mergedOption.legend) {
    if (!mergedOption.legend.left) {
      mergedOption.legend.right = `${themeConfig.paddings}%`
    }
    if (!mergedOption.legend.top) {
      mergedOption.legend.top = themeConfig.gapl
    }
  }

  // 合并网格样式
  if (!mergedOption.grid) {
    mergedOption.grid = {
      left: `${themeConfig.paddings}%`,
      right: `${themeConfig.paddings}%`,
      top: '30%',
      bottom: `2%`,
      backgroundColor: 'transparent',
      containLabel: true,
    }
  }

  // 合并坐标轴样式
  const applyAxisStyles = (axis: any) => {
    applyFontStyles(axis, themeConfig.font)
    if (!axis.axisLine) {
      axis.axisLine = {}
    }
    if (!axis.axisLine.lineStyle) {
      axis.axisLine.lineStyle = {}
    }
    if (!axis.axisLine.lineStyle.color) {
      axis.axisLine.lineStyle.color = themeConfig.bgColor300
    }
    if (!axis.splitLine) {
      axis.splitLine = {}
    }
    if (!axis.splitLine.lineStyle) {
      axis.splitLine.lineStyle = {}
    }
    if (!axis.splitLine.lineStyle.color) {
      axis.splitLine.lineStyle.color = themeConfig.bgColor300
    }
    // 轴名称样式（nameTextStyle）
    if (!axis.nameTextStyle) {
      axis.nameTextStyle = {}
    }
    if (!axis.nameTextStyle.color) {
      axis.nameTextStyle.color = themeConfig.textColor100
    }
    if (!axis.nameTextStyle.fontSize) {
      axis.nameTextStyle.fontSize = themeConfig.font.fontSizeSmall
    }
  }

  if (mergedOption.xAxis) {
    const xAxisArray = Array.isArray(mergedOption.xAxis) ? mergedOption.xAxis : [mergedOption.xAxis]
    applyStylesToArray(xAxisArray, applyAxisStyles)
  }

  if (mergedOption.yAxis) {
    const yAxisArray = Array.isArray(mergedOption.yAxis) ? mergedOption.yAxis : [mergedOption.yAxis]
    applyStylesToArray(yAxisArray, applyAxisStyles)
  }

  // 合并雷达坐标系样式
  if (mergedOption.radar) {
    const radarArray = Array.isArray(mergedOption.radar) ? mergedOption.radar : [mergedOption.radar]
    const applyRadarStyles = (radar: any) => {
      // 设置雷达图的轴线颜色
      if (!radar.axisLine) {
        radar.axisLine = {}
      }
      if (!radar.axisLine.lineStyle) {
        radar.axisLine.lineStyle = {}
      }
      if (!radar.axisLine.lineStyle.color) {
        radar.axisLine.lineStyle.color = themeConfig.bgColor300
      }

      // 设置雷达图的分隔线颜色
      if (!radar.splitLine) {
        radar.splitLine = {}
      }
      if (!radar.splitLine.lineStyle) {
        radar.splitLine.lineStyle = {}
      }
      if (!radar.splitLine.lineStyle.color) {
        radar.splitLine.lineStyle.color = themeConfig.bgColor300
      }

      // 设置雷达图的分隔区域颜色
      if (!radar.splitArea) {
        radar.splitArea = { show: false }
      }

      // 设置雷达图的指示器文本颜色（ECharts 6 使用 axisName）
      if (!radar.axisName) {
        radar.axisName = {}
      }
      if (!radar.axisName.color) {
        radar.axisName.color = themeConfig.textColor200
      }
    }
    applyStylesToArray(radarArray, applyRadarStyles)
  }

  // 合并单轴样式（主题河流图使用）
  if (mergedOption.singleAxis) {
    const singleAxisArray = Array.isArray(mergedOption.singleAxis)
      ? mergedOption.singleAxis
      : [mergedOption.singleAxis]
    const applySingleAxisStyles = (axis: any) => {
      applyFontStyles(axis, themeConfig.font)
      // 设置轴线颜色
      if (!axis.axisLine) {
        axis.axisLine = {}
      }
      if (!axis.axisLine.lineStyle) {
        axis.axisLine.lineStyle = {}
      }
      if (!axis.axisLine.lineStyle.color) {
        axis.axisLine.lineStyle.color = themeConfig.bgColor300
      }

      // 设置分隔线颜色
      if (!axis.splitLine) {
        axis.splitLine = {}
      }
      if (!axis.splitLine.lineStyle) {
        axis.splitLine.lineStyle = {}
      }
      if (!axis.splitLine.lineStyle.color) {
        axis.splitLine.lineStyle.color = themeConfig.bgColor300
      }

      // 设置刻度线颜色
      if (!axis.axisTick) {
        axis.axisTick = {}
      }
      if (!axis.axisTick.lineStyle) {
        axis.axisTick.lineStyle = {}
      }
      if (!axis.axisTick.lineStyle.color) {
        axis.axisTick.lineStyle.color = themeConfig.bgColor300
      }

      // 轴名称样式（nameTextStyle）
      if (!axis.nameTextStyle) {
        axis.nameTextStyle = {}
      }
      if (!axis.nameTextStyle.color) {
        axis.nameTextStyle.color = themeConfig.textColor100
      }
      if (!axis.nameTextStyle.fontSize) {
        axis.nameTextStyle.fontSize = themeConfig.font.fontSizeSmall
      }
    }
    applyStylesToArray(singleAxisArray, applySingleAxisStyles)
  }

  // 合并平行坐标轴样式（parallelAxis & parallel.axisDefault）
  if (mergedOption.parallelAxis) {
    const axes = Array.isArray(mergedOption.parallelAxis)
      ? mergedOption.parallelAxis
      : [mergedOption.parallelAxis]
    axes.forEach((axis: any) => {
      // 轴线
      if (!axis.axisLine) {
        axis.axisLine = {}
      }
      if (!axis.axisLine.lineStyle) {
        axis.axisLine.lineStyle = {}
      }
      if (!axis.axisLine.lineStyle.color) {
        axis.axisLine.lineStyle.color = themeConfig.bgColor300
      }

      // 分隔线
      if (!axis.splitLine) {
        axis.splitLine = {}
      }
      if (!axis.splitLine.lineStyle) {
        axis.splitLine.lineStyle = {}
      }
      if (!axis.splitLine.lineStyle.color) {
        axis.splitLine.lineStyle.color = themeConfig.bgColor300
      }

      // 标签
      if (!axis.axisLabel) {
        axis.axisLabel = {}
      }
      if (!axis.axisLabel.color) {
        axis.axisLabel.color = themeConfig.textColor100
      }
      if (!axis.axisLabel.fontSize) {
        axis.axisLabel.fontSize = themeConfig.font.fontSizeSmall
      }

      // 轴名称（如 “价格(万元)”）
      if (!axis.nameTextStyle) {
        axis.nameTextStyle = {}
      }
      if (!axis.nameTextStyle.color) {
        axis.nameTextStyle.color = themeConfig.textColor100
      }
      if (!axis.nameTextStyle.fontSize) {
        axis.nameTextStyle.fontSize = themeConfig.font.fontSizeSmall
      }
    })
  }

  if (mergedOption.parallel) {
    if (!mergedOption.parallel.axisDefault) {
      mergedOption.parallel.axisDefault = {}
    }
    const d = mergedOption.parallel.axisDefault
    if (!d.axisLine) {
      d.axisLine = {}
    }
    if (!d.axisLine.lineStyle) {
      d.axisLine.lineStyle = {}
    }
    if (!d.axisLine.lineStyle.color) {
      d.axisLine.lineStyle.color = themeConfig.bgColor300
    }
    if (!d.splitLine) {
      d.splitLine = {}
    }
    if (!d.splitLine.lineStyle) {
      d.splitLine.lineStyle = {}
    }
    if (!d.splitLine.lineStyle.color) {
      d.splitLine.lineStyle.color = themeConfig.bgColor300
    }
    if (!d.axisLabel) {
      d.axisLabel = {}
    }
    if (!d.axisLabel.color) {
      d.axisLabel.color = themeConfig.textColor100
    }
    if (!d.axisLabel.fontSize) {
      d.axisLabel.fontSize = themeConfig.font.fontSizeSmall
    }

    // 默认轴名称样式
    if (!d.nameTextStyle) {
      d.nameTextStyle = {}
    }
    if (!d.nameTextStyle.color) {
      d.nameTextStyle.color = themeConfig.textColor100
    }
    if (!d.nameTextStyle.fontSize) {
      d.nameTextStyle.fontSize = themeConfig.font.fontSizeSmall
    }
  }

  // 合并系列样式
  if (mergedOption.series) {
    const seriesArray = Array.isArray(mergedOption.series)
      ? mergedOption.series
      : [mergedOption.series]

    // 定义使用全局颜色的图表类型
    const useGlobalColor = ['pie', 'funnel', 'sunburst', 'treemap', 'graph', 'sankey', 'heatmap']

    seriesArray.forEach((series: any, index: number) => {
      // 系列级 tooltip 样式融合（若存在 series.tooltip）
      if (series.tooltip) {
        applyTooltipStyles(series.tooltip, themeConfig)
      }
      // 应用基础系列样式
      applySeriesStyles(series, index, themeConfig)

      // 根据图表类型应用特殊样式
      switch (series.type) {
        case 'pie':
          applyPieStyles(series, themeConfig)
          break
        case 'effectScatter':
          applyEffectScatterStyles(series, themeConfig, index)
          break
        case 'boxplot':
          applyBoxplotStyles(series, themeConfig)
          break
        case 'gauge':
          applyGaugeStyles(series, index, themeConfig)
          break
        case 'radar':
          applyRadarStyles(series, themeConfig)
          break
        case 'themeRiver':
          applyThemeRiverStyles(series, themeConfig)
          break
        case 'funnel':
          applyFunnelStyles(series, themeConfig)
          break
        case 'heatmap':
          applyHeatmapStyles(series, themeConfig)
          break
        case 'pictorialBar':
          applyPictorialBarStyles(series, themeConfig, index)
          break
        case 'treemap':
          applyTreemapStyles(series, themeConfig)
          break
        case 'sankey':
          applySankeyStyles(series, themeConfig)
          break
        case 'sunburst':
          applySunburstStyles(series, themeConfig)
          break
        case 'graph':
          applyGraphStyles(series, themeConfig)
          break
        case 'tree':
          applyTreeStyles(series, themeConfig)
          break
        case 'parallel':
          applyParallelStyles(series, themeConfig)
          break
        case 'lines':
          applyLinesStyles(series, themeConfig, index)
          break
        default:
          // 对于其他类型，如果不是使用全局颜色，则设置系列颜色
          if (!useGlobalColor.includes(series.type) && !series.itemStyle?.color && !series.color) {
            series.color = themeConfig.color.colors[index % themeConfig.color.colors.length]
          }
          break
      }
    })
  }

  // 合并提示框样式：若未声明 tooltip，则创建空对象以融合主题色
  if (!mergedOption.tooltip) {
    mergedOption.tooltip = {}
  }
  applyTooltipStyles(mergedOption.tooltip, themeConfig)

  // 合并 dataZoom 样式
  if (mergedOption.dataZoom) {
    const dataZoomArray = Array.isArray(mergedOption.dataZoom)
      ? mergedOption.dataZoom
      : [mergedOption.dataZoom]
    applyStylesToArray(dataZoomArray, (dataZoom: any) => {
      applyDataZoomStyles(dataZoom, themeConfig)
    })
  }

  return mergedOption
}
