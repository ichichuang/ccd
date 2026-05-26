import { effectScope, type EffectScope, type ObjectDirective } from 'vue'
import type { SwipeDirection } from '../useInteraction/types'
import { useSwipeAction } from '../useInteraction/useSwipeAction'

const SWIPE_SCOPE: unique symbol = Symbol('v-swipe-scope')
const VALID_DIRECTIONS = new Set<SwipeDirection>(['left', 'right', 'up', 'down'])

interface SwipeElement extends HTMLElement {
  [SWIPE_SCOPE]?: EffectScope
}

function mountSwipe(
  el: SwipeElement,
  handler: (direction: SwipeDirection) => void,
  arg?: string
): void {
  const directions: SwipeDirection[] | undefined =
    arg && VALID_DIRECTIONS.has(arg as SwipeDirection) ? [arg as SwipeDirection] : undefined
  const scope = effectScope()
  scope.run(() => useSwipeAction(el, handler, directions ? { directions } : undefined))
  el[SWIPE_SCOPE] = scope
}

export const vSwipe: ObjectDirective<HTMLElement, (direction: SwipeDirection) => void> = {
  mounted(el: SwipeElement, binding) {
    if (typeof binding.value !== 'function') return
    mountSwipe(el, binding.value, binding.arg)
  },

  updated(el: SwipeElement, binding) {
    el[SWIPE_SCOPE]?.stop()
    delete el[SWIPE_SCOPE]
    if (typeof binding.value !== 'function') return
    mountSwipe(el, binding.value, binding.arg)
  },

  unmounted(el: SwipeElement) {
    el[SWIPE_SCOPE]?.stop()
    delete el[SWIPE_SCOPE]
  },
}
