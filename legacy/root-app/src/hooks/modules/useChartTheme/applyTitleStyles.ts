// ECharts Title 样式边界：参数与 ECharts title 组件一致，内部使用 any 避免强依赖 echarts 内部类型。
import type { ThemeConfig } from './types'

/**
 * 应用主题样式到 ECharts title
 * 仅负责融合颜色和尺寸，不改动其他逻辑（函数式版本）
 */
export function applyTitleStyles(title: any, config: ThemeConfig): any {
  if (!title) {
    return title
  }

  return {
    ...title,
    backgroundColor: title.backgroundColor ?? config.card,
    textStyle: {
      ...title.textStyle,
      color: title.textStyle?.color ?? config.foreground,
      textBorderColor: title.textStyle?.textBorderColor ?? 'transparent',
      textShadowColor: title.textStyle?.textShadowColor ?? 'transparent',
    },
    subtextStyle: {
      ...title.subtextStyle,
      color: title.subtextStyle?.color ?? config.mutedForeground,
      textBorderColor: title.subtextStyle?.textBorderColor ?? 'transparent',
      textShadowColor: title.subtextStyle?.textShadowColor ?? 'transparent',
    },
  }
}
