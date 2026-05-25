import { expect, test, type BrowserContext, type Page } from '@playwright/test'
import { loginAsAdmin, waitForAppReady, waitForRuntimeLoadingIdle } from './helpers/app'

interface SidebarDashboardDiagnostics {
  route: {
    path: string
    name: string | null
    fullPath: string
    activeMenu: string | null
  } | null
  dashboardModelItem: {
    key: string | null
    routePath: string | null
    routeName: string | null
  } | null
  dashboardDistance: number | null
  dashboardDom: {
    state: string | null
    className: string
    menuKey: string | null
    backgroundColor: string
    color: string
  } | null
  headerDashboardDom: {
    state: string | null
    className: string
    menuKey: string | null
    backgroundColor: string
    color: string
  } | null
}

const dashboardSidebarItemSelector =
  '[data-layout-sidebar="true"] a.admin-sidebar-menu__item[href$="#/dashboard"]'
const dashboardHeaderItemSelector =
  '[data-layout-header="true"] a[href$="#/dashboard"][data-menu-state]'
const TRANSPARENT_BACKGROUND = 'rgba(0, 0, 0, 0)'
const INACTIVE_TEXT_COLOR = 'rgb(51, 51, 51)'

async function snapshotDashboardDiagnostics(page: Page): Promise<SidebarDashboardDiagnostics> {
  return page.evaluate(async () => {
    const app = document.querySelector('#app')
    const vueApp = app && (app as typeof app & { __vue_app__?: unknown }).__vue_app__
    const globalProperties = (vueApp as { config?: { globalProperties?: Record<string, unknown> } })
      ?.config?.globalProperties
    const router = globalProperties?.$router as
      | {
          currentRoute?: {
            value?: {
              path?: string
              name?: unknown
              fullPath?: string
              meta?: { activeMenu?: unknown }
            }
          }
        }
      | undefined

    const route = router?.currentRoute?.value
    const helper = await import('/src/router/utils/helper.ts')

    const menuModel = helper
      .getAdminMenuTree()
      .map((item: MenuItem) =>
        helper.menuItemToPrimeModel(item, (key: string): string => key)
      ) as Array<{
      key?: string
      route?: { path?: string; name?: string }
      items?: Array<unknown>
    }>

    const queue = [...menuModel]
    let dashboardModelItem: {
      key: string | null
      routePath: string | null
      routeName: string | null
      items?: Array<unknown>
    } | null = null

    while (queue.length > 0) {
      const candidate = queue.shift()
      if (!candidate) continue
      const routePath = typeof candidate.route?.path === 'string' ? candidate.route.path : null
      if (routePath === '/dashboard') {
        dashboardModelItem = {
          key: typeof candidate.key === 'string' ? candidate.key : null,
          routePath,
          routeName: typeof candidate.route?.name === 'string' ? candidate.route.name : null,
        }
        break
      }
      if (Array.isArray(candidate.items) && candidate.items.length > 0) {
        queue.push(...(candidate.items as Array<typeof candidate>))
      }
    }

    const dashboardNode = document.querySelector(
      '[data-layout-sidebar="true"] a.admin-sidebar-menu__item[href$="#/dashboard"]'
    )
    const headerDashboardNode = document.querySelector(
      '[data-layout-header="true"] a[href$="#/dashboard"][data-menu-state]'
    )

    const dashboardDistance =
      route && dashboardModelItem
        ? helper.getActiveDistance(
            route as import('vue-router').RouteLocationNormalized,
            {
              key: dashboardModelItem.key ?? '/dashboard',
              route: {
                path: dashboardModelItem.routePath ?? '/dashboard',
                name: dashboardModelItem.routeName ?? undefined,
              },
            } as unknown as import('/src/router/utils/helper.ts').PrimeMenuModelItem
          )
        : null

    return {
      route:
        route && typeof route.path === 'string'
          ? {
              path: route.path,
              name: typeof route.name === 'string' ? route.name : null,
              fullPath: typeof route.fullPath === 'string' ? route.fullPath : '',
              activeMenu: typeof route.meta?.activeMenu === 'string' ? route.meta.activeMenu : null,
            }
          : null,
      dashboardModelItem: dashboardModelItem
        ? {
            key: dashboardModelItem.key,
            routePath: dashboardModelItem.routePath,
            routeName: dashboardModelItem.routeName,
          }
        : null,
      dashboardDistance,
      dashboardDom: dashboardNode
        ? {
            state: dashboardNode.getAttribute('data-menu-state'),
            className: dashboardNode.className,
            menuKey: dashboardNode.getAttribute('data-menu-key'),
            backgroundColor: getComputedStyle(dashboardNode).backgroundColor,
            color: getComputedStyle(dashboardNode).color,
          }
        : null,
      headerDashboardDom: headerDashboardNode
        ? {
            state: headerDashboardNode.getAttribute('data-menu-state'),
            className: headerDashboardNode.className,
            menuKey: headerDashboardNode.getAttribute('data-menu-key'),
            backgroundColor: getComputedStyle(headerDashboardNode).backgroundColor,
            color: getComputedStyle(headerDashboardNode).color,
          }
        : null,
    }
  })
}

async function loginAndExtractStorageState(page: Page): Promise<{
  cookies: BrowserContext['storageState'] extends () => Promise<infer R>
    ? R extends { cookies: infer C }
      ? C
      : never
    : never
  origins: BrowserContext['storageState'] extends () => Promise<infer R>
    ? R extends { origins: infer O }
      ? O
      : never
    : never
}> {
  await loginAsAdmin(page)
  return page.context().storageState()
}

test.describe('sidebar route/menu first-paint synchronization', () => {
  test('direct first load /#/dashboard resolves sidebar dashboard item active', async ({
    browser,
    page,
  }) => {
    const storageState = await loginAndExtractStorageState(page)

    const directContext = await browser.newContext({ storageState })
    const directPage = await directContext.newPage()
    await directPage.goto('/?e2e=visual#/dashboard', { waitUntil: 'domcontentloaded' })
    await waitForAppReady(directPage)
    await waitForRuntimeLoadingIdle(directPage)
    await expect(directPage.locator('#dashboard-page')).toBeVisible()

    const dashboardItem = directPage.locator(dashboardSidebarItemSelector)
    await expect(dashboardItem).toBeVisible()
    await expect(dashboardItem).toHaveAttribute('data-menu-state', 'active')
    await expect(dashboardItem).not.toHaveCSS('background-color', TRANSPARENT_BACKGROUND)
    await expect(dashboardItem).not.toHaveCSS('color', INACTIVE_TEXT_COLOR)

    const diagnostics = await snapshotDashboardDiagnostics(directPage)
    expect(diagnostics.route).toMatchObject({
      path: '/dashboard',
      name: 'Dashboard',
      fullPath: '/dashboard',
    })
    expect(diagnostics.dashboardModelItem).toMatchObject({
      key: '/dashboard',
      routePath: '/dashboard',
      routeName: 'Dashboard',
    })
    expect(diagnostics.dashboardDistance).toBe(0)
    expect(diagnostics.dashboardDom?.state).toBe('active')
    expect(diagnostics.dashboardDom?.backgroundColor).not.toBe(TRANSPARENT_BACKGROUND)
    expect(diagnostics.dashboardDom?.color).not.toBe(INACTIVE_TEXT_COLOR)

    const headerDashboardItem = directPage.locator(dashboardHeaderItemSelector)
    if ((await headerDashboardItem.count()) > 0) {
      await expect(headerDashboardItem).toHaveAttribute('data-menu-state', 'active')
      await expect(headerDashboardItem).not.toHaveCSS('background-color', TRANSPARENT_BACKGROUND)
      await expect(headerDashboardItem).not.toHaveCSS('color', INACTIVE_TEXT_COLOR)
      expect(diagnostics.headerDashboardDom?.state).toBe('active')
      expect(diagnostics.headerDashboardDom?.backgroundColor).not.toBe(TRANSPARENT_BACKGROUND)
      expect(diagnostics.headerDashboardDom?.color).not.toBe(INACTIVE_TEXT_COLOR)
    }

    await directContext.close()
  })

  test('navigate away and back keeps dashboard sidebar active and synchronized', async ({
    page,
  }) => {
    await loginAsAdmin(page)

    await page.goto('/?e2e=visual#/example/system-states', { waitUntil: 'domcontentloaded' })
    await waitForAppReady(page)
    await waitForRuntimeLoadingIdle(page)
    await expect(page).toHaveURL(/#\/example\/system-states$/)

    const dashboardItem = page.locator(dashboardSidebarItemSelector)
    await expect(dashboardItem).toBeVisible()
    await dashboardItem.click()

    await expect(page).toHaveURL(/#\/dashboard$/)
    await waitForRuntimeLoadingIdle(page)
    await expect(page.locator('#dashboard-page')).toBeVisible()
    await expect(dashboardItem).toHaveAttribute('data-menu-state', 'active')
    await expect(dashboardItem).not.toHaveCSS('background-color', TRANSPARENT_BACKGROUND)
    await expect(dashboardItem).not.toHaveCSS('color', INACTIVE_TEXT_COLOR)

    const diagnostics = await snapshotDashboardDiagnostics(page)
    expect(diagnostics.dashboardDistance).toBe(0)
    expect(diagnostics.dashboardDom?.state).toBe('active')
    expect(diagnostics.dashboardDom?.backgroundColor).not.toBe(TRANSPARENT_BACKGROUND)
    expect(diagnostics.dashboardDom?.color).not.toBe(INACTIVE_TEXT_COLOR)
  })
})
