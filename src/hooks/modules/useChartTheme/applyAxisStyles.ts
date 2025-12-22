// 坐标轴样式应用函数

import type { FontConfig, ThemeConfig } from './types'
import { applyFontStyles } from './applyFontStyles'

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
        color: result.axisLine?.lineStyle?.color ?? config.bgColor300,
      },
    },
    splitLine: {
      ...result.splitLine,
      lineStyle: {
        ...result.splitLine?.lineStyle,
        color: result.splitLine?.lineStyle?.color ?? config.bgColor300,
      },
    },
    nameTextStyle: {
      ...result.nameTextStyle,
      color: result.nameTextStyle?.color ?? config.textColor100,
      fontSize: result.nameTextStyle?.fontSize ?? config.font.fontSizeSmall,
    },
  }

  return result
}
