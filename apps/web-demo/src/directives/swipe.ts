import type { EffectScope, ObjectDirective } from 'vue'
import { useSwipeAction } from '@ccd/vue-hooks'
import type { SwipeDirection } from '@ccd/vue-hooks'

/**
 * v-swipe 指令：滑动手势检测
 *
 * 用法：
 *   v-swipe="handler"              — 任意方向，handler 接收 SwipeDirection
 *   v-swipe:left="handler"         — 仅左滑
 *   v-swipe:right="handler"        — 仅右滑
 *   v-swipe:up="handler"           — 仅上滑
 *   v-swipe:down="handler"         — 仅下滑
 */

const SWIPE_SCOPE: unique symbol = Symbol('v-swipe-scope')

interface SwipeElement extends HTMLElement {
  [SWIPE_SCOPE]?: EffectScope
}

const VALID_DIRECTIONS = new Set<string>(['left', 'right', 'up', 'down'])

function setup(el: SwipeElement, handler: (dir: SwipeDirection) => void, arg?: string) {
  const directions = arg && VALID_DIRECTIONS.has(arg) ? [arg as SwipeDirection] : undefined

  const scope = effectScope()
  scope.run(() => useSwipeAction(el, handler, { directions }))
  el[SWIPE_SCOPE] = scope
}

export const vSwipe: ObjectDirective<HTMLElement, (direction: SwipeDirection) => void> = {
  mounted(el: SwipeElement, binding) {
    if (typeof binding.value !== 'function') return
    setup(el, binding.value, binding.arg)
  },

  updated(el: SwipeElement, binding) {
    el[SWIPE_SCOPE]?.stop()
    if (typeof binding.value !== 'function') return
    setup(el, binding.value, binding.arg)
  },

  unmounted(el: SwipeElement) {
    el[SWIPE_SCOPE]?.stop()
    delete el[SWIPE_SCOPE]
  },
}
