import type { EffectScope, ObjectDirective } from 'vue'
import { useTap } from '@ccd/vue-hooks'

/**
 * v-tap 指令：统一 tap 事件（抹平 click/touch/pen 差异）
 *
 * 用法：
 *   v-tap="handler"
 *
 * 内部基于 PointerEvents，当指针位移 < 10px 时触发 handler。
 */

const TAP_SCOPE: unique symbol = Symbol('v-tap-scope')

interface TapElement extends HTMLElement {
  [TAP_SCOPE]?: EffectScope
}

export const vTap: ObjectDirective<HTMLElement, (event: PointerEvent) => void> = {
  mounted(el: TapElement, binding) {
    if (typeof binding.value !== 'function') return
    const scope = effectScope()
    scope.run(() => useTap(el, binding.value))
    el[TAP_SCOPE] = scope
  },

  updated(el: TapElement, binding) {
    // Re-create scope if handler changes
    el[TAP_SCOPE]?.stop()
    if (typeof binding.value !== 'function') return
    const scope = effectScope()
    scope.run(() => useTap(el, binding.value))
    el[TAP_SCOPE] = scope
  },

  unmounted(el: TapElement) {
    el[TAP_SCOPE]?.stop()
    delete el[TAP_SCOPE]
  },
}
