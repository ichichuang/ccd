import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Locator, type Page, type TestInfo } from '@playwright/test'
import {
  createNetworkFailureCollector,
  loginAsAdmin,
  waitForAppReady,
  waitForRuntimeLoadingIdle,
  withVisualMode,
} from './helpers/app'

const PRO_TREE_TABLE_ROUTE = '/showcase/components/pro-tree-table/overview'
let navigationId = 0

function collectDiagnostics(page: Page): {
  consoleErrors: string[]
  pageErrors: string[]
} {
  const consoleErrors: string[] = []
  const pageErrors: string[] = []

  page.on('console', message => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })
  page.on('pageerror', error => {
    pageErrors.push(error.message)
  })

  return { consoleErrors, pageErrors }
}

async function gotoProTreeTableRoute(page: Page): Promise<void> {
  navigationId += 1
  const visualUrl = withVisualMode(PRO_TREE_TABLE_ROUTE).replace(
    '?e2e=visual',
    `?e2e=visual&e2eProTreeTable=${navigationId}`
  )

  await page.goto(visualUrl, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(
    expectedPath => window.location.hash === `#${expectedPath}`,
    PRO_TREE_TABLE_ROUTE
  )
  await waitForAppReady(page)
  await waitForRuntimeLoadingIdle(page)
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function bodyRowByNamePrefix(scope: Locator, name: string): Locator {
  return scope
    .getByRole('row', {
      name: new RegExp(`^(?:Toggle tree row\\s+)?${escapeRegExp(name)}(?:\\s|$)`),
    })
    .first()
}

async function attachRouteScreenshot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  const path = testInfo.outputPath(`${name}.png`)
  await page.getByTestId('showcase-pro-tree-table-demo').screenshot({ path })
  await testInfo.attach(name, {
    path,
    contentType: 'image/png',
  })
}

function expectNoDiagnostics(diagnostics: { consoleErrors: string[]; pageErrors: string[] }): void {
  expect(diagnostics.consoleErrors).toEqual([])
  expect(diagnostics.pageErrors).toEqual([])
}

test.describe('ProTreeTable accessibility and route gates', () => {
  test('overview route renders the experimental treegrid with axe and screenshot evidence', async ({
    page,
  }, testInfo) => {
    const diagnostics = collectDiagnostics(page)
    await loginAsAdmin(page)

    const networkFailures = createNetworkFailureCollector(page)
    try {
      await gotoProTreeTableRoute(page)

      const demo = page.getByTestId('showcase-pro-tree-table-demo')
      await expect(page.locator('h1', { hasText: 'ProTreeTable 概览' })).toBeVisible()
      await expect(demo).toBeVisible({ timeout: 15000 })

      const wrapperRoot = page.getByTestId('showcase-pro-tree-table')
      await expect(wrapperRoot).toHaveAttribute('data-pro-tree-table-experimental', 'true')

      const treegrid = demo.getByRole('treegrid', {
        name: 'ProTreeTable experimental treegrid',
      })
      await expect(treegrid).toBeVisible({ timeout: 15000 })
      await expect(demo.locator('table[role="treegrid"]')).toHaveCount(1)
      await expect(bodyRowByNamePrefix(demo, 'ProTreeTable 包装')).toBeVisible()
      await expect(bodyRowByNamePrefix(demo, '子节点懒加载')).toBeVisible()
      await expect(bodyRowByNamePrefix(demo, 'Headless 层级引擎')).toBeVisible()
      await expect(page.getByText('延期范围', { exact: true })).toBeVisible()
      await expect(page.getByText('editing、virtual scroll', { exact: false })).toBeVisible()

      const results = await new AxeBuilder({ page })
        .include('[data-testid="showcase-pro-tree-table-demo"]')
        .analyze()

      expect(results.violations).toEqual([])
      await attachRouteScreenshot(page, testInfo, 'pro-tree-table-route')
      expect(networkFailures.getFailures()).toEqual([])
    } finally {
      networkFailures.dispose()
    }

    expectNoDiagnostics(diagnostics)
  })

  test('keyboard expansion loads deterministic children and row selection updates evidence', async ({
    page,
  }) => {
    const diagnostics = collectDiagnostics(page)
    await loginAsAdmin(page)
    await gotoProTreeTableRoute(page)

    const demo = page.getByTestId('showcase-pro-tree-table-demo')
    const lazyRow = bodyRowByNamePrefix(demo, '子节点懒加载')

    await expect(lazyRow).toBeVisible({ timeout: 15000 })
    await lazyRow.focus()
    await expect(lazyRow).toBeFocused()
    await lazyRow.press('ArrowRight')

    await expect(bodyRowByNamePrefix(demo, '树专用 loadChildren contract')).toBeVisible({
      timeout: 15000,
    })
    await expect(bodyRowByNamePrefix(demo, '确定性本地异步数据')).toBeVisible()
    await expect(lazyRow).toHaveAttribute('aria-expanded', 'true')
    await expect(page.getByTestId('showcase-pro-tree-table-lazy-loads')).toContainText('1')
    await expect(page.getByTestId('showcase-pro-tree-table-lazy-children')).toContainText('2')
    await expect(page.getByTestId('showcase-pro-tree-table-event')).toContainText(
      '已加载 deferred.lazy 的子节点。'
    )

    const loadedChildRow = bodyRowByNamePrefix(demo, '树专用 loadChildren contract')
    await loadedChildRow.focus()
    await loadedChildRow.press('Enter')

    await expect(loadedChildRow).toHaveAttribute('aria-selected', 'true')
    await expect(page.getByTestId('showcase-pro-tree-table-selection')).toContainText(
      'deferred.lazy.contract'
    )
    await expect(page.getByTestId('showcase-pro-tree-table-event')).toContainText(
      '已选择 deferred.lazy.contract。'
    )
    expectNoDiagnostics(diagnostics)
  })
})
