import { expect, test, type BrowserContext, type Locator, type Page } from '@playwright/test'
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
  dashboardRowDom: {
    state: string | null
    className: string
    backgroundColor: string
    color: string
    width: number
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
const dashboardSidebarRowSelector =
  '[data-layout-sidebar="true"] .admin-sidebar-menu__visual-row:has(a.admin-sidebar-menu__item[href$="#/dashboard"])'
const dashboardHeaderContentSelector =
  '[data-layout-sidebar="true"] .p-panelmenu-header-content:has(a.admin-sidebar-menu__item[href$="#/dashboard"])'
const dashboardHeaderItemSelector =
  '[data-layout-header="true"] a[href$="#/dashboard"][data-menu-state]'
const primeVueOverviewSidebarItemSelector =
  '[data-layout-sidebar="true"] a.admin-sidebar-menu__item[href*="/example/primevue-collection/overview"]'
const primeVueOverviewRowSelector =
  '[data-layout-sidebar="true"] .admin-sidebar-menu__visual-row:has(a.admin-sidebar-menu__item[href*="/example/primevue-collection/overview"])'
const primeVueOverviewContentSelector =
  '[data-layout-sidebar="true"] .p-panelmenu-item-content:has(a.admin-sidebar-menu__item[href*="/example/primevue-collection/overview"])'
const systemConfigurationHeaderSelector =
  '[data-layout-sidebar="true"] .p-panelmenu-header-content:has-text("系统配置")'
const systemConfigurationRowSelector =
  '[data-layout-sidebar="true"] .admin-sidebar-menu__visual-row--root:has-text("系统配置")'
const collectionRootRowSelector =
  '[data-layout-sidebar="true"] .admin-sidebar-menu__visual-row--root:has-text("组件合集")'
const TRANSPARENT_BACKGROUND = 'rgba(0, 0, 0, 0)'
const INACTIVE_TEXT_COLOR = 'rgb(51, 51, 51)'
const WIDTH_EPSILON = 3

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
    const dashboardRowNode = document.querySelector(
      '[data-layout-sidebar="true"] .admin-sidebar-menu__visual-row:has(a.admin-sidebar-menu__item[href$="#/dashboard"])'
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
      dashboardRowDom: dashboardRowNode
        ? {
            state: dashboardRowNode.getAttribute('data-menu-row-state'),
            className: dashboardRowNode.className,
            backgroundColor: getComputedStyle(dashboardRowNode).backgroundColor,
            color: getComputedStyle(dashboardRowNode).color,
            width: dashboardRowNode.getBoundingClientRect().width,
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

async function expectRowWidthAligned(
  page: Page,
  rowSelector: string,
  containerSelector: string,
  anchorSelector?: string
): Promise<void> {
  const row = page.locator(rowSelector)
  const container = page.locator(containerSelector)
  const anchor = anchorSelector
    ? page.locator(anchorSelector)
    : row.locator('a.admin-sidebar-menu__item')

  const [rowBox, containerBox, anchorBox] = await Promise.all([
    row.boundingBox(),
    container.boundingBox(),
    anchor.boundingBox(),
  ])

  expect(rowBox).not.toBeNull()
  expect(containerBox).not.toBeNull()
  expect(anchorBox).not.toBeNull()
  if (!rowBox || !containerBox || !anchorBox) return

  expect(Math.abs(containerBox.width - rowBox.width)).toBeLessThanOrEqual(WIDTH_EPSILON)
  expect(Math.abs(anchorBox.width - rowBox.width)).toBeLessThanOrEqual(WIDTH_EPSILON)
}

async function getBackgroundColor(locator: Locator): Promise<string> {
  return locator.evaluate(node => getComputedStyle(node).backgroundColor)
}

async function expectHoverSurface(
  visualRow: Locator,
  headerContent: Locator,
  initialRowBackground: string,
  initialHeaderBackground: string
): Promise<void> {
  await expect
    .poll(async () => {
      const [rowBackground, headerBackground] = await Promise.all([
        getBackgroundColor(visualRow),
        getBackgroundColor(headerContent),
      ])

      return (
        rowBackground !== TRANSPARENT_BACKGROUND ||
        headerBackground !== TRANSPARENT_BACKGROUND ||
        rowBackground !== initialRowBackground ||
        headerBackground !== initialHeaderBackground
      )
    })
    .toBe(true)
}

test.describe('sidebar route/menu first-paint synchronization', () => {
  test('direct first load /#/example/primevue-collection/overview keeps route-owned and project active markers aligned', async ({
    browser,
    page,
  }) => {
    const storageState = await loginAndExtractStorageState(page)

    const directContext = await browser.newContext({ storageState })
    const directPage = await directContext.newPage()
    await directPage.goto('/?e2e=visual#/example/primevue-collection/overview', {
      waitUntil: 'domcontentloaded',
    })
    await waitForAppReady(directPage)
    await waitForRuntimeLoadingIdle(directPage)
    await expect(directPage).toHaveURL(/#\/example\/primevue-collection\/overview$/)

    const sidebar = directPage.locator('[data-layout-sidebar="true"]')
    await expect(sidebar).toBeVisible()

    const overviewItem = directPage.locator(primeVueOverviewSidebarItemSelector)
    const overviewRow = directPage.locator(primeVueOverviewRowSelector)
    await expect(overviewItem).toBeVisible()
    await expect(overviewRow).toBeVisible()
    await expect(overviewItem).toHaveAttribute('aria-current', 'page')
    await expect(overviewItem).toHaveAttribute('data-route-active', 'true')
    await expect(overviewItem).toHaveAttribute('data-route-exact-active', 'true')
    await expect(overviewItem).toHaveAttribute('data-menu-state', 'active')
    await expect(overviewRow).toHaveAttribute('data-route-active', 'true')
    await expect(overviewRow).toHaveAttribute('data-route-exact-active', 'true')
    await expect(overviewRow).toHaveAttribute('data-menu-row-state', 'active')
    await expect(overviewRow).not.toHaveCSS('background-color', TRANSPARENT_BACKGROUND)
    await expectRowWidthAligned(
      directPage,
      primeVueOverviewRowSelector,
      primeVueOverviewContentSelector,
      primeVueOverviewSidebarItemSelector
    )

    const collectionRootRow = directPage.locator(collectionRootRowSelector)
    await expect(collectionRootRow).toHaveAttribute('data-menu-row-state', 'ancestor')
    await expect(collectionRootRow).not.toHaveCSS('background-color', TRANSPARENT_BACKGROUND)

    const collectionAncestor = sidebar
      .locator('.admin-sidebar-menu__item[data-menu-state="ancestor"]')
      .filter({ hasText: '组件合集' })
      .first()
    const primeVueAncestor = sidebar
      .locator('.admin-sidebar-menu__item[data-menu-state="ancestor"]')
      .filter({ hasText: 'PrimeVue' })
      .first()

    await expect(collectionAncestor).toBeVisible()
    await expect(primeVueAncestor).toBeVisible()

    const systemConfigurationRow = directPage.locator(systemConfigurationRowSelector)
    await expect(systemConfigurationRow).toBeVisible()
    await systemConfigurationRow.hover()
    await expect(overviewRow).toHaveAttribute('data-menu-row-state', 'active')
    await expect(overviewRow).not.toHaveCSS('background-color', TRANSPARENT_BACKGROUND)

    await directPage.locator('[data-layout-content="true"]').hover()
    await expect(overviewItem).toBeVisible()
    await expect(overviewRow).toBeVisible()
    await expect(overviewItem).toHaveAttribute('aria-current', 'page')
    await expect(overviewItem).toHaveAttribute('data-route-exact-active', 'true')
    await expect(overviewItem).toHaveAttribute('data-menu-state', 'active')
    await expect(overviewRow).toHaveAttribute('data-route-exact-active', 'true')
    await expect(overviewRow).toHaveAttribute('data-menu-row-state', 'active')
    await expect(overviewRow).not.toHaveCSS('background-color', TRANSPARENT_BACKGROUND)

    await directContext.close()
  })

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
    const dashboardRow = directPage.locator(dashboardSidebarRowSelector)
    await expect(dashboardItem).toBeVisible()
    await expect(dashboardRow).toBeVisible()
    await expect(dashboardItem).toHaveAttribute('aria-current', 'page')
    await expect(dashboardItem).toHaveAttribute('data-route-active', 'true')
    await expect(dashboardItem).toHaveAttribute('data-route-exact-active', 'true')
    await expect(dashboardItem).toHaveAttribute('data-menu-state', 'active')
    await expect(dashboardRow).toHaveAttribute('data-route-active', 'true')
    await expect(dashboardRow).toHaveAttribute('data-route-exact-active', 'true')
    await expect(dashboardRow).toHaveAttribute('data-menu-row-state', 'active')
    await expect(dashboardRow).not.toHaveCSS('background-color', TRANSPARENT_BACKGROUND)
    await expect(dashboardItem).not.toHaveCSS('color', INACTIVE_TEXT_COLOR)
    await expectRowWidthAligned(
      directPage,
      dashboardSidebarRowSelector,
      dashboardHeaderContentSelector,
      dashboardSidebarItemSelector
    )

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
    expect(diagnostics.dashboardDom?.color).not.toBe(INACTIVE_TEXT_COLOR)
    expect(diagnostics.dashboardRowDom?.state).toBe('active')
    expect(diagnostics.dashboardRowDom?.backgroundColor).not.toBe(TRANSPARENT_BACKGROUND)

    const systemConfigurationHeader = directPage.locator(systemConfigurationHeaderSelector)
    const systemConfigurationRow = directPage.locator(systemConfigurationRowSelector)
    await expect(systemConfigurationHeader).toBeVisible()
    await expect(systemConfigurationRow).toBeVisible()
    await expect(systemConfigurationRow).toHaveAttribute('data-menu-row-state', 'idle')
    const [systemInitialRowBackground, systemInitialHeaderBackground] = await Promise.all([
      getBackgroundColor(systemConfigurationRow),
      getBackgroundColor(systemConfigurationHeader),
    ])
    await systemConfigurationHeader.hover()
    await expectHoverSurface(
      systemConfigurationRow,
      systemConfigurationHeader,
      systemInitialRowBackground,
      systemInitialHeaderBackground
    )
    await expect(dashboardRow).toHaveAttribute('data-menu-row-state', 'active')
    await expect(dashboardRow).not.toHaveCSS('background-color', TRANSPARENT_BACKGROUND)

    await directPage.locator('[data-layout-content="true"]').hover()
    await expect(dashboardItem).toHaveAttribute('data-route-exact-active', 'true')
    await expect(dashboardItem).toHaveAttribute('data-menu-state', 'active')
    await expect(dashboardRow).toHaveAttribute('data-route-exact-active', 'true')
    await expect(dashboardRow).toHaveAttribute('data-menu-row-state', 'active')
    await expect(dashboardRow).not.toHaveCSS('background-color', TRANSPARENT_BACKGROUND)

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
    await expect(dashboardItem).not.toHaveCSS('color', INACTIVE_TEXT_COLOR)

    const diagnostics = await snapshotDashboardDiagnostics(page)
    expect(diagnostics.dashboardDistance).toBe(0)
    expect(diagnostics.dashboardDom?.state).toBe('active')
    expect(diagnostics.dashboardDom?.color).not.toBe(INACTIVE_TEXT_COLOR)
    expect(diagnostics.dashboardRowDom?.state).toBe('active')
    expect(diagnostics.dashboardRowDom?.backgroundColor).not.toBe(TRANSPARENT_BACKGROUND)
  })
})
