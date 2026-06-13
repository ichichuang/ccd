import { expect, test } from '@playwright/test'
import { gotoVisual, loginAsAdmin, waitForAppReady, waitForRuntimeLoadingIdle } from './helpers/app'

test.describe('view route smoke coverage', () => {
  test('renders login, dashboard, and not-found views through the router', async ({ page }) => {
    await gotoVisual(page, '/login')
    await waitForAppReady(page)
    await waitForRuntimeLoadingIdle(page)
    await expect(page.locator('#username')).toBeVisible()
    await expect(page.locator('#password')).toBeVisible()

    await loginAsAdmin(page)
    await expect(page.locator('#dashboard-page')).toBeVisible()
    await expect(page.locator('#dashboard-page')).toContainText('架构控制中心')
    await expect(page.locator('#dashboard-page')).toContainText('运行时隔离')

    await gotoVisual(page, '/ui/pro-form')
    await waitForAppReady(page)
    await waitForRuntimeLoadingIdle(page)
    await expect(page.getByTestId('architecture-console-page')).toContainText('ProForm 能力')
    await expect(page.getByTestId('architecture-console-page')).toContainText('Schema 驱动 ProForm')

    await gotoVisual(page, '/ui/pro-table')
    await waitForAppReady(page)
    await waitForRuntimeLoadingIdle(page)
    await expect(page.getByTestId('architecture-console-page')).toContainText('ProTable 能力')
    await expect(page.getByTestId('architecture-console-page')).toContainText('类型化 ProTable')

    await gotoVisual(page, '/system/settings')
    await waitForAppReady(page)
    await waitForRuntimeLoadingIdle(page)
    await expect(page.getByTestId('global-settings-page')).toContainText('全局设置')
    await expect(page.getByTestId('global-settings-page')).toContainText('布局模块')

    await gotoVisual(page, '/missing-view')
    await waitForAppReady(page)
    await waitForRuntimeLoadingIdle(page)
    await expect(page).toHaveURL(/#\/404$/)
    await expect(page.locator('body')).toContainText('404')
  })
})
