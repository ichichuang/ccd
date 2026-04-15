import { expect, test } from '@playwright/test'
import {
  loginAsAdmin,
  openGlobalSettings,
  waitForAppReady,
  waitForThemeTransitionEnd,
} from '../helpers/app'

test.describe('theme switching visual regression', () => {
  test('dashboard ready state is stable', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('ccd-e2e-mode', 'visual')
    })

    await loginAsAdmin(page)
    await expect(page.locator('#dashboard-page')).toHaveScreenshot('dashboard-ready.png')
  })

  test('global settings reaches stable dark and light states', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('ccd-e2e-mode', 'visual')
    })

    await loginAsAdmin(page)
    await openGlobalSettings(page)

    const pageRoot = page.locator('#global-settings-content')

    await expect(pageRoot).toHaveScreenshot('global-settings-light.png')

    await page.getByRole('button', { name: '深色' }).click()
    await waitForThemeTransitionEnd(page)
    await expect(pageRoot).toHaveScreenshot('global-settings-dark.png')

    await page.getByRole('button', { name: '浅色' }).click()
    await waitForThemeTransitionEnd(page)
    await expect(pageRoot).toHaveScreenshot('global-settings-light-return.png')
  })

  test('global settings overlay renders stable with dashboard shell', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('ccd-e2e-mode', 'visual')
    })

    await loginAsAdmin(page)
    await openGlobalSettings(page)
    await waitForAppReady(page)

    await expect(page).toHaveScreenshot('theme-system-page.png', {
      fullPage: true,
    })
  })
})
