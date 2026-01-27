// src/composables/useElementSize.ts
import { debounce, throttle } from '@/common/modules/lodashes'
export interface UseElementSizeOptions {
  mode?: 'throttle' | 'debounce' | 'none'
  delay?: number
}

/**
 * 监听容器尺寸变化，返回 reactive 的 width/height，同时可选 callback
 * - targetRef 为 false 时，默认监听 document.documentElement 尺寸
 */
export function useElementSize(
  targetRef: Ref<HTMLElement | HTMLDivElement | null> | false,
  callback?: (entry: DOMRectReadOnly) => void,
  options: UseElementSizeOptions = {}
) {
  const width: Ref<number> = ref(0)
  const height: Ref<number> = ref(0)

  const { mode = 'none', delay = 200 } = options

  let observer: ResizeObserver | null = null
  let handler:
    | (((entry: DOMRectReadOnly) => void) & { cancel?: () => void; flush?: () => void })
    | null = null

  const run = (entry: DOMRectReadOnly) => {
    width.value = entry.width
    height.value = entry.height
    callback?.(entry)
  }

  const createHandler = () => {
    if (mode === 'debounce') {
      return debounce(run, delay) as typeof handler
    }
    if (mode === 'throttle') {
      return throttle(run, delay) as typeof handler
    }
    return ((e: DOMRectReadOnly) => run(e)) as typeof handler
  }

  const cancelHandler = () => {
    handler?.cancel?.()
    handler = null
  }

  const setupObserver = (el: HTMLElement) => {
    const rect = el.getBoundingClientRect()
    width.value = rect.width
    height.value = rect.height

    handler = createHandler()
    observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        if (entry.target === el) {
          handler!(entry.contentRect)
        }
      }
    })
    observer.observe(el)
  }

  const teardownObserver = () => {
    observer?.disconnect()
    observer = null
    cancelHandler()
  }

  onMounted(() => {
    if (targetRef === false) {
      // 直接监听 document.documentElement
      setupObserver(document.documentElement)
    } else {
      watch(
        targetRef,
        el => {
          teardownObserver()
          if (el) {
            setupObserver(el)
          }
        },
        { immediate: true }
      )
    }
  })

  onBeforeUnmount(() => {
    teardownObserver()
  })

  return { width, height }
}
