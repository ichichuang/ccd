import { expect, test, type Page, type TestInfo } from '@playwright/test'
import {
  loginAsAdmin,
  waitForAppReady,
  waitForRuntimeLoadingIdle,
  waitForThemeTransitionEnd,
  withVisualMode,
} from './helpers/app'

const hookRoutes = [
  {
    slug: 'overview',
    path: '/showcase/hooks/overview',
    heading: 'Hooks 概览',
    evidence: 'ShowcaseHookDemo.vue',
    overview: true,
  },
  {
    slug: 'theme-switching',
    path: '/showcase/hooks/theme-switching',
    heading: '主题切换',
    evidence: 'useThemeSwitch.ts',
    actionTestId: 'showcase-hooks-toggle-theme',
  },
  {
    slug: 'locale-switching',
    path: '/showcase/hooks/locale-switching',
    heading: '语言切换',
    evidence: 'useLocale.ts',
    actionTestId: 'showcase-hooks-toggle-locale',
  },
  {
    slug: 'http-flow',
    path: '/showcase/hooks/http-flow',
    heading: 'HTTP 流程',
    evidence: 'useHttpRequest.ts',
  },
  {
    slug: 'auth-permission',
    path: '/showcase/hooks/auth-permission',
    heading: '认证与权限',
    evidence: 'useAuth.ts',
  },
  {
    slug: 'layout-runtime',
    path: '/showcase/hooks/layout-runtime',
    heading: '布局运行时',
    evidence: 'useLayoutRuntime.ts',
  },
  {
    slug: 'responsive-device',
    path: '/showcase/hooks/responsive-device',
    heading: '响应式设备',
    evidence: 'device.ts',
  },
] as const

const mobileRoutes = [
  hookRoutes.find(route => route.slug === 'theme-switching'),
  hookRoutes.find(route => route.slug === 'responsive-device'),
].filter((route): route is (typeof hookRoutes)[number] => Boolean(route))

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
    `?e2e=visual&e2ePhase2CHooks=${navigationId}`
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
  const themeButton = page.getByTestId('showcase-hooks-toggle-theme')
  await themeButton.focus()

  const focusState = await themeButton.evaluate(element => {
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

async function expectHooksRoute(page: Page, route: (typeof hookRoutes)[number]): Promise<void> {
  await gotoShowcaseRoute(page, route.path)

  await expect(page.locator('h1', { hasText: route.heading })).toBeVisible()
  await expectSourceEvidenceReadable(page, route.evidence)

  if (route.overview) {
    await expect(page.getByRole('link', { name: /主题切换/ }).first()).toBeVisible()
    await expect(page.getByRole('link', { name: /响应式设备/ }).first()).toBeVisible()
    await expectNoHorizontalOverflow(page)
    return
  }

  await expect(page.getByTestId('showcase-hooks-demo')).toBeVisible()
  await expect(page.getByTestId('showcase-hooks-action-toolbar')).toBeVisible()
  await expect(page.getByTestId('showcase-hooks-intent-card')).toBeVisible()
  await expect(page.getByTestId('showcase-hooks-state-panel')).toBeVisible()
  await expect(page.getByTestId('showcase-hooks-contract')).toBeVisible()
  await expect(page.getByTestId('showcase-hooks-state-theme')).toBeVisible()
  await expect(page.getByTestId('showcase-hooks-state-locale')).toBeVisible()
  await expect(page.getByTestId('showcase-hooks-state-breakpoint')).toBeVisible()

  if (route.actionTestId) {
    await expect(page.getByTestId(route.actionTestId)).toBeVisible()
  } else {
    await expect(page.getByTestId('showcase-hooks-readonly-actions')).toBeVisible()
  }

  await expectNoHorizontalOverflow(page)
}

test.describe('Phase 2C Hooks showcase UI readiness', () => {
  test('desktop Hooks routes keep demo, state, actions, and evidence readable', async ({
    page,
  }, testInfo) => {
    const diagnostics = collectDiagnostics(page)

    await page.setViewportSize({ width: 1280, height: 720 })
    await loginAsAdmin(page)

    for (const route of hookRoutes) {
      await expectHooksRoute(page, route)
      await captureEvidence(page, testInfo, `desktop-${route.slug}`)
    }

    expect(diagnostics.pageErrors).toEqual([])
    expect(diagnostics.consoleErrors).toEqual([])
  })

  test('mobile Hooks routes avoid document overflow', async ({ page }, testInfo) => {
    const diagnostics = collectDiagnostics(page)

    await page.setViewportSize({ width: 390, height: 844 })
    await loginAsAdmin(page)

    for (const route of mobileRoutes) {
      await expectHooksRoute(page, route)
      await captureEvidence(page, testInfo, `mobile-${route.slug}`)
    }

    expect(diagnostics.pageErrors).toEqual([])
    expect(diagnostics.consoleErrors).toEqual([])
  })

  test('representative Hooks actions update state readouts', async ({ page }, testInfo) => {
    const diagnostics = collectDiagnostics(page)

    await page.setViewportSize({ width: 1280, height: 720 })
    await loginAsAdmin(page)

    await gotoShowcaseRoute(page, '/showcase/hooks/theme-switching')
    const themeState = page.getByTestId('showcase-hooks-state-theme')
    const initialTheme = await themeState.textContent()
    await page.getByTestId('showcase-hooks-toggle-theme').click()
    await waitForThemeTransitionEnd(page)
    await expect.poll(async () => themeState.textContent()).not.toBe(initialTheme)
    await expectNoHorizontalOverflow(page)
    await expectKeyboardFocusVisible(page)
    await captureEvidence(page, testInfo, 'behavior-theme-toggle')

    await gotoShowcaseRoute(page, '/showcase/hooks/locale-switching')
    const localeState = page.getByTestId('showcase-hooks-state-locale')
    const initialLocale = await localeState.textContent()
    await page.getByTestId('showcase-hooks-toggle-locale').click()
    await expect.poll(async () => localeState.textContent()).not.toBe(initialLocale)
    await page.getByTestId('showcase-hooks-toggle-locale').click()
    await expect.poll(async () => localeState.textContent()).toBe(initialLocale)
    await expectNoHorizontalOverflow(page)
    await captureEvidence(page, testInfo, 'behavior-locale-toggle')

    expect(diagnostics.pageErrors).toEqual([])
    expect(diagnostics.consoleErrors).toEqual([])
  })

  test('dark Hooks route keeps state and source evidence readable', async ({ page }, testInfo) => {
    const diagnostics = collectDiagnostics(page)

    await page.setViewportSize({ width: 1280, height: 720 })
    await loginAsAdmin(page)
    await switchThemeFromSettings(page, 'dark')
    await gotoShowcaseRoute(page, '/showcase/hooks/theme-switching')
    await page.waitForFunction(() => document.documentElement.classList.contains('dark'))

    await expect(page.locator('h1', { hasText: '主题切换' })).toBeVisible()
    await expect(page.getByTestId('showcase-hooks-demo')).toBeVisible()
    await expect(page.getByTestId('showcase-hooks-state-panel')).toBeVisible()
    await expectSourceEvidenceReadable(page, 'useThemeSwitch.ts')
    await expectNoHorizontalOverflow(page)
    await captureEvidence(page, testInfo, 'dark-theme-switching')

    expect(diagnostics.pageErrors).toEqual([])
    expect(diagnostics.consoleErrors).toEqual([])
  })
})
