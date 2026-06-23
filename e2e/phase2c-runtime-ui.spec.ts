import { expect, test, type Page, type TestInfo } from '@playwright/test'
import {
  loginAsAdmin,
  waitForAppReady,
  waitForRuntimeLoadingIdle,
  withVisualMode,
} from './helpers/app'

const runtimeRoutes = [
  {
    slug: 'overview',
    path: '/showcase/runtime/overview',
    heading: '运行时概览',
    evidence: 'ShowcaseRuntimePage.vue',
  },
  {
    slug: 'http',
    path: '/showcase/runtime/http',
    heading: 'HTTP 运行时',
    evidence: 'useHttpRequest.ts',
  },
  {
    slug: 'browser-runtime',
    path: '/showcase/runtime/browser-runtime',
    heading: '浏览器运行时',
    evidence: 'device.adapter.ts',
  },
  {
    slug: 'layout',
    path: '/showcase/runtime/layout',
    heading: '布局运行时',
    evidence: 'useLayoutRuntime.ts',
  },
  {
    slug: 'state-ownership',
    path: '/showcase/runtime/state-ownership',
    heading: '状态归属',
    evidence: 'piniaSerializer.ts',
  },
] as const

const mobileRoutes = [
  runtimeRoutes.find(route => route.slug === 'browser-runtime'),
  runtimeRoutes.find(route => route.slug === 'state-ownership'),
].filter((route): route is (typeof runtimeRoutes)[number] => Boolean(route))

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
    `?e2e=visual&e2ePhase2CRuntime=${navigationId}`
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
  await testInfo.attach(name, {
    path,
    contentType: 'image/png',
  })
  return path
}

async function expectSourceEvidenceReadable(page: Page, evidence: string): Promise<void> {
  const sourceCode = page.locator('code').filter({ hasText: evidence }).first()
  await expect(sourceCode).toBeVisible()

  const codeMetrics = await sourceCode.evaluate(element => {
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

async function expectKeyboardFocusVisible(page: Page): Promise<void> {
  const actionButton = page.getByTestId('showcase-runtime-run-check')
  await actionButton.focus()

  const focusState = await actionButton.evaluate(element => {
    const style = window.getComputedStyle(element)
    return {
      active: document.activeElement === element,
      boxShadow: style.boxShadow,
      outlineStyle: style.outlineStyle,
      outlineWidth: style.outlineWidth,
    }
  })

  expect(focusState.active).toBe(true)
  expect(
    focusState.boxShadow !== 'none' ||
      (focusState.outlineStyle !== 'none' && focusState.outlineWidth !== '0px')
  ).toBe(true)
}

async function expectRuntimeRoute(
  page: Page,
  route: (typeof runtimeRoutes)[number]
): Promise<void> {
  await gotoShowcaseRoute(page, route.path)

  await expect(page.locator('h1', { hasText: route.heading })).toBeVisible()
  await expect(page.getByTestId('showcase-runtime-demo')).toBeVisible()
  await expect(page.getByTestId('showcase-runtime-action-toolbar')).toBeVisible()
  await expect(page.getByTestId('showcase-runtime-state-panel')).toBeVisible()
  await expect(page.getByTestId('showcase-runtime-result-panel')).toBeVisible()
  await expect(page.getByTestId('showcase-runtime-contract')).toBeVisible()
  await expect(page.getByTestId('showcase-runtime-source-area')).toBeVisible()
  await expect(page.getByTestId('showcase-runtime-evidence-area')).toBeVisible()
  await expect(page.getByTestId('showcase-runtime-run-check')).toBeVisible()
  await expect(page.getByTestId('showcase-runtime-reset-check')).toBeVisible()
  await expect(page.getByTestId('showcase-runtime-run-count')).toBeVisible()
  await expect(page.getByTestId('showcase-runtime-last-action')).toBeVisible()
  await expectSourceEvidenceReadable(page, 'ShowcaseRuntimePage.vue')
  await expectSourceEvidenceReadable(page, route.evidence)
  await expectNoHorizontalOverflow(page)
}

test.describe('Phase 2C Runtime showcase UI readiness', () => {
  test('desktop Runtime routes keep demo, state, actions, and evidence readable', async ({
    page,
  }, testInfo) => {
    const diagnostics = collectDiagnostics(page)

    await page.setViewportSize({ width: 1280, height: 720 })
    await loginAsAdmin(page)

    for (const route of runtimeRoutes) {
      await expectRuntimeRoute(page, route)
      await captureEvidence(page, testInfo, `desktop-${route.slug}`)
    }

    expect(diagnostics.pageErrors).toEqual([])
    expect(diagnostics.consoleErrors).toEqual([])
  })

  test('mobile Runtime routes avoid document overflow', async ({ page }, testInfo) => {
    const diagnostics = collectDiagnostics(page)

    await page.setViewportSize({ width: 390, height: 844 })
    await loginAsAdmin(page)

    for (const route of mobileRoutes) {
      await expectRuntimeRoute(page, route)
      await captureEvidence(page, testInfo, `mobile-${route.slug}`)
    }

    expect(diagnostics.pageErrors).toEqual([])
    expect(diagnostics.consoleErrors).toEqual([])
  })

  test('representative Runtime actions update local result state', async ({ page }, testInfo) => {
    const diagnostics = collectDiagnostics(page)

    await page.setViewportSize({ width: 1280, height: 720 })
    await loginAsAdmin(page)
    await gotoShowcaseRoute(page, '/showcase/runtime/http')

    await expect(page.getByTestId('showcase-runtime-run-count')).toHaveText('1')
    await page.getByTestId('showcase-runtime-run-check').click()
    await expect(page.getByTestId('showcase-runtime-run-count')).toHaveText('2')
    await page.getByTestId('showcase-runtime-reset-check').click()
    await expect(page.getByTestId('showcase-runtime-run-count')).toHaveText('1')

    await expectKeyboardFocusVisible(page)
    await expectNoHorizontalOverflow(page)
    await captureEvidence(page, testInfo, 'behavior-http-actions')

    expect(diagnostics.pageErrors).toEqual([])
    expect(diagnostics.consoleErrors).toEqual([])
  })

  test('dark Runtime route keeps state and source evidence readable', async ({
    page,
  }, testInfo) => {
    const diagnostics = collectDiagnostics(page)

    await page.setViewportSize({ width: 1280, height: 720 })
    await loginAsAdmin(page)
    await switchThemeFromSettings(page, 'dark')
    await gotoShowcaseRoute(page, '/showcase/runtime/browser-runtime')
    await page.waitForFunction(() => document.documentElement.classList.contains('dark'))

    await expect(page.locator('h1', { hasText: '浏览器运行时' })).toBeVisible()
    await expect(page.getByTestId('showcase-runtime-state-panel')).toBeVisible()
    await expect(page.getByTestId('showcase-runtime-result-panel')).toBeVisible()
    await expectSourceEvidenceReadable(page, 'ShowcaseRuntimePage.vue')
    await expectSourceEvidenceReadable(page, 'device.adapter.ts')
    await expectNoHorizontalOverflow(page)
    await captureEvidence(page, testInfo, 'dark-browser-runtime')

    expect(diagnostics.pageErrors).toEqual([])
    expect(diagnostics.consoleErrors).toEqual([])
  })
})
