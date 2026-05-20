import { useEventListener } from '@vueuse/core'
import { shallowRef } from 'vue'
import type { InteractionTarget, UseTapOptions, UseTapReturn } from './types'

/**
 * Unified tap detection based on PointerEvents.
 *
 * Registers `pointerdown` / `pointerup` on the target element.
 * If the pointer moves less than `threshold` px between down and up, fires `handler`.
 * Works identically on mouse, touch, and pen inputs.
 */
export function useTap(
  target: InteractionTarget,
  handler: (event: PointerEvent) => void,
  options: UseTapOptions = {}
): UseTapReturn {
  const { threshold = 10 } = options

  const isTapping = shallowRef(false)

  let startX = 0
  let startY = 0

  useEventListener(target, 'pointerdown', (e: PointerEvent) => {
    startX = e.clientX
    startY = e.clientY
    isTapping.value = true
  })

  useEventListener(target, 'pointerup', (e: PointerEvent) => {
    if (!isTapping.value) return
    isTapping.value = false

    const dx = e.clientX - startX
    const dy = e.clientY - startY
    if (Math.sqrt(dx * dx + dy * dy) <= threshold) {
      handler(e)
    }
  })

  // Cancel if pointer leaves element or is cancelled
  useEventListener(target, 'pointercancel', () => {
    isTapping.value = false
  })

  useEventListener(target, 'pointerleave', () => {
    isTapping.value = false
  })

  return { isTapping }
}
