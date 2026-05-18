import { BREAKPOINTS } from '@/constants/breakpoints'
import type { ResponsiveSpan } from '../types'
import { PRO_FORM_LAYOUT_DEFAULTS } from '../config'

export type BreakpointKey = keyof typeof BREAKPOINTS

/**
 * 根据容器宽度计算当前激活断点
 */
export const getActiveBreakpoint = (width: number): BreakpointKey => {
  const entries = Object.entries(BREAKPOINTS).sort((a, b) => b[1] - a[1])
  for (const [key, value] of entries) {
    if (width >= value) return key as BreakpointKey
  }
  return 'xs'
}

/**
 * 根据当前断点解析字段在 12 栅格下应占用的列数
 * - 支持 number（固定列宽）
 * - 支持 ResponsiveSpan（按断点配置）
 */
export const resolveSpan = (
  spanConfig: ResponsiveSpan | undefined,
  activeBp: BreakpointKey
): number => {
  if (!spanConfig) return PRO_FORM_LAYOUT_DEFAULTS.gridSpan
  if (typeof spanConfig === 'number') return spanConfig

  const bpOrder: BreakpointKey[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl']
  const currentIndex = bpOrder.indexOf(activeBp)

  for (let i = currentIndex; i >= 0; i--) {
    const key = bpOrder[i]
    const val = spanConfig[key]
    if (val !== undefined) {
      return val
    }
  }

  return PRO_FORM_LAYOUT_DEFAULTS.gridSpan
}
