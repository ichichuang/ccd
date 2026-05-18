// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('@/utils/lodashes', () => ({
  debounceFn: <T extends (...args: never[]) => unknown>(fn: T, _ms: number): T => fn,
}))
vi.mock('@/utils/mitt', () => ({
  useMitt: () => ({ emit: vi.fn() }),
}))

describe('useDeviceStore', () => {
  let useDeviceStore: typeof import('./device').useDeviceStore

  beforeEach(async () => {
    vi.resetModules()
    vi.clearAllMocks()
    setActivePinia(createPinia())

    Object.defineProperty(window, 'innerWidth', { value: 1920, configurable: true, writable: true })
    Object.defineProperty(window, 'innerHeight', {
      value: 1080,
      configurable: true,
      writable: true,
    })
    Object.defineProperty(window, 'devicePixelRatio', {
      value: 1,
      configurable: true,
      writable: true,
    })
    Object.defineProperty(window, 'screen', {
      value: { width: 1920, height: 1080 },
      configurable: true,
    })

    const mod = await import('./device')
    useDeviceStore = mod.useDeviceStore
  })

  describe('updateBreakpoint - width-to-breakpoint mapping', () => {
    it('resolves xs for width 480', () => {
      const store = useDeviceStore()
      store.width = 480
      store.updateBreakpoint()
      expect(store.currentBreakpoint).toBe('xs')
    })

    it('resolves sm for width 640', () => {
      const store = useDeviceStore()
      store.width = 640
      store.updateBreakpoint()
      expect(store.currentBreakpoint).toBe('sm')
    })

    it('resolves xl for width 1280', () => {
      const store = useDeviceStore()
      store.width = 1280
      store.updateBreakpoint()
      expect(store.currentBreakpoint).toBe('xl')
    })

    it('resolves 5xl for width 3840', () => {
      const store = useDeviceStore()
      store.width = 3840
      store.updateBreakpoint()
      expect(store.currentBreakpoint).toBe('5xl')
    })
  })

  describe('layout getters', () => {
    it('isMobileLayout when type is Mobile', () => {
      const store = useDeviceStore()
      store.type = 'Mobile'
      store.currentBreakpoint = 'xl'
      expect(store.isMobileLayout).toBe(true)
    })

    it('isMobileLayout when breakpoint is narrow regardless of type', () => {
      const store = useDeviceStore()
      store.type = 'PC'
      store.currentBreakpoint = 'sm'
      expect(store.isMobileLayout).toBe(true)
    })

    it('isTabletLayout when type is Tablet and breakpoint is wide', () => {
      const store = useDeviceStore()
      store.type = 'Tablet'
      store.currentBreakpoint = 'xl'
      expect(store.isTabletLayout).toBe(true)
    })

    it('isPCLayout when type is PC and breakpoint is wide', () => {
      const store = useDeviceStore()
      store.type = 'PC'
      store.currentBreakpoint = 'xl'
      expect(store.isPCLayout).toBe(true)
    })
  })

  describe('initHardwareInfo', () => {
    it('parses UA and sets type', () => {
      const store = useDeviceStore()
      store.initHardwareInfo()
      expect(['PC', 'Mobile', 'Tablet']).toContain(store.type)
    })
  })

  describe('detectViewportInfo', () => {
    it('updates width, height, and orientation', () => {
      const store = useDeviceStore()
      Object.defineProperty(window, 'innerWidth', { value: 1920, configurable: true })
      Object.defineProperty(window, 'innerHeight', { value: 1080, configurable: true })

      store.detectViewportInfo()

      expect(store.width).toBe(1920)
      expect(store.height).toBe(1080)
      expect(store.orientation).toBe('horizontal')
    })
  })
})
