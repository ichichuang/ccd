import type { ThemeConfig } from './types'

/**
 * 递归应用颜色到节点
 */
function applyColorToNode(node: any, colorIndex: number, themeConfig: ThemeConfig): any {
  if (!node) {
    return node
  }

  const newNode = { ...node }

  if (!newNode.itemStyle) {
    newNode.itemStyle = {}
  }

  const itemStyleUpdates: any = {}

  if (!newNode.itemStyle.color) {
    itemStyleUpdates.color = themeConfig.color.colors[colorIndex % themeConfig.color.colors.length]
  }
  if (!newNode.itemStyle.borderColor) {
    itemStyleUpdates.borderColor = 'transparent'
  }
  if (newNode.itemStyle.borderWidth === undefined) {
    itemStyleUpdates.borderWidth = 0
  }

  if (Object.keys(itemStyleUpdates).length > 0) {
    newNode.itemStyle = {
      ...newNode.itemStyle,
      ...itemStyleUpdates,
    }
  }

  // 递归处理子节点
  if (Array.isArray(newNode.children)) {
    newNode.children = newNode.children.map((child: any, childIndex: number) =>
      applyColorToNode(child, colorIndex + childIndex + 1, themeConfig)
    )
  }

  return newNode
}

/**
 * 应用旭日图样式
 * 采用函数式编程，返回新的 series 对象
 */
export const applySunburstStyles = (series: any, themeConfig: ThemeConfig): any => {
  if (!series || series.type !== 'sunburst') {
    return series
  }

  const newSeries = { ...series }

  // 设置旭日图的标签样式
  if (!newSeries.label) {
    newSeries.label = {}
  }
  if (!newSeries.label.color || !newSeries.label.fontSize) {
    newSeries.label = {
      ...newSeries.label,
      show: newSeries.label.show ?? true,
      color: newSeries.label.color || themeConfig.textColor100,
      fontSize: newSeries.label.fontSize || themeConfig.font.fontSizeSmall,
    }
  }

  // 系列级边框样式
  if (!newSeries.itemStyle) {
    newSeries.itemStyle = {}
  }
  if (!newSeries.itemStyle.borderColor) {
    newSeries.itemStyle = {
      ...newSeries.itemStyle,
      borderColor: 'transparent',
    }
  }
  if (newSeries.itemStyle.borderWidth === undefined) {
    newSeries.itemStyle = {
      ...newSeries.itemStyle,
      borderWidth: 0,
    }
  }

  // 强调样式
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
        borderColor: themeConfig.color.primaryColors[0],
        borderWidth: 2,
      },
    }
  }

  // 设置旭日图的数据项样式
  if (Array.isArray(newSeries.data)) {
    newSeries.data = newSeries.data.map((node: any, index: number) =>
      applyColorToNode(node, index, themeConfig)
    )
  }

  // 分层 levels，补齐边框样式
  if (!newSeries.levels) {
    newSeries.levels = [
      { itemStyle: { borderColor: 'transparent', borderWidth: 0 } },
      { itemStyle: { borderColor: 'transparent', borderWidth: 0 } },
      { itemStyle: { borderColor: 'transparent', borderWidth: 0 } },
    ]
  }

  return newSeries
}
