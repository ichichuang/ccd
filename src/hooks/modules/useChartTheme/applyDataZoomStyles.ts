// DataZoom 样式应用函数

import type { ThemeConfig } from './types'
import { withAlpha } from './utils'

/**
 * 数据缩放样式应用函数（函数式版本）
 */
export function applyDataZoomStyles(dataZoom: any, config: ThemeConfig): any {
  if (!dataZoom) {
    return dataZoom
  }

  return {
    ...dataZoom,
    textStyle: {
      ...dataZoom.textStyle,
      color: dataZoom.textStyle?.color ?? config.mutedForeground,
      fontSize: dataZoom.textStyle?.fontSize ?? config.size.fontSm,
    },
    backgroundColor: dataZoom.backgroundColor ?? withAlpha(config.card, 0.02),
    borderColor: dataZoom.borderColor ?? config.border,
    borderWidth: dataZoom.borderWidth ?? config.size.dataZoomBorderWidth,
    fillerColor:
      dataZoom.fillerColor ??
      `linear-gradient(90deg, ${withAlpha(config.color.primaryColors[0], 0.2) ?? config.color.primaryColors[0] + '33'}, ${withAlpha(config.color.primaryColors[0], 0.4) ?? config.color.primaryColors[0] + '66'})`,
    fillerOpacity: dataZoom.fillerOpacity ?? 0.6,
    handleStyle: {
      ...dataZoom.handleStyle,
      color: dataZoom.handleStyle?.color ?? config.color.primaryColors[0],
      borderColor: dataZoom.handleStyle?.borderColor ?? config.color.primaryColors[0],
      borderWidth: dataZoom.handleStyle?.borderWidth ?? 2,
      borderRadius: dataZoom.handleStyle?.borderRadius ?? 4,
    },
    moveHandleStyle: {
      ...dataZoom.moveHandleStyle,
      color: dataZoom.moveHandleStyle?.color ?? config.color.primaryColors[0],
      borderColor: dataZoom.moveHandleStyle?.borderColor ?? config.color.primaryColors[0],
      borderWidth: dataZoom.moveHandleStyle?.borderWidth ?? 2,
      borderRadius: dataZoom.moveHandleStyle?.borderRadius ?? 4,
    },
    dataBackground: {
      ...dataZoom.dataBackground,
      areaStyle: {
        ...dataZoom.dataBackground?.areaStyle,
        color: dataZoom.dataBackground?.areaStyle?.color ?? withAlpha(config.card, 0.15),
        opacity: dataZoom.dataBackground?.areaStyle?.opacity ?? 0.4,
      },
    },
    selectedDataBackground: {
      ...dataZoom.selectedDataBackground,
      areaStyle: {
        ...dataZoom.selectedDataBackground?.areaStyle,
        color:
          dataZoom.selectedDataBackground?.areaStyle?.color ??
          withAlpha(config.color.primaryColors[0], 0.15),
        opacity: dataZoom.selectedDataBackground?.areaStyle?.opacity ?? 0.15,
      },
    },
    brushStyle: {
      ...dataZoom.brushStyle,
      color: dataZoom.brushStyle?.color ?? withAlpha(config.accent, 0.3),
    },
    zoomLock: dataZoom.zoomLock ?? false,
    showDataShadow: dataZoom.showDataShadow ?? true,
    showDetail: dataZoom.showDetail ?? true,
    realtime: dataZoom.realtime ?? true,
    filterMode: dataZoom.filterMode ?? 'filter',
    // 高度：仅在未显式设置且为轴向 dataZoom 时使用默认高度
    height: dataZoom.height ?? config.size.dataZoomHeight,
  }
}
