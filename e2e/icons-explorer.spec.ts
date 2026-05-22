import { expect, test } from '@playwright/test'
import { gotoVisual, loginAsAdmin, waitForAppReady, waitForRuntimeLoadingIdle } from './helpers/app'

test.describe('icons explorer', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
    await gotoVisual(page, '/example/components/icons')
    await waitForAppReady(page)
    await waitForRuntimeLoadingIdle(page)
  })

  test('renders icons, applies controls, and keeps panes independently scrollable', async ({
    page,
  }) => {
    const pageRoot = page.getByTestId('icons-explorer-page')
    const iconCards = page.getByTestId('icon-card')
    const previewIcon = page.getByTestId('preview-icon')
    const gridIcon = page.getByTestId('grid-icon').first()
    const count = page.getByTestId('icons-count')

    await expect(pageRoot).toBeVisible()
    await expect(count).not.toContainText('共 0 个图标')
    await expect(iconCards.first()).toBeVisible()
    expect(await iconCards.count()).toBeGreaterThan(0)

    const secondIconName = await iconCards.nth(1).getAttribute('data-icon-name')
    await iconCards.nth(1).click()
    await expect(page.getByTestId('icons-preview')).toContainText(secondIconName ?? '')

    await page.getByTestId('icon-size-5xl').click()
    await expect(previewIcon).toHaveClass(/text-5xl/)
    await expect(gridIcon).toHaveClass(/text-5xl/)

    await page.getByTestId('icon-color-primary').click()
    await expect(previewIcon).toHaveCSS('color', /rgb\(/)
    await expect(gridIcon).toHaveCSS('color', /rgb\(/)

    await page.getByTestId('icon-rotate-input').fill('90')
    await expect(previewIcon).toHaveCSS('transform', /matrix/)
    await expect(gridIcon).toHaveCSS('transform', /matrix/)

    await page.getByTestId('icon-scale-input').fill('1.5')
    await expect(previewIcon).toHaveCSS('transform', /matrix/)
    await expect(gridIcon).toHaveCSS('transform', /matrix/)

    const bodyScrollBefore = await page.evaluate(() => document.scrollingElement?.scrollTop ?? 0)
    await expect(pageRoot).toHaveCSS('overflow', 'hidden')

    const gridScrollTop = await page
      .locator('[data-testid="icons-grid-scroll"] .c-scrollbar-native')
      .evaluate(el => {
        el.scrollTop = 120
        el.dispatchEvent(new Event('scroll'))
        return el.scrollTop
      })
    const settingsScrollTopBefore = await page
      .locator('[data-testid="icons-settings-scroll"] .c-scrollbar-native')
      .evaluate(el => el.scrollTop)

    expect(gridScrollTop).toBeGreaterThan(0)

    const settingsScrollTop = await page
      .locator('[data-testid="icons-settings-scroll"] .c-scrollbar-native')
      .evaluate(el => {
        el.scrollTop += 120
        el.dispatchEvent(new Event('scroll'))
        return el.scrollTop
      })
    const gridScrollTopAfter = await page
      .locator('[data-testid="icons-grid-scroll"] .c-scrollbar-native')
      .evaluate(el => el.scrollTop)
    const bodyScrollAfter = await page.evaluate(() => document.scrollingElement?.scrollTop ?? 0)

    expect(settingsScrollTop).toBeGreaterThan(settingsScrollTopBefore)
    expect(gridScrollTopAfter).toBe(gridScrollTop)
    expect(bodyScrollAfter).toBe(bodyScrollBefore)
  })
})
