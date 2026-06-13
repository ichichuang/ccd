import { expect, test, type Page } from '@playwright/test'
import {
  gotoVisual,
  loginAsAdmin,
  waitForAppReady,
  waitForRuntimeLoadingIdle,
  waitForThemeTransitionEnd,
} from '../helpers/app'

async function switchThemeFromSettingsPage(
  page: Page,
  targetMode: 'light' | 'dark'
): Promise<void> {
  await page.locator('#user-entry-trigger').click()
  await page.locator('#user-open-global-settings').click()
  await expect(page).toHaveURL(/#\/system\/settings$/, { timeout: 15000 })
  const settings = page.getByTestId('global-settings-page')
  await expect(settings).toBeVisible()
  await expect(page.locator('#global-settings-content')).toHaveCount(0)
  await settings.getByRole('button', { name: targetMode === 'dark' ? '深色' : '浅色' }).click()
  await waitForThemeTransitionEnd(page)

  await gotoVisual(page, '/system/theme')
  await waitForAppReady(page)
  await waitForRuntimeLoadingIdle(page)
}

test.describe('theme switching visual regression', () => {
  test('dashboard ready state is stable', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('ccd-e2e-mode', 'visual')
    })

    await loginAsAdmin(page)
    await expect(page.locator('#dashboard-page')).toHaveScreenshot('dashboard-ready.png')
  })

  test('system theme console reaches stable dark and light states', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('ccd-e2e-mode', 'visual')
    })

    await loginAsAdmin(page)
    await gotoVisual(page, '/system/theme')
    await waitForAppReady(page)
    await waitForRuntimeLoadingIdle(page)

    const pageRoot = page.getByTestId('architecture-console-page')

    await expect(pageRoot).toHaveScreenshot('system-theme-light.png')

    await switchThemeFromSettingsPage(page, 'dark')
    await expect(pageRoot).toHaveScreenshot('system-theme-dark.png')

    await switchThemeFromSettingsPage(page, 'light')
    await expect(pageRoot).toHaveScreenshot('system-theme-light-return.png')
  })

  test('global settings route renders stable preset controls', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('ccd-e2e-mode', 'visual')
    })

    await loginAsAdmin(page)
    await gotoVisual(page, '/system/theme')
    await waitForAppReady(page)
    await waitForRuntimeLoadingIdle(page)
    await expect(page.getByTestId('architecture-console-page')).toBeVisible({ timeout: 15000 })

    await expect(page).toHaveScreenshot('system-theme-page.png', {
      fullPage: true,
    })
  })
})
