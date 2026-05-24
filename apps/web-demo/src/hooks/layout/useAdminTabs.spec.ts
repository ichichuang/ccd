// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import * as routeProvider from '@/infra/router/routeProvider'

const routeState = vi.hoisted(() => ({ path: '/settings', query: {} as Record<string, string> }))
const routerPush = vi.hoisted(() => vi.fn())
const routerReplace = vi.hoisted(() => vi.fn())

vi.mock('vue-router', () => ({
  useRoute: () => routeState,
  useRouter: () => ({ push: routerPush, replace: routerReplace }),
}))
vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key: string) => key }),
}))
vi.mock('@ccd/vue-hooks', () => ({
  useAppElementSize: vi.fn(),
}))
vi.mock('@/infra/router/routeProvider', () => ({
  getRouterCapabilities: vi.fn(() => ({
    getAdminMenuTree: vi.fn(() => [
      { path: '/dashboard', children: [] },
      { path: '/settings', children: [] },
      { path: '/reports', children: [] },
    ]),
    getFlatRouteList: vi.fn(() => [
      {
        name: 'Dashboard',
        path: '/dashboard',
        component: vi.fn(),
        meta: { title: 'Dashboard', fixedTag: true },
      },
      { name: 'Settings', path: '/settings', component: vi.fn(), meta: { title: 'Settings' } },
      { name: 'Reports', path: '/reports', component: vi.fn(), meta: { title: 'Reports' } },
    ]),
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

describe('useAdminTabs', () => {
  let useAdminTabs: typeof import('./useAdminTabs').useAdminTabs
  let usePermissionStore: typeof import('@/stores/modules/session/permission').usePermissionStore

  beforeEach(async () => {
    vi.resetModules()
    vi.mocked(routeProvider.isRouterCapabilitiesInstalled).mockReturnValue(true)
    vi.mocked(routeProvider.getRouterCapabilities).mockImplementation(() => ({
      getAdminMenuTree: vi.fn(() => [
        { path: '/dashboard', title: 'Dashboard', showLink: true, rank: 0, children: [] },
        { path: '/settings', title: 'Settings', showLink: true, rank: 1, children: [] },
        { path: '/reports', title: 'Reports', showLink: true, rank: 2, children: [] },
      ]),
      getFlatRouteList: vi.fn(() => [
        {
          name: 'Dashboard',
          path: '/dashboard',
          component: vi.fn(),
          meta: { title: 'Dashboard', fixedTag: true },
        },
        { name: 'Settings', path: '/settings', component: vi.fn(), meta: { title: 'Settings' } },
        { name: 'Reports', path: '/reports', component: vi.fn(), meta: { title: 'Reports' } },
      ]),
    }))
    routerPush.mockReset()
    routerReplace.mockReset()
    routeState.path = '/settings'
    routeState.query = {}
    setActivePinia(createPinia())
    useAdminTabs = (await import('./useAdminTabs')).useAdminTabs
    usePermissionStore = (await import('@/stores/modules/session/permission')).usePermissionStore
  })

  it('closeAll keeps dashboard and navigates to dashboard when current tab was closed', () => {
    const store = usePermissionStore()
    store.addTab('Settings')
    routeState.path = '/settings'
    const tabs = useAdminTabs()

    tabs.contextMenu.value.targetPath = '/settings'
    tabs.handleContextAction('closeAll')

    expect(store.tabs.map(tab => tab.path)).toEqual(['/dashboard'])
    expect(routerPush).toHaveBeenCalledWith('/dashboard')
  })

  it('closeOthers keeps dashboard plus target tab', () => {
    const store = usePermissionStore()
    store.addTab('Settings')
    store.addTab('Reports')
    routeState.path = '/reports'
    const tabs = useAdminTabs()

    tabs.contextMenu.value.targetPath = '/settings'
    tabs.handleContextAction('closeOthers')

    expect(store.tabs.map(tab => tab.path)).toEqual(['/dashboard', '/settings'])
    expect(routerPush).toHaveBeenCalledWith('/settings')
  })

  it('close current fixed tab is a no-op', () => {
    const store = usePermissionStore()
    store.ensureFixedTabs()
    routeState.path = '/dashboard'
    const tabs = useAdminTabs()
    const dashboard = store.tabs.find(tab => tab.path === '/dashboard')!

    tabs.onCloseTab(undefined, dashboard)

    expect(store.tabs.map(tab => tab.path)).toEqual(['/dashboard'])
    expect(routerPush).not.toHaveBeenCalled()
  })

  it('closeAll safely falls back when no fixed tabs are eligible', () => {
    const store = usePermissionStore()
    vi.mocked(routeProvider.isRouterCapabilitiesInstalled).mockReturnValue(false)
    store.tabs = [
      {
        name: 'Settings',
        path: '/settings',
        title: 'Settings',
        label: '',
        active: true,
        fixed: false,
        deletable: true,
      },
    ]
    routeState.path = '/settings'
    const tabs = useAdminTabs()

    tabs.contextMenu.value.targetPath = '/settings'
    tabs.handleContextAction('closeAll')

    expect(store.tabs).toEqual([])
    expect(routerPush).toHaveBeenCalledWith('/dashboard')
  })
})
