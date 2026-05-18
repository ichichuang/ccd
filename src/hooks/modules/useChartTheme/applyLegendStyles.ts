// ECharts Legend 样式边界：参数与 ECharts legend 组件一致，内部使用 any 避免强依赖 echarts 内部类型。
import type { ThemeConfig } from './types'
import { withAlpha } from './utils'

/**
 * 应用主题样式到 ECharts legend
 * 仅负责融合颜色和尺寸，不改动其他逻辑（函数式版本）
 */
export function applyLegendStyles(legend: any, config: ThemeConfig): any {
  if (!legend) {
    return legend
  }

  return {
    ...legend,
    backgroundColor: legend.backgroundColor ?? 'transparent',
    itemWidth: legend.itemWidth ?? config.size.legendItemWidth,
    itemHeight: legend.itemHeight ?? config.size.legendItemHeight,
    itemGap: legend.itemGap ?? config.size.legendItemGap,
    padding: legend.padding ?? config.size.legendPadding,
    textStyle: {
      ...legend.textStyle,
      color: legend.textStyle?.color ?? config.mutedForeground,
      fontSize: legend.textStyle?.fontSize ?? config.size.fontSm,
      lineHeight: legend.textStyle?.lineHeight ?? config.size.lineHeightSm,
    },
    borderColor: legend.borderColor ?? config.border,
    // 仅当用户显式配置了 selector 时才补充样式，避免无意间开启 ECharts 默认的「全选 / 反选」按钮
    ...(legend.selector
      ? {
          selector: {
            ...legend.selector,
            color: legend.selector.color ?? config.mutedForeground,
            borderColor: legend.selector.borderColor ?? config.border,
          },
        }
      : {}),
    inactiveColor: legend.inactiveColor ?? withAlpha(config.mutedForeground, 0.5),
    inactiveBorderColor: legend.inactiveBorderColor ?? withAlpha(config.border, 0.7),
  }
}
