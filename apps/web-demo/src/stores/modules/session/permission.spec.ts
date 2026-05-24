// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import * as routeProvider from '@/infra/router/routeProvider'

const dashboardRoute = {
  name: 'Dashboard',
  path: '/dashboard',
  component: vi.fn(),
  meta: {
    titleKey: 'router.dashboard.dashboard',
    title: 'Dashboard',
    icon: 'i-lucide-layout-dashboard',
    fixedTag: true,
  },
}

const settingsRoute = {
  name: 'Settings',
  path: '/settings',
  component: vi.fn(),
  meta: { title: 'Settings' },
}

const flatRoutes: RouteConfig[] = [
  dashboardRoute,
  settingsRoute,
  {
    name: 'FixedHidden',
    path: '/fixed-hidden',
    component: vi.fn(),
    meta: { title: 'Hidden', fixedTag: true, hiddenTag: true },
  },
  {
    name: 'FixedFullscreen',
    path: '/fixed-fullscreen',
    component: vi.fn(),
    meta: { title: 'Fullscreen', fixedTag: true, parent: 'fullscreen' },
  },
  {
    name: 'FixedRatio',
    path: '/fixed-ratio',
    component: vi.fn(),
    meta: { title: 'Ratio', fixedTag: true, parent: 'ratio' },
  },
  { name: 'InvalidPath', path: '', component: vi.fn(), meta: { title: 'Invalid', fixedTag: true } },
  { path: '/invalid-name', component: vi.fn(), meta: { title: 'Invalid', fixedTag: true } },
  {
    name: 'RedirectOnly',
    path: '/redirect-only',
    redirect: '/dashboard',
    meta: { title: 'Redirect', fixedTag: true },
  },
  {
    name: 'Fallback',
    path: '/fallback',
    component: vi.fn(),
    meta: { title: 'Fallback', fixedTag: true, useFallbackComponent: true },
  },
  {
    name: 'AdminOnly',
    path: '/admin-only',
    component: vi.fn(),
    meta: { title: 'Admin Only', fixedTag: true, roles: ['admin'] },
  },
]

vi.mock('@/infra/router/routeProvider', () => ({
  getRouterCapabilities: vi.fn(() => ({
    getAdminMenuTree: vi.fn(() => [
      { path: '/dashboard', children: [] },
      { path: '/settings', children: [] },
    ]),
    getFlatRouteList: vi.fn(() => flatRoutes),
  })),
  isRouterCapabilitiesInstalled: vi.fn(() => true),
}))
vi.mock('@ccd/shared-utils', () => ({
  generateIdFromKey: (key: string) => `id-${key}`,
  deepClone: (v: unknown) => JSON.parse(JSON.stringify(v)),
}))
vi.mock('@/stores/modules/session/user', () => ({
  useUserStoreWithOut: () => ({ userInfo: { roles: ['user'], permissions: [] } }),
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
    vi.mocked(routeProvider.isRouterCapabilitiesInstalled).mockReturnValue(true)
    vi.mocked(routeProvider.getRouterCapabilities).mockImplementation(() => ({
      getAdminMenuTree: vi.fn(() => [
        { path: '/dashboard', title: 'Dashboard', showLink: true, rank: 0, children: [] },
        { path: '/settings', title: 'Settings', showLink: true, rank: 1, children: [] },
      ]),
      getFlatRouteList: vi.fn(() => flatRoutes),
    }))
    setActivePinia(createPinia())
    const mod = await import('./permission')
    usePermissionStore = mod.usePermissionStore
  })

  describe('fixed admin tabs', () => {
    it('seeds dashboard before first visited non-dashboard admin route', () => {
      const store = usePermissionStore()
      store.addTab('Settings')

      expect(store.tabs.map(tab => tab.path)).toEqual(['/dashboard', '/settings'])
      expect(store.tabs[0]).toMatchObject({ fixed: true, deletable: false })
    })

    it('does not remove dashboard via removeTab', () => {
      const store = usePermissionStore()
      store.ensureFixedTabs()
      store.removeTab('/dashboard')

      expect(store.tabs.map(tab => tab.path)).toContain('/dashboard')
    })

    it('keeps dashboard via clearTabs', () => {
      const store = usePermissionStore()
      store.addTab('Settings')
      store.clearTabs()

      expect(store.tabs.map(tab => tab.path)).toEqual(['/dashboard'])
    })

    it('keeps dashboard via removeTabsExcept([])', () => {
      const store = usePermissionStore()
      store.addTab('Settings')
      store.removeTabsExcept([])

      expect(store.tabs.map(tab => tab.path)).toEqual(['/dashboard'])
    })

    it('keeps dashboard via removeTabsByIndexRange()', () => {
      const store = usePermissionStore()
      store.addTab('Settings')
      store.removeTabsByIndexRange(0, 10)

      expect(store.tabs.map(tab => tab.path)).toEqual(['/dashboard'])
    })

    it('does not create hiddenTag, fullscreen, ratio, redirect-only, fallback, or unauthorized fixed tabs', () => {
      const store = usePermissionStore()
      store.ensureFixedTabs()

      expect(store.tabs.map(tab => tab.path)).toEqual(['/dashboard'])
    })

    it('repairs persisted tabs missing dashboard', () => {
      const store = usePermissionStore()
      store.tabs = [
        {
          name: 'Settings',
          path: '/settings',
          title: 'Settings',
          label: '',
          active: false,
          fixed: false,
          deletable: true,
        },
      ]

      store.ensureFixedTabs()

      expect(store.tabs.map(tab => tab.path)).toEqual(['/dashboard', '/settings'])
    })

    it('normalizes persisted fixed tabs before regular tabs', () => {
      const store = usePermissionStore()
      store.tabs = [
        {
          name: 'Settings',
          path: '/settings',
          title: 'Settings',
          label: '',
          active: false,
          fixed: false,
          deletable: true,
        },
        {
          name: 'Dashboard',
          path: '/dashboard',
          title: 'Dashboard',
          label: '',
          active: true,
          fixed: true,
          deletable: false,
        },
      ]

      store.ensureFixedTabs()

      expect(store.tabs.map(tab => tab.path)).toEqual(['/dashboard', '/settings'])
      expect(store.tabs[0]).toMatchObject({ fixed: true, deletable: false, active: true })
    })

    it('does not let reorderTabs move fixed tabs behind regular tabs', () => {
      const store = usePermissionStore()
      store.addTab('Settings')
      store.reorderTabs(0, 1)

      expect(store.tabs.map(tab => tab.path)).toEqual(['/dashboard', '/settings'])
    })

    it('sanitizes stale and duplicate persisted tabs', () => {
      const store = usePermissionStore()
      store.tabs = [
        {
          name: 'Missing',
          path: '/missing',
          title: 'Missing',
          label: '',
          active: false,
          fixed: false,
          deletable: true,
        },
        {
          name: 'AdminOnly',
          path: '/admin-only',
          title: 'Admin Only',
          label: '',
          active: false,
          fixed: true,
          deletable: false,
        },
        {
          name: 'Settings',
          path: '/settings',
          title: 'Old Settings',
          label: '',
          active: false,
          fixed: true,
          deletable: false,
        },
        {
          name: 'Settings',
          path: '/settings',
          title: 'Duplicate Settings',
          label: '',
          active: false,
          fixed: false,
          deletable: true,
        },
      ]

      store.ensureFixedTabs()

      expect(store.tabs.map(tab => tab.path)).toEqual(['/dashboard', '/settings'])
      expect(store.tabs.find(tab => tab.path === '/settings')).toMatchObject({
        title: 'Settings',
        fixed: false,
        deletable: true,
      })
    })

    it('migrates legacy persisted tabs missing fixed/deletable fields', () => {
      const store = usePermissionStore()
      store.tabs = [
        {
          name: 'Settings',
          path: '/settings',
          title: 'Settings',
          label: '',
          active: false,
        } as TabItem,
      ]

      store.ensureFixedTabs()

      expect(store.tabs.find(tab => tab.path === '/settings')).toMatchObject({
        fixed: false,
        deletable: true,
      })
    })

    it('does not throw before router capabilities are installed', () => {
      const store = usePermissionStore()
      vi.mocked(routeProvider.isRouterCapabilitiesInstalled).mockReturnValue(false)
      vi.mocked(routeProvider.getRouterCapabilities).mockImplementation(() => {
        throw new Error('missing capabilities')
      })

      expect(() => store.ensureFixedTabs()).not.toThrow()
      expect(() => store.addTab('Settings')).not.toThrow()
    })

    it('refreshes stale fixed tab metadata from route meta', () => {
      const store = usePermissionStore()
      store.tabs = [
        {
          name: 'OldDashboard',
          path: '/dashboard',
          titleKey: 'old.key',
          title: 'Old',
          label: '',
          active: false,
          icon: 'old-icon',
          fixed: false,
          deletable: true,
        },
      ]

      store.ensureFixedTabs()

      expect(store.tabs[0]).toMatchObject({
        name: 'Dashboard',
        path: '/dashboard',
        titleKey: 'router.dashboard.dashboard',
        title: 'Dashboard',
        icon: 'i-lucide-layout-dashboard',
        fixed: true,
        deletable: false,
      })
    })

    it('keeps fixedTag as the only protection source during tab meta updates', () => {
      const store = usePermissionStore()
      store.addTab('Settings')

      store.updateTabMeta('Settings', { fixed: true })
      store.updateTabMeta('Dashboard', { fixed: false, deletable: true })

      expect(store.tabs.find(tab => tab.path === '/dashboard')).toMatchObject({
        fixed: true,
        deletable: false,
      })
      expect(store.tabs.find(tab => tab.path === '/settings')).toMatchObject({
        fixed: false,
        deletable: true,
      })
    })

    it('keeps fixedTag as the only protection source during single-property updates', () => {
      const store = usePermissionStore()
      store.addTab('Settings')

      store.updateTabProperty('Dashboard', { property: 'fixed', value: false })
      store.updateTabProperty('Dashboard', { property: 'deletable', value: true })
      store.updateTabProperty('Settings', { property: 'fixed', value: true })

      expect(store.tabs.find(tab => tab.path === '/dashboard')).toMatchObject({
        fixed: true,
        deletable: false,
      })
      expect(store.tabs.find(tab => tab.path === '/settings')).toMatchObject({
        fixed: false,
        deletable: true,
      })
    })
  })

  describe('addTab', () => {
    it('adds a tab for a valid route in admin menu', () => {
      const store = usePermissionStore()
      store.addTab('Settings')
      expect(store.tabs.map(tab => tab.name)).toEqual(['Dashboard', 'Settings'])
    })

    it('deduplicates by name', () => {
      const store = usePermissionStore()
      store.addTab('Dashboard')
      store.addTab('Dashboard')
      expect(store.tabs).toHaveLength(1)
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
