import { expect, test, type Page } from '@playwright/test'
import { gotoVisual, waitForAppReady, waitForRuntimeLoadingIdle } from './helpers/app'

async function loginAsAdmin(page: Page): Promise<void> {
  await page.goto('/#/login')
  await waitForAppReady(page)
  await waitForRuntimeLoadingIdle(page)
  await expect(page.locator('#username')).toBeVisible({ timeout: 15000 })
  await page.locator('#username').fill('admin')
  await page.locator('#password').fill('123456')
  const submit = page.locator('#login-submit')
  await expect(submit).toBeEnabled()
  await submit.click()
  await expect(page).toHaveURL(/#\/dashboard$/, { timeout: 30000 })
  await waitForAppReady(page)
  await waitForRuntimeLoadingIdle(page)
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

async function openSettingsPageFromUserMenu(page: Page) {
  await page.locator('#user-entry-trigger').click()
  await page.locator('#user-open-global-settings').click()

  await expect(page).toHaveURL(/#\/system\/settings$/, { timeout: 15000 })
  await waitForAppReady(page)
  await waitForRuntimeLoadingIdle(page)

  const settings = page.getByTestId('global-settings-page')
  await expect(settings).toBeVisible()
  await expect(page.getByRole('heading', { name: /全局设置|Global Settings/ })).toBeVisible()
  await expect(page.locator('#global-settings-content')).toHaveCount(0)
  await expect(page.getByText('全局配置 (Global Settings)')).toHaveCount(0)
  await expect(
    page
      .locator('[data-route-exact-active="true"]')
      .filter({ hasText: /全局设置|Global Settings/ })
      .first()
  ).toBeVisible()

  return settings
}

async function switchTheme(page: Page, targetMode: 'light' | 'dark'): Promise<void> {
  const settings = await openSettingsPageFromUserMenu(page)
  await settings.getByRole('button', { name: targetMode === 'dark' ? '深色' : '浅色' }).click()
  await waitForThemeState(page, targetMode)
}

async function openPrimeVueAdapter(page: Page): Promise<void> {
  await gotoVisual(page, '/ui/primevue-adapter')
  await waitForAppReady(page)
  await waitForRuntimeLoadingIdle(page)
  await expect(
    page.getByRole('heading', { name: /按钮与表单控件|Button And Form Controls/ })
  ).toBeVisible()
}

type RaisedButtonVisual = {
  text: string
  boxShadow: string
  hasVisibleElevation: boolean
}

async function readRaisedButtonVisuals(page: Page): Promise<RaisedButtonVisual[]> {
  return page.evaluate(() => {
    return Array.from(document.querySelectorAll<HTMLButtonElement>('button.p-button-raised'))
      .slice(0, 8)
      .map(button => {
        const style = getComputedStyle(button)
        const hasVisibleElevation = style.boxShadow !== 'none' || style.outlineStyle !== 'none'
        return {
          text: button.textContent?.trim() ?? '',
          boxShadow: style.boxShadow,
          hasVisibleElevation,
        }
      })
  })
}

async function expectToastTopCenter(page: Page): Promise<void> {
  await page.waitForFunction(() => typeof window.$toast?.add === 'function')
  await page.evaluate(() => {
    window.$toast?.add({
      severity: 'success',
      summary: 'E2E top center message',
      group: 'tc',
      life: 10000,
    })
  })

  const toast = page.getByText('E2E top center message').last()
  await expect(toast).toBeVisible()

  const geometry = await toast.evaluate(element => {
    const container = element.closest('.p-toast') ?? element
    const rect = container.getBoundingClientRect()
    return {
      top: Math.round(rect.top),
      centerX: Math.round(rect.left + rect.width / 2),
      viewportCenterX: Math.round(window.innerWidth / 2),
    }
  })

  expect(geometry.top).toBeGreaterThanOrEqual(0)
  expect(Math.abs(geometry.centerX - geometry.viewportCenterX)).toBeLessThanOrEqual(4)
}

test.describe('theme switch interaction', () => {
  test('global settings select button returns to light when dark and light are clicked rapidly', async ({
    page,
  }) => {
    await loginAsAdmin(page)

    const settings = await openSettingsPageFromUserMenu(page)

    const darkButton = settings.getByRole('button', { name: '深色' })
    const lightButton = settings.getByRole('button', { name: '浅色' })

    if ((await lightButton.getAttribute('aria-pressed')) !== 'true') {
      await lightButton.click()
      await waitForThemeState(page, 'light')
    }

    await expect(lightButton).toHaveAttribute('aria-pressed', 'true')

    await darkButton.click({ noWaitAfter: true })
    await lightButton.click({ noWaitAfter: true })

    await waitForThemeState(page, 'light')

    await expect(lightButton).toHaveAttribute('aria-pressed', 'true')
    await expect(darkButton).toHaveAttribute('aria-pressed', 'false')
  })

  test('PrimeVue raised buttons stay visibly elevated in dark mode', async ({ page }) => {
    await loginAsAdmin(page)
    await switchTheme(page, 'dark')
    await openPrimeVueAdapter(page)

    const visuals = await readRaisedButtonVisuals(page)
    expect(visuals.length).toBeGreaterThanOrEqual(8)
    expect(visuals.map(visual => visual.text)).toEqual(
      expect.arrayContaining(['主按钮', '次按钮', '成功', '信息', '警告', '帮助', '危险', '高对比'])
    )
    expect(visuals.every(visual => visual.hasVisibleElevation)).toBe(true)
    expect(visuals.every(visual => visual.boxShadow !== 'none')).toBe(true)
  })

  test('window toast top-center group renders at top center', async ({ page }) => {
    await loginAsAdmin(page)
    await expectToastTopCenter(page)
  })
})
