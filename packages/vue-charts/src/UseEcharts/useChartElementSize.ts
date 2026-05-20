import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { Ref } from 'vue'

export interface UseChartElementSizeReturn {
  width: Ref<number>
  height: Ref<number>
}

export function useChartElementSize(
  targetRef: Ref<HTMLElement | null | undefined>,
  callback?: (entry: DOMRectReadOnly) => void
): UseChartElementSizeReturn {
  const width = ref(0)
  const height = ref(0)
  let observer: ResizeObserver | null = null
  let timeoutId: ReturnType<typeof globalThis.setTimeout> | null = null

  const clearPending = () => {
    if (timeoutId !== null) {
      globalThis.clearTimeout(timeoutId)
      timeoutId = null
    }
  }

  const run = (entry: DOMRectReadOnly) => {
    width.value = entry.width
    height.value = entry.height
    callback?.(entry)
  }

  const schedule = (entry: DOMRectReadOnly) => {
    clearPending()
    timeoutId = globalThis.setTimeout(() => {
      timeoutId = null
      run(entry)
    }, 150)
  }

  const teardownObserver = () => {
    observer?.disconnect()
    observer = null
    clearPending()
  }

  const setupObserver = (el: HTMLElement) => {
    const rect = el.getBoundingClientRect()
    width.value = rect.width
    height.value = rect.height

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
