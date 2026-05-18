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

  const visualMapType = visualMap.type ?? 'continuous'

  // 连续型：优先写入 inRange/outOfRange，顶层 color 仅作为兼容（尽量不作为主语义）
  const continuousInRangeColor =
    visualMap.inRange?.color ??
    (visualMap.color && Array.isArray(visualMap.color) && visualMap.color.length > 0
      ? visualMap.color
      : [
          config.color.primaryColors[0],
          config.color.successColors[0],
          config.color.warnColors[0],
          config.color.dangerColors[0],
        ])

  const continuousOutOfRangeColor = visualMap.outOfRange?.color
    ? Array.isArray(visualMap.outOfRange.color)
      ? visualMap.outOfRange.color
      : [visualMap.outOfRange.color]
    : [config.mutedForeground]

  // 分段型：pieces/categories 使用调色盘自动补色
  let piecewiseColorArray = visualMap.color
  if (
    !piecewiseColorArray ||
    (Array.isArray(piecewiseColorArray) && piecewiseColorArray.length === 0)
  ) {
    piecewiseColorArray = config.color.colors.slice(0, 8)
  }

  const result: any = {
    ...visualMap,
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
    ...(visualMapType !== 'continuous' ? { color: piecewiseColorArray } : {}),
    ...(visualMapType === 'continuous'
      ? {
          inRange: {
            ...(visualMap.inRange ?? {}),
            color: continuousInRangeColor,
          },
          outOfRange: {
            ...(visualMap.outOfRange ?? {}),
            color: continuousOutOfRangeColor,
          },
        }
      : {}),
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
