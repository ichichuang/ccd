import type { MaybeRefOrGetter, Ref, ShallowRef } from 'vue'
import type { UseSwipeDirection } from '@vueuse/core'

// ---------------------------------------------------------------------------
// Shared
// ---------------------------------------------------------------------------

/** Element target accepted by all interaction composables */
export type InteractionTarget = MaybeRefOrGetter<HTMLElement | null | undefined>

/** Cardinal swipe direction (excludes VueUse's 'none') */
export type SwipeDirection = Exclude<UseSwipeDirection, 'none'>

// ---------------------------------------------------------------------------
// useTap
// ---------------------------------------------------------------------------

export interface UseTapOptions {
  /**
   * Maximum movement threshold (px) before a tap is cancelled.
   * @default 10
   */
  threshold?: number
}

export interface UseTapReturn {
  /** Whether a tap is in progress (pointer down, not yet moved past threshold) */
  isTapping: Readonly<ShallowRef<boolean>>
}

// ---------------------------------------------------------------------------
// useSwipeAction
// ---------------------------------------------------------------------------

export interface UseSwipeActionOptions {
  /**
   * Minimum distance (px) to register a swipe.
   * @default 50
   */
  threshold?: number
  /**
   * Filter which directions to listen for. Default: all four.
   */
  directions?: SwipeDirection[]
  /**
   * Disable text selection during swipe.
   * @default false
   */
  disableTextSelect?: boolean
}

export interface UseSwipeActionReturn {
  /** Whether a swipe gesture is in progress */
  isSwiping: Readonly<ShallowRef<boolean>>
  /** Detected direction once threshold is crossed */
  direction: Readonly<ShallowRef<SwipeDirection | null>>
  /** Current horizontal displacement */
  distanceX: Readonly<Ref<number>>
  /** Current vertical displacement */
  distanceY: Readonly<Ref<number>>
  /** Stop listening for swipes */
  stop: () => void
}

// ---------------------------------------------------------------------------
// useDragAction
// ---------------------------------------------------------------------------

export interface UseDragActionOptions {
  /** Initial position */
  initialValue?: { x: number; y: number }
  /**
   * Only start dragging when clicking the element directly (not children).
   * @default false
   */
  exact?: boolean
  /** Callback on drag end */
  onEnd?: (position: { x: number; y: number }, event: PointerEvent) => void
}

export interface UseDragActionReturn {
  /** Current x position */
  x: Ref<number>
  /** Current y position */
  y: Ref<number>
  /** Computed CSS transform style string */
  style: Readonly<Ref<string>>
  /** Whether currently being dragged */
  isDragging: Readonly<Ref<boolean>>
}

// ---------------------------------------------------------------------------
// useLongPressAction
// ---------------------------------------------------------------------------

export interface UseLongPressActionOptions {
  /**
   * Delay in ms before long press fires.
   * @default 500
   */
  delay?: number
  /**
   * Maximum movement distance (px) before cancelling.
   * @default 10
   */
  distanceThreshold?: number
}

export interface UseLongPressActionReturn {
  /** Whether the long-press timer is counting down */
  isPressing: Readonly<ShallowRef<boolean>>
}

// ---------------------------------------------------------------------------
// useInteraction (unified facade)
// ---------------------------------------------------------------------------

export interface UseInteractionReturn {
  tap: (
    target: InteractionTarget,
    handler: (event: PointerEvent) => void,
    options?: UseTapOptions
  ) => UseTapReturn

  swipe: (
    target: InteractionTarget,
    handler: (direction: SwipeDirection) => void,
    options?: UseSwipeActionOptions
  ) => UseSwipeActionReturn

  drag: (target: InteractionTarget, options?: UseDragActionOptions) => UseDragActionReturn

  longPress: (
    target: InteractionTarget,
    handler: (event: PointerEvent) => void,
    options?: UseLongPressActionOptions
  ) => UseLongPressActionReturn
}
