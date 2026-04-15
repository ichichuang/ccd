import { expect, test } from '@playwright/test'
import { loginAsAdmin, openGlobalSettings } from './helpers/app'

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
    await openGlobalSettings(page)

    const settings = page.locator('#global-settings-content')

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
