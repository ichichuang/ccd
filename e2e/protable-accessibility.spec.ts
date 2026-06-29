import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import {
  loginAsAdmin,
  waitForAppReady,
  waitForRuntimeLoadingIdle,
  withVisualMode,
} from './helpers/app'

async function gotoProTableVirtualRoute(page: Page): Promise<void> {
  const path = '/showcase/components/pro-table/virtual-infinite'
  await page.goto(withVisualMode(path), { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(expectedPath => window.location.hash === `#${expectedPath}`, path)
  await waitForAppReady(page)
  await waitForRuntimeLoadingIdle(page)
}

test.describe('ProTable accessibility smoke', () => {
  test('virtual scroll demo region has no axe violations', async ({ page }) => {
    await loginAsAdmin(page)
    await gotoProTableVirtualRoute(page)

    const region = page.getByTestId('showcase-pro-table-demo-region')
    await expect(region).toBeVisible({ timeout: 15000 })
    await expect(region.getByRole('grid')).toBeVisible({ timeout: 15000 })

    const results = await new AxeBuilder({ page })
      .include('[data-testid="showcase-pro-table-demo-region"]')
      .analyze()

    expect(results.violations).toEqual([])
  })
})
