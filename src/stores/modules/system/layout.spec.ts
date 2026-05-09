// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

// Mock dependencies that the store imports at module level
vi.mock('@/stores', async () => {
  const pinia = await import('pinia')
  return { default: pinia.createPinia() }
})

vi.mock('@/stores/modules/system/device', () => ({
  useDeviceStore: () => ({
    type: 'PC',
    currentBreakpoint: 'xl',
  }),
}))

vi.mock('@/utils/safeStorage/piniaSerializer', () => ({
  createPiniaEncryptedSerializer: () => ({
    serialize: (v: unknown) => JSON.stringify(v),
    deserialize: (v: string) => JSON.parse(v),
  }),
}))

describe('useLayoutStore — MODULE_DEPENDENCIES state machine', () => {
  let useLayoutStore: typeof import('./layout').useLayoutStore

  beforeEach(async () => {
    vi.resetModules()
    const pinia = createPinia()
    setActivePinia(pinia)

    // Dynamic import after resetModules to get fresh module
    const mod = await import('./layout')
    useLayoutStore = mod.useLayoutStore
  })

  describe('setModuleVisible — parent-child cascade', () => {
    it('closing showHeader caches and hides showLogo + showMenu', () => {
      const store = useLayoutStore()
      // Ensure initial state: header is on, logo and menu are on (vertical defaults)
      store.visibilitySettings.vertical.showHeader = true
      store.visibilitySettings.vertical.showLogo = true
      store.visibilitySettings.vertical.showMenu = true

      store.setModuleVisible('showHeader', false, 'vertical')

      expect(store.visibilitySettings.vertical.showHeader).toBe(false)
      expect(store.visibilitySettings.vertical.showLogo).toBe(false)
      expect(store.visibilitySettings.vertical.showMenu).toBe(false)
      // Cache should exist
      expect(store.moduleRestoreCache.vertical.showHeader).toEqual({
        showLogo: true,
        showMenu: true,
      })
    })

    it('re-opening showHeader restores cached children', () => {
      const store = useLayoutStore()
      store.visibilitySettings.vertical.showHeader = true
      store.visibilitySettings.vertical.showLogo = true
      store.visibilitySettings.vertical.showMenu = false

      // Close header (caches logo=true, menu=false)
      store.setModuleVisible('showHeader', false, 'vertical')
      expect(store.moduleRestoreCache.vertical.showHeader).toBeDefined()

      // Re-open header
      store.setModuleVisible('showHeader', true, 'vertical')

      expect(store.visibilitySettings.vertical.showHeader).toBe(true)
      expect(store.visibilitySettings.vertical.showLogo).toBe(true)
      expect(store.visibilitySettings.vertical.showMenu).toBe(false)
      // Cache should be cleared
      expect(store.moduleRestoreCache.vertical.showHeader).toBeUndefined()
    })

    it('closing showBreadcrumb caches and hides showBreadcrumbIcon', () => {
      const store = useLayoutStore()
      store.visibilitySettings.vertical.showBreadcrumb = true
      store.visibilitySettings.vertical.showBreadcrumbIcon = true

      store.setModuleVisible('showBreadcrumb', false, 'vertical')

      expect(store.visibilitySettings.vertical.showBreadcrumb).toBe(false)
      expect(store.visibilitySettings.vertical.showBreadcrumbIcon).toBe(false)
      expect(store.moduleRestoreCache.vertical.showBreadcrumb).toEqual({
        showBreadcrumbIcon: true,
      })
    })

    it('closing a child does not affect parent or sibling', () => {
      const store = useLayoutStore()
      store.visibilitySettings.mix.showHeader = true
      store.visibilitySettings.mix.showLogo = true
      store.visibilitySettings.mix.showMenu = true

      store.setModuleVisible('showLogo', false, 'mix')

      expect(store.visibilitySettings.mix.showHeader).toBe(true)
      expect(store.visibilitySettings.mix.showMenu).toBe(true)
      expect(store.visibilitySettings.mix.showLogo).toBe(false)
    })

    it('opening a child when parent is closed auto-enables parent', () => {
      const store = useLayoutStore()
      store.visibilitySettings.vertical.showHeader = false
      store.visibilitySettings.vertical.showLogo = false

      store.setModuleVisible('showLogo', true, 'vertical')

      expect(store.visibilitySettings.vertical.showHeader).toBe(true)
      expect(store.visibilitySettings.vertical.showLogo).toBe(true)
    })
  })

  describe('setModuleVisible — mode constraints', () => {
    it('vertical mode forces showMenu to false', () => {
      const store = useLayoutStore()
      store.visibilitySettings.vertical.showMenu = true

      store.setModuleVisible('showMenu', true, 'vertical')

      expect(store.visibilitySettings.vertical.showMenu).toBe(false)
    })

    it('horizontal mode forces showSidebar to false', () => {
      const store = useLayoutStore()
      store.visibilitySettings.horizontal.showSidebar = true

      store.setModuleVisible('showSidebar', true, 'horizontal')

      expect(store.visibilitySettings.horizontal.showSidebar).toBe(false)
    })

    it('mix mode does not force any module off', () => {
      const store = useLayoutStore()
      store.visibilitySettings.mix.showMenu = true
      store.visibilitySettings.mix.showSidebar = true

      store.setModuleVisible('showMenu', true, 'mix')
      store.setModuleVisible('showSidebar', true, 'mix')

      expect(store.visibilitySettings.mix.showMenu).toBe(true)
      expect(store.visibilitySettings.mix.showSidebar).toBe(true)
    })
  })

  describe('moduleRestoreCache — per-mode isolation', () => {
    it('cache is per-mode: closing in vertical does not affect horizontal', () => {
      const store = useLayoutStore()
      store.visibilitySettings.vertical.showHeader = true
      store.visibilitySettings.vertical.showLogo = true
      store.visibilitySettings.horizontal.showHeader = true
      store.visibilitySettings.horizontal.showLogo = true

      store.setModuleVisible('showHeader', false, 'vertical')

      expect(store.moduleRestoreCache.vertical.showHeader).toBeDefined()
      expect(store.moduleRestoreCache.horizontal.showHeader).toBeUndefined()
      expect(store.visibilitySettings.horizontal.showLogo).toBe(true)
    })
  })

  describe('enforceParentRequirements', () => {
    it('child with false parent is forced to false', () => {
      const store = useLayoutStore()
      // Manually set child true while parent is false
      store.visibilitySettings.vertical.showHeader = false
      store.visibilitySettings.vertical.showLogo = true

      // Trigger constraint enforcement
      store.setModuleVisible('showTabs', true, 'vertical')

      // showLogo should have been forced false because showHeader is false
      expect(store.visibilitySettings.vertical.showLogo).toBe(false)
    })

    it('child with true parent is preserved', () => {
      const store = useLayoutStore()
      store.visibilitySettings.vertical.showHeader = true
      store.visibilitySettings.vertical.showLogo = true

      store.setModuleVisible('showTabs', true, 'vertical')

      expect(store.visibilitySettings.vertical.showLogo).toBe(true)
    })
  })

  describe('toggleModuleVisible', () => {
    it('toggles from current state', () => {
      const store = useLayoutStore()
      store.visibilitySettings.vertical.showTabs = true

      store.toggleModuleVisible('showTabs')
      expect(store.visibilitySettings.vertical.showTabs).toBe(false)

      store.toggleModuleVisible('showTabs')
      expect(store.visibilitySettings.vertical.showTabs).toBe(true)
    })
  })

  describe('resetSetting — loading counter preservation', () => {
    it('preserves loadingCount and pageLoadingCount', () => {
      const store = useLayoutStore()
      store.beginGlobalLoading()
      store.beginGlobalLoading()
      store.beginPageLoading()

      expect(store.loadingCount).toBe(3) // 1 initial + 2 begins
      expect(store.pageLoadingCount).toBe(1)

      store.resetSetting()

      expect(store.loadingCount).toBe(3)
      expect(store.pageLoadingCount).toBe(1)
      expect(store.isLoading).toBe(true)
      expect(store.isPageLoading).toBe(true)
    })

    it('clears moduleRestoreCache', () => {
      const store = useLayoutStore()
      store.visibilitySettings.vertical.showHeader = true
      store.visibilitySettings.vertical.showLogo = true
      store.setModuleVisible('showHeader', false, 'vertical')

      expect(store.moduleRestoreCache.vertical.showHeader).toBeDefined()

      store.resetSetting()

      expect(store.moduleRestoreCache.vertical).toEqual({})
      expect(store.moduleRestoreCache.horizontal).toEqual({})
      expect(store.moduleRestoreCache.mix).toEqual({})
    })

    it('resets userAdjusted to false', () => {
      const store = useLayoutStore()
      store.markUserAdjusted()
      expect(store.userAdjusted).toBe(true)

      store.resetSetting()
      expect(store.userAdjusted).toBe(false)
    })
  })

  describe('loading counter semantics', () => {
    it('beginGlobalLoading increments, endGlobalLoading decrements', () => {
      const store = useLayoutStore()
      // Initial loadingCount is 1 (from default state)
      const initial = store.loadingCount

      store.beginGlobalLoading()
      expect(store.loadingCount).toBe(initial + 1)
      expect(store.isLoading).toBe(true)

      store.endGlobalLoading()
      expect(store.loadingCount).toBe(initial)

      store.endGlobalLoading()
      expect(store.loadingCount).toBe(initial - 1)
    })

    it('endGlobalLoading does not go below 0', () => {
      const store = useLayoutStore()
      store.loadingCount = 0

      store.endGlobalLoading()
      expect(store.loadingCount).toBe(0)
      expect(store.isLoading).toBe(false)
    })

    it('concurrent begin/end maintains correct count', () => {
      const store = useLayoutStore()
      store.loadingCount = 0

      store.beginGlobalLoading()
      store.beginGlobalLoading()
      store.beginGlobalLoading()
      expect(store.loadingCount).toBe(3)

      store.endGlobalLoading()
      expect(store.loadingCount).toBe(2)
      expect(store.isLoading).toBe(true)

      store.endGlobalLoading()
      store.endGlobalLoading()
      expect(store.loadingCount).toBe(0)
      expect(store.isLoading).toBe(false)
    })
  })

  describe('setPreferredMode', () => {
    it('updates preferredMode and enforces constraints', () => {
      const store = useLayoutStore()
      store.setPreferredMode('horizontal')

      expect(store.preferredMode).toBe('horizontal')
      // horizontal mode should enforce showSidebar = false
      expect(store.visibilitySettings.horizontal.showSidebar).toBe(false)
    })

    it('marks userAdjusted', () => {
      const store = useLayoutStore()
      store.userAdjusted = false

      store.setPreferredMode('mix')
      expect(store.userAdjusted).toBe(true)
    })
  })
})
