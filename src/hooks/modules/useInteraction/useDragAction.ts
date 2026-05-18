import { useDraggable } from '@vueuse/core'
import type { InteractionTarget, UseDragActionOptions, UseDragActionReturn } from './types'

/**
 * Element dragging based on PointerEvents.
 *
 * Wraps VueUse's `useDraggable` with a simplified option surface.
 * Bind the returned `style` directly to the element for positioning.
 */
export function useDragAction(
  target: InteractionTarget,
  options: UseDragActionOptions = {}
): UseDragActionReturn {
  const { initialValue = { x: 0, y: 0 }, exact = false, onEnd } = options

  const draggable = useDraggable(target, {
    initialValue,
    exact,
    onEnd: onEnd ? (pos, e) => onEnd({ x: pos.x, y: pos.y }, e) : undefined,
  })

  return {
    x: draggable.x,
    y: draggable.y,
    style: draggable.style,
    isDragging: draggable.isDragging,
  }
}
