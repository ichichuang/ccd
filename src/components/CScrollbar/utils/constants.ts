/**
 * CScrollbar 组件默认配置
 *
 * 注意：此处的默认值需要与 types.ts 中文档注释保持一致
 */
import { TRANSITION_SCALE_VALUES } from '@/constants/sizeScale'
import type { ScrollbarProps, ScrollbarVisibility } from './types'

/** 与 PrimeVue ScrollTop 默认 threshold 一致 */
export const DEFAULT_BACK_TO_TOP_THRESHOLD = 400

/** 返回顶部浮动按钮默认边距（px），与 bottom/right 一致 */
export const DEFAULT_BACK_TO_TOP_OFFSET_PX = 40

/** Props 默认值（与 ScrollbarProps 中 @default 一致） */
export const defaultScrollbarProps: Required<
  Pick<
    ScrollbarProps,
    | 'visibility'
    | 'defer'
    | 'native'
    | 'backToTop'
    | 'backToTopThreshold'
    | 'backToTopOffsetBottom'
    | 'backToTopOffsetRight'
  >
> = {
  visibility: 'auto',
  defer: true,
  native: false,
  backToTop: false,
  backToTopThreshold: DEFAULT_BACK_TO_TOP_THRESHOLD,
  backToTopOffsetBottom: DEFAULT_BACK_TO_TOP_OFFSET_PX,
  backToTopOffsetRight: DEFAULT_BACK_TO_TOP_OFFSET_PX,
}

/**
 * OverlayScrollbars 自动隐藏延迟（ms）
 * 与尺寸系统 --transition-xl 一致（TRANSITION_SCALE_VALUES.xl）
 */
export const DEFAULT_SCROLLBAR_AUTO_HIDE_DELAY_MS = TRANSITION_SCALE_VALUES.xl

/**
 * 由 visibility 解析 OverlayScrollbars 的 autoHide 策略
 */
export function resolveScrollbarAutoHide(visibility: ScrollbarVisibility): 'leave' | 'never' {
  return visibility === 'auto' ? 'leave' : 'never'
}
