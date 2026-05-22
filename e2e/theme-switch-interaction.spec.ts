import { expect, test, type Page } from '@playwright/test'
import { gotoVisual, waitForAppReady, waitForRuntimeLoadingIdle } from './helpers/app'

async function loginAsAdmin(page: Page): Promise<void> {
  await page.goto('/#/login')
  await waitForAppReady(page)
  await waitForRuntimeLoadingIdle(page)
  await expect(page.locator('#username')).toBeVisible({ timeout: 15000 })
  await page.locator('#username').fill('admin')
  await page.locator('#password').fill('123456')
  const submit = page.locator('#login-submit')
  await expect(submit).toBeEnabled()
  await submit.click()
  await expect(page).toHaveURL(/#\/dashboard$/, { timeout: 30000 })
  await waitForAppReady(page)
  await waitForRuntimeLoadingIdle(page)
}

async function waitForThemeState(page: Page, targetMode: 'light' | 'dark'): Promise<void> {
  await page.waitForFunction(mode => {
    const isDark = document.documentElement.classList.contains('dark')
    return (
      document.documentElement.dataset.themeMode === mode &&
      document.documentElement.dataset.themeTransitioning === 'false' &&
      (mode === 'dark' ? isDark : !isDark)
    )
  }, targetMode)
}

async function switchTheme(page: Page, targetMode: 'light' | 'dark'): Promise<void> {
  await page.locator('#user-entry-trigger').click()
  await page.locator('#user-open-global-settings').click()

  const settings = page.locator('#global-settings-content')
  await expect(settings).toBeVisible()
  await settings.getByRole('button', { name: targetMode === 'dark' ? '深色' : '浅色' }).click()
  await waitForThemeState(page, targetMode)
  await page.keyboard.press('Escape')
  await expect(settings).toBeHidden()
}

async function openPrimeVueOverview(page: Page): Promise<void> {
  await gotoVisual(page, '/example/primevue-collection/overview')
  await waitForAppReady(page)
  await waitForRuntimeLoadingIdle(page)
  await expect(page.getByRole('heading', { name: 'Button Family' })).toBeVisible()
}

type RaisedButtonVisual = {
  text: string
  boxShadow: string
  hasVisibleElevation: boolean
}

async function readRaisedButtonVisuals(page: Page): Promise<RaisedButtonVisual[]> {
  return page.evaluate(() => {
    return Array.from(document.querySelectorAll<HTMLButtonElement>('button.p-button-raised'))
      .slice(0, 8)
      .map(button => {
        const style = getComputedStyle(button)
        const hasVisibleElevation = style.boxShadow !== 'none' || style.outlineStyle !== 'none'
        return {
          text: button.textContent?.trim() ?? '',
          boxShadow: style.boxShadow,
          hasVisibleElevation,
        }
      })
  })
}

async function expectToastTopCenter(page: Page): Promise<void> {
  await page.evaluate(() => {
    window.$message?.success('E2E top center message')
  })

  const toast = page.locator('.p-toast.p-toast-top-center').first()
  await expect(toast).toBeVisible()
  await expect(toast.getByText('E2E top center message')).toBeVisible()

  const geometry = await toast.evaluate(element => {
    const rect = element.getBoundingClientRect()
    return {
      top: Math.round(rect.top),
      centerX: Math.round(rect.left + rect.width / 2),
      viewportCenterX: Math.round(window.innerWidth / 2),
    }
  })

  expect(geometry.top).toBeGreaterThanOrEqual(0)
  expect(Math.abs(geometry.centerX - geometry.viewportCenterX)).toBeLessThanOrEqual(4)
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

  test('PrimeVue raised buttons stay visibly elevated in dark mode', async ({ page }) => {
    await loginAsAdmin(page)
    await switchTheme(page, 'dark')
    await openPrimeVueOverview(page)

    const visuals = await readRaisedButtonVisuals(page)
    expect(visuals.length).toBeGreaterThanOrEqual(8)
    expect(visuals.map(visual => visual.text)).toEqual(
      expect.arrayContaining([
        'Primary',
        'Secondary',
        'Success',
        'Info',
        'Warn',
        'Help',
        'Danger',
        'Contrast',
      ])
    )
    expect(visuals.every(visual => visual.hasVisibleElevation)).toBe(true)
    expect(visuals.every(visual => visual.boxShadow !== 'none')).toBe(true)
  })

  test('window message default renders at top center', async ({ page }) => {
    await loginAsAdmin(page)
    await expectToastTopCenter(page)
  })
})
