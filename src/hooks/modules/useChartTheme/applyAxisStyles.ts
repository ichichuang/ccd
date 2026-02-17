// ECharts 坐标轴样式边界：参数与 ECharts 轴类型一致，内部使用 any 避免强依赖 echarts 内部类型。
import type { ThemeConfig } from './types'
import { applyFontStyles } from './applyFontStyles'
import { withAlpha } from './utils'

/**
 * 坐标轴样式应用函数（函数式版本）
 */
export function applyAxisStyles(axis: any, config: ThemeConfig): any {
  if (!axis) {
    return axis
  }

  let result = applyFontStyles(axis, config.font)

  result = {
    ...result,
    axisLine: {
      ...result.axisLine,
      lineStyle: {
        ...result.axisLine?.lineStyle,
        // 主轴线：使用 border 色，确保在 bg-card 容器中也清晰可见
        color: result.axisLine?.lineStyle?.color ?? config.border,
        width: result.axisLine?.lineStyle?.width ?? config.size.strokeAxis,
      },
    },
    axisTick: {
      ...result.axisTick,
      length: result.axisTick?.length ?? config.size.tickLen,
      lineStyle: {
        ...result.axisTick?.lineStyle,
        // 刻度线优先使用自身颜色，否则继承轴线颜色，最后回退到 border
        color:
          result.axisTick?.lineStyle?.color ?? result.axisLine?.lineStyle?.color ?? config.border,
        width: result.axisTick?.lineStyle?.width ?? config.size.strokeHairline,
      },
    },
    axisLabel: {
      ...result.axisLabel,
      color: result.axisLabel?.color ?? config.mutedForeground,
      fontSize: result.axisLabel?.fontSize ?? config.size.fontSm,
      margin: result.axisLabel?.margin ?? config.size.axisLabelMargin,
      padding: result.axisLabel?.padding ?? config.size.axisLabelPadding,
    },
    splitLine: {
      ...result.splitLine,
      lineStyle: {
        ...result.splitLine?.lineStyle,
        // 分割线：使用 border 80% 透明度，形成清晰但不过分抢眼的网格线
        color: result.splitLine?.lineStyle?.color ?? withAlpha(config.border, 0.8),
        width: result.splitLine?.lineStyle?.width ?? config.size.strokeGrid,
      },
    },
    splitArea: {
      ...result.splitArea,
      areaStyle: {
        ...result.splitArea?.areaStyle,
        color: result.splitArea?.areaStyle?.color ?? [
          withAlpha(config.card, 0.06),
          withAlpha(config.background, 0.03),
        ],
      },
    },
    minorSplitLine: {
      ...result.minorSplitLine,
      lineStyle: {
        ...result.minorSplitLine?.lineStyle,
        // 次级分割线：使用 border 30% 透明度，作为较弱的辅助参考线
        color: result.minorSplitLine?.lineStyle?.color ?? withAlpha(config.border, 0.3),
        width: result.minorSplitLine?.lineStyle?.width ?? config.size.strokeHairline,
      },
    },
    minorTick: {
      ...result.minorTick,
      length: result.minorTick?.length ?? config.size.minorTickLen,
      lineStyle: {
        ...result.minorTick?.lineStyle,
        // 次级刻度线：使用 border 50% 透明度，层级介于主刻度与次分割线之间
        color: result.minorTick?.lineStyle?.color ?? withAlpha(config.border, 0.5),
        width: result.minorTick?.lineStyle?.width ?? config.size.strokeHairline,
      },
    },
    nameTextStyle: {
      ...result.nameTextStyle,
      color: result.nameTextStyle?.color ?? config.foreground,
      fontSize: result.nameTextStyle?.fontSize ?? config.size.fontSm,
    },
  }

  return result
}
