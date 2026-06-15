import { expect, test } from '@playwright/test'
import { gotoVisual, loginAsAdmin, waitForAppReady, waitForRuntimeLoadingIdle } from './helpers/app'

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
