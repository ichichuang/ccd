import { expect, test, type Page } from '@playwright/test'
import {
  loginAsAdmin,
  waitForAppReady,
  waitForRuntimeLoadingIdle,
  withVisualMode,
} from './helpers/app'
import {
  SHOWCASE_ROUTE_SMOKE_TARGET_PATHS,
  type ShowcaseRouteSmokeTargetPath,
} from './showcaseRouteSmokeTargets'

const viewportMatrix = [
  { name: 'desktop', width: 1280, height: 720 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
] as const

const showcaseSmokeTargetSet = new Set<string>(SHOWCASE_ROUTE_SMOKE_TARGET_PATHS)
let showcaseNavigationId = 0

function showcaseSmokePath(path: ShowcaseRouteSmokeTargetPath): ShowcaseRouteSmokeTargetPath {
  if (!showcaseSmokeTargetSet.has(path)) {
    throw new Error(`Missing showcase route smoke target: ${path}`)
  }

  return path
}

async function gotoFreshVisualRoute(
  page: Page,
  hashPath: string,
  expectedHashPath = hashPath
): Promise<void> {
  showcaseNavigationId += 1
  const normalizedPath = hashPath.startsWith('/') ? hashPath : `/${hashPath}`
  const normalizedExpectedPath = expectedHashPath.startsWith('/')
    ? expectedHashPath
    : `/${expectedHashPath}`
  const visualUrl = withVisualMode(normalizedPath).replace(
    '?e2e=visual',
    `?e2e=visual&e2eShowcaseRoute=${showcaseNavigationId}`
  )

  await page.goto(visualUrl, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(
    path => window.location.hash === `#${path}` || window.location.hash === '#/404',
    normalizedExpectedPath
  )
}

function collectPageDiagnostics(page: Page): {
  pageErrors: string[]
  consoleErrors: string[]
} {
  const pageErrors: string[] = []
  const consoleErrors: string[] = []

  page.on('pageerror', err => pageErrors.push(err.message))
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })

  return { pageErrors, consoleErrors }
}

function expectNoDiagnostics(diagnostics: { pageErrors: string[]; consoleErrors: string[] }): void {
  expect(diagnostics.pageErrors).toEqual([])
  expect(diagnostics.consoleErrors).toEqual([])
}

async function expectDashboardPublicProductLanding(page: Page): Promise<void> {
  const dashboard = page.locator('#dashboard-page')
  const startExploring = page.locator('#dashboard-start-exploring')
  const deliveryStory = page.getByRole('link', { name: '查看交付故事', exact: true })

  await expect(dashboard).toBeVisible()
  await expect(dashboard).toContainText('CCD 产品系统')
  await expect(dashboard).toContainText('用一套可复用能力构建一致的应用体验')
  await expect(startExploring).toBeVisible()
  await expect(startExploring).toHaveText(/开始探索/)
  await expect(startExploring).toHaveAttribute('href', /#\/showcase\/overview$/)
  await expect(deliveryStory).toBeVisible()
  await expect(deliveryStory).toHaveText(/查看交付故事/)
  await expect(page.locator('[data-testid="dashboard-benefit-card"]')).toHaveCount(6)
  await expect(page.locator('[data-testid="dashboard-capability-card"]')).toHaveCount(6)
  await expect(page.locator('[data-testid="dashboard-preview-tile"]')).toHaveCount(3)
}

async function expectNoEmbeddedLargeDemos(page: Page): Promise<void> {
  await expect(page.locator('#dashboard-page canvas')).toHaveCount(0)
  await expect(page.locator('#dashboard-page .echarts')).toHaveCount(0)
  await expect(page.locator('#dashboard-page .p-datatable')).toHaveCount(0)
  await expect(
    page.locator(
      '#dashboard-page form, #dashboard-page .pro-table, #dashboard-page [class*="pro-table"], #dashboard-page .pro-form, #dashboard-page [class*="pro-form"]'
    )
  ).toHaveCount(0)
}

async function expectResponsiveDashboardGeometry(page: Page): Promise<void> {
  const geometry = await page.locator('#dashboard-page').evaluate(element => {
    const rect = element.getBoundingClientRect()
    return {
      width: rect.width,
      height: rect.height,
      textLength: element.textContent?.trim().length ?? 0,
      documentClientWidth: document.documentElement.clientWidth,
      documentScrollWidth: document.documentElement.scrollWidth,
    }
  })

  expect(geometry.width).toBeGreaterThan(0)
  expect(geometry.height).toBeGreaterThan(0)
  expect(geometry.textLength).toBeGreaterThan(100)
  expect(geometry.documentScrollWidth).toBeLessThanOrEqual(geometry.documentClientWidth + 2)
}

async function expectUsableChartCanvas(page: Page): Promise<void> {
  const canvas = page.locator('.echarts canvas').first()
  await expect(canvas).toBeVisible({ timeout: 15000 })

  const geometry = await canvas.evaluate(element => {
    const rect = element.getBoundingClientRect()
    const canvasElement = element as HTMLCanvasElement
    return {
      cssWidth: Math.round(rect.width),
      cssHeight: Math.round(rect.height),
      width: canvasElement.width,
      height: canvasElement.height,
    }
  })

  expect(geometry.cssWidth).toBeGreaterThan(0)
  expect(geometry.cssHeight).toBeGreaterThan(0)
  expect(geometry.width).toBeGreaterThan(0)
  expect(geometry.height).toBeGreaterThan(0)
}

async function expectNoInlineMotionResidue(page: Page, rootSelector: string): Promise<void> {
  const residue = await page
    .locator(rootSelector)
    .first()
    .evaluate(root => {
      const style = (root as HTMLElement).style
      if (!style.animation && !style.opacity && !style.transform && !style.transition) return []

      return [
        {
          tagName: root.tagName.toLowerCase(),
          testId: root.getAttribute('data-testid'),
          id: root.id,
          animation: style.animation,
          opacity: style.opacity,
          transform: style.transform,
          transition: style.transition,
        },
      ]
    })

  expect(residue).toEqual([])
}

test.describe('showcase route system public product experience', () => {
  for (const viewport of viewportMatrix) {
    test(`${viewport.name} dashboard is a public product homepage`, async ({ page }) => {
      const diagnostics = collectPageDiagnostics(page)
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await loginAsAdmin(page)

      await expectDashboardPublicProductLanding(page)
      await expectNoEmbeddedLargeDemos(page)
      await expectResponsiveDashboardGeometry(page)
      expectNoDiagnostics(diagnostics)
    })
  }

  test('showcase root redirects to the catalog overview', async ({ page }) => {
    const diagnostics = collectPageDiagnostics(page)
    await loginAsAdmin(page)

    await gotoFreshVisualRoute(page, '/showcase', '/showcase/overview')
    await waitForAppReady(page)
    await waitForRuntimeLoadingIdle(page)

    await expect(page).toHaveURL(/#\/showcase\/overview$/)
    await expect(page.locator('h1', { hasText: '概览' })).toBeVisible()
    await expect(page.getByText('浏览承载产品演示', { exact: false }).first()).toBeVisible()
    expectNoDiagnostics(diagnostics)
  })

  test('ProTable basic showcase page renders a focused table demo', async ({ page }) => {
    const diagnostics = collectPageDiagnostics(page)
    await loginAsAdmin(page)

    await gotoFreshVisualRoute(page, showcaseSmokePath('/showcase/components/pro-table/basic'))
    await waitForAppReady(page)
    await waitForRuntimeLoadingIdle(page)

    await expect(page.locator('h1', { hasText: '基础表格' })).toBeVisible()
    await expect(page.getByText('试用基础表格').first()).toBeVisible()
    await expect(page.locator('.p-datatable').first()).toBeVisible()
    await expect(page.getByText('可复用表格起点').first()).toBeVisible()
    expectNoDiagnostics(diagnostics)
  })

  test('ProForm validation showcase page renders guided validation', async ({ page }) => {
    const diagnostics = collectPageDiagnostics(page)
    await loginAsAdmin(page)

    await gotoFreshVisualRoute(page, showcaseSmokePath('/showcase/components/pro-form/validation'))
    await waitForAppReady(page)
    await waitForRuntimeLoadingIdle(page)

    await expect(page.locator('h1', { hasText: '校验' })).toBeVisible()
    await expect(page.getByText('试用校验规则').first()).toBeVisible()
    await page.getByRole('button', { name: /^校验$/ }).click()
    await expect(page.getByText('请求名称必填。').first()).toBeVisible()
    expectNoDiagnostics(diagnostics)
  })

  test('chart theme showcase page renders a usable chart canvas', async ({ page }) => {
    const diagnostics = collectPageDiagnostics(page)
    await loginAsAdmin(page)

    await gotoFreshVisualRoute(page, showcaseSmokePath('/showcase/components/charts/theme'))
    await waitForAppReady(page)
    await waitForRuntimeLoadingIdle(page)

    await expect(page.locator('h1', { hasText: '图表主题' })).toBeVisible()
    await expect(page.getByText('主题感知图表', { exact: false }).first()).toBeVisible()
    await expectUsableChartCanvas(page)
    expectNoDiagnostics(diagnostics)
  })

  test('design token showcase page explains visual system basics', async ({ page }) => {
    const diagnostics = collectPageDiagnostics(page)
    await loginAsAdmin(page)

    await gotoFreshVisualRoute(page, showcaseSmokePath('/showcase/design/tokens'))
    await waitForAppReady(page)
    await waitForRuntimeLoadingIdle(page)

    await expect(page.locator('h1', { hasText: '设计 Token' })).toBeVisible()
    await expect(page.getByText('语义 token 族', { exact: false }).first()).toBeVisible()
    await expect(
      page.getByText('状态表面如何跨主题保持可读', { exact: false }).first()
    ).toBeVisible()
    expectNoDiagnostics(diagnostics)
  })

  test('dashboard and showcase leave no inline reveal motion under reduced motion', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await loginAsAdmin(page)
    await expectDashboardPublicProductLanding(page)
    await expectNoInlineMotionResidue(page, '#dashboard-page')

    await gotoFreshVisualRoute(page, '/showcase', '/showcase/overview')
    await waitForAppReady(page)
    await waitForRuntimeLoadingIdle(page)
    await expect(page.locator('h1', { hasText: '概览' })).toBeVisible()
    await expectNoInlineMotionResidue(page, 'section:has(> header h1)')
  })
})
