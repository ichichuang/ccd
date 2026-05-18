// ECharts 系列样式边界：参数与 ECharts graph 系列一致，内部使用 any 避免强依赖 echarts 内部类型。
import type { ThemeConfig } from './types'

/**
 * 应用关系图样式
 * 采用函数式编程，返回新的 series 对象
 */
export const applyGraphStyles = (series: any, themeConfig: ThemeConfig): any => {
  if (!series || series.type !== 'graph') {
    return series
  }

  const palette = themeConfig.color.colors
  const newSeries = { ...series }

  // 给 categories 分配颜色，优先保证同类同色
  if (Array.isArray(newSeries.categories)) {
    newSeries.categories = newSeries.categories.map((cat: any, idx: number) => {
      const newCat = { ...cat }
      if (!newCat.itemStyle) {
        newCat.itemStyle = {}
      }
      if (!newCat.itemStyle.color) {
        newCat.itemStyle = {
          ...newCat.itemStyle,
          color: palette[idx % palette.length],
        }
      }
      return newCat
    })
  }

  // 为每个节点着色：有 category 用 category 颜色；否则按节点索引
  if (Array.isArray(newSeries.data)) {
    newSeries.data = newSeries.data.map((node: any, idx: number) => {
      const newNode = { ...node }
      if (!newNode.itemStyle) {
        newNode.itemStyle = {}
      }
      if (!newNode.itemStyle.color) {
        if (
          typeof newNode.category === 'number' &&
          Array.isArray(newSeries.categories) &&
          newSeries.categories[newNode.category]?.itemStyle?.color
        ) {
          newNode.itemStyle.color = newSeries.categories[newNode.category].itemStyle.color
        } else {
          newNode.itemStyle.color = palette[idx % palette.length]
        }
      }
      // 节点尺寸：仅在用户未显式配置时注入默认值（与 SizeMode 对齐）
      if (newNode.symbolSize === undefined) {
        newNode.symbolSize = themeConfig.size.symbolMd
      }
      return newNode
    })
  }

  // 为连线着色：根据连接的节点类别或使用渐变色
  if (Array.isArray(newSeries.links)) {
    newSeries.links = newSeries.links.map((link: any, idx: number) => {
      const newLink = { ...link }
      if (!newLink.lineStyle) {
        newLink.lineStyle = {}
      }
      if (!newLink.lineStyle.color) {
        // 如果连线有源节点和目标节点，尝试使用它们的颜色
        const sourceNode = newSeries.data?.find(
          (n: any) => n.id === link.source || n.name === link.source
        )
        const targetNode = newSeries.data?.find(
          (n: any) => n.id === link.target || n.name === link.target
        )

        if (sourceNode?.itemStyle?.color && targetNode?.itemStyle?.color) {
          // 使用渐变色连接两个节点
          newLink.lineStyle.color = {
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
          newLink.lineStyle.color = palette[idx % palette.length]
        }
      }
      // 连线线宽：仅在用户未显式配置时注入默认值（与 SizeMode 对齐）
      if (newLink.lineStyle.width === undefined) {
        newLink.lineStyle.width = themeConfig.size.strokeSeries
      }
      return newLink
    })
  }

  // 标签样式
  if (!newSeries.label) {
    newSeries.label = {}
  }
  if (!newSeries.label.color || !newSeries.label.fontSize || !newSeries.label.lineHeight) {
    newSeries.label = {
      ...newSeries.label,
      color: newSeries.label.color || themeConfig.foreground,
      fontSize: newSeries.label.fontSize || themeConfig.size.fontSm,
      lineHeight: newSeries.label.lineHeight || themeConfig.size.lineHeightSm,
    }
  }

  return newSeries
}
