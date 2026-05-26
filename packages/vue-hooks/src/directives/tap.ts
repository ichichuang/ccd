import { effectScope, type EffectScope, type ObjectDirective } from 'vue'
import { useTap } from '../useInteraction/useTap'

const TAP_SCOPE: unique symbol = Symbol('v-tap-scope')

interface TapElement extends HTMLElement {
  [TAP_SCOPE]?: EffectScope
}

function mountTap(el: TapElement, handler: (event: PointerEvent) => void): void {
  const scope = effectScope()
  scope.run(() => useTap(el, handler))
  el[TAP_SCOPE] = scope
}

export const vTap: ObjectDirective<HTMLElement, (event: PointerEvent) => void> = {
  mounted(el: TapElement, binding) {
    if (typeof binding.value !== 'function') return
    mountTap(el, binding.value)
  },

  updated(el: TapElement, binding) {
    el[TAP_SCOPE]?.stop()
    delete el[TAP_SCOPE]
    if (typeof binding.value !== 'function') return
    mountTap(el, binding.value)
  },

  unmounted(el: TapElement) {
    el[TAP_SCOPE]?.stop()
    delete el[TAP_SCOPE]
  },
}
