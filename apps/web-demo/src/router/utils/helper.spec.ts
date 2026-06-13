// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest'

const routerState = vi.hoisted(() => ({
  currentRoute: { value: { name: 'Dashboard' as string | undefined } },
  routes: [] as RouteConfig[],
  push: vi.fn(),
}))

const permissionStore = vi.hoisted(() => ({
  registerWindow: vi.fn(),
  markWindowClosed: vi.fn(),
}))

const logger = vi.hoisted(() => ({
  warn: vi.fn(),
  error: vi.fn(),
}))

vi.mock('@ccd/shared-utils', () => ({
  generateIdFromKey: (key: string) => `window-${key}`,
}))

vi.mock('@/adapters/logger.adapter', () => ({
  appLogger: logger,
}))

vi.mock('@/router', () => ({
  default: {
    currentRoute: routerState.currentRoute,
    getRoutes: () => routerState.routes,
    push: routerState.push,
  },
  routeUtils: {
    flatRoutes: [],
    menuTree: [],
    getAdminMenuTree: () => [],
  },
}))

vi.mock('@/stores/modules/session', () => ({
  usePermissionStore: () => permissionStore,
}))

function createRouteWindow(): Window {
  return {
    closed: false,
    name: '',
    focus: vi.fn(),
    addEventListener: vi.fn(),
  } as unknown as Window
}

describe('goToRoute window reuse', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.resetModules()
    vi.unstubAllEnvs()
    vi.stubEnv('VITE_ROUTER_MODE', 'hash')
    vi.stubEnv('VITE_PUBLIC_PATH', '/')
    vi.stubEnv('VITE_ROOT_REDIRECT', '/dashboard')

    routerState.currentRoute.value.name = 'Dashboard'
    routerState.routes = []
    routerState.push.mockReset()
    permissionStore.registerWindow.mockReset()
    permissionStore.markWindowClosed.mockReset()
    logger.warn.mockReset()
    logger.error.mockReset()
  })

  it('opens a reusable route with a stable window target and focuses it on repeat', async () => {
    routerState.routes = [
      {
        name: 'ReuseDemo',
        path: '/architecture/governance/reuse-window',
        component: vi.fn(),
        meta: { parent: 'fullscreen', reuseWindow: true },
      },
    ]
    const openedWindow = createRouteWindow()
    const openSpy = vi.spyOn(window, 'open').mockReturnValue(openedWindow)
    const { goToRoute } = await import('./helper')

    goToRoute('ReuseDemo')

    expect(openSpy).toHaveBeenCalledTimes(1)
    expect(openSpy.mock.calls[0]?.[1]).toBe('window-ReuseDemo:{}')
    expect(openSpy.mock.calls[0]?.[1]).not.toBe('_blank')
    expect(permissionStore.registerWindow).toHaveBeenCalledWith(
      'ReuseDemo',
      undefined,
      expect.stringContaining('_windowKey=window-ReuseDemo%3A%7B%7D')
    )

    goToRoute('ReuseDemo')

    expect(openSpy).toHaveBeenCalledTimes(1)
    expect(openedWindow.focus).toHaveBeenCalledTimes(1)
    expect(permissionStore.registerWindow).toHaveBeenCalledTimes(1)
  })

  it('keeps non-reusable new-window routes on _blank', async () => {
    routerState.routes = [
      {
        name: 'FullscreenDemo',
        path: '/architecture/governance/fullscreen',
        component: vi.fn(),
        meta: { parent: 'fullscreen' },
      },
    ]
    const openSpy = vi.spyOn(window, 'open').mockReturnValue(createRouteWindow())
    const { goToRoute } = await import('./helper')

    goToRoute('FullscreenDemo')

    expect(openSpy).toHaveBeenCalledTimes(1)
    expect(openSpy.mock.calls[0]?.[1]).toBe('_blank')
  })
})
