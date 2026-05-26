import { effectScope, type EffectScope, type ObjectDirective } from 'vue'
import { useLongPressAction } from '../useInteraction/useLongPressAction'

const LONG_PRESS_SCOPE: unique symbol = Symbol('v-long-press-scope')

interface LongPressElement extends HTMLElement {
  [LONG_PRESS_SCOPE]?: EffectScope
}

function mountLongPress(
  el: LongPressElement,
  handler: (event: PointerEvent) => void,
  arg?: string
): void {
  const delay = arg ? Number.parseInt(arg, 10) : Number.NaN
  const scope = effectScope()
  scope.run(() => useLongPressAction(el, handler, Number.isFinite(delay) ? { delay } : undefined))
  el[LONG_PRESS_SCOPE] = scope
}

export const vLongPress: ObjectDirective<HTMLElement, (event: PointerEvent) => void> = {
  mounted(el: LongPressElement, binding) {
    if (typeof binding.value !== 'function') return
    mountLongPress(el, binding.value, binding.arg)
  },

  updated(el: LongPressElement, binding) {
    el[LONG_PRESS_SCOPE]?.stop()
    delete el[LONG_PRESS_SCOPE]
    if (typeof binding.value !== 'function') return
    mountLongPress(el, binding.value, binding.arg)
  },

  unmounted(el: LongPressElement) {
    el[LONG_PRESS_SCOPE]?.stop()
    delete el[LONG_PRESS_SCOPE]
  },
}
