import { describe, expect, it } from 'vitest'
import {
  calculatePageTitle,
  formatPageTitle,
  getDeferredRouteTitleSource,
  shouldDeferRouteTitle,
} from './usePageTitle'
import type { RouteLocationNormalized } from 'vue-router'

const t = (key: string): string =>
  key === 'router.error.notFound'
    ? '页面未找到'
    : key === 'router.dashboard.dashboard'
      ? '仪表盘'
      : key

function createRoute(input: Partial<RouteLocationNormalized>): RouteLocationNormalized {
  return {
    path: '/',
    fullPath: '/',
    query: {},
    hash: '',
    name: undefined,
    params: {},
    matched: [],
    meta: {},
    redirectedFrom: undefined,
    ...input,
  } as RouteLocationNormalized
}

describe('route title stability', () => {
  it('defers transient 404 titles while dynamic routes are not loaded', () => {
    const route = createRoute({
      path: '/404',
      meta: { titleKey: 'router.error.notFound' },
      redirectedFrom: createRoute({ path: '/dashboard', name: 'Dashboard' }),
    })

    expect(shouldDeferRouteTitle(route, false)).toBe(true)
    const source = getDeferredRouteTitleSource(route)

    expect(source?.name).toBe('Dashboard')
    expect(source ? calculatePageTitle(source, 'CCD', t) : '').toBe('CCD')
  })

  it('keeps the last stable browser title for transient direct-entry 404 before routes load', () => {
    const route = createRoute({
      path: '/404',
      meta: { titleKey: 'router.error.notFound' },
    })

    expect(shouldDeferRouteTitle(route, false)).toBe(true)
    expect(getDeferredRouteTitleSource(route)).toBeUndefined()
  })

  it('does not defer real 404 titles after dynamic routes are loaded', () => {
    const route = createRoute({
      path: '/404',
      meta: { titleKey: 'router.error.notFound' },
      redirectedFrom: createRoute({ path: '/missing', name: undefined }),
    })

    expect(shouldDeferRouteTitle(route, true)).toBe(false)
    expect(calculatePageTitle(route, 'CCD', t)).toBe('页面未找到 - CCD')
  })

  it('uses route meta titles and normalized app title casing', () => {
    const route = createRoute({
      path: '/dashboard',
      name: 'Dashboard',
      meta: { titleKey: 'router.dashboard.dashboard' },
    })

    expect(calculatePageTitle(route, 'ccd', t)).toBe('仪表盘 - CCD')
  })

  it('does not expose internal route names or empty separators', () => {
    expect(formatPageTitle(undefined)).toBe('CCD')
    expect(formatPageTitle('')).toBe('CCD')
    expect(formatPageTitle('CatchAll')).toBe('CCD')
    expect(formatPageTitle('NotFound')).toBe('CCD')
    expect(formatPageTitle('dashboard/index')).toBe('CCD')
    expect(formatPageTitle('CCD')).toBe('CCD')
    expect(formatPageTitle('PrimeVue 概览')).toBe('PrimeVue 概览 - CCD')
  })
})
