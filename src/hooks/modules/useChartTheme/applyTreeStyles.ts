import type { ThemeConfig } from './types'

/**
 * 递归应用颜色到树节点
 */
function colorizeNode(
  node: any,
  indexInSiblings: number,
  level: number,
  themeConfig: ThemeConfig
): any {
  if (!node) {
    return node
  }

  const palette = themeConfig.color.colors
  const newNode = { ...node }

  if (!newNode.itemStyle) {
    newNode.itemStyle = {}
  }
  if (!newNode.itemStyle.color) {
    // 使用层级和兄弟索引的组合来确保颜色分布更均匀
    const colorIndex = (level * 2 + indexInSiblings) % palette.length
    newNode.itemStyle = {
      ...newNode.itemStyle,
      color: palette[colorIndex],
    }
  }

  // 设置节点符号样式
  if (!newNode.symbol) {
    newNode.symbol = 'circle'
  }
  if (!newNode.symbolSize) {
    newNode.symbolSize = 8
  }

  // 设置连线样式
  if (!newNode.lineStyle) {
    newNode.lineStyle = {}
  }
  if (!newNode.lineStyle.color) {
    newNode.lineStyle = {
      ...newNode.lineStyle,
      color: themeConfig.bgColor300,
    }
  }
  if (!newNode.lineStyle.width) {
    newNode.lineStyle = {
      ...newNode.lineStyle,
      width: 1,
    }
  }

  // 递归处理子节点
  if (Array.isArray(newNode.children)) {
    newNode.children = newNode.children.map((child: any, i: number) =>
      colorizeNode(child, i, level + 1, themeConfig)
    )
  }

  return newNode
}

/**
 * 应用树图样式
 * 采用函数式编程，返回新的 series 对象
 */
export const applyTreeStyles = (series: any, themeConfig: ThemeConfig): any => {
  if (!series || series.type !== 'tree') {
    return series
  }

  const newSeries = { ...series }

  // 处理数据节点
  if (Array.isArray(newSeries.data)) {
    newSeries.data = newSeries.data.map((root: any) => colorizeNode(root, 0, 0, themeConfig))
  }

  // 统一标签样式
  if (!newSeries.label) {
    newSeries.label = {}
  }
  if (!newSeries.label.color || !newSeries.label.fontSize) {
    newSeries.label = {
      ...newSeries.label,
      color: newSeries.label.color || themeConfig.textColor100,
      fontSize: newSeries.label.fontSize || themeConfig.font.fontSizeSmall,
    }
  }

  // 设置布局配置
  if (!newSeries.layout) {
    newSeries.layout = 'orthogonal'
  }
  if (!newSeries.orient) {
    newSeries.orient = 'LR'
  }

  return newSeries
}
