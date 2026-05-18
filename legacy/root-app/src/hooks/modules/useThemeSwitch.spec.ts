// @vitest-environment jsdom
// @vitest-environment-options {"url":"http://localhost/"}

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

interface Deferred<T> {
  promise: Promise<T>
  resolve: (value: T | PromiseLike<T>) => void
}

function createDeferred<T>(): Deferred<T> {
  let resolve!: (value: T | PromiseLike<T>) => void
  const promise = new Promise<T>(res => {
    resolve = res
  })
  return { promise, resolve }
}

function ensureStorage(): Storage {
  if (globalThis.localStorage) return globalThis.localStorage

  const values = new Map<string, string>()
  const storage: Storage = {
    get length() {
      return values.size
    },
    clear: () => values.clear(),
    getItem: (key: string) => values.get(key) ?? null,
    key: (index: number) => Array.from(values.keys())[index] ?? null,
    removeItem: (key: string) => {
      values.delete(key)
    },
    setItem: (key: string, value: string) => {
      values.set(key, value)
    },
  }

  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: storage,
  })

  return storage
}

describe('useThemeSwitch', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.resetModules()

    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })

    Object.defineProperty(globalThis, 'requestAnimationFrame', {
      configurable: true,
      writable: true,
      value: (callback: FrameRequestCallback) => {
        callback(0)
        return 1
      },
    })

    Object.defineProperty(globalThis, 'cancelAnimationFrame', {
      configurable: true,
      writable: true,
      value: vi.fn(),
    })

    ensureStorage().clear()
    document.documentElement.className = ''
    document.documentElement.style.cssText = ''
    document.documentElement.dataset.themeTransitioning = 'false'
    document.documentElement.removeAttribute('data-transition')
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('queues the latest target mode during an active transition and shares animation state', async () => {
    setActivePinia(createPinia())

    const { useThemeStore } = await import('@/stores/modules/system/theme')
    const { useThemeSwitch } = await import('./useThemeSwitch')

    const themeStore = useThemeStore()
    themeStore.setMode('light')

    const first = useThemeSwitch()
    const second = useThemeSwitch()

    const transitions: Array<{
      ready: Deferred<void>
      finished: Deferred<void>
    }> = []

    Object.defineProperty(document, 'startViewTransition', {
      configurable: true,
      value: vi.fn((callback: () => Promise<void> | void) => {
        const transition = {
          ready: createDeferred<void>(),
          finished: createDeferred<void>(),
        }
        transitions.push(transition)

        void Promise.resolve(callback()).then(() => {
          transition.ready.resolve(undefined)
        })

        return {
          ready: transition.ready.promise,
          finished: transition.finished.promise,
        }
      }),
    })

    const firstRun = first.setThemeWithAnimation('dark')
    await Promise.resolve()
    await nextTick()

    expect(themeStore.mode).toBe('dark')
    expect(first.isAnimating.value).toBe(true)
    expect(second.isAnimating.value).toBe(true)
    expect(transitions).toHaveLength(1)

    await second.setThemeWithAnimation('light')
    expect(transitions).toHaveLength(1)

    transitions[0]?.finished.resolve(undefined)
    vi.advanceTimersByTime(100)
    await Promise.resolve()
    await nextTick()

    await vi.waitFor(() => {
      expect(transitions).toHaveLength(2)
    })

    expect(themeStore.mode).toBe('light')
    expect(first.isAnimating.value).toBe(true)
    expect(second.isAnimating.value).toBe(true)

    transitions[1]?.finished.resolve(undefined)
    vi.advanceTimersByTime(100)
    await Promise.resolve()
    await nextTick()
    await firstRun

    await vi.waitFor(() => {
      expect(first.isAnimating.value).toBe(false)
      expect(second.isAnimating.value).toBe(false)
    })

    expect(themeStore.mode).toBe('light')
    expect(document.documentElement.dataset.themeTransitioning).toBe('false')
  })

  it('uses the viewport center for transition variables even when a mouse event is provided', async () => {
    setActivePinia(createPinia())

    const { useThemeStore } = await import('@/stores/modules/system/theme')
    const { useThemeSwitch } = await import('./useThemeSwitch')

    const themeStore = useThemeStore()
    themeStore.setMode('light')

    const themeSwitch = useThemeSwitch()
    const transition = {
      ready: createDeferred<void>(),
      finished: createDeferred<void>(),
    }

    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 1200,
    })
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: 800,
    })
    Object.defineProperty(document, 'startViewTransition', {
      configurable: true,
      value: vi.fn((callback: () => Promise<void> | void) => {
        void Promise.resolve(callback()).then(() => {
          transition.ready.resolve(undefined)
        })

        return {
          ready: transition.ready.promise,
          finished: transition.finished.promise,
        }
      }),
    })

    const run = themeSwitch.setThemeWithAnimation(
      'dark',
      new MouseEvent('click', { clientX: 12, clientY: 34 }),
      'circle'
    )
    await transition.ready.promise
    await nextTick()

    expect(document.documentElement.style.getPropertyValue('--transition-x')).toBe('600px')
    expect(document.documentElement.style.getPropertyValue('--transition-y')).toBe('400px')
    expect(document.documentElement.style.getPropertyValue('--transition-radius')).toBe(
      '721.1102550927978px'
    )

    transition.finished.resolve(undefined)
    await Promise.resolve()
    await nextTick()
    vi.advanceTimersByTime(100)
    await Promise.resolve()
    await run
  })
})
