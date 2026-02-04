// 字体样式应用函数

import type { FontConfig } from './types'

/**
 * 字体样式应用函数（函数式版本）
 * 返回新的对象，不修改原对象
 */
export function applyFontStyles(target: any, config: FontConfig): any {
  if (!target) {
    return target
  }

  return {
    ...target,
    textStyle: {
      ...target.textStyle,
      color: target.textStyle?.color ?? config.textColor,
      fontSize: target.textStyle?.fontSize ?? config.fontSize,
    },
    label: {
      ...target.label,
      color: target.label?.color ?? config.textColor,
      fontSize: target.label?.fontSize ?? config.fontSizeSmall,
    },
    axisLabel: {
      ...target.axisLabel,
      color: target.axisLabel?.color ?? config.textColorSecondary,
      fontSize: target.axisLabel?.fontSize ?? config.fontSizeSmall,
    },
  }
}

/**
 * 通用字体样式应用函数，批量处理多个目标
 */
export function applyFontStylesToTargets(targets: any[], config: FontConfig): any[] {
  return targets.map(target => (target ? applyFontStyles(target, config) : target))
}
