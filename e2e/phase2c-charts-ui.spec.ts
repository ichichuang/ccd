import { expect, test, type Page, type TestInfo } from '@playwright/test'
import {
  loginAsAdmin,
  waitForAppReady,
  waitForRuntimeLoadingIdle,
  withVisualMode,
} from './helpers/app'

const chartRoutes = [
  {
    slug: 'overview',
    path: '/showcase/components/charts/overview',
    heading: '图表概览',
    evidence: 'ShowcaseChartDemoShell.vue',
  },
  {
    slug: 'theme',
    path: '/showcase/components/charts/theme',
    heading: '图表主题',
    evidence: 'UseEcharts.vue',
  },
  {
    slug: 'responsive',
    path: '/showcase/components/charts/responsive',
    heading: '响应式图表',
    evidence: 'showcaseChartOptions.ts',
    control: '紧凑宽度',
  },
  {
    slug: 'states',
    path: '/showcase/components/charts/states',
    heading: '图表状态',
    evidence: 'showcaseChartOptions.ts',
    control: '加载',
  },
  {
    slug: 'events',
    path: '/showcase/components/charts/events',
    heading: '图表事件',
    evidence: 'UseEcharts.vue',
  },
  {
    slug: 'dashboard-preview',
    path: '/showcase/components/charts/dashboard-preview',
    heading: '看板预览',
    evidence: 'showcaseChartOptions.ts',
  },
] as const

const mobileRoutes = [
  chartRoutes.find(route => route.slug === 'overview'),
  chartRoutes.find(route => route.slug === 'responsive'),
].filter((route): route is (typeof chartRoutes)[number] => Boolean(route))

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
    `?e2e=visual&e2ePhase2CCharts=${navigationId}`
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

async function expectChartRegionReady(page: Page): Promise<void> {
  const region = page.getByTestId('showcase-chart-region')
  await expect(region).toBeVisible({ timeout: 15000 })

  const regionBox = await region.boundingBox()
  expect(regionBox?.width ?? 0).toBeGreaterThan(180)
  expect(regionBox?.height ?? 0).toBeGreaterThan(240)

  const chart = region.locator('.echarts').first()
  await expect(chart).toBeVisible({ timeout: 15000 })

  const chartBox = await chart.boundingBox()
  expect(chartBox?.width ?? 0).toBeGreaterThan(0)
  expect(chartBox?.height ?? 0).toBeGreaterThan(0)
}

async function expectSourceEvidenceReadable(page: Page, evidence: string): Promise<void> {
  const sourceArea = page.getByTestId('showcase-chart-source-area')
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

async function expectChartsRoute(page: Page, route: (typeof chartRoutes)[number]): Promise<void> {
  await gotoShowcaseRoute(page, route.path)

  await expect(page.locator('h1', { hasText: route.heading })).toBeVisible()
  await expect(page.getByText('图表控制', { exact: true }).first()).toBeVisible()
  await expect(page.getByText('就绪度与配置', { exact: true }).first()).toBeVisible()
  await expect(page.getByText('源码与包装证据', { exact: true }).first()).toBeVisible()
  await expect(page.getByText('包装驱动', { exact: true }).first()).toBeVisible()
  await expectChartRegionReady(page)
  await expectSourceEvidenceReadable(page, route.evidence)

  if (route.control) {
    await expect(page.getByText(route.control, { exact: true }).first()).toBeVisible()
  }

  await expectNoHorizontalOverflow(page)
}

test.describe('Phase 2C Charts showcase UI readiness', () => {
  test('desktop Charts routes keep chart, controls, readiness, and evidence readable', async ({
    page,
  }, testInfo) => {
    const diagnostics = collectDiagnostics(page)

    await page.setViewportSize({ width: 1280, height: 720 })
    await loginAsAdmin(page)

    for (const route of chartRoutes) {
      await expectChartsRoute(page, route)
      await captureEvidence(page, testInfo, `desktop-${route.slug}`)
    }

    expect(diagnostics.pageErrors).toEqual([])
    expect(diagnostics.consoleErrors).toEqual([])
  })

  test('mobile Charts routes avoid document overflow', async ({ page }, testInfo) => {
    const diagnostics = collectDiagnostics(page)

    await page.setViewportSize({ width: 390, height: 844 })
    await loginAsAdmin(page)

    for (const route of mobileRoutes) {
      await expectChartsRoute(page, route)
      await captureEvidence(page, testInfo, `mobile-${route.slug}`)
    }

    expect(diagnostics.pageErrors).toEqual([])
    expect(diagnostics.consoleErrors).toEqual([])
  })

  test('chart controls remain usable', async ({ page }, testInfo) => {
    const diagnostics = collectDiagnostics(page)

    await page.setViewportSize({ width: 1280, height: 720 })
    await loginAsAdmin(page)

    await gotoShowcaseRoute(page, '/showcase/components/charts/responsive')
    const stage = page.getByTestId('showcase-chart-region')
    const initialWidth = await stage.evaluate(element =>
      Math.round(element.getBoundingClientRect().width)
    )
    await page.getByLabel('紧凑宽度').click()
    await expect
      .poll(async () =>
        stage.evaluate(element => Math.round(element.getBoundingClientRect().width))
      )
      .toBeLessThan(initialWidth)
    await expectChartRegionReady(page)
    await expectNoHorizontalOverflow(page)
    await captureEvidence(page, testInfo, 'responsive-compact-control')

    await gotoShowcaseRoute(page, '/showcase/components/charts/states')
    await page.getByLabel('加载').click()
    await expect(page.getByText('加载', { exact: true }).first()).toBeVisible()
    await expectChartRegionReady(page)
    await expectNoHorizontalOverflow(page)
    await captureEvidence(page, testInfo, 'states-loading-control')

    expect(diagnostics.pageErrors).toEqual([])
    expect(diagnostics.consoleErrors).toEqual([])
  })

  test('dark theme chart route keeps chart and source evidence readable', async ({
    page,
  }, testInfo) => {
    const diagnostics = collectDiagnostics(page)

    await page.setViewportSize({ width: 1280, height: 720 })
    await loginAsAdmin(page)
    await switchThemeFromSettings(page, 'dark')
    await gotoShowcaseRoute(page, '/showcase/components/charts/theme')
    await page.waitForFunction(() => document.documentElement.classList.contains('dark'))

    await expect(page.locator('h1', { hasText: '图表主题' })).toBeVisible()
    await expectChartRegionReady(page)
    await expectSourceEvidenceReadable(page, 'UseEcharts.vue')
    await expectNoHorizontalOverflow(page)
    await captureEvidence(page, testInfo, 'dark-theme')

    expect(diagnostics.pageErrors).toEqual([])
    expect(diagnostics.consoleErrors).toEqual([])
  })
})
