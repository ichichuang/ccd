/**
 * CScrollbar type definitions
 */
import type {
  OverlayScrollbars,
  PartialOptions,
  OnUpdatedEventListenerArgs,
} from 'overlayscrollbars'

export type { OnUpdatedEventListenerArgs }

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
  state: () => any

  /**
   * Get elements structure
   */
  elements: () => any
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
