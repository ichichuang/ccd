import { expect, test, type Locator, type Page, type TestInfo } from '@playwright/test'
import {
  loginAsAdmin,
  waitForAppReady,
  waitForRuntimeLoadingIdle,
  withVisualMode,
} from './helpers/app'

const proTableRoutes = [
  {
    slug: 'overview',
    path: '/showcase/components/pro-table/overview',
    heading: 'ProTable 概览',
    evidence: 'ProTableDemoShell.vue',
  },
  {
    slug: 'basic',
    path: '/showcase/components/pro-table/basic',
    heading: '基础表格',
    evidence: 'proTableDemoData.ts',
  },
  {
    slug: 'columns',
    path: '/showcase/components/pro-table/columns',
    heading: '列配置',
    evidence: 'proTableColumns.ts',
    control: '列控件',
  },
  {
    slug: 'sorting-filtering',
    path: '/showcase/components/pro-table/sorting-filtering',
    heading: '排序与过滤',
    evidence: 'proTableColumns.ts',
    control: '状态过滤',
  },
  {
    slug: 'pagination',
    path: '/showcase/components/pro-table/pagination',
    heading: '分页',
    evidence: 'proTableDemoData.ts',
    control: '分页契约',
  },
  {
    slug: 'server-request',
    path: '/showcase/components/pro-table/server-request',
    heading: '服务端请求',
    evidence: 'props.ts',
    control: '请求状态',
  },
  {
    slug: 'states',
    path: '/showcase/components/pro-table/states',
    heading: '表格状态',
    evidence: 'ProTableDemoShell.vue',
    control: '加载态',
  },
  {
    slug: 'selection',
    path: '/showcase/components/pro-table/selection',
    heading: '选择',
    evidence: 'ProTable.vue',
    control: '选择与行聚焦',
  },
  {
    slug: 'toolbar-density',
    path: '/showcase/components/pro-table/toolbar-density',
    heading: '工具栏与密度',
    evidence: 'pro-table/toolbar-density/index.vue',
    control: '搜索、密度、刷新',
  },
  {
    slug: 'virtual-infinite',
    path: '/showcase/components/pro-table/virtual-infinite',
    heading: '虚拟与无限滚动',
    evidence: 'pro-table/virtual-infinite/index.vue',
    control: '虚拟行与无限请求加载',
  },
  {
    slug: 'export-refresh',
    path: '/showcase/components/pro-table/export-refresh',
    heading: '导出与刷新',
    evidence: 'pro-table/export-refresh/index.vue',
    control: '当前页导出、选中导出、刷新',
  },
  {
    slug: 'cell-rendering',
    path: '/showcase/components/pro-table/cell-rendering',
    heading: '单元格渲染',
    evidence: 'pro-table/cell-rendering/index.vue',
    control: 'Value enum 渲染',
  },
  {
    slug: 'form-composition',
    path: '/showcase/components/pro-table/form-composition',
    heading: '表单组合',
    evidence: 'pro-table/form-composition/index.vue',
    control: '所有者过滤',
  },
  {
    slug: 'api-events',
    path: '/showcase/components/pro-table/api-events',
    heading: 'API 与事件',
    evidence: 'pro-table/api-events/index.vue',
    control: '事件记录',
  },
] as const

const mobileRoutes = [
  proTableRoutes.find(route => route.slug === 'basic'),
  proTableRoutes.find(route => route.slug === 'server-request'),
].filter((route): route is (typeof proTableRoutes)[number] => Boolean(route))

let navigationId = 0

function collectDiagnostics(page: Page): {
  consoleErrors: string[]
  pageErrors: string[]
} {
  const consoleErrors: string[] = []
  const pageErrors: string[] = []

  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })
  page.on('pageerror', error => {
    pageErrors.push(error.message)
  })

  return { consoleErrors, pageErrors }
}

async function gotoShowcaseRoute(page: Page, path: string): Promise<void> {
  navigationId += 1
  const visualUrl = withVisualMode(path).replace(
    '?e2e=visual',
    `?e2e=visual&e2ePhase2CProTable=${navigationId}`
  )

  await page.goto(visualUrl, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(expectedPath => window.location.hash === `#${expectedPath}`, path)
  await waitForAppReady(page)
  await waitForRuntimeLoadingIdle(page)
}

async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  const metrics = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }))

  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 2)
}

interface GeometryBox {
  x: number
  y: number
  width: number
  height: number
}

async function expectMeasuredBox(locator: Locator, label: string): Promise<GeometryBox> {
  const box = await locator.boundingBox()
  expect(box, `${label} should have a measured layout box`).not.toBeNull()
  if (!box) throw new Error(`${label} should have a measured layout box`)
  return box
}

async function expectProTableRegionReady(page: Page): Promise<void> {
  const region = page.getByTestId('showcase-pro-table-demo-region')
  await expect(region).toBeVisible({ timeout: 15000 })

  const regionBox = await region.boundingBox()
  expect(regionBox?.width ?? 0).toBeGreaterThan(240)
  expect(regionBox?.height ?? 0).toBeGreaterThan(180)

  const table = region.locator('table, [role="grid"]').first()
  await expect(table).toBeVisible({ timeout: 15000 })

  const tableBox = await table.boundingBox()
  expect(tableBox?.width ?? 0).toBeGreaterThan(0)
  expect(tableBox?.height ?? 0).toBeGreaterThan(0)
}

async function expectSourceEvidenceReadable(page: Page, evidence: string): Promise<void> {
  const sourceArea = page.getByTestId('showcase-pro-table-source-area')
  await expect(sourceArea).toBeVisible()
  await expect(sourceArea.getByText(evidence, { exact: false }).first()).toBeVisible()

  const codeMetrics = await sourceArea
    .locator('code')
    .first()
    .evaluate(element => {
      const style = window.getComputedStyle(element)
      return {
        clientWidth: element.clientWidth,
        scrollWidth: element.scrollWidth,
        wordBreak: style.wordBreak,
      }
    })

  expect(codeMetrics.wordBreak).toBe('break-all')
  expect(codeMetrics.scrollWidth).toBeLessThanOrEqual(codeMetrics.clientWidth + 4)
}

async function selectComboboxOption(page: Page, scope: Locator, optionName: string): Promise<void> {
  const combobox = scope.getByRole('combobox')

  await combobox.click()
  await page.getByRole('option', { name: optionName, exact: true }).click()
  await expect(combobox).toContainText(optionName)
}

async function waitForThemeState(page: Page, targetMode: 'light' | 'dark'): Promise<void> {
  await page.waitForFunction(mode => {
    const isDark = document.documentElement.classList.contains('dark')
    return (
      document.documentElement.dataset.themeMode === mode &&
      document.documentElement.dataset.themeTransitioning === 'false' &&
      (mode === 'dark' ? isDark : !isDark)
    )
  }, targetMode)
}

async function switchThemeFromSettings(page: Page, targetMode: 'light' | 'dark'): Promise<void> {
  await page.locator('#user-entry-trigger').click()
  await page.locator('#user-open-global-settings').click()
  await expect(page).toHaveURL(/#\/system\/settings$/, { timeout: 15000 })
  await waitForAppReady(page)
  await waitForRuntimeLoadingIdle(page)

  const settings = page.getByTestId('global-settings-page')
  await expect(settings).toBeVisible()
  await settings.getByRole('button', { name: targetMode === 'dark' ? '深色' : '浅色' }).click()
  await waitForThemeState(page, targetMode)
}

async function captureEvidence(page: Page, testInfo: TestInfo, name: string): Promise<string> {
  const path = testInfo.outputPath(`${name}.png`)
  await page.screenshot({ path, fullPage: true })
  await testInfo.attach(name, {
    path,
    contentType: 'image/png',
  })
  return path
}

async function expectProTableRoute(
  page: Page,
  route: (typeof proTableRoutes)[number]
): Promise<void> {
  await gotoShowcaseRoute(page, route.path)

  await expect(page.locator('h1', { hasText: route.heading })).toBeVisible()
  await expect(page.getByText('表格工作区', { exact: true }).first()).toBeVisible()
  await expect(page.getByText('表格操作', { exact: true }).first()).toBeVisible()
  await expect(page.getByText('交互证据', { exact: true }).first()).toBeVisible()
  await expect(page.getByText('源码与包证据', { exact: true }).first()).toBeVisible()
  await expect(page.getByTestId('showcase-pro-table-action-toolbar')).toBeVisible()
  await expectProTableRegionReady(page)
  await expectSourceEvidenceReadable(page, route.evidence)

  if (route.control) {
    await expect(page.getByText(route.control, { exact: false }).first()).toBeVisible()
  }

  await expectNoHorizontalOverflow(page)
}

test.describe('Phase 2C ProTable showcase UI readiness', () => {
  test('desktop ProTable routes keep table, controls, state, and evidence readable', async ({
    page,
  }, testInfo) => {
    const diagnostics = collectDiagnostics(page)

    await page.setViewportSize({ width: 1280, height: 720 })
    await loginAsAdmin(page)

    for (const route of proTableRoutes) {
      await expectProTableRoute(page, route)
      await captureEvidence(page, testInfo, `desktop-${route.slug}`)
    }

    expect(diagnostics.pageErrors).toEqual([])
    expect(diagnostics.consoleErrors).toEqual([])
  })

  test('mobile ProTable routes avoid document overflow', async ({ page }, testInfo) => {
    const diagnostics = collectDiagnostics(page)

    await page.setViewportSize({ width: 390, height: 844 })
    await loginAsAdmin(page)

    for (const route of mobileRoutes) {
      await expectProTableRoute(page, route)
      await captureEvidence(page, testInfo, `mobile-${route.slug}`)
    }

    expect(diagnostics.pageErrors).toEqual([])
    expect(diagnostics.consoleErrors).toEqual([])
  })

  test('representative ProTable behaviors remain visible', async ({ page }, testInfo) => {
    const diagnostics = collectDiagnostics(page)

    await page.setViewportSize({ width: 1280, height: 720 })
    await loginAsAdmin(page)

    await gotoShowcaseRoute(page, '/showcase/components/pro-table/basic')
    await expect(page.getByText('能力', { exact: true }).first()).toBeVisible()
    await expect(page.getByText('可复用表格起点', { exact: true }).first()).toBeVisible()
    await expectNoHorizontalOverflow(page)
    await captureEvidence(page, testInfo, 'behavior-basic-rows')

    await gotoShowcaseRoute(page, '/showcase/components/pro-table/columns')
    await expect(page.getByText('Value enum 渲染', { exact: true }).first()).toBeVisible()
    await page.getByRole('button', { name: '隐藏所有者' }).first().click()
    await expect(page.getByRole('button', { name: '显示所有者' }).first()).toBeVisible()
    await expectNoHorizontalOverflow(page)
    await captureEvidence(page, testInfo, 'behavior-columns-value-enum')

    await gotoShowcaseRoute(page, '/showcase/components/pro-table/states')
    await expect(page.getByText('加载态', { exact: true }).first()).toBeVisible()
    await expect(page.getByText('空状态', { exact: true }).first()).toBeVisible()
    await page.locator('.p-toggleswitch').nth(1).click()
    await expect(page.getByText('没有匹配的 ProTable 行', { exact: true }).first()).toBeVisible()
    await expectNoHorizontalOverflow(page)
    await captureEvidence(page, testInfo, 'behavior-states-empty')

    await gotoShowcaseRoute(page, '/showcase/components/pro-table/selection')
    await expect(page.locator('.p-checkbox').first()).toBeVisible()
    await expect(page.getByText('选择与行聚焦', { exact: true }).first()).toBeVisible()
    await expectNoHorizontalOverflow(page)
    await captureEvidence(page, testInfo, 'behavior-selection-controls')

    expect(diagnostics.pageErrors).toEqual([])
    expect(diagnostics.consoleErrors).toEqual([])
  })

  test('basic ProTable fullscreen expands inside app content and restores without overflow', async ({
    page,
  }) => {
    const diagnostics = collectDiagnostics(page)

    await page.setViewportSize({ width: 1280, height: 720 })
    await loginAsAdmin(page)
    await gotoShowcaseRoute(page, '/showcase/components/pro-table/basic')

    const header = page.locator('[data-layout-header="true"]')
    const sidebar = page.locator('[data-layout-sidebar="true"]')
    const region = page.getByTestId('showcase-pro-table-demo-region')
    const expandControl = region.getByRole('button', { name: /切换全屏|Toggle fullscreen/ }).first()

    await expect(header).toBeVisible()
    await expect(sidebar).toBeVisible()
    await expect(region).toBeVisible()
    await expect(expandControl).toBeVisible()

    await expandControl.click()

    const restoreControl = region
      .getByRole('button', { name: /切换全屏|Toggle fullscreen/ })
      .first()
    const expandedTable = region.locator('[data-pro-table-fullscreen="true"]').first()

    await expect(restoreControl).toBeVisible()
    await expect(restoreControl).toHaveAttribute('aria-pressed', 'true')
    await expect(expandedTable).toBeVisible()
    await expect(region.getByPlaceholder(/搜索|Search/)).toBeVisible()
    await expect(region.getByText('能力', { exact: true }).first()).toBeVisible()
    await expect(region.getByText('可复用表格起点', { exact: false }).first()).toBeVisible()
    await expect(region.getByText(/共 \d+ 条|Total \d+ records/).first()).toBeVisible()

    const headerBox = await expectMeasuredBox(header, 'admin header')
    const sidebarBox = await expectMeasuredBox(sidebar, 'admin sidebar')
    const expandedBox = await expectMeasuredBox(expandedTable, 'expanded ProTable')

    expect(expandedBox.y).toBeGreaterThanOrEqual(headerBox.y + headerBox.height - 2)
    expect(expandedBox.x).toBeGreaterThanOrEqual(sidebarBox.x + sidebarBox.width - 2)
    await expectNoHorizontalOverflow(page)

    await restoreControl.click()

    await expect(region.locator('[data-pro-table-fullscreen="true"]')).toHaveCount(0)
    await expectProTableRegionReady(page)
    await expectNoHorizontalOverflow(page)

    expect(diagnostics.pageErrors).toEqual([])
    expect(diagnostics.consoleErrors).toEqual([])
  })

  test('virtual/infinite route auto-loads request rows and exposes fetch-state interactions', async ({
    page,
  }) => {
    const diagnostics = collectDiagnostics(page)

    await page.setViewportSize({ width: 1280, height: 720 })
    await loginAsAdmin(page)

    await gotoShowcaseRoute(page, '/showcase/components/pro-table/virtual-infinite')
    await expect(page.locator('h1', { hasText: '虚拟与无限滚动' })).toBeVisible()

    const scrollModePanel = page.locator('section').filter({ hasText: '滚动模式' }).first()
    const scrollModeCombobox = scrollModePanel.getByRole('combobox')
    await expect(scrollModeCombobox).toContainText('虚拟滚动')

    await selectComboboxOption(page, scrollModePanel, '无限请求')
    await expect(page.getByTestId('showcase-pro-table-demo-region')).toBeVisible()
    await expect(page.getByRole('row', { name: /可复用表格起点 1/ }).first()).toBeVisible({
      timeout: 15000,
    })

    await page.getByRole('button', { name: '刷新' }).first().click()
    await expect(page.getByRole('row', { name: /可复用表格起点 1/ }).first()).toBeVisible({
      timeout: 15000,
    })

    await page.getByRole('button', { name: '读取请求状态' }).first().click()
    await expect(page.getByText('已调用 getFetchState()', { exact: false }).first()).toBeVisible()
    await expect(page.getByText('还有更多 是', { exact: false }).first()).toBeVisible()

    await page.getByRole('button', { name: '读取状态' }).first().click()
    await expect(page.getByText(/第 \d+ 页，页大小 \d+，总数 \d+/).first()).toBeVisible()

    await expectSourceEvidenceReadable(page, 'pro-table/virtual-infinite/index.vue')
    await expectNoHorizontalOverflow(page)

    expect(diagnostics.pageErrors).toEqual([])
    expect(diagnostics.consoleErrors).toEqual([])
  })

  test('dark ProTable route keeps table and source evidence readable', async ({
    page,
  }, testInfo) => {
    const diagnostics = collectDiagnostics(page)

    await page.setViewportSize({ width: 1280, height: 720 })
    await loginAsAdmin(page)
    await switchThemeFromSettings(page, 'dark')
    await gotoShowcaseRoute(page, '/showcase/components/pro-table/basic')
    await page.waitForFunction(() => document.documentElement.classList.contains('dark'))

    await expect(page.locator('h1', { hasText: '基础表格' })).toBeVisible()
    await expect(page.getByText('表格工作区', { exact: true }).first()).toBeVisible()
    await expectProTableRegionReady(page)
    await expectSourceEvidenceReadable(page, 'ProTable.vue')
    await expectNoHorizontalOverflow(page)
    await captureEvidence(page, testInfo, 'dark-basic')

    expect(diagnostics.pageErrors).toEqual([])
    expect(diagnostics.consoleErrors).toEqual([])
  })
})
