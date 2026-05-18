import { usePointerSwipe } from '@vueuse/core'
import type {
  InteractionTarget,
  SwipeDirection,
  UseSwipeActionOptions,
  UseSwipeActionReturn,
} from './types'

/**
 * Swipe detection based on PointerEvents (unified mouse + touch + pen).
 *
 * Wraps VueUse's `usePointerSwipe`, adding direction filtering
 * and a simplified callback API.
 */
export function useSwipeAction(
  target: InteractionTarget,
  handler: (direction: SwipeDirection) => void,
  options: UseSwipeActionOptions = {}
): UseSwipeActionReturn {
  const { threshold = 50, directions, disableTextSelect = false } = options

  const direction = shallowRef<SwipeDirection | null>(null)

  const swipe = usePointerSwipe(target, {
    threshold,
    disableTextSelect,
    onSwipeEnd(_e, dir) {
      if (dir === 'none') return
      // Filter by allowed directions if specified
      if (directions && !directions.includes(dir)) return
      direction.value = dir
      handler(dir)
    },
  })

  // Reset direction when swipe starts
  watch(swipe.isSwiping, swiping => {
    if (swiping) direction.value = null
  })

  return {
    isSwiping: swipe.isSwiping,
    direction,
    distanceX: swipe.distanceX,
    distanceY: swipe.distanceY,
    stop: swipe.stop,
  }
}
