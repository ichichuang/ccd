import { useTap } from './useTap'
import { useSwipeAction } from './useSwipeAction'
import { useDragAction } from './useDragAction'
import { useLongPressAction } from './useLongPressAction'
import type { UseInteractionReturn } from './types'

/**
 * Unified interaction facade.
 *
 * Returns all four interaction composables as a single object
 * for convenient one-import usage in components.
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * const cardRef = ref<HTMLElement | null>(null)
 * const { tap, swipe, longPress } = useInteraction()
 *
 * tap(cardRef, () => emit('select'))
 * swipe(cardRef, (dir) => { if (dir === 'left') emit('dismiss') })
 * longPress(cardRef, () => emit('context'))
 * </script>
 * ```
 */
export function useInteraction(): UseInteractionReturn {
  return {
    tap: useTap,
    swipe: useSwipeAction,
    drag: useDragAction,
    longPress: useLongPressAction,
  }
}
