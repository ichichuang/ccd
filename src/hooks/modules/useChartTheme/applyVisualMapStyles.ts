// ECharts VisualMap 样式边界：参数与 ECharts visualMap 组件一致，内部使用 any 避免强依赖 echarts 内部类型。
import type { ThemeConfig } from './types'

/**
 * 应用主题样式到 ECharts visualMap
 * 仅负责融合颜色和尺寸，不改动其他逻辑（函数式版本）
 */
export function applyVisualMapStyles(visualMap: any, config: ThemeConfig): any {
  if (!visualMap) {
    return visualMap
  }

  // 如果用户未提供 color，使用架构配色生成连续/分段颜色数组
  let colorArray = visualMap.color
  if (!colorArray || (Array.isArray(colorArray) && colorArray.length === 0)) {
    if (visualMap.type === 'continuous') {
      // 连续型：使用 primary -> success -> warn -> danger 渐变
      colorArray = [
        config.color.primaryColors[0],
        config.color.successColors[0],
        config.color.warnColors[0],
        config.color.dangerColors[0],
      ]
    } else {
      // 分段型：使用调色盘前 N 个颜色
      colorArray = config.color.colors.slice(0, 8)
    }
  }

  const result: any = {
    ...visualMap,
    color: colorArray,
    backgroundColor: visualMap.backgroundColor ?? config.card,
    borderColor: visualMap.borderColor ?? config.border,
    borderWidth: visualMap.borderWidth ?? config.size.visualMapBorderWidth,
    padding: visualMap.padding ?? config.size.visualMapPadding,
    itemWidth: visualMap.itemWidth ?? config.size.visualMapItemWidth,
    itemHeight: visualMap.itemHeight ?? config.size.visualMapItemHeight,
    itemGap: visualMap.itemGap ?? config.size.visualMapItemGap,
    textStyle: {
      ...visualMap.textStyle,
      color: visualMap.textStyle?.color ?? config.foreground,
      fontSize: visualMap.textStyle?.fontSize ?? config.size.fontSm,
    },
  }

  // pieces 和 categories 中的 color 如果用户已指定则保留，否则从调色盘按 index 分配
  if (visualMap.pieces) {
    result.pieces = visualMap.pieces.map((piece: any, index: number) => ({
      ...piece,
      color: piece.color ?? config.color.colors[index % config.color.colors.length],
    }))
  }

  if (visualMap.categories) {
    result.categories = visualMap.categories.map((cat: any, index: number) => ({
      ...cat,
      color: cat.color ?? config.color.colors[index % config.color.colors.length],
    }))
  }

  return result
}
