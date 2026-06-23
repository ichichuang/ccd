import { readFileSync } from 'node:fs'
import { expect, test, type Page, type TestInfo } from '@playwright/test'
import {
  loginAsAdmin,
  waitForAppReady,
  waitForRuntimeLoadingIdle,
  withVisualMode,
} from './helpers/app'

const designRoutes = [
  {
    slug: 'root',
    path: '/showcase/design',
    expectedPath: '/showcase/design/tokens',
    heading: '设计 Token',
    evidence: 'packages/design-tokens/src/**',
  },
  {
    slug: 'tokens',
    path: '/showcase/design/tokens',
    expectedPath: '/showcase/design/tokens',
    heading: '设计 Token',
    evidence: 'packages/design-tokens/src/**',
  },
  {
    slug: 'unocss',
    path: '/showcase/design/unocss',
    expectedPath: '/showcase/design/unocss',
    heading: 'UnoCSS',
    evidence: 'semanticShortcuts.ts',
  },
  {
    slug: 'material',
    path: '/showcase/design/material',
    expectedPath: '/showcase/design/material',
    heading: '材质',
    evidence: 'semanticShortcuts.ts',
  },
  {
    slug: 'density',
    path: '/showcase/design/density',
    expectedPath: '/showcase/design/density',
    heading: '密度',
    evidence: 'packages/design-tokens/src/size.ts',
  },
  {
    slug: 'motion',
    path: '/showcase/design/motion',
    expectedPath: '/showcase/design/motion',
    heading: '动效',
    evidence: 'apps/web-demo/src/plugins/animation/**',
  },
] as const

const mobileRoutes = [
  designRoutes.find(route => route.slug === 'tokens'),
  designRoutes.find(route => route.slug === 'density'),
].filter((route): route is (typeof designRoutes)[number] => Boolean(route))

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

async function gotoShowcaseRoute(page: Page, path: string, expectedPath = path): Promise<void> {
  navigationId += 1
  const visualUrl = withVisualMode(path).replace(
    '?e2e=visual',
    `?e2e=visual&e2ePhase2CDesign=${navigationId}`
  )

  await page.goto(visualUrl, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(routePath => window.location.hash === `#${routePath}`, expectedPath)
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
  const actionButton = page.getByTestId('showcase-design-inspect-sample')
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
  const demoMotion = await page.getByTestId('showcase-design-demo').evaluate(element => {
    const style = window.getComputedStyle(element)
    return {
      animationDuration: style.animationDuration,
      animationName: style.animationName,
    }
  })

  expect(demoMotion.animationName).toBe('none')
  expect(demoMotion.animationDuration).toBe('0s')
}

async function expectDesignRoute(page: Page, route: (typeof designRoutes)[number]): Promise<void> {
  await gotoShowcaseRoute(page, route.path, route.expectedPath)

  await expect(page.locator('h1', { hasText: route.heading })).toBeVisible()
  await expect(page.getByTestId('showcase-design-demo')).toBeVisible()
  await expect(page.getByTestId('showcase-design-action-toolbar')).toBeVisible()
  await expect(page.getByTestId('showcase-design-sample-panel')).toBeVisible()
  await expect(page.getByTestId('showcase-design-preview-area')).toBeVisible()
  await expect(page.getByTestId('showcase-design-state-panel')).toBeVisible()
  await expect(page.getByTestId('showcase-design-contract')).toBeVisible()
  await expect(page.getByTestId('showcase-design-source-area')).toBeVisible()
  await expect(page.getByTestId('showcase-design-inspect-sample')).toBeVisible()
  await expect(page.getByTestId('showcase-design-reset-sample')).toBeVisible()
  await expect(page.getByTestId('showcase-design-run-count')).toBeVisible()
  await expectSourceEvidenceReadable(
    page,
    'apps/web-demo/src/views/showcase/shared/remaining/ShowcaseDesignDemo.vue'
  )
  await expectSourceEvidenceReadable(page, route.evidence)
  await expectNoHorizontalOverflow(page)
}

test.describe('Phase 2C Design showcase UI readiness', () => {
  test('desktop Design routes keep previews, actions, state, and evidence readable', async ({
    page,
  }, testInfo) => {
    const diagnostics = collectDiagnostics(page)

    await page.setViewportSize({ width: 1280, height: 720 })
    await loginAsAdmin(page)

    for (const route of designRoutes) {
      await expectDesignRoute(page, route)
      await captureEvidence(page, testInfo, `desktop-${route.slug}`)
    }

    expect(diagnostics.pageErrors).toEqual([])
    expect(diagnostics.consoleErrors).toEqual([])
  })

  test('mobile Design routes avoid document overflow', async ({ page }, testInfo) => {
    const diagnostics = collectDiagnostics(page)

    await page.setViewportSize({ width: 390, height: 844 })
    await loginAsAdmin(page)

    for (const route of mobileRoutes) {
      await expectDesignRoute(page, route)
      await captureEvidence(page, testInfo, `mobile-${route.slug}`)
    }

    expect(diagnostics.pageErrors).toEqual([])
    expect(diagnostics.consoleErrors).toEqual([])
  })

  test('representative Design actions update only local sample state', async ({
    page,
  }, testInfo) => {
    const diagnostics = collectDiagnostics(page)

    await page.setViewportSize({ width: 1280, height: 720 })
    await loginAsAdmin(page)
    await gotoShowcaseRoute(page, '/showcase/design/material')

    await expect(page.getByTestId('showcase-design-run-count')).toHaveText('1')
    await expect(page.getByTestId('showcase-design-active-sample')).toContainText('Solid')
    await page.getByTestId('showcase-design-inspect-sample').click()
    await expect(page.getByTestId('showcase-design-run-count')).toHaveText('2')
    await expect(page.getByTestId('showcase-design-last-action')).toContainText('样本已检查')
    await expect(page.getByTestId('showcase-design-active-sample')).toContainText('Elevated')
    await page.getByTestId('showcase-design-reset-sample').click()
    await expect(page.getByTestId('showcase-design-run-count')).toHaveText('1')
    await expectKeyboardFocusVisible(page)
    await expectReducedMotionStable(page)
    await expectNoHorizontalOverflow(page)
    await captureEvidence(page, testInfo, 'behavior-material-actions')

    expect(diagnostics.pageErrors).toEqual([])
    expect(diagnostics.consoleErrors).toEqual([])
  })

  test('dark Design token route keeps previews and source evidence readable', async ({
    page,
  }, testInfo) => {
    const diagnostics = collectDiagnostics(page)

    await page.setViewportSize({ width: 1280, height: 720 })
    await loginAsAdmin(page)
    await switchThemeFromSettings(page, 'dark')
    await gotoShowcaseRoute(page, '/showcase/design/tokens')
    await page.waitForFunction(() => document.documentElement.classList.contains('dark'))

    await expect(page.locator('h1', { hasText: '设计 Token' })).toBeVisible()
    await expect(page.getByTestId('showcase-design-sample-panel')).toBeVisible()
    await expect(page.getByTestId('showcase-design-state-panel')).toBeVisible()
    await expectSourceEvidenceReadable(page, 'packages/design-tokens/src/**')
    await expectNoHorizontalOverflow(page)
    await captureEvidence(page, testInfo, 'dark-design-tokens')

    expect(diagnostics.pageErrors).toEqual([])
    expect(diagnostics.consoleErrors).toEqual([])
  })

  test('changed Design sources avoid hardcoded colors, raw inline style, and forbidden files', () => {
    const changedDesignFiles = [
      'apps/web-demo/src/views/showcase/shared/remaining/ShowcaseDesignDemo.vue',
      'apps/web-demo/src/views/showcase/shared/remaining/ShowcaseDesignDemo.dom.spec.ts',
      'apps/web-demo/src/locales/lang/console/en-US.ts',
      'apps/web-demo/src/locales/lang/console/zh-CN.ts',
      'e2e/phase2c-design-ui.spec.ts',
    ]
    const hardcodedColorPattern =
      /#[0-9a-fA-F]{3,8}\b|\b(?:rgb|rgba|hsl|hsla)\(|\b(?:bg|text|border)-(?:white|black|gray|slate|red|blue|green|yellow|orange|purple|neutral|zinc|stone)(?:\b|-)/
    const inlineStylePattern = new RegExp(String.raw`\b:?sty` + 'le=')
    const forbiddenMutationPattern =
      /packages\/|src\/(?:adapters|api|hooks|layouts|router|stores|utils)\/|uno\.config|unocss\.config|pnpm-lock|package\.json|__snapshots__/

    const violations = changedDesignFiles.flatMap(file => {
      const source = readFileSync(file, 'utf8')
      return [
        hardcodedColorPattern.test(source) ? `${file}: hardcoded color` : null,
        inlineStylePattern.test(source) ? `${file}: raw inline style` : null,
        forbiddenMutationPattern.test(file) ? `${file}: forbidden path` : null,
      ].filter((entry): entry is string => Boolean(entry))
    })

    expect(violations).toEqual([])
  })
})
