// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('@/infra/router/routeProvider', () => ({
  getRouterCapabilities: () => ({
    getAdminMenuTree: vi.fn(() => [
      { path: '/dashboard', children: [] },
      { path: '/settings', children: [] },
    ]),
    getFlatRouteList: vi.fn(() => [
      { name: 'Dashboard', path: '/dashboard', meta: { title: 'Dashboard' } },
      { name: 'Settings', path: '/settings', meta: { title: 'Settings' } },
      {
        name: 'Fullscreen',
        path: '/fullscreen',
        meta: { title: 'Fullscreen', parent: 'fullscreen' },
      },
      { name: 'Hidden', path: '/hidden', meta: { title: 'Hidden', hiddenTag: true } },
    ]),
  }),
}))
vi.mock('@ccd/shared-utils', () => ({
  generateIdFromKey: (key: string) => `id-${key}`,
  deepClone: (v: unknown) => JSON.parse(JSON.stringify(v)),
}))
vi.mock('@/utils/safeStorage/piniaSerializer', () => ({
  createPiniaEncryptedSerializer: () => ({
    serialize: (v: unknown) => JSON.stringify(v),
    deserialize: (v: string) => JSON.parse(v),
  }),
}))
vi.mock('@/stores', async () => {
  const pinia = await import('pinia')
  return { default: pinia.createPinia() }
})

describe('usePermissionStore', () => {
  let usePermissionStore: typeof import('./permission').usePermissionStore

  beforeEach(async () => {
    vi.resetModules()
    setActivePinia(createPinia())
    const mod = await import('./permission')
    usePermissionStore = mod.usePermissionStore
  })

  describe('addTab', () => {
    it('adds a tab for a valid route in admin menu', () => {
      const store = usePermissionStore()
      store.addTab('Dashboard')
      expect(store.tabs).toHaveLength(1)
      expect(store.tabs[0].name).toBe('Dashboard')
    })

    it('deduplicates by name', () => {
      const store = usePermissionStore()
      store.addTab('Dashboard')
      store.addTab('Dashboard')
      expect(store.tabs).toHaveLength(1)
    })

    it('filters out fullscreen parent routes', () => {
      const store = usePermissionStore()
      store.addTab('Fullscreen')
      expect(store.tabs).toHaveLength(0)
    })

    it('filters out hiddenTag routes', () => {
      const store = usePermissionStore()
      store.addTab('Hidden')
      expect(store.tabs).toHaveLength(0)
    })
  })

  describe('registerWindow / markWindowClosed', () => {
    it('creates window metadata and returns key', () => {
      const store = usePermissionStore()
      const key = store.registerWindow('Dashboard', {}, '/dashboard')
      expect(key).toBeTruthy()
      expect(store.windows).toHaveLength(1)
      expect(store.windows[0].routeName).toBe('Dashboard')
      expect(store.windows[0].isOpen).toBe(true)
    })

    it('updates existing window on re-register', () => {
      const store = usePermissionStore()
      const key1 = store.registerWindow('Dashboard', {}, '/dashboard')
      const key2 = store.registerWindow('Dashboard', {}, '/dashboard?v=2')
      expect(key1).toBe(key2)
      expect(store.windows).toHaveLength(1)
      expect(store.windows[0].url).toBe('/dashboard?v=2')
    })

    it('marks window as closed', () => {
      const store = usePermissionStore()
      const key = store.registerWindow('Dashboard', {}, '/dashboard')
      store.markWindowClosed(key)
      expect(store.windows[0].isOpen).toBe(false)
    })
  })

  describe('cleanupOldWindows', () => {
    it('removes closed windows older than maxAge', () => {
      const store = usePermissionStore()
      const key = store.registerWindow('Dashboard', {}, '/dashboard')
      store.markWindowClosed(key)
      store.windows[0].openedAt = Date.now() - 8 * 24 * 60 * 60 * 1000

      store.cleanupOldWindows()

      expect(store.windows).toHaveLength(0)
    })

    it('keeps open windows regardless of age', () => {
      const store = usePermissionStore()
      store.registerWindow('Dashboard', {}, '/dashboard')
      store.windows[0].openedAt = Date.now() - 8 * 24 * 60 * 60 * 1000

      store.cleanupOldWindows()

      expect(store.windows).toHaveLength(1)
    })
  })

  describe('reset', () => {
    it('clears all state', () => {
      const store = usePermissionStore()
      store.addTab('Dashboard')
      store.registerWindow('Dashboard', {}, '/dashboard')

      store.reset()

      expect(store.tabs).toHaveLength(0)
      expect(store.windows).toHaveLength(0)
      expect(store.staticRoutes).toHaveLength(0)
      expect(store.dynamicRoutes).toHaveLength(0)
      expect(store.isDynamicRoutesLoaded).toBe(false)
    })
  })
})
