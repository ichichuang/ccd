import { expect, test } from '@playwright/test'
import {
  gotoVisual,
  loginAsAdmin,
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

  test('theme switch example reaches stable dark and light states', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('ccd-e2e-mode', 'visual')
    })

    await loginAsAdmin(page)
    await gotoVisual(page, '/example/hooks/composables/use-theme-switch')
    await waitForAppReady(page)

    const pageRoot = page.locator('#use-theme-switch-page')

    await expect(pageRoot).toHaveScreenshot('use-theme-switch-light.png')

    await page.locator('#theme-mode-dark-animated').click()
    await waitForThemeTransitionEnd(page)
    await expect(pageRoot).toHaveScreenshot('use-theme-switch-dark.png')

    await page.locator('#theme-mode-light-animated').click()
    await waitForThemeTransitionEnd(page)
    await expect(pageRoot).toHaveScreenshot('use-theme-switch-light-return.png')
  })

  test('global settings content renders stable preset controls', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('ccd-e2e-mode', 'visual')
    })

    await loginAsAdmin(page)
    await gotoVisual(page, '/example/system-configuration/theme')
    await waitForAppReady(page)

    await expect(page).toHaveScreenshot('theme-system-page.png', {
      fullPage: true,
    })
  })
})
