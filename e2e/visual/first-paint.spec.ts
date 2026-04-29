import { expect, test } from '@playwright/test'
import {
  gotoVisualFirstPaint,
  releasePreloader,
  waitForAppReady,
  waitForRuntimeLoadingIdle,
} from '../helpers/app'

test.describe('first paint visual regression', () => {
  test('light-mode native preloader matches snapshot', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('theme-mode', 'light')
      window.localStorage.setItem('ccd-e2e-mode', 'visual')
    })

    await gotoVisualFirstPaint(page, '/login')
    await expect(page.locator('#preloader-bg')).toHaveScreenshot('first-paint-light.png')

    await releasePreloader(page)
    await waitForAppReady(page)
    await waitForRuntimeLoadingIdle(page)
  })

  test('dark-mode native preloader matches snapshot', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('theme-mode', 'dark')
      window.localStorage.setItem('ccd-e2e-mode', 'visual')
    })

    await gotoVisualFirstPaint(page, '/login')
    await expect(page.locator('#preloader-bg')).toHaveScreenshot('first-paint-dark.png')

    await releasePreloader(page)
    await waitForAppReady(page)
    await waitForRuntimeLoadingIdle(page)
  })
})
