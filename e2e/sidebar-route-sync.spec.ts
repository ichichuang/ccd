import { expect, test, type Locator, type Page } from '@playwright/test'
import { gotoVisual, waitForAppReady, waitForRuntimeLoadingIdle } from './helpers/app'
import { AUTH_STORAGE_STATE_PATH } from './helpers/authState'

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

interface SidebarShowcaseDiagnostics {
  route: {
    path: string
    name: string | null
    fullPath: string
    activeMenu: string | null
  } | null
  distances: {
    root: number | null
    components: number | null
    proTable: number | null
    proTableBasic: number | null
  }
}

const dashboardSidebarItemSelector =
  '[data-layout-sidebar="true"] a.admin-sidebar-menu__item[href$="#/dashboard"]'
const dashboardSidebarRowSelector =
  '[data-layout-sidebar="true"] .admin-sidebar-menu__visual-row:has(a.admin-sidebar-menu__item[href$="#/dashboard"])'
const dashboardHeaderContentSelector =
  '[data-layout-sidebar="true"] .p-panelmenu-header-content:has(a.admin-sidebar-menu__item[href$="#/dashboard"])'
const dashboardHeaderItemSelector =
  '[data-layout-header="true"] a[href$="#/dashboard"][data-menu-state]'
const primeVueAdapterSidebarItemSelector =
  '[data-layout-sidebar="true"] a.admin-sidebar-menu__item[href*="/ui/primevue-adapter"]'
const primeVueAdapterRowSelector =
  '[data-layout-sidebar="true"] .admin-sidebar-menu__visual-row:has(a.admin-sidebar-menu__item[href*="/ui/primevue-adapter"])'
const primeVueAdapterContentSelector =
  '[data-layout-sidebar="true"] .p-panelmenu-item-content:has(a.admin-sidebar-menu__item[href*="/ui/primevue-adapter"])'
const runtimeStateSidebarItemSelector =
  '[data-layout-sidebar="true"] a.admin-sidebar-menu__item[href$="#/runtime/state"]'
const showcaseProTableBasicSidebarItemSelector =
  '[data-layout-sidebar="true"] a.admin-sidebar-menu__item[href*="/showcase/components/pro-table/basic"]'
const showcaseProTableBasicRowSelector =
  '[data-layout-sidebar="true"] .admin-sidebar-menu__visual-row:has(a.admin-sidebar-menu__item[href*="/showcase/components/pro-table/basic"])'
const showcaseProTableBasicContentSelector =
  '[data-layout-sidebar="true"] .p-panelmenu-item-content:has(a.admin-sidebar-menu__item[href*="/showcase/components/pro-table/basic"])'
const showcaseRootRowSelector =
  '[data-layout-sidebar="true"] .admin-sidebar-menu__visual-row--root:has-text("展示")'
const showcaseComponentsRowSelector =
  '[data-layout-sidebar="true"] .admin-sidebar-menu__visual-row:has-text("组件")'
const showcaseProTableRowSelector =
  '[data-layout-sidebar="true"] .admin-sidebar-menu__visual-row:has([data-menu-label-key="/showcase/components/pro-table"])'
const systemConfigurationHeaderSelector =
  '[data-layout-sidebar="true"] .p-panelmenu-header-content:has-text("系统")'
const systemConfigurationRowSelector =
  '[data-layout-sidebar="true"] .admin-sidebar-menu__visual-row--root:has-text("系统")'
const uiRootRowSelector =
  '[data-layout-sidebar="true"] .admin-sidebar-menu__visual-row--root:has-text("UI")'
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

async function snapshotShowcaseDiagnostics(page: Page): Promise<SidebarShowcaseDiagnostics> {
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

    type MenuModelItem = {
      key?: string
      route?: { path?: string; name?: string }
      items?: MenuModelItem[]
    }

    const menuModel = helper
      .getAdminMenuTree()
      .map((item: MenuItem) =>
        helper.menuItemToPrimeModel(item, (key: string): string => key)
      ) as MenuModelItem[]

    const queue = [...menuModel]
    let rootItem: MenuModelItem | null = null
    let componentsItem: MenuModelItem | null = null
    let proTableItem: MenuModelItem | null = null
    let proTableBasicItem: MenuModelItem | null = null

    while (queue.length > 0) {
      const candidate = queue.shift()
      if (!candidate) continue

      if (candidate.key === '/showcase') rootItem = candidate
      if (candidate.key === '/showcase/components') componentsItem = candidate
      if (candidate.key === '/showcase/components/pro-table') proTableItem = candidate
      if (candidate.route?.path === '/showcase/components/pro-table/basic') {
        proTableBasicItem = candidate
      }
      if (Array.isArray(candidate.items) && candidate.items.length > 0) {
        queue.push(...candidate.items)
      }
    }

    const activeDistance = (item: MenuModelItem | null): number | null =>
      route && item
        ? helper.getActiveDistance(
            route as import('vue-router').RouteLocationNormalized,
            item as import('/src/router/utils/helper.ts').PrimeMenuModelItem
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
      distances: {
        root: activeDistance(rootItem),
        components: activeDistance(componentsItem),
        proTable: activeDistance(proTableItem),
        proTableBasic: activeDistance(proTableBasicItem),
      },
    }
  })
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
  test.use({ storageState: AUTH_STORAGE_STATE_PATH })

  test('direct first load /#/ui/primevue-adapter keeps route-owned and project active markers aligned', async ({
    browser,
  }) => {
    const directContext = await browser.newContext({ storageState: AUTH_STORAGE_STATE_PATH })
    const directPage = await directContext.newPage()
    await directPage.goto('/?e2e=visual#/ui/primevue-adapter', {
      waitUntil: 'domcontentloaded',
    })
    await waitForAppReady(directPage)
    await waitForRuntimeLoadingIdle(directPage)
    await expect(directPage).toHaveURL(/#\/ui\/primevue-adapter$/)

    const sidebar = directPage.locator('[data-layout-sidebar="true"]')
    await expect(sidebar).toBeVisible()

    const overviewItem = directPage.locator(primeVueAdapterSidebarItemSelector)
    const overviewRow = directPage.locator(primeVueAdapterRowSelector)
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
      primeVueAdapterRowSelector,
      primeVueAdapterContentSelector,
      primeVueAdapterSidebarItemSelector
    )

    const uiRootRow = directPage.locator(uiRootRowSelector)
    await expect(uiRootRow).toHaveAttribute('data-menu-row-state', 'ancestor')
    await expect(uiRootRow).not.toHaveCSS('background-color', TRANSPARENT_BACKGROUND)

    const uiAncestor = sidebar
      .locator('.admin-sidebar-menu__item[data-menu-state="ancestor"]')
      .filter({ hasText: 'UI' })
      .first()

    await expect(uiAncestor).toBeVisible()

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
  }) => {
    const directContext = await browser.newContext({ storageState: AUTH_STORAGE_STATE_PATH })
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

  test('direct first load nested showcase route keeps sidebar ancestors and child active', async ({
    browser,
  }) => {
    const directContext = await browser.newContext({ storageState: AUTH_STORAGE_STATE_PATH })
    const directPage = await directContext.newPage()
    await directPage.goto('/?e2e=visual#/showcase/components/pro-table/basic', {
      waitUntil: 'domcontentloaded',
    })
    await waitForAppReady(directPage)
    await waitForRuntimeLoadingIdle(directPage)
    await expect(directPage).toHaveURL(/#\/showcase\/components\/pro-table\/basic$/)

    const sidebar = directPage.locator('[data-layout-sidebar="true"]')
    await expect(sidebar).toBeVisible()

    const showcaseRootRow = directPage.locator(showcaseRootRowSelector)
    const showcaseComponentsRow = directPage.locator(showcaseComponentsRowSelector)
    const showcaseProTableRow = directPage.locator(showcaseProTableRowSelector)
    const proTableBasicItem = directPage.locator(showcaseProTableBasicSidebarItemSelector)
    const proTableBasicRow = directPage.locator(showcaseProTableBasicRowSelector)

    await expect(showcaseRootRow).toBeVisible()
    await expect(showcaseComponentsRow).toBeVisible()
    await expect(showcaseProTableRow).toBeVisible()
    await expect(proTableBasicItem).toBeVisible()
    await expect(proTableBasicRow).toBeVisible()
    await expect(showcaseRootRow).toHaveAttribute('data-menu-row-state', 'ancestor')
    await expect(showcaseComponentsRow).toHaveAttribute('data-menu-row-state', 'ancestor')
    await expect(showcaseProTableRow).toHaveAttribute('data-menu-row-state', 'ancestor')
    await expect(proTableBasicItem).toHaveAttribute('aria-current', 'page')
    await expect(proTableBasicItem).toHaveAttribute('data-route-active', 'true')
    await expect(proTableBasicItem).toHaveAttribute('data-route-exact-active', 'true')
    await expect(proTableBasicItem).toHaveAttribute('data-menu-state', 'active')
    await expect(proTableBasicRow).toHaveAttribute('data-route-active', 'true')
    await expect(proTableBasicRow).toHaveAttribute('data-route-exact-active', 'true')
    await expect(proTableBasicRow).toHaveAttribute('data-menu-row-state', 'active')
    await expect(proTableBasicRow).not.toHaveCSS('background-color', TRANSPARENT_BACKGROUND)
    await expectRowWidthAligned(
      directPage,
      showcaseProTableBasicRowSelector,
      showcaseProTableBasicContentSelector,
      showcaseProTableBasicSidebarItemSelector
    )

    const diagnostics = await snapshotShowcaseDiagnostics(directPage)
    expect(diagnostics.route).toMatchObject({
      path: '/showcase/components/pro-table/basic',
      name: 'ShowcaseComponentsProTableBasic',
      fullPath: '/showcase/components/pro-table/basic',
    })
    expect(diagnostics.distances.proTableBasic).toBe(0)
    expect(diagnostics.distances.proTable).toBeGreaterThan(0)
    expect(diagnostics.distances.components).toBeGreaterThan(0)
    expect(diagnostics.distances.root).toBeGreaterThan(0)

    const systemConfigurationRow = directPage.locator(systemConfigurationRowSelector)
    await expect(systemConfigurationRow).toBeVisible()
    await systemConfigurationRow.hover()
    await expect(proTableBasicRow).toHaveAttribute('data-menu-row-state', 'active')
    await expect(showcaseRootRow).toHaveAttribute('data-menu-row-state', 'ancestor')
    await expect(showcaseComponentsRow).toHaveAttribute('data-menu-row-state', 'ancestor')
    await expect(showcaseProTableRow).toHaveAttribute('data-menu-row-state', 'ancestor')

    await directPage.locator('[data-layout-content="true"]').hover()
    await expect(proTableBasicItem).toHaveAttribute('data-route-exact-active', 'true')
    await expect(proTableBasicItem).toHaveAttribute('data-menu-state', 'active')
    await expect(proTableBasicRow).toHaveAttribute('data-menu-row-state', 'active')

    await directContext.close()
  })

  test('navigate away and back keeps dashboard sidebar active and synchronized', async ({
    page,
  }) => {
    await gotoVisual(page, '/dashboard')
    await waitForAppReady(page)
    await waitForRuntimeLoadingIdle(page)
    await expect(page.locator('#dashboard-page')).toBeVisible()

    await page.goto('/?e2e=visual#/runtime/state', { waitUntil: 'domcontentloaded' })
    await waitForAppReady(page)
    await waitForRuntimeLoadingIdle(page)
    await expect(page).toHaveURL(/#\/runtime\/state$/)

    const dashboardItem = page.locator(dashboardSidebarItemSelector)
    const runtimeStateItem = page.locator(runtimeStateSidebarItemSelector)
    await expect(runtimeStateItem).toHaveAttribute('data-menu-state', 'active')
    await expect(dashboardItem).toHaveAttribute('data-menu-state', 'idle')
    await expect(dashboardItem).toBeVisible()

    await Promise.all([page.waitForURL(/#\/dashboard$/), dashboardItem.click()])
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
