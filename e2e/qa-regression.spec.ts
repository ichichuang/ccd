import { expect, test, type BrowserContext, type Page } from '@playwright/test'
import {
  createNetworkFailureCollector,
  gotoVisual,
  loginAsAdmin,
  waitForAppReady,
  waitForRuntimeLoadingIdle,
  withVisualMode,
} from './helpers/app'
import type { NetworkFailureRecord } from './helpers/app'

const viewportMatrix = [
  { name: 'desktop', width: 1280, height: 720 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
] as const

const DASHBOARD_RENDER_BUDGET_MS = 1000
const QUICK_ACTION_OPEN_BUDGET_MS = 1500
const LONG_TASK_WORST_CASE_BUDGET_MS = process.env.CI ? 600 : 180

type LayoutContract = {
  bodyChildCount: number
  appChildCount: number
  shellChildCount: number
  routerOutletDepth: number
  appReadyAt: number
  dashboardVisibleAt: number
  blankSamples: number
  consoleErrors: string[]
  longTasks: number[]
}

function expectNoNetworkFailures(failures: NetworkFailureRecord[], scope: string): void {
  expect(failures, `${scope} should not produce failed requests or HTTP >= 400 responses`).toEqual(
    []
  )
}

async function expectNonBlankRoute(page: Page): Promise<void> {
  await waitForAppReady(page)
  await waitForRuntimeLoadingIdle(page)
  await expect(page.locator('#app-shell')).toBeVisible()
  await expect(page.locator('[data-layout-content="true"]')).toBeVisible()
  await expect(page.locator('#dashboard-page')).toBeVisible()

  const geometry = await page.evaluate(() => {
    const dashboard = document.querySelector('#dashboard-page')?.getBoundingClientRect()
    const content = document.querySelector('[data-layout-content="true"]')?.getBoundingClientRect()
    return {
      textLength: document.body.innerText.trim().length,
      dashboardWidth: dashboard?.width ?? 0,
      dashboardHeight: dashboard?.height ?? 0,
      contentWidth: content?.width ?? 0,
      contentHeight: content?.height ?? 0,
    }
  })

  expect(geometry.textLength).toBeGreaterThan(100)
  expect(geometry.dashboardWidth).toBeGreaterThan(0)
  expect(geometry.dashboardHeight).toBeGreaterThan(0)
  expect(geometry.contentWidth).toBeGreaterThan(0)
  expect(geometry.contentHeight).toBeGreaterThan(0)
}

async function installBlankScreenProbe(page: Page): Promise<void> {
  await page.addInitScript(() => {
    window.localStorage.setItem('ccd-e2e-mode', 'visual')
    window.ccdLayoutProbe = {
      blankSamples: 0,
      consoleErrors: [],
      longTasks: [],
    }
    const layoutProbe = window.ccdLayoutProbe

    const isBlankShell = () => {
      const app = document.querySelector('#app')
      const shell = document.querySelector('#app-shell')
      const dashboard = document.querySelector('#dashboard-page')
      const login = document.querySelector('#login-submit')
      const visibleRouteNode = dashboard ?? login
      return Boolean(
        app && shell && !visibleRouteNode && document.body.innerText.trim().length === 0
      )
    }

    let postReadyFrames = 0
    const sample = () => {
      if (document.documentElement.dataset.appReady === 'true') {
        postReadyFrames += 1
        if (isBlankShell()) layoutProbe.blankSamples += 1
      }
      if (postReadyFrames < 30) {
        window.requestAnimationFrame(sample)
      }
    }

    const originalError = console.error
    console.error = (...args: unknown[]) => {
      layoutProbe.consoleErrors.push(args.map(String).join(' '))
      originalError(...args)
    }

    const performanceObserverCtor = window.PerformanceObserver
    if (performanceObserverCtor) {
      try {
        const observer = new performanceObserverCtor(list => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 0) layoutProbe.longTasks.push(entry.duration)
          }
        })
        observer.observe({ type: 'longtask', buffered: true })
      } catch {
        // Long Task API is optional in browser engines used for local testing.
      }
    }

    window.requestAnimationFrame(sample)
  })
}

async function readLayoutContract(page: Page): Promise<LayoutContract> {
  return page.evaluate(() => {
    const getDepth = (node: Element | null): number => {
      if (!node) return 0
      const children = Array.from(node.children)
      if (children.length === 0) return 1
      return 1 + Math.max(...children.map(getDepth))
    }
    const probe = window.ccdLayoutProbe ?? { blankSamples: 0, consoleErrors: [], longTasks: [] }
    return {
      bodyChildCount: document.body.children.length,
      appChildCount: document.querySelector('#app')?.children.length ?? 0,
      shellChildCount: document.querySelector('#app-shell')?.children.length ?? 0,
      routerOutletDepth: getDepth(document.querySelector('#dashboard-page')),
      appReadyAt: performance.getEntriesByName('ccd:app-ready').at(-1)?.startTime ?? 0,
      dashboardVisibleAt:
        performance.getEntriesByName('ccd:dashboard-visible').at(-1)?.startTime ?? 0,
      blankSamples: probe.blankSamples,
      consoleErrors: probe.consoleErrors,
      longTasks: probe.longTasks,
    }
  })
}

async function markDashboardVisible(page: Page): Promise<void> {
  await page.evaluate(() => {
    performance.mark('ccd:dashboard-visible')
  })
}

test.describe('QA full regression repair matrix', () => {
  for (const viewport of viewportMatrix) {
    test(`${viewport.name} dashboard keeps a visible layout tree`, async ({ page }) => {
      const networkCollector = createNetworkFailureCollector(page)
      await installBlankScreenProbe(page)
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await loginAsAdmin(page)
      await expectNonBlankRoute(page)
      await markDashboardVisible(page)

      const drawerTrigger = page.locator('[data-layout-drawer-trigger="true"]')
      const sidebarMode = await page
        .locator('[data-layout-shell="admin"]')
        .getAttribute('data-sidebar-mode')
      if (sidebarMode === 'drawer') {
        await expect(drawerTrigger).toBeVisible()
        await drawerTrigger.click()
        await expect(page.locator('[data-layout-drawer="true"]')).toBeVisible()
      } else if (sidebarMode === 'inline') {
        await expect(page.locator('[data-layout-sidebar="true"]')).toBeVisible()
      } else {
        await expect(page.locator('[data-layout-header="true"]')).toBeVisible()
      }

      const startedAt = Date.now()
      await page.locator('#dashboard-quick-action').click()
      await expect(page.locator('.p-dialog')).toBeVisible()
      expect(Date.now() - startedAt).toBeLessThan(QUICK_ACTION_OPEN_BUDGET_MS)

      const contract = await readLayoutContract(page)
      expect(contract.bodyChildCount).toBeGreaterThan(1)
      expect(contract.appChildCount).toBeGreaterThan(0)
      expect(contract.shellChildCount).toBeGreaterThan(1)
      expect(contract.routerOutletDepth).toBeGreaterThan(3)
      expect(contract.blankSamples).toBe(0)
      expect(contract.consoleErrors).toEqual([])
      const failures = networkCollector.getFailures()
      networkCollector.dispose()
      expectNoNetworkFailures(failures, `${viewport.name} dashboard route`)
    })
  }

  test('login route and logout redirect chain are stable', async ({ page }) => {
    const networkCollector = createNetworkFailureCollector(page)
    await page.setViewportSize({ width: 1280, height: 720 })
    await gotoVisual(page, '/login')
    await waitForAppReady(page)
    await waitForRuntimeLoadingIdle(page)
    await expect(page.locator('#login-submit')).toBeVisible()

    await loginAsAdmin(page)
    await expectNonBlankRoute(page)
    await page.locator('#user-entry-trigger').click()
    await page.locator('#user-logout').click()
    await expect(page).toHaveURL(/#\/login\?redirect=/)
    await waitForRuntimeLoadingIdle(page)
    await expect(page.locator('#login-submit')).toBeVisible()
    const failures = networkCollector.getFailures()
    networkCollector.dispose()
    expectNoNetworkFailures(failures, 'login and logout redirect chain')
  })

  test('dashboard fixed tab survives non-dashboard redirect and destructive actions', async ({
    page,
  }) => {
    const networkCollector = createNetworkFailureCollector(page)
    await page.setViewportSize({ width: 1280, height: 720 })
    await gotoVisual(page, '/login?redirect=/example/hooks/layout/admin-tabs')
    await waitForAppReady(page)
    await waitForRuntimeLoadingIdle(page)
    await expect(page.locator('#username')).toBeVisible({ timeout: 15000 })
    await page.locator('#username').fill('admin')
    await page.locator('#password').fill('123456')
    await page.locator('#login-submit').click()
    await expect(page).toHaveURL(/#\/example\/hooks\/layout\/admin-tabs$/)
    await waitForAppReady(page)
    await waitForRuntimeLoadingIdle(page)

    const dashboardTab = page.locator('[data-admin-tabs-bar="true"] [data-path="/dashboard"]')
    await expect(dashboardTab).toBeVisible()
    await expect(dashboardTab.locator('[data-admin-tab-close="true"]')).toHaveCount(0)

    await dashboardTab.click({ button: 'right' })
    await expect(page.locator('[data-admin-tabs-context-menu="true"]')).toBeVisible()
    await expect(
      page.locator('[data-admin-tabs-context-menu="true"]', { hasText: /Close$/ })
    ).toHaveCount(0)
    await page.mouse.click(1, 1)
    await expect(page.locator('[data-admin-tabs-context-menu="true"]')).toHaveCount(0)

    const activeTab = page.locator(
      '[data-admin-tabs-bar="true"] [data-path="/example/hooks/layout/admin-tabs"]'
    )
    await activeTab.dispatchEvent('contextmenu', {
      button: 2,
      buttons: 2,
      clientX: 320,
      clientY: 120,
      bubbles: true,
      cancelable: true,
    })
    await expect(page.locator('[data-admin-tabs-context-menu="true"]')).toBeVisible()
    await page
      .locator('[data-admin-tabs-context-menu="true"] div[role="button"]', {
        hasText: /Close All|关闭全部/,
      })
      .click()
    await expect(dashboardTab).toBeVisible()
    await expect(page).toHaveURL(/#\/dashboard$/)

    await page.goto(withVisualMode('/example/hooks/layout/admin-tabs'), {
      waitUntil: 'domcontentloaded',
    })
    await waitForAppReady(page)
    await waitForRuntimeLoadingIdle(page)
    await expect(dashboardTab).toBeVisible()

    const failures = networkCollector.getFailures()
    networkCollector.dispose()
    expectNoNetworkFailures(failures, 'admin fixed dashboard tab')
  })

  test('hard refresh preserves dashboard through auth store rehydration', async ({ page }) => {
    const networkCollector = createNetworkFailureCollector(page)
    await installBlankScreenProbe(page)
    await page.setViewportSize({ width: 390, height: 844 })
    await loginAsAdmin(page)
    await expectNonBlankRoute(page)

    await page.reload({ waitUntil: 'domcontentloaded' })
    await expect(page).toHaveURL(/#\/dashboard$/)
    await expectNonBlankRoute(page)
    await markDashboardVisible(page)

    const contract = await readLayoutContract(page)
    expect(contract.blankSamples).toBe(0)
    expect(contract.consoleErrors).toEqual([])
    expect(contract.routerOutletDepth).toBeGreaterThan(3)
    const failures = networkCollector.getFailures()
    networkCollector.dispose()
    expectNoNetworkFailures(failures, 'hard refresh dashboard rehydration')
  })

  test('delayed storage reads do not collapse authenticated dashboard reload', async ({ page }) => {
    const networkCollector = createNetworkFailureCollector(page)
    await page.addInitScript(() => {
      window.localStorage.setItem('ccd-e2e-mode', 'visual')
    })
    await loginAsAdmin(page)

    await installBlankScreenProbe(page)
    await page.addInitScript(() => {
      const rawGetItem = Storage.prototype.getItem
      Storage.prototype.getItem = function patchedGetItem(key: string): string | null {
        if (key.includes('-user') || key.includes('-permission')) {
          const deadline = performance.now() + 24
          while (performance.now() < deadline) {
            // intentional sync delay to simulate slow persisted-state rehydration
          }
        }
        return rawGetItem.call(this, key)
      }
    })

    await page.goto(withVisualMode('/dashboard'), { waitUntil: 'domcontentloaded' })
    await expect(page).toHaveURL(/#\/dashboard$/)
    await expectNonBlankRoute(page)
    await markDashboardVisible(page)

    const contract = await readLayoutContract(page)
    expect(contract.blankSamples).toBe(0)
    expect(contract.consoleErrors).toEqual([])
    expect(contract.routerOutletDepth).toBeGreaterThan(3)
    const failures = networkCollector.getFailures()
    networkCollector.dispose()
    expectNoNetworkFailures(failures, 'delayed storage dashboard reload')
  })

  test('invalid mid-session token refresh redirects without blank shell', async ({ page }) => {
    const networkCollector = createNetworkFailureCollector(page)
    await installBlankScreenProbe(page)
    await page.setViewportSize({ width: 390, height: 844 })
    await loginAsAdmin(page)
    await expectNonBlankRoute(page)

    await page.evaluate(() => {
      const userKey = Object.keys(window.localStorage).find(key => key.endsWith('-user'))
      if (userKey) {
        window.localStorage.setItem(
          userKey,
          JSON.stringify({
            token: 'invalid-token',
            isLogin: true,
            userInfo: {
              userId: '1',
              username: 'admin',
              roles: ['admin'],
              permissions: ['*:*:*'],
            },
          })
        )
      }
    })

    await page.reload({ waitUntil: 'domcontentloaded' })
    await expect(page).toHaveURL(/#\/login\?redirect=/)
    await waitForAppReady(page)
    await waitForRuntimeLoadingIdle(page)
    await expect(page.locator('#login-submit')).toBeVisible()

    const contract = await readLayoutContract(page)
    expect(contract.blankSamples).toBe(0)
    expect(contract.routerOutletDepth).toBe(0)
    const failures = networkCollector.getFailures()
    networkCollector.dispose()
    expectNoNetworkFailures(failures, 'invalid token refresh redirect')
  })

  test('multi-tab logout conflict converges to login without stale dashboard', async ({
    page,
    context,
  }) => {
    const primaryCollector = createNetworkFailureCollector(page)
    await installBlankScreenProbe(page)
    await page.setViewportSize({ width: 1280, height: 720 })
    await loginAsAdmin(page)
    await expectNonBlankRoute(page)

    const secondTab = await context.newPage()
    const secondaryCollector = createNetworkFailureCollector(secondTab)
    await installBlankScreenProbe(secondTab)
    await secondTab.goto(withVisualMode('/dashboard'), { waitUntil: 'domcontentloaded' })
    await expect(secondTab).toHaveURL(/#\/dashboard$/)
    await expectNonBlankRoute(secondTab)

    await page.locator('#user-entry-trigger').click()
    await page.locator('#user-logout').click()
    await expect(page).toHaveURL(/#\/login\?redirect=/)

    await secondTab.reload({ waitUntil: 'domcontentloaded' })
    await expect(secondTab).toHaveURL(/#\/login\?redirect=/)
    await waitForAppReady(secondTab)
    await waitForRuntimeLoadingIdle(secondTab)
    await expect(secondTab.locator('#login-submit')).toBeVisible()
    await expect(secondTab.locator('#dashboard-page')).toBeHidden()

    const contract = await readLayoutContract(secondTab)
    expect(contract.blankSamples).toBe(0)
    const primaryFailures = primaryCollector.getFailures()
    const secondaryFailures = secondaryCollector.getFailures()
    primaryCollector.dispose()
    secondaryCollector.dispose()
    expectNoNetworkFailures(primaryFailures, 'multi-tab primary page')
    expectNoNetworkFailures(secondaryFailures, 'multi-tab secondary page')
    await secondTab.close()
  })

  test('authenticated dashboard first render stays within budget', async ({ page }) => {
    const networkCollector = createNetworkFailureCollector(page)
    await page.setViewportSize({ width: 1280, height: 720 })
    await loginAsAdmin(page)
    await page.evaluate(() => performance.mark('ccd:dashboard-direct-start'))

    await page.goto(withVisualMode('/dashboard'), { waitUntil: 'domcontentloaded' })
    await expect(page).toHaveURL(/#\/dashboard$/)
    await expectNonBlankRoute(page)
    await markDashboardVisible(page)

    const renderTime = await page.evaluate(() => {
      const start =
        performance.getEntriesByName('ccd:dashboard-direct-start').at(-1)?.startTime ?? 0
      const visible = performance.getEntriesByName('ccd:dashboard-visible').at(-1)?.startTime ?? 0
      return visible - start
    })
    expect(renderTime).toBeLessThan(DASHBOARD_RENDER_BUDGET_MS)
    const failures = networkCollector.getFailures()
    networkCollector.dispose()
    expectNoNetworkFailures(failures, 'dashboard first render budget')
  })

  test('dashboard long tasks stay below worst-case freeze budget @perf', async ({ page }) => {
    const networkCollector = createNetworkFailureCollector(page)
    await installBlankScreenProbe(page)
    await page.setViewportSize({ width: 1280, height: 720 })
    await loginAsAdmin(page)
    await expectNonBlankRoute(page)

    const contract = await readLayoutContract(page)
    const worstLongTask = Math.max(0, ...contract.longTasks)
    expect(worstLongTask).toBeLessThan(LONG_TASK_WORST_CASE_BUDGET_MS)
    const failures = networkCollector.getFailures()
    networkCollector.dispose()
    expectNoNetworkFailures(failures, 'dashboard long-task budget')
  })

  test('visual baselines catch silent layout collapse @visual', async ({ page, context }) => {
    const networkCollector = createNetworkFailureCollector(page)
    await page.setViewportSize({ width: 1280, height: 720 })
    await loginAsAdmin(page)
    await expectNonBlankRoute(page)
    await expect(page.locator('#dashboard-page')).toHaveScreenshot('qa-dashboard-desktop.png')

    await page.setViewportSize({ width: 390, height: 844 })
    await waitForRuntimeLoadingIdle(page)
    await expectNonBlankRoute(page)
    await expect(page.locator('#dashboard-quick-action')).toBeVisible()

    const mobileGeometry = await page.locator('#dashboard-page').evaluate(element => {
      const rect = element.getBoundingClientRect()
      return {
        width: rect.width,
        height: rect.height,
        textLength: element.textContent?.trim().length ?? 0,
      }
    })
    expect(mobileGeometry.width * mobileGeometry.height).toBeGreaterThan(40_000)
    expect(mobileGeometry.height).toBeGreaterThan(600)
    expect(mobileGeometry.textLength).toBeGreaterThan(100)

    const { page: loginPage, networkCollector: loginCollector } = await openFreshLoginPage(context)
    await expect(loginPage.locator('#login-submit')).toBeVisible()
    await expect(loginPage.locator('#dashboard-page')).toBeHidden()
    const loginShellGeometry = await loginPage.locator('#app-shell').evaluate(element => {
      const rect = element.getBoundingClientRect()
      return {
        width: rect.width,
        height: rect.height,
        textLength: element.textContent?.trim().length ?? 0,
      }
    })
    expect(loginShellGeometry.width * loginShellGeometry.height).toBeGreaterThan(300_000)
    expect(loginShellGeometry.textLength).toBeGreaterThan(10)
    const failures = networkCollector.getFailures()
    const loginFailures = loginCollector.getFailures()
    networkCollector.dispose()
    loginCollector.dispose()
    expectNoNetworkFailures(failures, 'visual baseline dashboard route')
    expectNoNetworkFailures(loginFailures, 'visual baseline login route')
    await loginPage.close()
  })
})

async function openFreshLoginPage(context: BrowserContext): Promise<{
  page: Page
  networkCollector: ReturnType<typeof createNetworkFailureCollector>
}> {
  const loginPage = await context.newPage()
  const networkCollector = createNetworkFailureCollector(loginPage)
  await loginPage.addInitScript(() => {
    window.localStorage.clear()
    window.localStorage.setItem('ccd-e2e-mode', 'visual')
  })
  await gotoVisual(loginPage, '/login')
  await waitForAppReady(loginPage)
  await waitForRuntimeLoadingIdle(loginPage)
  return { page: loginPage, networkCollector }
}
