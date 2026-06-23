import { expect, test, type Page, type TestInfo } from '@playwright/test'
import {
  loginAsAdmin,
  waitForAppReady,
  waitForRuntimeLoadingIdle,
  withVisualMode,
} from './helpers/app'

const feedbackRoute = {
  slug: 'dialog-toast',
  path: '/showcase/feedback/dialog-toast',
  heading: 'Dialog 与 Toast',
  sourceEvidence: 'ShowcaseFeedbackDemo.vue',
} as const

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
    `?e2e=visual&e2ePhase2CFeedback=${navigationId}`
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

async function expectSourceEvidenceReadable(page: Page): Promise<void> {
  const sourceCode = page.locator('code').filter({ hasText: feedbackRoute.sourceEvidence }).first()
  await expect(sourceCode).toBeVisible()

  const codeMetrics = await sourceCode.evaluate(element => {
    const style = window.getComputedStyle(element)
    return {
      clientWidth: element.clientWidth,
      overflowWrap: style.overflowWrap,
      scrollWidth: element.scrollWidth,
      wordBreak: style.wordBreak,
    }
  })

  expect(codeMetrics.wordBreak).toBe('break-all')
  expect(codeMetrics.scrollWidth).toBeLessThanOrEqual(codeMetrics.clientWidth + 4)
}

async function expectKeyboardFocusVisible(page: Page): Promise<void> {
  const openDialogButton = page.getByRole('button', { name: '打开 Dialog' }).first()
  await page.keyboard.press('Tab')
  await openDialogButton.focus()

  const focusState = await openDialogButton.evaluate(element => {
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

async function expectFeedbackPageReady(page: Page): Promise<void> {
  await expect(page.locator('h1', { hasText: feedbackRoute.heading })).toBeVisible()
  await expect(page.getByTestId('showcase-feedback-demo')).toBeVisible()
  await expect(page.getByTestId('showcase-feedback-action-toolbar')).toBeVisible()
  await expect(page.getByTestId('showcase-feedback-stage')).toBeVisible()
  await expect(page.getByTestId('showcase-feedback-log')).toBeVisible()
  await expect(page.getByTestId('showcase-feedback-log-empty')).toBeVisible()
  await expect(page.getByTestId('showcase-feedback-contract')).toBeVisible()
  await expect(page.getByRole('button', { name: '打开 Dialog' })).toBeVisible()
  await expect(page.getByRole('button', { name: '显示 Message' })).toBeVisible()
  await expect(page.getByRole('button', { name: '显示 Toast' })).toBeVisible()
  await expectSourceEvidenceReadable(page)
  await expectNoHorizontalOverflow(page)
}

async function runFeedbackInteractions(page: Page): Promise<void> {
  await page.getByRole('button', { name: '打开 Dialog' }).click()
  await expect(page.getByText('反馈 Dialog').first()).toBeVisible()
  await page.getByRole('button', { name: '确定' }).click()
  await expect(page.getByText('Dialog 已打开').first()).toBeVisible()

  await page.getByRole('button', { name: '显示 Message' }).click()
  await expect(page.getByText('Message 已显示').first()).toBeVisible()

  await page.getByRole('button', { name: '显示 Toast' }).click()
  await expect(page.getByText('Toast 已显示').first()).toBeVisible()
  await expect(page.getByText('暂无反馈')).toHaveCount(0)
  await expectNoHorizontalOverflow(page)
}

test.describe('Phase 2C Feedback showcase UI readiness', () => {
  test('desktop Dialog and Toast route keeps controls, log, and source evidence readable', async ({
    page,
  }, testInfo) => {
    const diagnostics = collectDiagnostics(page)

    await page.setViewportSize({ width: 1280, height: 720 })
    await loginAsAdmin(page)
    await gotoShowcaseRoute(page, feedbackRoute.path)
    await expectFeedbackPageReady(page)
    await expectKeyboardFocusVisible(page)
    await runFeedbackInteractions(page)
    await captureEvidence(page, testInfo, `desktop-${feedbackRoute.slug}`)

    expect(diagnostics.pageErrors).toEqual([])
    expect(diagnostics.consoleErrors).toEqual([])
  })

  test('mobile Dialog and Toast route avoids document overflow', async ({ page }, testInfo) => {
    const diagnostics = collectDiagnostics(page)

    await page.setViewportSize({ width: 390, height: 844 })
    await loginAsAdmin(page)
    await gotoShowcaseRoute(page, feedbackRoute.path)
    await expectFeedbackPageReady(page)
    await runFeedbackInteractions(page)
    await captureEvidence(page, testInfo, `mobile-${feedbackRoute.slug}`)

    expect(diagnostics.pageErrors).toEqual([])
    expect(diagnostics.consoleErrors).toEqual([])
  })

  test('dark Dialog and Toast route keeps feedback surfaces readable', async ({
    page,
  }, testInfo) => {
    const diagnostics = collectDiagnostics(page)

    await page.setViewportSize({ width: 1280, height: 720 })
    await loginAsAdmin(page)
    await switchThemeFromSettings(page, 'dark')
    await gotoShowcaseRoute(page, feedbackRoute.path)
    await page.waitForFunction(() => document.documentElement.classList.contains('dark'))
    await expectFeedbackPageReady(page)
    await runFeedbackInteractions(page)
    await captureEvidence(page, testInfo, `dark-${feedbackRoute.slug}`)

    expect(diagnostics.pageErrors).toEqual([])
    expect(diagnostics.consoleErrors).toEqual([])
  })
})
