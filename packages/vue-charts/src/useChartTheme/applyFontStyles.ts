// @ts-nocheck
// ECharts 字体样式边界：目标对象与 ECharts 文本/轴标签等一致，内部使用 unknown 避免强依赖 echarts 内部类型。
import type { FontConfig } from './types'

/**
 * 字体样式应用函数（函数式版本）
 * 返回新的对象，不修改原对象
 */
export function applyFontStyles(target: unknown, config: FontConfig): unknown {
  if (!target) {
    return target
  }

  return {
    ...target,
    textStyle: {
      ...target.textStyle,
      color: target.textStyle?.color ?? config.textColor,
      fontSize: target.textStyle?.fontSize ?? config.fontSizeMd,
    },
    label: {
      ...target.label,
      color: target.label?.color ?? config.textColor,
      fontSize: target.label?.fontSize ?? config.fontSizeSm,
    },
    axisLabel: {
      ...target.axisLabel,
      color: target.axisLabel?.color ?? config.textColorSecondary,
      fontSize: target.axisLabel?.fontSize ?? config.fontSizeSm,
    },
  }
}

/**
 * 通用字体样式应用函数，批量处理多个目标
 */
export function applyFontStylesToTargets(targets: unknown[], config: FontConfig): unknown[] {
  return targets.map(target => (target ? applyFontStyles(target, config) : target))
}
