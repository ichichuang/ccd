import type { EffectScope, ObjectDirective } from 'vue'
import { useLongPressAction } from '@ccd/vue-hooks'

/**
 * v-long-press 指令：长按手势检测
 *
 * 用法：
 *   v-long-press="handler"          — 默认 500ms 触发
 *   v-long-press:800="handler"      — 自定义延迟 800ms
 */

const LONG_PRESS_SCOPE: unique symbol = Symbol('v-long-press-scope')

interface LongPressElement extends HTMLElement {
  [LONG_PRESS_SCOPE]?: EffectScope
}

function setup(el: LongPressElement, handler: (e: PointerEvent) => void, arg?: string) {
  const delay = arg ? Number.parseInt(arg, 10) : undefined
  const scope = effectScope()
  scope.run(() => useLongPressAction(el, handler, delay ? { delay } : undefined))
  el[LONG_PRESS_SCOPE] = scope
}

export const vLongPress: ObjectDirective<HTMLElement, (event: PointerEvent) => void> = {
  mounted(el: LongPressElement, binding) {
    if (typeof binding.value !== 'function') return
    setup(el, binding.value, binding.arg)
  },

  updated(el: LongPressElement, binding) {
    el[LONG_PRESS_SCOPE]?.stop()
    if (typeof binding.value !== 'function') return
    setup(el, binding.value, binding.arg)
  },

  unmounted(el: LongPressElement) {
    el[LONG_PRESS_SCOPE]?.stop()
    delete el[LONG_PRESS_SCOPE]
  },
}
