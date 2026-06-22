import { expect, test } from '@playwright/test'
import { gotoVisual, loginAsAdmin, waitForAppReady, waitForRuntimeLoadingIdle } from './helpers/app'

test.describe('Phase 1 correctness', () => {
  test.describe('direct credential entry and login', () => {
    test('login with direct credentials via #username and #password', async ({ page }) => {
      await gotoVisual(page, '/login')
      await waitForAppReady(page)
      await waitForRuntimeLoadingIdle(page)

      // Direct credential entry (no quick-account buttons)
      await expect(page.locator('#username')).toBeVisible({ timeout: 15000 })
      await page.locator('#username').fill('admin')
      await page.locator('#password').fill('123456')

      const submit = page.locator('#login-submit')
      await expect(submit).toBeEnabled()
      await submit.click()

      await expect(page).toHaveURL(/#\/dashboard$/, { timeout: 30000 })
      await waitForAppReady(page)
      await waitForRuntimeLoadingIdle(page)
      await expect(page.locator('#dashboard-page')).toBeVisible({ timeout: 15000 })
    })
  })

  test.describe('valid redirect reaches intended internal route', () => {
    test('redirect to /architecture/governance after login', async ({ page }) => {
      await gotoVisual(page, '/login?redirect=/architecture/governance')
      await waitForAppReady(page)
      await waitForRuntimeLoadingIdle(page)

      await page.locator('#username').fill('admin')
      await page.locator('#password').fill('123456')

      const submit = page.locator('#login-submit')
      await expect(submit).toBeEnabled()
      await submit.click()

      // Should redirect to the requested internal route
      await expect(page).toHaveURL(/#\/architecture\/governance$/, { timeout: 30000 })
      await waitForAppReady(page)
      await waitForRuntimeLoadingIdle(page)
    })
  })

  test.describe('external-like and login-loop redirects fall back safely', () => {
    test('external-like redirect falls back to safe default', async ({ page }) => {
      await gotoVisual(page, '/login?redirect=https://evil.com')
      await waitForAppReady(page)
      await waitForRuntimeLoadingIdle(page)

      await page.locator('#username').fill('admin')
      await page.locator('#password').fill('123456')

      const submit = page.locator('#login-submit')
      await expect(submit).toBeEnabled()
      await submit.click()

      // Must NOT redirect to the external URL; must land on safe default
      await expect(page).not.toHaveURL(/evil\.com/)
      await page.waitForTimeout(2000)
      const url = page.url()
      expect(url).toMatch(/#\/dashboard/)
    })

    test('/login redirect falls back to safe default', async ({ page }) => {
      await gotoVisual(page, '/login?redirect=/login')
      await waitForAppReady(page)
      await waitForRuntimeLoadingIdle(page)

      await page.locator('#username').fill('admin')
      await page.locator('#password').fill('123456')

      const submit = page.locator('#login-submit')
      await expect(submit).toBeEnabled()
      await submit.click()

      // Must NOT redirect back to /login
      await expect(page).not.toHaveURL(/#\/login$/, { timeout: 10000 })
      await page.waitForTimeout(2000)
      const url = page.url()
      expect(url).toMatch(/#\/dashboard/)
    })
  })

  test.describe('error page behavior', () => {
    test('404 page shows Dashboard action when navigating to unknown URL', async ({ page }) => {
      // Login first — error pages require authentication
      await loginAsAdmin(page)

      await gotoVisual(page, '/nonexistent-url-that-does-not-exist')
      await waitForAppReady(page)
      await waitForRuntimeLoadingIdle(page)

      // Should land on /404
      await expect(page).toHaveURL(/#\/404$/, { timeout: 15000 })

      // Dashboard action is present
      await expect(page.getByRole('button', { name: /Back to Home|返回首页/ })).toBeVisible()

      // Error page heading
      await expect(page.locator('h1')).toBeVisible()
    })

    test('403 page is reachable and has Dashboard action', async ({ page }) => {
      // Login as admin first, then navigate to a restricted path
      await loginAsAdmin(page)

      // Navigate to 403
      await gotoVisual(page, '/403')
      await waitForAppReady(page)
      await waitForRuntimeLoadingIdle(page)

      // Should stay on /403
      await expect(page).toHaveURL(/#\/403$/, { timeout: 10000 })

      // Dashboard action is present
      await expect(page.getByRole('button', { name: /Back to Home|返回首页/ })).toBeVisible()
    })

    test('500 page has Reload and Dashboard controls', async ({ page }) => {
      // Login as admin first
      await loginAsAdmin(page)

      // Navigate to 500
      await gotoVisual(page, '/500')
      await waitForAppReady(page)
      await waitForRuntimeLoadingIdle(page)

      // Should stay on /500
      await expect(page).toHaveURL(/#\/500$/, { timeout: 10000 })

      // Dashboard action is present
      await expect(page.getByRole('button', { name: /Back to Home|返回首页/ })).toBeVisible()

      // Reload action is present
      await expect(page.getByRole('button', { name: /Reload|重新载入/ })).toBeVisible()
    })

    test('unknown URL reaches /404', async ({ page }) => {
      // Login first — CatchAll redirect to /404 requires authentication
      await loginAsAdmin(page)

      await gotoVisual(page, '/completely/bogus/path/that/should/not/exist')
      await waitForAppReady(page)
      await waitForRuntimeLoadingIdle(page)

      // Should redirect to /404 via CatchAll
      await expect(page).toHaveURL(/#\/404$/, { timeout: 15000 })
    })

    test('no blank route on unauthenticated page visit', async ({ page }) => {
      await gotoVisual(page, '/login')
      await waitForAppReady(page)
      await waitForRuntimeLoadingIdle(page)

      // Login page must be visible — not a blank page
      await expect(page.locator('#login-submit')).toBeVisible({ timeout: 15000 })
    })
  })

  test.describe('no uncaught console errors for covered scenarios', () => {
    test('login page has no console errors', async ({ page }) => {
      const consoleErrors: string[] = []
      page.on('console', msg => {
        if (msg.type() === 'error') consoleErrors.push(msg.text())
      })

      await gotoVisual(page, '/login')
      await waitForAppReady(page)
      await waitForRuntimeLoadingIdle(page)

      // Filter out expected warnings
      const relevantErrors = consoleErrors.filter(
        e => !e.includes('Failed to load resource') && !e.includes('favicon')
      )
      expect(relevantErrors).toEqual([])
    })

    test('error pages have no console errors', async ({ page }) => {
      const consoleErrors: string[] = []
      page.on('console', msg => {
        if (msg.type() === 'error') consoleErrors.push(msg.text())
      })

      await gotoVisual(page, '/404')
      await waitForAppReady(page)
      await waitForRuntimeLoadingIdle(page)

      const relevantErrors = consoleErrors.filter(
        e => !e.includes('Failed to load resource') && !e.includes('favicon')
      )
      expect(relevantErrors).toEqual([])
    })
  })
})
