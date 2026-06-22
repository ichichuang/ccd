import { expect, test, type Page, type TestInfo } from '@playwright/test'
import {
  loginAsAdmin,
  waitForAppReady,
  waitForRuntimeLoadingIdle,
  withVisualMode,
} from './helpers/app'

const proFormRoutes = [
  {
    slug: 'overview',
    path: '/showcase/components/pro-form/overview',
    heading: 'ProForm 概览',
    primaryControl: '请求名称',
    evidence: 'ProFormDemoShell.vue',
  },
  {
    slug: 'basic-schema',
    path: '/showcase/components/pro-form/basic-schema',
    heading: '基础 Schema',
    primaryControl: '请求名称',
    evidence: 'proFormDemoSchemas.ts',
  },
  {
    slug: 'validation',
    path: '/showcase/components/pro-form/validation',
    heading: '校验',
    primaryControl: '请求名称',
    evidence: 'ProFormDemoShell.vue',
  },
  {
    slug: 'conditional-visibility',
    path: '/showcase/components/pro-form/conditional-visibility',
    heading: '条件显示',
    primaryControl: '审批说明',
    evidence: 'proFormDemoSchemas.ts',
  },
  {
    slug: 'dependencies-computed',
    path: '/showcase/components/pro-form/dependencies-computed',
    heading: '依赖与计算',
    primaryControl: '月度成本',
    evidence: 'proFormDemoSchemas.ts',
  },
  {
    slug: 'grouped-layout',
    path: '/showcase/components/pro-form/grouped-layout',
    heading: '分组布局',
    primaryControl: '请求信息',
    evidence: 'proFormDemoSchemas.ts',
  },
] as const

const mobileRoutes = [
  proFormRoutes.find(route => route.slug === 'basic-schema'),
  proFormRoutes.find(route => route.slug === 'validation'),
].filter((route): route is (typeof proFormRoutes)[number] => Boolean(route))

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
    `?e2e=visual&e2ePhase2C=${navigationId}`
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
  return path
}

async function expectProFormRoute(
  page: Page,
  route: (typeof proFormRoutes)[number]
): Promise<void> {
  await gotoShowcaseRoute(page, route.path)

  await expect(page.locator('h1', { hasText: route.heading })).toBeVisible()
  await expect(page.getByText('表单操作', { exact: true }).first()).toBeVisible()
  await expect(page.getByRole('button', { name: /^校验$/ }).first()).toBeVisible()
  await expect(page.getByRole('button', { name: '提交请求' }).first()).toBeVisible()
  await expect(page.getByText(route.primaryControl, { exact: false }).first()).toBeVisible()
  await expect(page.getByText(route.evidence, { exact: false }).first()).toBeVisible()
  await expect(page.getByText('本地反馈', { exact: true }).first()).toBeVisible()
  await expectNoHorizontalOverflow(page)
}

test.describe('Phase 2C ProForm showcase UI readiness', () => {
  test('desktop ProForm routes keep actions, forms, feedback, and evidence readable', async ({
    page,
  }, testInfo) => {
    const diagnostics = collectDiagnostics(page)

    await page.setViewportSize({ width: 1280, height: 720 })
    await loginAsAdmin(page)

    for (const route of proFormRoutes) {
      await expectProFormRoute(page, route)
      await captureEvidence(page, testInfo, `desktop-${route.slug}`)
    }

    expect(diagnostics.pageErrors).toEqual([])
    expect(diagnostics.consoleErrors).toEqual([])
  })

  test('mobile ProForm routes avoid document overflow', async ({ page }, testInfo) => {
    const diagnostics = collectDiagnostics(page)

    await page.setViewportSize({ width: 390, height: 844 })
    await loginAsAdmin(page)

    for (const route of mobileRoutes) {
      await expectProFormRoute(page, route)
      await captureEvidence(page, testInfo, `mobile-${route.slug}`)
    }

    expect(diagnostics.pageErrors).toEqual([])
    expect(diagnostics.consoleErrors).toEqual([])
  })

  test('validation and submit feedback remain usable', async ({ page }, testInfo) => {
    const diagnostics = collectDiagnostics(page)

    await page.setViewportSize({ width: 1280, height: 720 })
    await loginAsAdmin(page)

    await gotoShowcaseRoute(page, '/showcase/components/pro-form/validation')
    await page
      .getByRole('button', { name: /^校验$/ })
      .first()
      .click()
    await expect(page.getByText('请求名称必填。').first()).toBeVisible()
    await expectNoHorizontalOverflow(page)
    await captureEvidence(page, testInfo, 'validation-required-fields')

    await gotoShowcaseRoute(page, '/showcase/components/pro-form/basic-schema')
    await page.getByRole('button', { name: '提交请求' }).first().click()
    await expect(page.getByText('已本地提交字段', { exact: false }).first()).toBeVisible()
    await expectNoHorizontalOverflow(page)
    await captureEvidence(page, testInfo, 'basic-submit-feedback')

    expect(diagnostics.pageErrors).toEqual([])
    expect(diagnostics.consoleErrors).toEqual([])
  })

  test('dark validation route keeps controls and feedback readable', async ({ page }, testInfo) => {
    const diagnostics = collectDiagnostics(page)

    await page.setViewportSize({ width: 1280, height: 720 })
    await loginAsAdmin(page)
    await switchThemeFromSettings(page, 'dark')
    await gotoShowcaseRoute(page, '/showcase/components/pro-form/validation')
    await page.waitForFunction(() => document.documentElement.classList.contains('dark'))

    await expect(page.locator('h1', { hasText: '校验' })).toBeVisible()
    await expect(page.getByText('Schema 驱动表单', { exact: true }).first()).toBeVisible()
    await expect(page.getByRole('button', { name: /^校验$/ }).first()).toBeVisible()
    await expectNoHorizontalOverflow(page)
    await captureEvidence(page, testInfo, 'dark-validation')

    expect(diagnostics.pageErrors).toEqual([])
    expect(diagnostics.consoleErrors).toEqual([])
  })
})
