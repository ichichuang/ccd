import { onLongPress, useEventListener } from '@vueuse/core'
import { computed, shallowRef, toValue } from 'vue'
import type {
  InteractionTarget,
  UseLongPressActionOptions,
  UseLongPressActionReturn,
} from './types'

/**
 * Long-press detection based on PointerEvents.
 *
 * Wraps VueUse's `onLongPress`, adding a reactive `isPressing` state
 * to indicate the timer countdown is active.
 */
export function useLongPressAction(
  target: InteractionTarget,
  handler: (event: PointerEvent) => void,
  options: UseLongPressActionOptions = {}
): UseLongPressActionReturn {
  const { delay = 500, distanceThreshold = 10 } = options

  const isPressing = shallowRef(false)

  const el = computed(() => toValue(target) ?? null)

  onLongPress(el, handler, {
    delay,
    distanceThreshold,
    modifiers: { prevent: true },
  })

  // Track pressing state for UI feedback
  useEventListener(target, 'pointerdown', () => {
    isPressing.value = true
  })

  useEventListener(target, 'pointerup', () => {
    isPressing.value = false
  })

  useEventListener(target, 'pointercancel', () => {
    isPressing.value = false
  })

  useEventListener(target, 'pointerleave', () => {
    isPressing.value = false
  })

  return { isPressing }
}
