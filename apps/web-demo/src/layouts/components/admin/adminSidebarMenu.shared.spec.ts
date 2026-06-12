import { describe, expect, it } from 'vitest'
import { buildExpandedKeysForRoute, buildSidebarRouteSyncStamp } from './adminSidebarMenu.shared'

type MockRoute = {
  path: string
  fullPath: string
  meta?: {
    activeMenu?: string
    parentPaths?: string[]
  }
}

function toRoute(route: MockRoute) {
  return route as unknown as import('vue-router').RouteLocationNormalizedLoadedGeneric
}

describe('adminSidebarMenu.shared route sync helpers', () => {
  it('builds expanded keys from parentPaths and keeps only latest root when multiple is disabled', () => {
    const route = toRoute({
      path: '/architecture/governance',
      fullPath: '/architecture/governance',
      meta: {
        parentPaths: ['/architecture', '/architecture/governance'],
      },
    })

    expect(buildExpandedKeysForRoute(route, true, ['/architecture', '/dashboard'])).toEqual({
      '/architecture': true,
      '/architecture/governance': true,
    })

    expect(buildExpandedKeysForRoute(route, false, ['/architecture', '/dashboard'])).toEqual({
      '/architecture': true,
      '/architecture/governance': true,
      '/dashboard': false,
    })
  })

  it('returns empty expanded keys when parentPaths is missing', () => {
    const route = toRoute({
      path: '/dashboard',
      fullPath: '/dashboard',
      meta: {},
    })

    expect(buildExpandedKeysForRoute(route, true, ['/dashboard'])).toEqual({})
  })

  it('includes activeMenu and parentPaths in sync stamp', () => {
    const baseRoute = toRoute({
      path: '/dashboard',
      fullPath: '/dashboard',
      meta: {
        parentPaths: ['/root'],
      },
    })
    const activeMenuRoute = toRoute({
      path: '/dashboard/metrics',
      fullPath: '/dashboard/metrics?tab=a',
      meta: {
        activeMenu: '/dashboard',
        parentPaths: ['/root', '/dashboard'],
      },
    })

    const baseStamp = buildSidebarRouteSyncStamp(baseRoute)
    const activeMenuStamp = buildSidebarRouteSyncStamp(activeMenuRoute)

    expect(baseStamp).not.toEqual(activeMenuStamp)
    expect(activeMenuStamp).toContain('/dashboard')
    expect(activeMenuStamp).toContain('/root>/dashboard')
  })
})
