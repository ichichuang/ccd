// ECharts Toolbox 样式边界：参数与 ECharts toolbox 组件一致，内部使用 any 避免强依赖 echarts 内部类型。
import type { ThemeConfig } from './types'

/**
 * 应用主题样式到 ECharts toolbox
 * 仅负责融合颜色和尺寸，不改动其他逻辑（函数式版本）
 */
export function applyToolboxStyles(toolbox: any, config: ThemeConfig): any {
  if (!toolbox) {
    return toolbox
  }

  const applyToolboxFeatureBase = (feature: any): any => {
    if (!feature || typeof feature !== 'object') return feature
    return {
      ...feature,
      textStyle: {
        ...feature.textStyle,
        color: feature.textStyle?.color ?? config.foreground,
        fontSize: feature.textStyle?.fontSize ?? config.size.fontSm,
      },
      backgroundColor: feature.backgroundColor ?? config.card,
      borderColor: feature.borderColor ?? config.border,
      borderWidth: feature.borderWidth ?? config.size.strokeHairline,
    }
  }

  return {
    ...toolbox,
    itemSize: toolbox.itemSize ?? config.size.toolboxItemSize,
    itemGap: toolbox.itemGap ?? config.size.toolboxItemGap,
    iconStyle: {
      ...toolbox.iconStyle,
      color: toolbox.iconStyle?.color ?? config.mutedForeground,
      borderColor: toolbox.iconStyle?.borderColor ?? config.border,
    },
    feature: {
      ...toolbox.feature,
      dataView: {
        ...toolbox.feature?.dataView,
        textStyle: {
          ...toolbox.feature?.dataView?.textStyle,
          color: toolbox.feature?.dataView?.textStyle?.color ?? config.foreground,
        },
        backgroundColor: toolbox.feature?.dataView?.backgroundColor ?? config.card,
      },
      // 其他 feature（saveAsImage, restore, dataZoom, brush 等）如有 textStyle/backgroundColor 也统一处理
      saveAsImage: {
        ...toolbox.feature?.saveAsImage,
        backgroundColor: toolbox.feature?.saveAsImage?.backgroundColor ?? config.background,
      },
      restore: applyToolboxFeatureBase(toolbox.feature?.restore),
      dataZoom: applyToolboxFeatureBase(toolbox.feature?.dataZoom),
      reset: applyToolboxFeatureBase(toolbox.feature?.reset),
      brush: applyToolboxFeatureBase(toolbox.feature?.brush),
    },
  }
}
