/**
 * CScrollbar type definitions
 */
import type {
  Elements,
  OverlayScrollbars,
  PartialOptions,
  State,
  OnUpdatedEventListenerArgs,
} from 'overlayscrollbars'

export type { OnUpdatedEventListenerArgs }

export interface ScrollbarMemoryPosition {
  scrollTop: number
  scrollLeft: number
}

export interface ScrollbarMemoryProvider {
  get: (key: string) => ScrollbarMemoryPosition | undefined
  set: (key: string, position: ScrollbarMemoryPosition) => void
}

/**
 * CScrollbar visibility options
 * - 'auto': Automatically hide when not scrolling
 * - 'visible': Always visible
 * - 'hidden': Always hidden
 */
export type ScrollbarVisibility = 'auto' | 'visible' | 'hidden'

/**
 * CScrollbar Props Interface
 */
export interface ScrollbarProps {
  /**
   * CScrollbar visibility
   * @default 'auto'
   */
  visibility?: ScrollbarVisibility

  /**
   * Defer initialization to avoid flickering
   * @default true
   */
  defer?: boolean

  /**
   * Custom class name
   */
  class?: string

  /**
   * Use native scrollbar instead of OverlayScrollbars
   * @default false
   */
  native?: boolean

  /**
   * Dark theme state supplied by the consuming app.
   * Defaults to the document `html.dark` class when omitted.
   */
  dark?: boolean

  /**
   * 是否显示「返回顶部」浮动按钮（与 PrimeVue ScrollTop 行为对齐：scrollTop 超过阈值后显示）
   * @default false
   */
  backToTop?: boolean

  /**
   * 从内容顶部向下滚动的距离（px）超过该值时显示返回顶部按钮；语义为 scrollTop，非距底部剩余距离
   * @default 400（与 PrimeVue ScrollTop 默认 threshold 一致）
   */
  backToTopThreshold?: number

  /**
   * 返回顶部按钮距定位容器底部（px）；按钮位于滚动视口外层的定位层，不随内容滚动
   * @default 40
   */
  backToTopOffsetBottom?: number

  /**
   * 返回顶部按钮距定位容器右侧（px）
   * @default 40
   */
  backToTopOffsetRight?: number

  /**
   * Opt-in key used to restore and persist scroll position through the injected memory provider.
   * Omit to keep scroll memory disabled.
   */
  memoryKey?: string

  /**
   * Scroll position persistence throttle interval in milliseconds.
   * @default 200
   */
  memoryThrottle?: number

  /**
   * OverlayScrollbars options
   */
  options?: PartialOptions
}

/**
 * CScrollbar Instance Interface
 * Exposed methods via template ref
 */
export interface ScrollbarInstance {
  /**
   * Scroll to specific position
   */
  scrollTo: (options: ScrollToOptions) => void

  /**
   * Get underlying OverlayScrollbars instance
   */
  getInstance: () => OverlayScrollbars | null

  /**
   * Force update
   */
  update: (force?: boolean) => boolean

  /**
   * Get current state
   */
  state: () => State | undefined

  /**
   * Get elements structure
   */
  elements: () => Elements | undefined
}

/**
 * Event payloads
 */
export interface ScrollbarEventMap {
  initialized: [instance: OverlayScrollbars]
  updated: [instance: OverlayScrollbars, onUpdatedArgs: OnUpdatedEventListenerArgs]
  destroyed: [instance: OverlayScrollbars, canceled: boolean]
  scroll: [instance: OverlayScrollbars, event: Event]
}
