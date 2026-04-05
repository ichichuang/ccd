// ECharts Tooltip 样式边界：参数与 ECharts tooltip 组件一致，内部使用 any 避免强依赖 echarts 内部类型。
import type { ThemeConfig } from './types'
import { withAlpha } from './utils'

/** Tooltip 玻璃态透明度（Glassmorphism），与 bg-background/80 backdrop-blur-lg 一致 */
const TOOLTIP_BG_ALPHA = 0.92
/** Tooltip 过渡时长 (s)，流体动画 */
const TOOLTIP_TRANSITION_DURATION = 0.3

/**
 * 应用主题样式到 ECharts tooltip
 * 仅负责融合颜色和尺寸，不改动 formatter 逻辑（函数式版本）
 * V2: 玻璃态背景 + 流体 transitionDuration
 */
export function applyTooltipStyles(
  tooltip: Record<string, any> | undefined,
  config: ThemeConfig
): Record<string, any> {
  const bgColor = withAlpha(config.card, TOOLTIP_BG_ALPHA) ?? config.card

  if (!tooltip) {
    return {
      backgroundColor: bgColor,
      borderColor: config.card,
      padding: config.size.tooltipPadding,
      borderWidth: config.size.tooltipBorderWidth,
      borderRadius: config.size.tooltipRadius,
      transitionDuration: TOOLTIP_TRANSITION_DURATION,
      textStyle: {
        color: config.foreground,
        fontSize: config.size.fontSm,
        lineHeight: config.size.lineHeightSm,
      },
      axisPointer: {
        lineStyle: {
          color: withAlpha(config.accent, 0.5),
          width: config.size.strokeHairline,
        },
        crossStyle: {
          color: withAlpha(config.accent, 0.6),
          width: config.size.strokeHairline,
        },
      },
    }
  }

  return {
    ...tooltip,
    backgroundColor: tooltip.backgroundColor ?? bgColor,
    borderColor: tooltip.borderColor ?? config.card,
    padding: tooltip.padding ?? config.size.tooltipPadding,
    borderWidth: tooltip.borderWidth ?? config.size.tooltipBorderWidth,
    borderRadius: tooltip.borderRadius ?? config.size.tooltipRadius,
    textStyle: {
      ...tooltip.textStyle,
      color: tooltip.textStyle?.color ?? config.foreground,
      fontSize: tooltip.textStyle?.fontSize ?? config.size.fontSm,
      lineHeight: tooltip.textStyle?.lineHeight ?? config.size.lineHeightSm,
    },
    axisPointer: {
      ...tooltip.axisPointer,
      lineStyle: {
        ...tooltip.axisPointer?.lineStyle,
        color: tooltip.axisPointer?.lineStyle?.color ?? withAlpha(config.accent, 0.5),
        width: tooltip.axisPointer?.lineStyle?.width ?? config.size.strokeHairline,
      },
      crossStyle: {
        ...tooltip.axisPointer?.crossStyle,
        color: tooltip.axisPointer?.crossStyle?.color ?? withAlpha(config.accent, 0.6),
        width: tooltip.axisPointer?.crossStyle?.width ?? config.size.strokeHairline,
      },
    },
    transitionDuration: tooltip.transitionDuration ?? TOOLTIP_TRANSITION_DURATION,
    // 不处理 formatter —— 避免污染全局 tooltip 逻辑
  }
}
