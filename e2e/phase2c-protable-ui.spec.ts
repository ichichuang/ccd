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
  }, testInfo) => {
    const diagnostics = collectDiagnostics(page)

    await page.setViewportSize({ width: 1280, height: 720 })
    await loginAsAdmin(page)
    await gotoShowcaseRoute(page, '/showcase/components/pro-table/basic')

    const header = page.locator('[data-layout-header="true"]')
    const sidebar = page.locator('[data-layout-sidebar="true"]')
    const routeTabs = page.locator('[data-admin-tabs-bar="true"]')
    const footer = page.locator('footer').first()
    const region = page.getByTestId('showcase-pro-table-demo-region')
    const proTable = region.locator('[data-pro-table-root]').first()
    const expandControl = region.locator('[data-pro-table-fullscreen-toggle]').first()
    const densityControl = region
      .getByRole('button', { name: /表格区域尺寸密度|Table area size density/ })
      .first()
    const densityControlHook = region.locator('[data-pro-table-density-toggle]').first()

    await expect(header).toBeVisible()
    await expect(sidebar).toBeVisible()
    await expect(routeTabs).toBeVisible()
    await expect(footer).toBeVisible()
    await expect(region).toBeVisible()
    await expect(proTable).toBeVisible()
    await expect(expandControl).toBeVisible()
    await expect(expandControl).toHaveAttribute('aria-pressed', 'false')
    await expect(densityControl).toBeVisible()
    await expect(densityControlHook).toBeVisible()

    // Popover triggers must expose aria-haspopup for assistive technology
    await expect(densityControl).toHaveAttribute('aria-haspopup', 'true')
    const colSettingsTrigger = region
      .getByRole('button', { name: /列设置|Column settings/ })
      .first()
    await expect(colSettingsTrigger).toHaveAttribute('aria-haspopup', 'true')

    const normalBox = await expectMeasuredBox(proTable, 'normal embedded ProTable')
    const expandControlBox = await expectMeasuredBox(expandControl, 'fullscreen expand control')
    const densityControlBox = await expectMeasuredBox(densityControlHook, 'density control')
    expect(expandControlBox.width).toBeGreaterThanOrEqual(densityControlBox.width - 4)
    expect(expandControlBox.height).toBeGreaterThanOrEqual(densityControlBox.height - 4)
    expect(expandControlBox.width).toBeGreaterThanOrEqual(28)
    expect(expandControlBox.height).toBeGreaterThanOrEqual(28)
    await captureEvidence(page, testInfo, 'fullscreen-normal')

    await expandControl.click()

    const restoreControl = region.getByRole('button', { name: /退出全屏|Exit fullscreen/ }).first()
    const expandedTable = region.locator('[data-pro-table-fullscreen="true"]').first()
    const fullscreenOverlay = page.locator('[data-pro-table-fullscreen-overlay]').first()

    await expect(restoreControl).toBeVisible()
    await expect(restoreControl).toHaveAttribute('aria-pressed', 'true')
    await expect(expandedTable).toBeVisible()
    // Overlay must exist and fill workspace to dim surrounding content
    await expect(fullscreenOverlay).toBeVisible()
    const overlayBox = await expectMeasuredBox(fullscreenOverlay, 'fullscreen dim overlay')
    expect(overlayBox.width).toBeGreaterThan(0)
    expect(overlayBox.height).toBeGreaterThan(0)
    const overlayStyle = await fullscreenOverlay.evaluate(element => {
      const style = window.getComputedStyle(element)
      return {
        backgroundColor: style.backgroundColor,
        pointerEvents: style.pointerEvents,
      }
    })
    expect(overlayStyle.backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
    expect(overlayStyle.pointerEvents).toBe('none')
    const searchInput = region.getByPlaceholder(/搜索|Search/)
    await expect(searchInput).toBeVisible()
    await searchInput.fill('可复用')
    await expect(searchInput).toHaveValue('可复用')
    await expect(region.getByText('能力', { exact: true }).first()).toBeVisible()
    await expect(region.getByText('可复用表格起点', { exact: false }).first()).toBeVisible()
    await searchInput.fill('')
    await expect(expandedTable.locator('thead, [role="rowgroup"]').first()).toBeVisible()
    await expect(expandedTable.locator('tbody tr, [role="row"]').first()).toBeVisible()
    await expect(region.getByText(/共 \d+ 条|Total \d+ records/).first()).toBeVisible()

    const headerBox = await expectMeasuredBox(header, 'admin header')
    const sidebarBox = await expectMeasuredBox(sidebar, 'admin sidebar')
    const routeTabsBox = await expectMeasuredBox(routeTabs, 'admin route tabs')
    const footerBox = await expectMeasuredBox(footer, 'admin footer')
    const expandedBox = await expectMeasuredBox(expandedTable, 'expanded ProTable')

    // Expanded workspace must be meaningfully different from normal mode by top shift plus height growth
    expect(normalBox.y - expandedBox.y).toBeGreaterThanOrEqual(24)
    expect(expandedBox.height).toBeGreaterThan(normalBox.height + 32)
    // Expanded workspace must start near the top of the app content area
    expect(expandedBox.y).toBeLessThanOrEqual(routeTabsBox.y + routeTabsBox.height + 24)
    expect(expandedBox.y).toBeGreaterThanOrEqual(headerBox.y + headerBox.height - 2)
    expect(expandedBox.y).toBeGreaterThanOrEqual(routeTabsBox.y + routeTabsBox.height - 2)
    // Expanded workspace must not overlap sidebar
    expect(expandedBox.x).toBeGreaterThanOrEqual(sidebarBox.x + sidebarBox.width - 2)
    expect(expandedBox.x).toBeGreaterThan(0)
    // Expanded workspace must fill most of the available content workspace without covering the footer
    const availableContentHeight = footerBox.y - (routeTabsBox.y + routeTabsBox.height)
    expect(expandedBox.height).toBeGreaterThanOrEqual(availableContentHeight * 0.65)
    expect(expandedBox.y + expandedBox.height).toBeLessThanOrEqual(footerBox.y + 2)
    expect(Math.abs(overlayBox.x - expandedBox.x)).toBeLessThanOrEqual(2)
    expect(Math.abs(overlayBox.y - expandedBox.y)).toBeLessThanOrEqual(2)
    expect(Math.abs(overlayBox.width - expandedBox.width)).toBeLessThanOrEqual(2)
    expect(Math.abs(overlayBox.height - expandedBox.height)).toBeLessThanOrEqual(2)
    await expectNoHorizontalOverflow(page)

    const paginator = region.locator('.p-paginator').first()
    const firstCapabilityCell = expandedTable.locator('tbody tr').first().locator('td').first()
    const firstCapabilityBeforePage = await firstCapabilityCell.textContent()
    await expect(paginator).toBeVisible()
    await paginator.locator('.p-paginator-next').first().click()
    await expect
      .poll(async () => firstCapabilityCell.textContent())
      .not.toBe(firstCapabilityBeforePage)

    // Density menu popover trigger accessibility and visual state evidence survive expand/restore
    await expect(densityControl).toHaveAttribute('aria-expanded', 'false')
    await densityControl.click()
    const densityMenu = page.locator('[data-pro-table-density-menu]').first()
    await expect(densityMenu).toBeVisible()
    await expect(densityControl).toHaveAttribute('aria-expanded', 'true')
    await expect(
      densityMenu.locator('[data-pro-table-density-selected="true"]').first()
    ).toBeVisible()
    const compactDensityOption = densityMenu
      .locator('[data-pro-table-density-option="compact"]')
      .first()
    await compactDensityOption.hover()
    const densityHoverStyle = await compactDensityOption.evaluate(element => {
      const style = window.getComputedStyle(element)
      return {
        backgroundColor: style.backgroundColor,
        boxShadow: style.boxShadow,
      }
    })
    expect(densityHoverStyle.backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
    await compactDensityOption.getByRole('button', { name: /紧凑|Compact/ }).focus()
    await expect(compactDensityOption.getByRole('button', { name: /紧凑|Compact/ })).toBeFocused()
    await compactDensityOption.getByRole('button', { name: /紧凑|Compact/ }).click()
    await expect(densityControl).toHaveAttribute('aria-expanded', 'false')
    await densityControl.click()
    await expect(densityMenu.locator('[data-pro-table-density-option="compact"]')).toHaveAttribute(
      'data-pro-table-density-selected',
      'true'
    )
    await densityMenu
      .locator('[data-pro-table-density-option="comfortable"]')
      .first()
      .getByRole('button', { name: /适中|Comfortable/ })
      .click()
    await expect(densityControl).toHaveAttribute('aria-expanded', 'false')

    const ownerHeader = expandedTable
      .locator('thead')
      .getByText(/所有者|Owner/)
      .first()
    await expect(ownerHeader).toBeVisible()
    await colSettingsTrigger.click()
    await expect(colSettingsTrigger).toHaveAttribute('aria-expanded', 'true')
    const ownerSwitchGroup = page.getByRole('group', { name: /所有者|Owner/ }).first()
    await expect(ownerSwitchGroup).toBeVisible()
    const ownerSwitch = ownerSwitchGroup.locator('.p-toggleswitch').first()
    await ownerSwitch.click()
    await expect(ownerHeader).toHaveCount(0)
    await ownerSwitch.click()
    await expect(ownerHeader).toBeVisible()
    await colSettingsTrigger.click()
    await expect(colSettingsTrigger).toHaveAttribute('aria-expanded', 'false')
    await captureEvidence(page, testInfo, 'fullscreen-expanded')

    await restoreControl.click()

    await expect(region.locator('[data-pro-table-fullscreen="true"]')).toHaveCount(0)
    await expect(fullscreenOverlay).toHaveCount(0)
    await expectProTableRegionReady(page)
    const restoredBox = await expectMeasuredBox(proTable, 'restored embedded ProTable')
    expect(restoredBox.height).toBeLessThan(expandedBox.height - 24)
    expect(Math.abs(restoredBox.height - normalBox.height)).toBeLessThanOrEqual(12)
    await expectNoHorizontalOverflow(page)
    await captureEvidence(page, testInfo, 'fullscreen-restored')

    expect(diagnostics.pageErrors).toEqual([])
    expect(diagnostics.consoleErrors).toEqual([])
  })

  test('basic ProTable region fullscreen exits when Escape is pressed', async ({
    page,
  }, testInfo) => {
    const diagnostics = collectDiagnostics(page)

    await page.setViewportSize({ width: 1280, height: 720 })
    await loginAsAdmin(page)
    await gotoShowcaseRoute(page, '/showcase/components/pro-table/basic')

    const region = page.getByTestId('showcase-pro-table-demo-region')
    const proTable = region.locator('[data-pro-table-root]').first()
    const expandControl = region.locator('[data-pro-table-fullscreen-toggle]').first()
    const fullscreenOverlay = page.locator('[data-pro-table-fullscreen-overlay]').first()

    await expect(proTable).toBeVisible()
    await expect(expandControl).toHaveAttribute('aria-pressed', 'false')

    // Escape while NOT in fullscreen must be a harmless no-op.
    await page.keyboard.press('Escape')
    await expect(region.locator('[data-pro-table-fullscreen="true"]')).toHaveCount(0)
    await expect(fullscreenOverlay).toHaveCount(0)

    // Enter region fullscreen via the toolbar toggle.
    await expandControl.click()
    const expandedTable = region.locator('[data-pro-table-fullscreen="true"]').first()
    const restoreControl = region.getByRole('button', { name: /退出全屏|Exit fullscreen/ }).first()
    await expect(expandedTable).toBeVisible()
    await expect(fullscreenOverlay).toBeVisible()
    await expect(restoreControl).toHaveAttribute('aria-pressed', 'true')
    await captureEvidence(page, testInfo, 'fullscreen-escape-active')

    // Press Escape — region fullscreen must exit (PT-ESC-01).
    await page.keyboard.press('Escape')
    await expect(region.locator('[data-pro-table-fullscreen="true"]')).toHaveCount(0)
    await expect(fullscreenOverlay).toHaveCount(0)
    await expect(expandControl).toHaveAttribute('aria-pressed', 'false')

    // Table remains usable after exiting via Escape.
    await expectProTableRegionReady(page)
    const searchInput = region.getByPlaceholder(/搜索|Search/)
    await searchInput.fill('可复用')
    await expect(searchInput).toHaveValue('可复用')
    await searchInput.fill('')
    await expectNoHorizontalOverflow(page)
    await captureEvidence(page, testInfo, 'fullscreen-escape-restored')

    expect(diagnostics.pageErrors).toEqual([])
    expect(diagnostics.consoleErrors).toEqual([])
  })

  test('region fullscreen: Escape closes an open toolbar popover before exiting fullscreen (PT-ESC-02)', async ({
    page,
  }, testInfo) => {
    const diagnostics = collectDiagnostics(page)

    await page.setViewportSize({ width: 1280, height: 720 })
    await loginAsAdmin(page)
    await gotoShowcaseRoute(page, '/showcase/components/pro-table/basic')

    const region = page.getByTestId('showcase-pro-table-demo-region')
    const proTableRoot = region.locator('[data-pro-table-root]').first()
    const expandControl = region.locator('[data-pro-table-fullscreen-toggle]').first()
    const densityControl = region.locator('[data-pro-table-density-toggle]').first()
    const densityMenu = page.locator('[data-pro-table-density-menu]').first()
    const fullscreenFlag = region.locator('[data-pro-table-fullscreen="true"]')
    const fullscreenOverlay = page.locator('[data-pro-table-fullscreen-overlay]').first()

    // Enter region fullscreen.
    await expandControl.click()
    await expect(fullscreenFlag).toHaveCount(1)
    await expect(fullscreenOverlay).toBeVisible()

    // Open the density popover inside the fullscreen region.
    await densityControl.click()
    await expect(densityMenu).toBeVisible()
    await expect(densityControl).toHaveAttribute('aria-expanded', 'true')
    // ProTable must observe the popover-open state so it can defer the Escape exit.
    await expect(proTableRoot).toHaveAttribute('data-pro-table-popover-open', 'true')

    // First Escape closes the popover only — fullscreen must survive.
    await page.keyboard.press('Escape')
    await expect(densityMenu).toBeHidden()
    await expect(densityControl).toHaveAttribute('aria-expanded', 'false')
    await expect(fullscreenFlag).toHaveCount(1)
    await expect(fullscreenOverlay).toBeVisible()
    await captureEvidence(page, testInfo, 'fullscreen-escape-popover-kept')

    // Second Escape (no popover open) now exits fullscreen.
    await page.keyboard.press('Escape')
    await expect(fullscreenFlag).toHaveCount(0)
    await expect(fullscreenOverlay).toHaveCount(0)
    await expect(expandControl).toHaveAttribute('aria-pressed', 'false')

    await expectProTableRegionReady(page)
    await expectNoHorizontalOverflow(page)
    await captureEvidence(page, testInfo, 'fullscreen-escape-popover-exit')

    expect(diagnostics.pageErrors).toEqual([])
    expect(diagnostics.consoleErrors).toEqual([])
  })

  test('DataTable sortable headers expose aria-sort and sort via mouse + keyboard (PT-SORT-A11Y)', async ({
    page,
  }, testInfo) => {
    const diagnostics = collectDiagnostics(page)

    await page.setViewportSize({ width: 1280, height: 720 })
    await loginAsAdmin(page)
    await gotoShowcaseRoute(page, '/showcase/components/pro-table/basic')

    const region = page.getByTestId('showcase-pro-table-demo-region')
    await expectProTableRegionReady(page)

    // The first sortable header is a focusable button control inside a
    // columnheader <th> that carries aria-sort.
    const sortControl = region.locator('[data-pro-table-sort="true"]').first()
    const sortableTh = region.locator('th:has([data-pro-table-sort="true"])').first()
    await expect(sortControl).toBeVisible()
    await expect(sortControl).toHaveAttribute('role', 'button')
    await expect(sortControl).toHaveAttribute('tabindex', '0')
    await expect(sortableTh).toHaveAttribute('aria-sort', 'none')

    // Mouse click → ascending.
    await sortControl.click()
    await expect(sortableTh).toHaveAttribute('aria-sort', 'ascending')

    // Keyboard (Enter on the focused control) → descending.
    await sortControl.focus()
    await expect(sortControl).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(sortableTh).toHaveAttribute('aria-sort', 'descending')

    // Keyboard (Space) also activates the control → cycles back to none
    // (single-column 3-state). Re-focus first: the row re-sort can move focus.
    await sortControl.focus()
    await expect(sortControl).toBeFocused()
    await page.keyboard.press(' ')
    await expect(sortableTh).toHaveAttribute('aria-sort', 'none')

    await expectNoHorizontalOverflow(page)
    await captureEvidence(page, testInfo, 'sort-a11y-keyboard')

    expect(diagnostics.pageErrors).toEqual([])
    expect(diagnostics.consoleErrors).toEqual([])
  })

  test('basic ProTable surfaces per-column filter UI: text + select filters, non-filterable columns inert (PT-UI-03)', async ({
    page,
  }, testInfo) => {
    const diagnostics = collectDiagnostics(page)

    // PT-UI-03 i18n polish (Step 15): the per-column filter labels must resolve from the app
    // locale bundle, so opening/using the filter UI must emit NO [intlify] missing-key warnings
    // for the proTable.columnFilter* keys.
    const columnFilterMissingKeyWarnings: string[] = []
    page.on('console', msg => {
      const text = msg.text()
      if (text.includes('[intlify]') && text.includes('columnFilter')) {
        columnFilterMissingKeyWarnings.push(text)
      }
    })

    await page.setViewportSize({ width: 1280, height: 720 })
    await loginAsAdmin(page)
    await gotoShowcaseRoute(page, '/showcase/components/pro-table/basic')

    const region = page.getByTestId('showcase-pro-table-demo-region')
    await expectProTableRegionReady(page)

    // One shared per-column filter popover (PrimeVue overlay teleported to <body>).
    const filterPopover = page.locator('[data-pro-table-filter-popover]').first()
    // The header filter trigger sits inside the DataTable's overflow-auto container, so a
    // focus-scroll on click can dismiss the just-opened popover. Centering the trigger first
    // makes that focus-scroll a no-op, so the popover opens and persists deterministically.
    const openHeaderFilter = async (toggle: Locator): Promise<void> => {
      await toggle.evaluate(el => el.scrollIntoView({ block: 'center', inline: 'center' }))
      await toggle.click()
      await expect(filterPopover).toBeVisible()
    }

    // The paginator total reflects the engine's filtered row count independent of page size.
    const totalLocator = region.getByText(/共 \d+ 条|Total \d+ records/).first()
    await expect(totalLocator).toBeVisible()
    const readTotal = async (): Promise<number> => {
      const text = (await totalLocator.textContent()) ?? ''
      const match = text.match(/(\d+)/)
      if (!match) throw new Error(`No total count parsed from "${text}"`)
      return Number(match[1])
    }
    const initialTotal = await readTotal()
    expect(initialTotal).toBe(16) // basic mode renders 16 stable local rows

    // (7) Non-filterable columns expose NO filter trigger.
    const ownerHeader = region.locator('th', { hasText: '所有者' }).first()
    await expect(ownerHeader).toBeVisible()
    await expect(ownerHeader.locator('[data-pro-table-filter-toggle]')).toHaveCount(0)
    const recordsHeader = region.locator('th', { hasText: '记录数' }).first()
    await expect(recordsHeader.locator('[data-pro-table-filter-toggle]')).toHaveCount(0)

    // (1) Filterable TEXT column (capability) exposes a filter trigger with the a11y contract.
    const capabilityHeader = region.locator('th', { hasText: '能力' }).first()
    const capabilityFilter = capabilityHeader.locator('[data-pro-table-filter-toggle]').first()
    await expect(capabilityFilter).toBeVisible()
    await expect(capabilityFilter).toHaveAttribute('aria-haspopup', 'dialog')
    await expect(capabilityFilter).toHaveAttribute('aria-expanded', 'false')
    await expect(capabilityFilter).toHaveAttribute('aria-pressed', 'false')
    // PT-UI-03 i18n polish: localized aria-label (was the English fallback "Filter 能力").
    await expect(capabilityFilter).toHaveAttribute('aria-label', '筛选「能力」')

    // Capture row-1 capability for a deterministic text-filter value.
    const firstCapability =
      (await region.locator('tbody tr').first().locator('td').first().textContent())?.trim() ?? ''
    expect(firstCapability.length).toBeGreaterThan(0)

    // (2) Clicking opens the filter popover (teleported to <body>) with a text input.
    await openHeaderFilter(capabilityFilter)
    await expect(capabilityFilter).toHaveAttribute('aria-expanded', 'true')
    const textInput = filterPopover.locator('input[data-pro-table-filter-input]').first()
    await expect(textInput).toBeVisible()
    // PT-UI-03 i18n polish: localized placeholder (was the English fallback "Filter…").
    await expect(textInput).toHaveAttribute('placeholder', '筛选...')

    // (3) Entering a value filters the visible rows through the engine contract.
    await textInput.fill(firstCapability)
    await expect.poll(readTotal).toBeLessThan(initialTotal)
    await expect(region.getByText(firstCapability, { exact: false }).first()).toBeVisible()

    // (4) The trigger announces the active filter state.
    await expect(capabilityFilter).toHaveAttribute('aria-pressed', 'true')
    await expect(capabilityFilter).toHaveAttribute('data-pro-table-filter-active', 'true')
    await captureEvidence(page, testInfo, 'column-filter-text-active')

    // (5) Clearing the filter restores the rows and the inactive state (popover stays open).
    const clearButton = filterPopover.locator('[data-pro-table-filter-clear]').first()
    await expect(clearButton).toBeEnabled()
    // PT-UI-03 i18n polish: localized clear label (was the English fallback "Clear").
    await expect(clearButton).toContainText('清除筛选')
    await clearButton.click()
    await expect.poll(readTotal).toBe(initialTotal)
    await expect(capabilityFilter).toHaveAttribute('aria-pressed', 'false')
    await expect(capabilityFilter).not.toHaveAttribute('data-pro-table-filter-active', 'true')

    // (8) Escape closes the still-open filter popover; with no fullscreen active this is
    // harmless to the table (the fullscreen Escape handler only binds while fullscreen).
    await expect(filterPopover).toBeVisible()
    await textInput.click()
    await page.keyboard.press('Escape')
    await expect(filterPopover).toBeHidden()
    await expect(capabilityFilter).toHaveAttribute('aria-expanded', 'false')

    // (6) Filterable SELECT column (status) renders a select control and filters correctly.
    const statusHeader = region.locator('th', { hasText: '状态' }).first()
    const statusFilter = statusHeader.locator('[data-pro-table-filter-toggle]').first()
    await expect(statusFilter).toBeVisible()
    // PT-UI-03 i18n polish: localized aria-label on the select-filter trigger too.
    await expect(statusFilter).toHaveAttribute('aria-label', '筛选「状态」')
    await openHeaderFilter(statusFilter)
    await expect(filterPopover.locator('.p-select')).toBeVisible()
    const statusCombobox = filterPopover.getByRole('combobox')
    await statusCombobox.click()
    await page.getByRole('option', { name: '请求', exact: true }).click()
    await expect(statusCombobox).toContainText('请求')
    // status=request matches exactly 2 of the 16 stable rows.
    await expect.poll(readTotal).toBe(2)
    await expect(statusFilter).toHaveAttribute('aria-pressed', 'true')
    await expect(statusFilter).toHaveAttribute('data-pro-table-filter-active', 'true')
    await captureEvidence(page, testInfo, 'column-filter-select-active')

    // Clearing the select filter restores the full row set.
    const statusClear = filterPopover.locator('[data-pro-table-filter-clear]').first()
    await expect(statusClear).toBeEnabled()
    await statusClear.click()
    await expect.poll(readTotal).toBe(initialTotal)
    await expect(statusFilter).not.toHaveAttribute('data-pro-table-filter-active', 'true')

    await expectNoHorizontalOverflow(page)
    await captureEvidence(page, testInfo, 'column-filter-restored')

    expect(diagnostics.pageErrors).toEqual([])
    expect(diagnostics.consoleErrors).toEqual([])
    // PT-UI-03 i18n polish: filter labels resolved from the locale bundle — no missing-key noise.
    expect(columnFilterMissingKeyWarnings).toEqual([])
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
