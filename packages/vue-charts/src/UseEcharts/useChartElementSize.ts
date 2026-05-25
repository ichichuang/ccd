import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { Ref } from 'vue'
import { getStableElementSize } from './echarts-render-core'

export interface UseChartElementSizeReturn {
  width: Ref<number>
  height: Ref<number>
}

export function normalizeChartSizeValue(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return 0
  return value
}

export function toNormalizedContentRect(
  rect: Pick<DOMRectReadOnly, 'width' | 'height'>
): DOMRectReadOnly {
  return {
    width: normalizeChartSizeValue(rect.width),
    height: normalizeChartSizeValue(rect.height),
  } as DOMRectReadOnly
}

export function createRafCoalescer(
  run: (entry: DOMRectReadOnly) => void,
  requestAnimationFrameImpl: typeof globalThis.requestAnimationFrame = globalThis.requestAnimationFrame,
  cancelAnimationFrameImpl: typeof globalThis.cancelAnimationFrame = globalThis.cancelAnimationFrame
): {
  schedule: (entry: DOMRectReadOnly) => void
  cancel: () => void
} {
  let rafId: number | null = null
  let pendingEntry: DOMRectReadOnly | null = null

  const cancel = () => {
    if (rafId !== null) {
      cancelAnimationFrameImpl(rafId)
      rafId = null
    }
    pendingEntry = null
  }

  const schedule = (entry: DOMRectReadOnly) => {
    pendingEntry = entry
    if (rafId !== null) return

    rafId = requestAnimationFrameImpl(() => {
      rafId = null
      const nextEntry = pendingEntry
      pendingEntry = null
      if (!nextEntry) return
      run(nextEntry)
    })
  }

  return { schedule, cancel }
}

export function useChartElementSize(
  targetRef: Ref<HTMLElement | null | undefined>,
  callback?: (entry: DOMRectReadOnly) => void
): UseChartElementSizeReturn {
  const width = ref(0)
  const height = ref(0)
  let observer: ResizeObserver | null = null
  const { schedule, cancel } = createRafCoalescer(entry => run(entry))

  const run = (entry: DOMRectReadOnly) => {
    const normalized = toNormalizedContentRect(entry)

    width.value = normalized.width
    height.value = normalized.height
    callback?.(normalized)
  }

  const teardownObserver = () => {
    observer?.disconnect()
    observer = null
    cancel()
  }

  const setupObserver = (el: HTMLElement) => {
    const stableSize = getStableElementSize(el)
    width.value = stableSize?.width ?? 0
    height.value = stableSize?.height ?? 0

    if (typeof ResizeObserver === 'undefined') return

    observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        if (entry.target === el) {
          schedule(entry.contentRect)
        }
      }
    })
    observer.observe(el)
  }

  onMounted(() => {
    watch(
      targetRef,
      (el: HTMLElement | null | undefined) => {
        teardownObserver()
        if (el instanceof HTMLElement) {
          setupObserver(el)
        }
      },
      { immediate: true }
    )
  })

  onBeforeUnmount(() => {
    teardownObserver()
  })

  return { width, height }
}
