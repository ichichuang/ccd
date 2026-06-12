import { expect, test } from '@playwright/test'
import { gotoVisual, waitForAppReady, waitForRuntimeLoadingIdle } from './helpers/app'
import { AUTH_STORAGE_STATE_PATH } from './helpers/authState'

test.describe('feedback console', () => {
  test.use({ storageState: AUTH_STORAGE_STATE_PATH })

  test.beforeEach(async ({ page }) => {
    await gotoVisual(page, '/ui/feedback')
    await waitForAppReady(page)
    await waitForRuntimeLoadingIdle(page)
  })

  test('renders merged icon, dialog, toast, and empty-state evidence', async ({ page }) => {
    await expect(page.getByTestId('architecture-console-page')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Feedback Primitives' })).toBeVisible()
    await expect(page.getByText('No stale example routes')).toBeVisible()
    await expect(page.locator('span.i-lucide-message-circle')).toBeVisible()
    await expect(page.locator('span.i-lucide-circle-dashed')).toBeVisible()
  })
})
