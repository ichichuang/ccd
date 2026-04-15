import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

const E2E_VISUAL_QUERY = 'e2e=visual'
const E2E_PRELOADER_HOLD_QUERY = 'e2eHoldPreloader=1'

export function withVisualMode(hashPath: string, options?: { holdPreloader?: boolean }): string {
  const query = options?.holdPreloader
    ? `${E2E_VISUAL_QUERY}&${E2E_PRELOADER_HOLD_QUERY}`
    : E2E_VISUAL_QUERY
  return `/?${query}#${hashPath.startsWith('/') ? hashPath : `/${hashPath}`}`
}

export async function gotoVisual(page: Page, hashPath: string): Promise<void> {
  await page.goto(withVisualMode(hashPath))
}

export async function gotoVisualFirstPaint(page: Page, hashPath: string): Promise<void> {
  await page.goto(withVisualMode(hashPath, { holdPreloader: true }), {
    waitUntil: 'domcontentloaded',
  })
  await page.waitForFunction(() => document.documentElement.dataset.preloaderState === 'held')
}

export async function releasePreloader(page: Page): Promise<void> {
  await page.evaluate(() => {
    window.dispatchEvent(new Event('ccd:release-preloader'))
  })
}

export async function waitForAppReady(page: Page): Promise<void> {
  await page.waitForFunction(() => document.documentElement.dataset.appReady === 'true')
  await expect(page.locator('#app-shell')).toBeVisible()
}

export async function waitForRuntimeLoadingIdle(page: Page): Promise<void> {
  await page.waitForFunction(() => document.documentElement.dataset.runtimeLoading === 'false')
  await expect(page.locator('#runtime-loading-overlay')).toBeHidden()
}

export async function waitForThemeTransitionEnd(page: Page): Promise<void> {
  await page.waitForFunction(() => document.documentElement.dataset.themeTransitioning !== 'true')
}

export async function loginAsAdmin(page: Page): Promise<void> {
  await gotoVisual(page, '/login')
  await page.locator('#username').fill('admin')
  await page.locator('#password').fill('123456')
  await page.locator('#login-submit').click()
  await page.waitForURL(/#\/dashboard$/)
  await waitForAppReady(page)
  await waitForRuntimeLoadingIdle(page)
  await expect(page.locator('#dashboard-page')).toBeVisible({ timeout: 15000 })
}
