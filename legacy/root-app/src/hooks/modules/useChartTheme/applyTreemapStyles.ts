// ECharts 系列/节点样式边界：参数与 ECharts treemap 系列一致，内部使用 any 避免强依赖 echarts 内部类型。
import type { ThemeConfig } from './types'

/**
 * 递归收集节点值
 */
function collectValues(node: any, values: number[]): void {
  if (!node) {
    return
  }
  const val = Array.isArray(node.value) ? node.value[0] : node.value
  if (typeof val === 'number') {
    values.push(val)
  }
  if (Array.isArray(node.children)) {
    node.children.forEach((child: any) => collectValues(child, values))
  }
}

/**
 * 递归分配颜色到节点
 */
function assignColorsToNodes(
  nodes: any[],
  colorIndex: number,
  level: number,
  themeConfig: ThemeConfig
): any[] {
  if (!Array.isArray(nodes)) {
    return nodes
  }

  return nodes.map((node: any, index: number) => {
    const newNode = { ...node }

    if (!newNode.itemStyle) {
      newNode.itemStyle = {}
    }

    // 为每个节点分配颜色，确保兄弟节点有不同的颜色
    if (!newNode.itemStyle.color) {
      // 使用层级和索引的组合来确保颜色分布均匀
      const nodeColorIndex = (level * 3 + index) % themeConfig.color.colors.length
      newNode.itemStyle = {
        ...newNode.itemStyle,
        color: themeConfig.color.colors[nodeColorIndex],
      }
    }

    // 递归处理子节点
    if (Array.isArray(newNode.children)) {
      newNode.children = assignColorsToNodes(
        newNode.children,
        colorIndex + index + 1,
        level + 1,
        themeConfig
      )
    }

    return newNode
  })
}

/**
 * 应用矩形树图样式
 * 采用函数式编程，返回新的 series 对象
 */
export const applyTreemapStyles = (series: any, themeConfig: ThemeConfig): any => {
  if (!series || series.type !== 'treemap') {
    return series
  }

  const newSeries = { ...series }

  // 基础调色与映射策略
  if (!newSeries.color) {
    newSeries.color = themeConfig.color.colors
  }
  if (!newSeries.colorMappingBy) {
    // 兄弟节点按索引取色，满足"按 length 区分颜色"
    newSeries.colorMappingBy = 'index'
  }
  if (!newSeries.colorSaturation) {
    newSeries.colorSaturation = [0.45, 0.95]
  }
  if (newSeries.visibleMin === undefined) {
    newSeries.visibleMin = 0
  }
  if (newSeries.childrenVisibleMin === undefined) {
    newSeries.childrenVisibleMin = 0
  }

  // 视觉维度与可视范围（根据 value 动态计算）
  if (newSeries.visualDimension === undefined) {
    newSeries.visualDimension = 0
  }
  const values: number[] = []
  if (Array.isArray(newSeries.data)) {
    newSeries.data.forEach((node: any) => collectValues(node, values))
  }
  if (values.length > 0) {
    const vMin = Math.min(...values)
    const vMax = Math.max(...values)
    if (isFinite(vMin) && isFinite(vMax)) {
      if (newSeries.visualMin === undefined) {
        newSeries.visualMin = vMin
      }
      if (newSeries.visualMax === undefined) {
        newSeries.visualMax = vMax
      }
    }
  }

  // 设置树图的视觉映射
  if (!newSeries.visualMap) {
    newSeries.visualMap = {
      type: 'continuous',
      min: 0,
      max: 100,
      inRange: {
        color: themeConfig.color.colors.slice(0, 6), // 使用前6个颜色
      },
    }
  }

  // 设置树图的标签样式
  if (!newSeries.label) {
    newSeries.label = {}
  }
  const labelUpdates: any = {}
  if (!newSeries.label.formatter) {
    labelUpdates.formatter = '{b}'
  }
  if (!newSeries.label.color) {
    labelUpdates.color = themeConfig.foreground
  }
  if (!newSeries.label.fontSize) {
    labelUpdates.fontSize = themeConfig.size.fontSm
  }
  if (!newSeries.label.lineHeight) {
    labelUpdates.lineHeight = themeConfig.size.lineHeightSm
  }
  if (newSeries.label.show === undefined) {
    labelUpdates.show = true
  }
  if (Object.keys(labelUpdates).length > 0) {
    newSeries.label = {
      ...newSeries.label,
      ...labelUpdates,
    }
  }

  // 统一消除文字描边/阴影并合并系统配色（label）
  if (!newSeries.label.rich) {
    newSeries.label.rich = {}
  }
  const labelStyleUpdates: any = {}
  if (!newSeries.label.textBorderColor) {
    labelStyleUpdates.textBorderColor = 'transparent'
  }
  if (newSeries.label.textBorderWidth === undefined) {
    labelStyleUpdates.textBorderWidth = 0
  }
  if (newSeries.label.textShadowBlur === undefined) {
    labelStyleUpdates.textShadowBlur = 0
  }
  if (!newSeries.label.textShadowColor) {
    labelStyleUpdates.textShadowColor = 'transparent'
  }
  if (Object.keys(labelStyleUpdates).length > 0) {
    newSeries.label = {
      ...newSeries.label,
      ...labelStyleUpdates,
    }
  }

  // 顶层小标题 upperLabel 的颜色与描边
  if (!newSeries.upperLabel) {
    newSeries.upperLabel = {}
  }
  const upperLabelUpdates: any = {}
  if (newSeries.upperLabel.show === undefined) {
    upperLabelUpdates.show = true
  }
  if (!newSeries.upperLabel.color) {
    upperLabelUpdates.color = themeConfig.mutedForeground
  }
  if (!newSeries.upperLabel.textBorderColor) {
    upperLabelUpdates.textBorderColor = 'transparent'
  }
  if (newSeries.upperLabel.textBorderWidth === undefined) {
    upperLabelUpdates.textBorderWidth = 0
  }
  if (newSeries.upperLabel.textShadowBlur === undefined) {
    upperLabelUpdates.textShadowBlur = 0
  }
  if (!newSeries.upperLabel.textShadowColor) {
    upperLabelUpdates.textShadowColor = 'transparent'
  }
  if (Object.keys(upperLabelUpdates).length > 0) {
    newSeries.upperLabel = {
      ...newSeries.upperLabel,
      ...upperLabelUpdates,
    }
  }

  // 系列级 itemStyle 边框与间隔等默认样式
  if (!newSeries.itemStyle) {
    newSeries.itemStyle = {}
  }
  const itemStyleUpdates: any = {}
  if (!newSeries.itemStyle.borderColor) {
    itemStyleUpdates.borderColor = 'transparent'
  }
  if (newSeries.itemStyle.borderWidth === undefined) {
    itemStyleUpdates.borderWidth = 0
  }
  if (newSeries.itemStyle.gapWidth === undefined) {
    itemStyleUpdates.gapWidth = 0
  }
  if (newSeries.itemStyle.borderRadius === undefined) {
    itemStyleUpdates.borderRadius = themeConfig.size.radiusSm
  }
  if (Object.keys(itemStyleUpdates).length > 0) {
    newSeries.itemStyle = {
      ...newSeries.itemStyle,
      ...itemStyleUpdates,
    }
  }

  // 强调态边框（高亮时更明显）
  if (!newSeries.emphasis) {
    newSeries.emphasis = {}
  }
  if (!newSeries.emphasis.itemStyle) {
    newSeries.emphasis.itemStyle = {}
  }
  const emphasisUpdates: any = {}
  if (!newSeries.emphasis.itemStyle.borderColor) {
    emphasisUpdates.borderColor = 'transparent'
  }
  if (newSeries.emphasis.itemStyle.borderWidth === undefined) {
    emphasisUpdates.borderWidth = 0
  }
  if (Object.keys(emphasisUpdates).length > 0) {
    newSeries.emphasis = {
      ...newSeries.emphasis,
      itemStyle: {
        ...newSeries.emphasis.itemStyle,
        ...emphasisUpdates,
      },
    }
  }

  // 基础 levels（分层边框与间隔，未设置时提供合理默认）
  if (!newSeries.levels) {
    newSeries.levels = [
      { itemStyle: { borderColor: 'transparent', borderWidth: 0, gapWidth: 0 } },
      { itemStyle: { borderColor: 'transparent', borderWidth: 0, gapWidth: 0 } },
      { itemStyle: { borderColor: 'transparent', borderWidth: 0, gapWidth: 0 } },
    ]
  }

  // 改进的颜色分配逻辑：按层级和兄弟节点分配颜色
  if (Array.isArray(newSeries.data)) {
    newSeries.data = assignColorsToNodes(newSeries.data, 0, 0, themeConfig)
  }

  // 设置面包屑导航样式
  if (!newSeries.breadcrumb) {
    newSeries.breadcrumb = {}
  }
  if (newSeries.breadcrumb.show === undefined) {
    newSeries.breadcrumb.show = true
  }

  // 面包屑导航的样式配置
  if (!newSeries.breadcrumb.itemStyle) {
    newSeries.breadcrumb.itemStyle = {}
  }
  const breadcrumbItemStyleUpdates: any = {}
  if (!newSeries.breadcrumb.itemStyle.color) {
    breadcrumbItemStyleUpdates.color = themeConfig.background
  }
  if (newSeries.breadcrumb.itemStyle.opacity === undefined) {
    breadcrumbItemStyleUpdates.opacity = 0.95
  }
  if (!newSeries.breadcrumb.itemStyle.borderColor) {
    breadcrumbItemStyleUpdates.borderColor = themeConfig.card
  }
  if (!newSeries.breadcrumb.itemStyle.borderWidth) {
    breadcrumbItemStyleUpdates.borderWidth = themeConfig.size.strokeHairline
  }
  if (!newSeries.breadcrumb.itemStyle.borderRadius) {
    breadcrumbItemStyleUpdates.borderRadius = themeConfig.size.radiusSm
  }
  if (Object.keys(breadcrumbItemStyleUpdates).length > 0) {
    newSeries.breadcrumb.itemStyle = {
      ...newSeries.breadcrumb.itemStyle,
      ...breadcrumbItemStyleUpdates,
    }
  }

  // 确保普通态文字颜色在 itemStyle 下也强制设置
  if (!newSeries.breadcrumb.itemStyle.textStyle) {
    newSeries.breadcrumb.itemStyle.textStyle = {}
  }
  if (!newSeries.breadcrumb.itemStyle.textStyle.color) {
    newSeries.breadcrumb.itemStyle.textStyle = {
      ...newSeries.breadcrumb.itemStyle.textStyle,
      color: themeConfig.foreground,
    }
  }

  // 面包屑导航的文本样式
  if (!newSeries.breadcrumb.textStyle) {
    newSeries.breadcrumb.textStyle = {}
  }
  const breadcrumbTextStyleUpdates: any = {}
  if (!newSeries.breadcrumb.textStyle.color) {
    breadcrumbTextStyleUpdates.color = themeConfig.foreground
  }
  if (!newSeries.breadcrumb.textStyle.fontSize) {
    breadcrumbTextStyleUpdates.fontSize = themeConfig.size.fontSm
  }
  if (!newSeries.breadcrumb.textStyle.lineHeight) {
    breadcrumbTextStyleUpdates.lineHeight = themeConfig.size.lineHeightSm
  }
  if (Object.keys(breadcrumbTextStyleUpdates).length > 0) {
    newSeries.breadcrumb.textStyle = {
      ...newSeries.breadcrumb.textStyle,
      ...breadcrumbTextStyleUpdates,
    }
  }

  if (!newSeries.breadcrumb.separator) {
    newSeries.breadcrumb.separator = '>'
  }
  if (!newSeries.breadcrumb.separatorStyle) {
    newSeries.breadcrumb.separatorStyle = {}
  }
  if (!newSeries.breadcrumb.separatorStyle.color) {
    newSeries.breadcrumb.separatorStyle = {
      ...newSeries.breadcrumb.separatorStyle,
      color: themeConfig.card,
      opacity: 0.9,
    }
  }

  // 面包屑导航的强调样式
  if (!newSeries.breadcrumb.emphasis) {
    newSeries.breadcrumb.emphasis = {}
  }
  if (!newSeries.breadcrumb.emphasis.itemStyle) {
    newSeries.breadcrumb.emphasis.itemStyle = {}
  }
  const breadcrumbEmphasisUpdates: any = {}
  if (!newSeries.breadcrumb.emphasis.itemStyle.color) {
    breadcrumbEmphasisUpdates.color = themeConfig.card
  }
  if (!newSeries.breadcrumb.emphasis.itemStyle.borderColor) {
    breadcrumbEmphasisUpdates.borderColor = themeConfig.card
  }
  if (newSeries.breadcrumb.emphasis.itemStyle.opacity === undefined) {
    breadcrumbEmphasisUpdates.opacity = 1
  }
  if (Object.keys(breadcrumbEmphasisUpdates).length > 0) {
    newSeries.breadcrumb.emphasis.itemStyle = {
      ...newSeries.breadcrumb.emphasis.itemStyle,
      ...breadcrumbEmphasisUpdates,
    }
  }
  if (!newSeries.breadcrumb.emphasis.textStyle) {
    newSeries.breadcrumb.emphasis.textStyle = {}
  }
  if (!newSeries.breadcrumb.emphasis.textStyle.color) {
    newSeries.breadcrumb.emphasis.textStyle = {
      ...newSeries.breadcrumb.emphasis.textStyle,
      color: themeConfig.foreground,
    }
  }

  return newSeries
}
