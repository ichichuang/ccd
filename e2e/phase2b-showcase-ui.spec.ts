import { expect, test, type Page, type TestInfo } from '@playwright/test'
import {
  loginAsAdmin,
  waitForAppReady,
  waitForRuntimeLoadingIdle,
  withVisualMode,
} from './helpers/app'

const migratedRoutes = [
  {
    slug: 'overview',
    path: '/showcase/overview',
    heading: '概览',
    evidence: '浏览承载产品演示',
  },
  {
    slug: 'pro-table-basic',
    path: '/showcase/components/pro-table/basic',
    heading: '基础表格',
    evidence: '表格操作',
  },
  {
    slug: 'pro-table-columns',
    path: '/showcase/components/pro-table/columns',
    heading: '列配置',
    evidence: '表格操作',
  },
  {
    slug: 'dialog-toast',
    path: '/showcase/feedback/dialog-toast',
    heading: 'Dialog 与 Toast',
    evidence: '反馈操作',
  },
] as const

const viewportMatrix = [
  { name: 'desktop', width: 1280, height: 720 },
  { name: 'mobile', width: 390, height: 844 },
] as const

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
    `?e2e=visual&e2ePhase2B=${navigationId}`
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

test.describe('Phase 2B showcase UI readiness', () => {
  for (const viewport of viewportMatrix) {
    test(`${viewport.name} migrated showcase routes stay readable without overflow`, async ({
      page,
    }, testInfo) => {
      const diagnostics = collectDiagnostics(page)

      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await loginAsAdmin(page)

      for (const route of migratedRoutes) {
        await gotoShowcaseRoute(page, route.path)
        await expect(page.locator('h1', { hasText: route.heading })).toBeVisible()
        await expect(page.getByText(route.evidence, { exact: false }).first()).toBeVisible()
        await expectNoHorizontalOverflow(page)
        await captureEvidence(page, testInfo, `${viewport.name}-${route.slug}`)
      }

      expect(diagnostics.pageErrors).toEqual([])
      expect(diagnostics.consoleErrors).toEqual([])
    })
  }

  test('dark Dialog and Toast showcase keeps feedback controls readable', async ({
    page,
  }, testInfo) => {
    const diagnostics = collectDiagnostics(page)

    await page.setViewportSize({ width: 1280, height: 720 })
    await loginAsAdmin(page)
    await switchThemeFromSettings(page, 'dark')
    await gotoShowcaseRoute(page, '/showcase/feedback/dialog-toast')
    await page.waitForFunction(() => document.documentElement.classList.contains('dark'))

    await expect(page.locator('h1', { hasText: 'Dialog 与 Toast' })).toBeVisible()
    await expect(page.getByText('反馈操作', { exact: true })).toBeVisible()
    await page.getByRole('button', { name: '打开 Dialog' }).click()
    await expect(page.getByText('反馈 Dialog').first()).toBeVisible()
    await page.getByRole('button', { name: '确定' }).click()
    await expectNoHorizontalOverflow(page)
    await captureEvidence(page, testInfo, 'dark-dialog-toast')

    expect(diagnostics.pageErrors).toEqual([])
    expect(diagnostics.consoleErrors).toEqual([])
  })
})
