// DataZoom 样式应用函数

import type { ThemeConfig } from './types'

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
      color: dataZoom.textStyle?.color ?? config.accent100,
      fontSize: dataZoom.textStyle?.fontSize ?? config.font.fontSizeSmall,
    },
    backgroundColor: dataZoom.backgroundColor ?? 'rgba(0, 0, 0, 0.05)',
    borderColor: dataZoom.borderColor ?? 'rgba(0, 0, 0, 0.1)',
    borderWidth: dataZoom.borderWidth ?? 1,
    fillerColor:
      dataZoom.fillerColor ??
      `linear-gradient(90deg, ${config.color.primaryColors[0]}20, ${config.color.primaryColors[0]}40)`,
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
        color: dataZoom.dataBackground?.areaStyle?.color ?? 'rgba(0, 0, 0, 0.08)',
        opacity: dataZoom.dataBackground?.areaStyle?.opacity ?? 0.4,
      },
    },
    selectedDataBackground: {
      ...dataZoom.selectedDataBackground,
      areaStyle: {
        ...dataZoom.selectedDataBackground?.areaStyle,
        color: dataZoom.selectedDataBackground?.areaStyle?.color ?? config.color.primaryColors[0],
        opacity: dataZoom.selectedDataBackground?.areaStyle?.opacity ?? 0.15,
      },
    },
    zoomLock: dataZoom.zoomLock ?? false,
    showDataShadow: dataZoom.showDataShadow ?? true,
    showDetail: dataZoom.showDetail ?? true,
    realtime: dataZoom.realtime ?? true,
    filterMode: dataZoom.filterMode ?? 'filter',
  }
}
