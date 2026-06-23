import { expect, test, type Page, type TestInfo } from '@playwright/test'
import {
  loginAsAdmin,
  waitForAppReady,
  waitForRuntimeLoadingIdle,
  withVisualMode,
} from './helpers/app'

const utilityRoutes = [
  {
    slug: 'overview',
    path: '/showcase/utils/overview',
    heading: '工具概览',
    evidence: 'ShowcaseUtilityDemo.vue',
    overview: true,
  },
  {
    slug: 'date',
    path: '/showcase/utils/date',
    heading: '日期工具',
    evidence: 'apps/web-demo/src/utils/date/**',
    actionTestId: 'showcase-utils-run-sample',
    resultTestId: 'showcase-utils-output-format',
  },
  {
    slug: 'safe-storage',
    path: '/showcase/utils/safe-storage',
    heading: 'safeStorage',
    evidence: 'apps/web-demo/src/utils/safeStorage/**',
    actionTestId: 'showcase-utils-run-sample',
    resultTestId: 'showcase-utils-output-decoded',
  },
  {
    slug: 'state-persistence',
    path: '/showcase/utils/state-persistence',
    heading: '状态持久化',
    evidence: 'apps/web-demo/src/utils/safeStorage/piniaSerializer.ts',
    actionTestId: 'showcase-utils-run-sample',
    resultTestId: 'showcase-utils-output-codec',
  },
] as const

const mobileRoutes = [
  utilityRoutes.find(route => route.slug === 'date'),
  utilityRoutes.find(route => route.slug === 'safe-storage'),
].filter((route): route is (typeof utilityRoutes)[number] => Boolean(route))

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
    `?e2e=visual&e2ePhase2CUtils=${navigationId}`
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
  const actionButton = page.getByTestId('showcase-utils-run-sample')
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

async function expectReducedMotionStable(page: Page): Promise<void> {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const demoMotion = await page.getByTestId('showcase-utils-demo').evaluate(element => {
    const style = window.getComputedStyle(element)
    return {
      animationName: style.animationName,
      animationDuration: style.animationDuration,
    }
  })

  expect(demoMotion.animationName).toBe('none')
  expect(demoMotion.animationDuration).toBe('0s')
}

async function expectUtilityRoute(
  page: Page,
  route: (typeof utilityRoutes)[number]
): Promise<void> {
  await gotoShowcaseRoute(page, route.path)

  await expect(page.locator('h1', { hasText: route.heading })).toBeVisible()
  await expectSourceEvidenceReadable(page, route.evidence)

  if (route.overview) {
    await expect(page.getByRole('link', { name: /日期工具/ }).first()).toBeVisible()
    await expect(page.getByRole('link', { name: /safeStorage/ }).first()).toBeVisible()
    await expectNoHorizontalOverflow(page)
    return
  }

  await expect(page.getByTestId('showcase-utils-demo')).toBeVisible()
  await expect(page.getByTestId('showcase-utils-action-toolbar')).toBeVisible()
  await expect(page.getByTestId('showcase-utils-sample-panel')).toBeVisible()
  await expect(page.getByTestId('showcase-utils-output-panel')).toBeVisible()
  await expect(page.getByTestId('showcase-utils-contract')).toBeVisible()

  await expect(page.getByTestId(route.actionTestId)).toBeVisible()
  await expect(page.getByTestId('showcase-utils-reset-sample')).toBeVisible()
  await expect(page.getByTestId(route.resultTestId)).toBeVisible()
  await expectNoHorizontalOverflow(page)
}

test.describe('Phase 2C Utils showcase UI readiness', () => {
  test('desktop Utils routes keep samples, outputs, actions, and evidence readable', async ({
    page,
  }, testInfo) => {
    const diagnostics = collectDiagnostics(page)

    await page.setViewportSize({ width: 1280, height: 720 })
    await loginAsAdmin(page)

    for (const route of utilityRoutes) {
      await expectUtilityRoute(page, route)
      await captureEvidence(page, testInfo, `desktop-${route.slug}`)
    }

    expect(diagnostics.pageErrors).toEqual([])
    expect(diagnostics.consoleErrors).toEqual([])
  })

  test('mobile Utils routes avoid document overflow', async ({ page }, testInfo) => {
    const diagnostics = collectDiagnostics(page)

    await page.setViewportSize({ width: 390, height: 844 })
    await loginAsAdmin(page)

    for (const route of mobileRoutes) {
      await expectUtilityRoute(page, route)
      await captureEvidence(page, testInfo, `mobile-${route.slug}`)
    }

    expect(diagnostics.pageErrors).toEqual([])
    expect(diagnostics.consoleErrors).toEqual([])
  })

  test('representative Utils actions update local demo state', async ({ page }, testInfo) => {
    const diagnostics = collectDiagnostics(page)

    await page.setViewportSize({ width: 1280, height: 720 })
    await loginAsAdmin(page)
    await gotoShowcaseRoute(page, '/showcase/utils/safe-storage')

    await expect(page.getByTestId('showcase-utils-output-decoded')).toContainText('showcase')
    await expect(page.getByTestId('showcase-utils-run-count')).toHaveText('1')

    await page.getByTestId('showcase-utils-run-sample').click()
    await expect(page.getByTestId('showcase-utils-run-count')).toHaveText('2')
    await expect(page.getByTestId('showcase-utils-last-action')).toContainText('样本已重跑')

    await page.getByTestId('showcase-utils-reset-sample').click()
    await expect(page.getByTestId('showcase-utils-run-count')).toHaveText('1')
    await expect(page.getByTestId('showcase-utils-last-action')).toContainText('样本已重置')

    await expectKeyboardFocusVisible(page)
    await expectReducedMotionStable(page)
    await expectNoHorizontalOverflow(page)
    await captureEvidence(page, testInfo, 'behavior-safe-storage-actions')

    expect(diagnostics.pageErrors).toEqual([])
    expect(diagnostics.consoleErrors).toEqual([])
  })

  test('dark Utils route keeps output and source evidence readable', async ({ page }, testInfo) => {
    const diagnostics = collectDiagnostics(page)

    await page.setViewportSize({ width: 1280, height: 720 })
    await loginAsAdmin(page)
    await switchThemeFromSettings(page, 'dark')
    await gotoShowcaseRoute(page, '/showcase/utils/date')
    await page.waitForFunction(() => document.documentElement.classList.contains('dark'))

    await expect(page.locator('h1', { hasText: '日期工具' })).toBeVisible()
    await expect(page.getByTestId('showcase-utils-demo')).toBeVisible()
    await expect(page.getByTestId('showcase-utils-output-panel')).toBeVisible()
    await expectSourceEvidenceReadable(page, 'apps/web-demo/src/utils/date/**')
    await expectNoHorizontalOverflow(page)
    await captureEvidence(page, testInfo, 'dark-date')

    expect(diagnostics.pageErrors).toEqual([])
    expect(diagnostics.consoleErrors).toEqual([])
  })
})
