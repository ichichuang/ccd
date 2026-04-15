import { expect, test } from '@playwright/test'
import { waitForAppReady, waitForRuntimeLoadingIdle } from './helpers/app'

async function loginAsAdmin(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('/#/login')
  await page.locator('#username').fill('admin')
  await page.locator('#password').fill('123456')
  await page.locator('#login-submit').click()
  await page.waitForURL(/#\/dashboard$/)
  await waitForAppReady(page)
  await waitForRuntimeLoadingIdle(page)
}

async function waitForThemeState(
  page: import('@playwright/test').Page,
  targetMode: 'light' | 'dark'
): Promise<void> {
  await page.waitForFunction(mode => {
    const isDark = document.documentElement.classList.contains('dark')
    return (
      document.documentElement.dataset.themeMode === mode &&
      document.documentElement.dataset.themeTransitioning === 'false' &&
      (mode === 'dark' ? isDark : !isDark)
    )
  }, targetMode)
}

test.describe('theme switch interaction', () => {
  test('global settings select button returns to light when dark and light are clicked rapidly', async ({
    page,
  }) => {
    await loginAsAdmin(page)

    await page.locator('#user-entry-trigger').click()
    await page.locator('#user-open-global-settings').click()

    const settings = page.locator('#global-settings-content')
    await expect(settings).toBeVisible()

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
})
