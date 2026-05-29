import { expect, test, type Page } from '@playwright/test'
import {
  gotoVisual,
  waitForAppReady,
  waitForRuntimeLoadingIdle,
  waitForThemeTransitionEnd,
} from './helpers/app'
import { AUTH_STORAGE_STATE_PATH } from './helpers/authState'

async function getThemeContextMenuIconClass(page: Page): Promise<string> {
  await waitForRuntimeLoadingIdle(page)
  await page
    .locator('[data-layout-shell="admin"]')
    .click({ button: 'right', position: { x: 80, y: 120 } })

  const item = page.getByRole('menu').locator('.global-context-menu__theme-toggle')
  await expect(item).toBeVisible()

  const icon = item.locator('[class*="i-lucide-"]').first()
  await expect(icon).toBeVisible()
  await expect(icon).toHaveCSS('mask-image', /url\(/)

  const box = await icon.boundingBox()
  expect(box?.width).toBeGreaterThan(0)
  expect(box?.height).toBeGreaterThan(0)

  return (await icon.getAttribute('class')) ?? ''
}

test.use({ storageState: AUTH_STORAGE_STATE_PATH })

test('global context menu theme toggle icon follows light and dark DOM state', async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('ccd-e2e-mode', 'visual')
  })

  await gotoVisual(page, '/dashboard')
  await waitForAppReady(page)
  await expect.poll(() => getThemeContextMenuIconClass(page)).toContain('i-lucide-moon')

  await page.getByRole('menu').locator('.global-context-menu__theme-toggle').click()
  await waitForThemeTransitionEnd(page)
  await expect(page.locator('html')).toHaveClass(/dark/)
  await expect.poll(() => getThemeContextMenuIconClass(page)).toContain('i-lucide-sun')
})
