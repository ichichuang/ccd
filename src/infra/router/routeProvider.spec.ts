import { beforeEach, describe, expect, it } from 'vitest'
import {
  getRouterCapabilities,
  installRouterCapabilities,
  isRouterCapabilitiesInstalled,
  resetRouterCapabilitiesForTest,
} from './routeProvider'
import type { RouterCapabilities } from './routeProvider'

describe('router capabilities provider', () => {
  beforeEach(() => {
    resetRouterCapabilitiesForTest()
  })

  it('fails fast before capabilities are installed', () => {
    expect(isRouterCapabilitiesInstalled()).toBe(false)
    expect(() => getRouterCapabilities()).toThrow('Router capabilities are not installed')
  })

  it('reads capabilities through the installed bridge', () => {
    const menuTree: MenuItem[] = [
      { path: '/dashboard', title: 'Dashboard', showLink: true, rank: 1 },
    ]
    const flatRoutes: RouteConfig[] = [{ path: '/dashboard', name: 'Dashboard' }]

    installRouterCapabilities({
      getAdminMenuTree: () => menuTree,
      getFlatRouteList: () => flatRoutes,
    })

    expect(isRouterCapabilitiesInstalled()).toBe(true)
    expect(getRouterCapabilities().getAdminMenuTree()).toBe(menuTree)
    expect(getRouterCapabilities().getFlatRouteList()).toBe(flatRoutes)
  })

  it('rejects incomplete capability objects', () => {
    expect(() =>
      installRouterCapabilities({
        getAdminMenuTree: () => [],
        getFlatRouteList: undefined as unknown as RouterCapabilities['getFlatRouteList'],
      })
    ).toThrow('getFlatRouteList must be a function')
  })
})
