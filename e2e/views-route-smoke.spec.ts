import { expect, test, type Page } from '@playwright/test'
import {
  gotoVisual,
  loginAsAdmin,
  waitForAppReady,
  waitForRuntimeLoadingIdle,
  withVisualMode,
} from './helpers/app'
import {
  SHOWCASE_ROUTE_SMOKE_TARGET_PATHS,
  type ShowcaseRouteSmokeTargetPath,
} from './showcaseRouteSmokeTargets'

const showcaseRouteSmokeTargetSet = new Set<string>(SHOWCASE_ROUTE_SMOKE_TARGET_PATHS)
let routeSmokeNavigationId = 0

function showcaseSmokePath(path: ShowcaseRouteSmokeTargetPath): ShowcaseRouteSmokeTargetPath {
  if (!showcaseRouteSmokeTargetSet.has(path)) {
    throw new Error(`Missing showcase route smoke target: ${path}`)
  }

  return path
}

async function gotoRouteSmokeVisual(page: Page, hashPath: string): Promise<void> {
  routeSmokeNavigationId += 1
  const normalizedPath = hashPath.startsWith('/') ? hashPath : `/${hashPath}`
  const visualUrl = withVisualMode(normalizedPath).replace(
    '?e2e=visual',
    `?e2e=visual&e2eRouteSmoke=${routeSmokeNavigationId}`
  )

  await page.goto(visualUrl)
  await page.waitForFunction(
    path => window.location.hash === `#${path}` || window.location.hash === '#/404',
    normalizedPath
  )
}

async function waitForLoginThemeState(page: Page, targetMode: 'light' | 'dark'): Promise<void> {
  await page.waitForFunction(mode => {
    const isDark = document.documentElement.classList.contains('dark')
    const datasetMode = document.documentElement.dataset.themeMode
    const modeMatches = datasetMode === mode || (mode === 'light' && !datasetMode)
    return (
      modeMatches &&
      document.documentElement.dataset.themeTransitioning !== 'true' &&
      (mode === 'dark' ? isDark : !isDark)
    )
  }, targetMode)
}

test.describe('view route smoke coverage', () => {
  test('login gateway preserves quick fill, failure clearing, locale, and theme controls', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      window.localStorage.clear()
      window.localStorage.setItem('theme-mode', 'light')
      window.localStorage.setItem('ccd-e2e-mode', 'visual')
    })

    await gotoVisual(page, '/login')
    await waitForAppReady(page)
    await waitForRuntimeLoadingIdle(page)
    await expect(page.locator('#login-submit')).toBeVisible()
    await page.waitForFunction(() => typeof window.$toast?.dangerIn === 'function')
    await page.evaluate(() => {
      const target = window as Window & {
        loginFailureToastCalls?: Array<{
          detail?: string
          position: string
          summary: string
        }>
      }
      const toast = target.$toast
      if (!toast?.dangerIn) return

      target.loginFailureToastCalls = []
      const dangerIn = toast.dangerIn.bind(toast)
      toast.dangerIn = ((position: string, summary: string, detail?: string) => {
        target.loginFailureToastCalls?.push({ position, summary, detail })
        dangerIn(position, summary, detail)
      }) as typeof toast.dangerIn
    })

    await page.locator('#username').fill('admin')
    await expect(page.locator('#username')).toHaveValue('admin')
    await page.locator('#password').fill('123456')
    await expect(page.locator('#password')).toHaveValue('123456')

    await page.locator('#username').clear()
    await page.locator('#password').clear()
    await page.locator('#username').fill('user')
    await expect(page.locator('#username')).toHaveValue('user')
    await page.locator('#password').fill('123456')
    await expect(page.locator('#password')).toHaveValue('123456')

    await page.locator('#username').clear()
    await page.locator('#username').fill('admin')
    await page.locator('#password').fill('badpass')
    await page.locator('#login-submit').click()
    await expect
      .poll(() =>
        page.evaluate(() => {
          const target = window as Window & {
            loginFailureToastCalls?: Array<{
              detail?: string
              position: string
              summary: string
            }>
          }

          return (
            target.loginFailureToastCalls?.some(
              call => call.position === 'top-center' && call.summary === '登录失败'
            ) ?? false
          )
        })
      )
      .toBe(true)
    await expect(page.locator('#password')).toHaveValue('')

    await page.getByRole('button', { name: '切换语言' }).click()
    await page.getByRole('menuitemradio', { name: 'English' }).click()
    await expect(page.getByRole('heading', { name: 'Sign in to CCD' })).toBeVisible()
    await page.getByRole('button', { name: 'Switch language' }).click()
    await page.getByRole('menuitemradio', { name: '简体中文' }).click()
    await expect(page.getByRole('heading', { name: '登录到 CCD' })).toBeVisible()

    await page.getByRole('button', { name: '切换主题' }).click()
    await page.waitForFunction(
      () =>
        document.documentElement.dataset.themeMode === 'dark' &&
        document.documentElement.dataset.themeTransitioning === 'false' &&
        document.documentElement.classList.contains('dark')
    )
  })

  test('login gateway keeps shader motion and form state stable across theme toggle', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      window.localStorage.clear()
      window.localStorage.setItem('theme-mode', 'light')
    })

    const errors: Error[] = []
    const consoleErrors: string[] = []
    page.on('pageerror', err => errors.push(err))
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text())
    })

    await page.goto('/#/login?redirect=/system/settings')
    await waitForAppReady(page)
    await waitForRuntimeLoadingIdle(page)
    await expect(page.locator('#login-submit')).toBeVisible()

    await page.locator('#username').fill('admin')
    await page.locator('#password').fill('123456')
    await page.locator('#password').focus()

    const passwordFieldGeometry = await page.evaluate(() => {
      const password = document.querySelector<HTMLInputElement>('#password')
      const shell = password?.closest<HTMLElement>('.login-field-shell')
      const leading = shell?.querySelector<HTMLElement>('.login-field-affix--leading')
      const toggle = shell?.querySelector<HTMLElement>('.login-password-toggle')

      const shellRect = shell?.getBoundingClientRect()
      const leadingRect = leading?.getBoundingClientRect()
      const toggleRect = toggle?.getBoundingClientRect()
      const leadingStyle = leading ? getComputedStyle(leading) : null
      const toggleStyle = toggle ? getComputedStyle(toggle) : null
      const transparentColor = 'rgba(0, 0, 0, 0)'

      return {
        hasParts: Boolean(shellRect && leadingRect && toggleRect),
        leadingCenterDelta:
          shellRect && leadingRect
            ? Math.abs(
                leadingRect.top + leadingRect.height / 2 - (shellRect.top + shellRect.height / 2)
              )
            : Number.POSITIVE_INFINITY,
        toggleCenterDelta:
          shellRect && toggleRect
            ? Math.abs(
                toggleRect.top + toggleRect.height / 2 - (shellRect.top + shellRect.height / 2)
              )
            : Number.POSITIVE_INFINITY,
        leadingHasVisibleDivider:
          leadingStyle !== null &&
          Number.parseFloat(leadingStyle.borderRightWidth) > 0 &&
          leadingStyle.borderRightStyle !== 'none' &&
          leadingStyle.borderRightColor !== transparentColor,
        toggleHasVisibleDivider:
          toggleStyle !== null &&
          Number.parseFloat(toggleStyle.borderLeftWidth) > 0 &&
          toggleStyle.borderLeftStyle !== 'none' &&
          toggleStyle.borderLeftColor !== transparentColor,
      }
    })

    expect(passwordFieldGeometry.hasParts).toBe(true)
    expect(passwordFieldGeometry.leadingCenterDelta).toBeLessThanOrEqual(1)
    expect(passwordFieldGeometry.toggleCenterDelta).toBeLessThanOrEqual(1)
    expect(passwordFieldGeometry.leadingHasVisibleDivider).toBe(false)
    expect(passwordFieldGeometry.toggleHasVisibleDivider).toBe(false)

    const stage = page.getByTestId('auth-visual-stage')
    const palette = page.getByTestId('auth-palette-picker')
    const card = page.getByTestId('auth-login-card')
    const bubbles = page.getByTestId('auth-glass-bubble')
    await expect(stage).toBeVisible()
    await expect(palette).toBeVisible()
    await expect(card).toBeVisible()
    await expect(bubbles).toHaveCount(4)
    await expect(page.getByTestId('auth-static-core')).toHaveCount(0)
    await expect(stage.locator('.auth-architecture-chip')).toHaveCount(0)
    await expect(
      page.locator(
        '[data-login-diagonal-slash], [data-login-line-sweep], .login-diagonal-slash, .login-line-sweep'
      )
    ).toHaveCount(0)

    await page.evaluate(() => {
      const el = document.querySelector('[data-testid="auth-visual-stage"]')
      if (el instanceof HTMLElement) {
        el.dataset.e2eStageMarker = 'preserved'
      }

      const card = document.querySelector('[data-testid="auth-login-card"]')
      if (card instanceof HTMLElement) {
        card.dataset.e2eCardMarker = 'preserved'
      }

      const username = document.querySelector('#username')
      if (username instanceof HTMLElement) {
        username.dataset.e2eInputMarker = 'preserved'
      }
    })

    await page.getByRole('button', { name: '切换主题' }).click()
    await waitForLoginThemeState(page, 'dark')
    await page.waitForTimeout(120)

    await expect(page.locator('#username')).toHaveValue('admin')
    await expect(page.locator('#password')).toHaveValue('123456')

    const isPreserved = await page.evaluate(() => {
      const el = document.querySelector('[data-testid="auth-visual-stage"]')
      return el instanceof HTMLElement ? el.dataset.e2eStageMarker === 'preserved' : false
    })
    expect(isPreserved).toBe(true)

    const isCardPreservedAfterTheme = await page.evaluate(() => {
      const el = document.querySelector('[data-testid="auth-login-card"]')
      return el instanceof HTMLElement ? el.dataset.e2eCardMarker === 'preserved' : false
    })
    expect(isCardPreservedAfterTheme).toBe(true)

    const isInputPreservedAfterTheme = await page.evaluate(() => {
      const el = document.querySelector('#username')
      return el instanceof HTMLElement ? el.dataset.e2eInputMarker === 'preserved' : false
    })
    expect(isInputPreservedAfterTheme).toBe(true)

    await palette.getByRole('button', { pressed: false }).first().click()
    await page.waitForTimeout(120)

    await expect(page.locator('#username')).toHaveValue('admin')
    await expect(page.locator('#password')).toHaveValue('123456')

    const isCardPreservedAfterPalette = await page.evaluate(() => {
      const el = document.querySelector('[data-testid="auth-login-card"]')
      return el instanceof HTMLElement ? el.dataset.e2eCardMarker === 'preserved' : false
    })
    expect(isCardPreservedAfterPalette).toBe(true)

    const isInputPreservedAfterPalette = await page.evaluate(() => {
      const el = document.querySelector('#username')
      return el instanceof HTMLElement ? el.dataset.e2eInputMarker === 'preserved' : false
    })
    expect(isInputPreservedAfterPalette).toBe(true)

    expect(errors).toHaveLength(0)
    expect(consoleErrors).toHaveLength(0)

    const hasRotation = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('#login-page *'))
      return elements.some(el => {
        const style = getComputedStyle(el)
        const animation = style.animationName || ''
        const transform = style.transform || ''
        return (
          animation.toLowerCase().includes('spin') ||
          animation.toLowerCase().includes('rotate') ||
          transform.toLowerCase().includes('rotate')
        )
      })
    })
    expect(hasRotation).toBe(false)
  })

  test('login gateway renders final static state under reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.addInitScript(() => {
      window.localStorage.clear()
      window.localStorage.setItem('theme-mode', 'light')
    })

    await gotoVisual(page, '/login')
    await waitForAppReady(page)
    await waitForRuntimeLoadingIdle(page)
    await expect(page.locator('#login-submit')).toBeVisible()
    await expect(page.getByTestId('auth-glass-bubble')).toHaveCount(4)

    const motionState = await page.evaluate(() => {
      const animatedNodes = Array.from(
        document.querySelectorAll<HTMLElement>(
          [
            '[data-testid="auth-login-card"]',
            '.login-field-shell',
            '.login-form-options',
            '#login-submit',
            '[data-testid="auth-palette-picker"]',
            '[data-testid="auth-glass-bubble"]',
          ].join(', ')
        )
      )
      const card = document.querySelector<HTMLElement>('[data-testid="auth-login-card"]')
      const cardStyle = card ? getComputedStyle(card) : null

      return {
        hasInlineMotion: animatedNodes.some(
          node => node.style.transform || node.style.opacity || node.style.visibility
        ),
        cardOpacity: cardStyle?.opacity ?? '',
        cardTransform: cardStyle?.transform ?? '',
      }
    })

    expect(motionState.hasInlineMotion).toBe(false)
    expect(motionState.cardOpacity).toBe('1')
    expect(motionState.cardTransform).toBe('none')
  })

  test('login gateway keeps mobile layout inside the viewport', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear()
      window.localStorage.setItem('ccd-e2e-mode', 'visual')
    })
    await page.setViewportSize({ width: 390, height: 844 })

    await gotoVisual(page, '/login')
    await waitForAppReady(page)
    await waitForRuntimeLoadingIdle(page)
    await expect(page.locator('#auth-visual-stage')).toBeVisible()
    await expect(page.locator('#login-submit')).toBeVisible()

    const geometry = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      shellHeight: document.querySelector('#login-shell')?.getBoundingClientRect().height ?? 0,
    }))

    expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.clientWidth + 1)
    expect(geometry.shellHeight).toBeGreaterThan(0)
    expect(geometry.shellHeight).toBeLessThanOrEqual(844)
  })

  test('renders login, dashboard, and not-found views through the router', async ({ page }) => {
    await gotoVisual(page, '/login')
    await waitForAppReady(page)
    await waitForRuntimeLoadingIdle(page)
    await expect(page.locator('#username')).toBeVisible()
    await expect(page.locator('#password')).toBeVisible()

    await loginAsAdmin(page)
    const dashboard = page.locator('#dashboard-page')
    const startExploring = page.locator('#dashboard-start-exploring')

    await expect(dashboard).toBeVisible()
    await expect(dashboard).toContainText(/CCD/)
    await expect(dashboard).toContainText(/consistent|一致/)
    await expect(startExploring).toBeVisible()
    await expect(startExploring).toHaveAttribute('href', /#\/showcase\/overview$/)
    await expect(page.locator('#dashboard-page canvas')).toHaveCount(0)
    await expect(
      page.locator('#dashboard-page .echarts canvas, #dashboard-page .p-datatable')
    ).toHaveCount(0)
    await expect(
      page.locator(
        '#dashboard-page form, #dashboard-page .pro-table, #dashboard-page [class*="pro-table"], #dashboard-page .pro-form, #dashboard-page [class*="pro-form"]'
      )
    ).toHaveCount(0)

    await gotoRouteSmokeVisual(page, '/ui/pro-form')
    await waitForAppReady(page)
    await waitForRuntimeLoadingIdle(page)
    await expect(page.getByTestId('architecture-console-page')).toContainText('ProForm 能力')
    await expect(page.getByTestId('architecture-console-page')).toContainText('引导式请求表单')

    await gotoRouteSmokeVisual(page, '/ui/pro-table')
    await waitForAppReady(page)
    await waitForRuntimeLoadingIdle(page)
    await expect(page.getByTestId('architecture-console-page')).toContainText('ProTable 能力')
    await expect(page.getByTestId('architecture-console-page')).toContainText('类型化 ProTable')

    await gotoRouteSmokeVisual(page, '/system/settings')
    await waitForAppReady(page)
    await waitForRuntimeLoadingIdle(page)
    await expect(page.getByTestId('global-settings-page')).toContainText('全局设置')
    await expect(page.getByTestId('global-settings-page')).toContainText('布局模块')

    await gotoRouteSmokeVisual(page, '/missing-view')
    await waitForAppReady(page)
    await waitForRuntimeLoadingIdle(page)
    await expect(page).toHaveURL(/#\/404$/)
    await expect(page.locator('body')).toContainText('404')
  })

  test('renders the showcase overview page through the catalog route', async ({ page }) => {
    const pageErrors: string[] = []
    const consoleDiagnostics: string[] = []

    page.on('pageerror', err => pageErrors.push(err.message))
    page.on('console', msg => {
      const text = msg.text()
      if (msg.type() === 'error' || text.includes('showcase.remaining')) {
        consoleDiagnostics.push(text)
      }
    })

    await loginAsAdmin(page)
    await gotoRouteSmokeVisual(page, showcaseSmokePath('/showcase/overview'))
    await waitForAppReady(page)
    await waitForRuntimeLoadingIdle(page)

    await expect(page.locator('h1', { hasText: '概览' })).toBeVisible()
    await expect(page.getByText('浏览承载产品演示', { exact: false }).first()).toBeVisible()
    await expect(page.getByText('能力', { exact: false }).first()).toBeVisible()
    await expect(
      page.getByText(/预览外壳|页面渲染失败|showcase\.remaining|ai:guard|pnpm/)
    ).toHaveCount(0)

    expect(pageErrors).toHaveLength(0)
    expect(consoleDiagnostics).toHaveLength(0)
  })

  test('renders the ProTable showcase page through the catalog route', async ({ page }) => {
    const pageErrors: string[] = []
    const consoleErrors: string[] = []

    page.on('pageerror', err => pageErrors.push(err.message))
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text())
    })

    await loginAsAdmin(page)
    await gotoRouteSmokeVisual(page, showcaseSmokePath('/showcase/components/pro-table/basic'))
    await waitForAppReady(page)
    await waitForRuntimeLoadingIdle(page)

    await expect(page.locator('h1', { hasText: '基础表格' })).toBeVisible()
    await expect(page.getByText('推荐操作').first()).toBeVisible()
    await expect(page.getByText('可复用表格起点').first()).toBeVisible()
    await expect(
      page.getByText('先定义类型化列与稳定行字段', { exact: false }).first()
    ).toBeVisible()
    await expect(page.getByText(/预览外壳|页面渲染失败|验证命令|ai:guard|pnpm/)).toHaveCount(0)

    expect(pageErrors).toHaveLength(0)
    expect(consoleErrors).toHaveLength(0)
  })

  test('renders the ProForm validation showcase page through the catalog route', async ({
    page,
  }) => {
    const pageErrors: string[] = []
    const consoleErrors: string[] = []

    page.on('pageerror', err => pageErrors.push(err.message))
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text())
    })

    await loginAsAdmin(page)
    await gotoRouteSmokeVisual(page, showcaseSmokePath('/showcase/components/pro-form/validation'))
    await waitForAppReady(page)
    await waitForRuntimeLoadingIdle(page)

    await expect(page.locator('h1', { hasText: '校验' })).toBeVisible()
    await expect(page.getByText('试用校验规则').first()).toBeVisible()
    await expect(page.getByText('校验可见').first()).toBeVisible()
    await page.getByRole('button', { name: /^校验$/ }).click()
    await expect(page.getByText('请求名称必填。').first()).toBeVisible()
    await expect(page.getByText(/预览外壳|页面渲染失败|验证命令|ai:guard|pnpm/)).toHaveCount(0)

    expect(pageErrors).toHaveLength(0)
    expect(consoleErrors).toHaveLength(0)
  })

  test('renders the chart theme showcase page through the catalog route', async ({ page }) => {
    const pageErrors: string[] = []
    const consoleDiagnostics: string[] = []

    page.on('pageerror', err => pageErrors.push(err.message))
    page.on('console', msg => {
      const text = msg.text()
      if (msg.type() === 'error' || text.includes('showcase.remaining')) {
        consoleDiagnostics.push(text)
      }
    })

    await loginAsAdmin(page)
    await gotoRouteSmokeVisual(page, showcaseSmokePath('/showcase/components/charts/theme'))
    await waitForAppReady(page)
    await waitForRuntimeLoadingIdle(page)

    await expect(page.locator('h1', { hasText: '图表主题' })).toBeVisible()
    await expect(page.getByText('查看主题感知图表如何跟随当前 token 色板').first()).toBeVisible()
    await expect(
      page.getByText('主题模式变化由图表包装与 token 运行时处理。').first()
    ).toBeVisible()
    await expect(page.locator('canvas').first()).toBeVisible()
    await expect(
      page.getByText(/预览外壳|页面渲染失败|showcase\.remaining|ai:guard|pnpm/)
    ).toHaveCount(0)

    expect(pageErrors).toHaveLength(0)
    expect(consoleDiagnostics).toHaveLength(0)
  })

  test('renders the feedback dialog-toast showcase page through the catalog route', async ({
    page,
  }) => {
    const pageErrors: string[] = []
    const consoleDiagnostics: string[] = []

    page.on('pageerror', err => pageErrors.push(err.message))
    page.on('console', msg => {
      const text = msg.text()
      if (msg.type() === 'error' || text.includes('showcase.remaining')) {
        consoleDiagnostics.push(text)
      }
    })

    await loginAsAdmin(page)
    await gotoRouteSmokeVisual(page, showcaseSmokePath('/showcase/feedback/dialog-toast'))
    await waitForAppReady(page)
    await waitForRuntimeLoadingIdle(page)

    await expect(page.locator('h1', { hasText: 'Dialog 与 Toast' })).toBeVisible()
    await expect(page.getByText('反馈从空状态开始').first()).toBeVisible()
    await page.getByRole('button', { name: '打开 Dialog' }).click()
    await expect(page.getByText('反馈 Dialog').first()).toBeVisible()
    await expect(page.getByText('Dialog 已打开').first()).toBeVisible()
    await page.getByRole('button', { name: '确定' }).click()
    await page.getByRole('button', { name: '显示 Message' }).click()
    await expect(page.getByText('Message 已显示').first()).toBeVisible()
    await page.getByRole('button', { name: '显示 Toast' }).click()
    await expect(page.getByText('Toast 已显示').first()).toBeVisible()
    await expect(
      page.getByText(/预览外壳|页面渲染失败|showcase\.remaining|ai:guard|pnpm/)
    ).toHaveCount(0)

    expect(pageErrors).toHaveLength(0)
    expect(consoleDiagnostics).toHaveLength(0)
  })

  test('renders the design tokens showcase page through the catalog route', async ({ page }) => {
    const pageErrors: string[] = []
    const consoleDiagnostics: string[] = []

    page.on('pageerror', err => pageErrors.push(err.message))
    page.on('console', msg => {
      const text = msg.text()
      if (msg.type() === 'error' || text.includes('showcase.remaining')) {
        consoleDiagnostics.push(text)
      }
    })

    await loginAsAdmin(page)
    await gotoRouteSmokeVisual(page, showcaseSmokePath('/showcase/design/tokens'))
    await waitForAppReady(page)
    await waitForRuntimeLoadingIdle(page)

    await expect(page.locator('h1', { hasText: '设计 Token' })).toBeVisible()
    await expect(page.getByText('查看语义 token 族', { exact: false }).first()).toBeVisible()
    await expect(
      page.getByText('状态表面如何跨主题保持可读', { exact: false }).first()
    ).toBeVisible()
    await expect(
      page.getByText(/预览外壳|页面渲染失败|showcase\.remaining|ai:guard|pnpm/)
    ).toHaveCount(0)

    expect(pageErrors).toHaveLength(0)
    expect(consoleDiagnostics).toHaveLength(0)
  })
})
