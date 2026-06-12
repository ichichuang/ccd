import { expect, test } from '@playwright/test'
import {
  gotoVisual,
  loginAsAdmin,
  waitForAppReady,
  waitForRuntimeLoadingIdle,
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

    await page.locator('#user-entry-trigger').click()
    await page.locator('#user-open-global-settings').click()
    await page.locator('#global-settings-content').getByRole('button', { name: '深色' }).click()
    await waitForThemeTransitionEnd(page)
    await page.keyboard.press('Escape')
    await expect(pageRoot).toHaveScreenshot('system-theme-dark.png')

    await page.locator('#user-entry-trigger').click()
    await page.locator('#user-open-global-settings').click()
    await page.locator('#global-settings-content').getByRole('button', { name: '浅色' }).click()
    await waitForThemeTransitionEnd(page)
    await page.keyboard.press('Escape')
    await expect(pageRoot).toHaveScreenshot('system-theme-light-return.png')
  })

  test('global settings content renders stable preset controls', async ({ page }) => {
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
