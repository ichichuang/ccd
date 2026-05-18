// ECharts Brush 样式边界：参数与 ECharts brush 组件一致，内部使用 any 避免强依赖 echarts 内部类型。
import type { ThemeConfig } from './types'
import { withAlpha } from './utils'

/**
 * 应用主题样式到 ECharts brush
 * 仅负责融合颜色和尺寸，不改动其他逻辑（函数式版本）
 */
export function applyBrushStyles(brush: any, config: ThemeConfig): any {
  if (!brush) {
    return brush
  }

  return {
    ...brush,
    brushStyle: {
      ...brush.brushStyle,
      borderColor: brush.brushStyle?.borderColor ?? config.accent,
      fill: brush.brushStyle?.fill ?? withAlpha(config.accent, 0.3),
    },
  }
}
