import { expect, test, type Page } from '@playwright/test'
import { gotoVisual, loginAsAdmin, waitForAppReady, waitForRuntimeLoadingIdle } from './helpers/app'

type AuthMotionSnapshot = {
  animationCount: number
  animationName: string
  currentTime: number
  instance: string | null
  marker: string | null
  sameAnimation: boolean
  username: string
  password: string
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

async function readAuthMotionSnapshot(
  page: Page,
  options: { mark?: boolean } = {}
): Promise<AuthMotionSnapshot> {
  return page.evaluate(shouldMark => {
    type AuthMotionProbeElement = HTMLElement & {
      ccdMotionAnimation?: Animation | null
      ccdMotionProbe?: string
    }

    const core = document.querySelector<HTMLElement>('[data-auth-motion-core="true"]')
    if (!core) throw new Error('Expected auth motion core to be mounted.')

    const probe = core as AuthMotionProbeElement
    const activeAnimation =
      core.getAnimations().find(animation => animation.playState === 'running') ??
      core.getAnimations()[0] ??
      null

    if (shouldMark) {
      probe.ccdMotionProbe = 'auth-motion-same-node'
      probe.ccdMotionAnimation = activeAnimation
    }

    const rawCurrentTime = activeAnimation?.currentTime
    const currentTime =
      typeof rawCurrentTime === 'number' ? rawCurrentTime : Number(rawCurrentTime ?? 0)
    const username = document.querySelector<HTMLInputElement>('#username')?.value ?? ''
    const password = document.querySelector<HTMLInputElement>('#password')?.value ?? ''

    return {
      animationCount: core.getAnimations().length,
      animationName: getComputedStyle(core).animationName,
      currentTime,
      instance: core.dataset.motionInstance ?? null,
      marker: probe.ccdMotionProbe ?? null,
      sameAnimation: probe.ccdMotionAnimation === activeAnimation,
      username,
      password,
    }
  }, options.mark === true)
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

    await page.locator('#login-fill-admin').click()
    await expect(page.locator('#username')).toHaveValue('admin')
    await expect(page.locator('#password')).toHaveValue('123456')

    await page.locator('#login-fill-user').click()
    await expect(page.locator('#username')).toHaveValue('user')
    await expect(page.locator('#password')).toHaveValue('123456')

    await page.locator('#login-fill-admin').click()
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

    await page.goto('/#/login?redirect=/system/settings')
    await waitForAppReady(page)
    await waitForRuntimeLoadingIdle(page)
    await expect(page.locator('#login-submit')).toBeVisible()

    await page.locator('#username').fill('admin')
    await page.locator('#password').fill('123456')
    await expect(page.locator('[data-auth-motion-core="true"]')).toBeVisible()
    await page.waitForTimeout(120)

    const beforeToggle = await readAuthMotionSnapshot(page, { mark: true })
    expect(beforeToggle.animationCount).toBeGreaterThan(0)
    expect(beforeToggle.animationName).not.toBe('none')
    expect(beforeToggle.sameAnimation).toBe(true)

    await page.getByRole('button', { name: '切换主题' }).click()
    await waitForLoginThemeState(page, 'dark')
    await page.waitForTimeout(120)

    const afterToggle = await readAuthMotionSnapshot(page)
    expect(afterToggle.marker).toBe('auth-motion-same-node')
    expect(afterToggle.sameAnimation).toBe(true)
    expect(afterToggle.instance).toBe(beforeToggle.instance)
    expect(afterToggle.animationName).toBe(beforeToggle.animationName)
    expect(afterToggle.currentTime).toBeGreaterThan(beforeToggle.currentTime)
    expect(afterToggle.username).toBe('admin')
    expect(afterToggle.password).toBe('123456')
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
    await expect(page.locator('#dashboard-page')).toBeVisible()
    await expect(page.locator('#dashboard-page')).toContainText('架构控制中心')
    await expect(page.locator('#dashboard-page')).toContainText('运行时隔离')

    await gotoVisual(page, '/ui/pro-form')
    await waitForAppReady(page)
    await waitForRuntimeLoadingIdle(page)
    await expect(page.getByTestId('architecture-console-page')).toContainText('ProForm 能力')
    await expect(page.getByTestId('architecture-console-page')).toContainText('Schema 驱动 ProForm')

    await gotoVisual(page, '/ui/pro-table')
    await waitForAppReady(page)
    await waitForRuntimeLoadingIdle(page)
    await expect(page.getByTestId('architecture-console-page')).toContainText('ProTable 能力')
    await expect(page.getByTestId('architecture-console-page')).toContainText('类型化 ProTable')

    await gotoVisual(page, '/system/settings')
    await waitForAppReady(page)
    await waitForRuntimeLoadingIdle(page)
    await expect(page.getByTestId('global-settings-page')).toContainText('全局设置')
    await expect(page.getByTestId('global-settings-page')).toContainText('布局模块')

    await gotoVisual(page, '/missing-view')
    await waitForAppReady(page)
    await waitForRuntimeLoadingIdle(page)
    await expect(page).toHaveURL(/#\/404$/)
    await expect(page.locator('body')).toContainText('404')
  })
})
