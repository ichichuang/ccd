import { useTimeoutFn } from '@vueuse/core'
import type { Ref } from 'vue'
import type { INFINITE_SCROLL_DEFAULTS } from '../config'

export interface UseProTableInfiniteScrollOptions {
  enabled: boolean
  containerRef: Ref<HTMLElement | null>
  /** CSS selectors to find the scrollable element inside the container. Tried in order. */
  scrollTargetSelectors: string[]
  isLoading: Readonly<Ref<boolean>>
  setupDelayMs: typeof INFINITE_SCROLL_DEFAULTS.setupDelayMs
  bottomDistancePx: typeof INFINITE_SCROLL_DEFAULTS.bottomDistancePx
  onLoadMore: () => void
}

export interface UseProTableInfiniteScrollReturn {
  /** Manually trigger setup (called automatically on mount when enabled) */
  setup: () => void
  /** Teardown scroll listener and pending timer */
  cleanup: () => void
}

export function useProTableInfiniteScroll(
  options: UseProTableInfiniteScrollOptions
): UseProTableInfiniteScrollReturn {
  let _scrollTarget: HTMLElement | null = null
  let _scrollHandler: (() => void) | null = null

  const { start: scheduleSetup, stop: cancelScheduledSetup } = useTimeoutFn(
    attachListener,
    options.setupDelayMs,
    { immediate: false }
  )

  function attachListener(): void {
    if (!options.enabled || !options.containerRef.value) return

    for (const selector of options.scrollTargetSelectors) {
      const el = options.containerRef.value.querySelector<HTMLElement>(selector)
      if (el) {
        _scrollTarget = el
        break
      }
    }
    if (!_scrollTarget) return

    _scrollHandler = () => {
      if (!_scrollTarget || options.isLoading.value) return
      const { scrollTop, scrollHeight, clientHeight } = _scrollTarget
      if (scrollHeight - scrollTop - clientHeight < options.bottomDistancePx) {
        options.onLoadMore()
      }
    }
    _scrollTarget.addEventListener('scroll', _scrollHandler, { passive: true })
  }

  function cleanup(): void {
    cancelScheduledSetup()
    if (_scrollTarget && _scrollHandler) {
      _scrollTarget.removeEventListener('scroll', _scrollHandler)
    }
    _scrollTarget = null
    _scrollHandler = null
  }

  function setup(): void {
    if (!options.enabled) return
    scheduleSetup()
  }

  return { setup, cleanup }
}
