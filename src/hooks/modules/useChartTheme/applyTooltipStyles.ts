// Tooltip 样式应用函数

import type { ThemeConfig } from './types'

/**
 * 应用主题样式到 ECharts tooltip
 * 仅负责融合颜色和尺寸，不改动 formatter 逻辑（函数式版本）
 */
export function applyTooltipStyles(
  tooltip: Record<string, any> | undefined,
  config: ThemeConfig
): Record<string, any> {
  if (!tooltip) {
    return {
      backgroundColor: config.bgColor200,
      borderColor: config.bgColor300,
      textStyle: {
        color: config.textColor100,
        fontSize: config.font.fontSizeSmall,
      },
    }
  }

  return {
    ...tooltip,
    backgroundColor: tooltip.backgroundColor ?? config.bgColor200,
    borderColor: tooltip.borderColor ?? config.bgColor300,
    textStyle: {
      ...tooltip.textStyle,
      color: tooltip.textStyle?.color ?? config.textColor100,
      fontSize: tooltip.textStyle?.fontSize ?? config.font.fontSizeSmall,
    },
    // 不处理 formatter —— 避免污染全局 tooltip 逻辑
  }
}
