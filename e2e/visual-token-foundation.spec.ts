import { expect, test, type Page } from '@playwright/test'
import { gotoVisual, loginAsAdmin, waitForAppReady, waitForRuntimeLoadingIdle } from './helpers/app'

async function openRoute(page: Page, hashPath: string): Promise<void> {
  await loginAsAdmin(page)
  await gotoVisual(page, hashPath)
  await waitForAppReady(page)
  await waitForRuntimeLoadingIdle(page)
}

async function waitForStyleChange(
  page: Page,
  selector: string,
  property: string,
  previousValue: string
): Promise<string> {
  await page.waitForFunction(
    ({ cssSelector, cssProperty, before }) => {
      const element = document.querySelector(cssSelector)
      if (!element) return false
      return window.getComputedStyle(element).getPropertyValue(cssProperty) !== before
    },
    { cssSelector: selector, cssProperty: property, before: previousValue }
  )
  return page
    .locator(selector)
    .first()
    .evaluate((element, cssProperty) => {
      return window.getComputedStyle(element).getPropertyValue(cssProperty)
    }, property)
}

test.describe('visual token foundation', () => {
  test('LayoutAdmin active and hover states are visually distinct', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 960 })
    await openRoute(page, '/example/primevue-collection/overview')

    const sidebar = page.locator('[data-layout-sidebar="true"]')
    await expect(sidebar).toBeVisible()

    const activeItem = sidebar
      .locator('.admin-sidebar-menu__item')
      .filter({ hasText: 'PrimeVue' })
      .first()
    await expect(activeItem).toBeVisible()
    await expect(activeItem).toHaveClass(/bg-sidebar-primary!|bg-sidebar-accent\/18!/, {
      timeout: 5000,
    })

    const hoverItem = sidebar
      .locator('.admin-sidebar-menu__item')
      .filter({ hasText: 'Toast' })
      .first()
    await expect(hoverItem).toBeVisible()
    await expect(hoverItem).toHaveClass(/hover:bg-sidebar-accent\/18!/, { timeout: 5000 })
    await expect(hoverItem).toHaveClass(/hover:text-sidebar-primary!/, { timeout: 5000 })
  })

  test('PrimeVue form controls expose hover and focus feedback', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 960 })
    await openRoute(page, '/example/primevue-collection/overview')

    const inputText = page.getByPlaceholder('InputText').first()
    await expect(inputText).toBeVisible()
    const inputSelector = 'input[placeholder="InputText"]'
    const inputBorder = await inputText.evaluate(
      element => window.getComputedStyle(element).borderColor
    )
    await inputText.hover()
    const inputHoverBorder = await waitForStyleChange(
      page,
      inputSelector,
      'border-color',
      inputBorder
    )
    await inputText.focus()
    const inputFocusShadow = await inputText.evaluate(
      element => window.getComputedStyle(element).boxShadow
    )
    expect(inputHoverBorder).not.toBe(inputBorder)
    expect(inputFocusShadow).not.toBe('none')

    const numberRoot = page.locator('.p-inputnumber').first()
    const numberInput = page.getByPlaceholder('InputNumber')
    await expect(numberRoot).toBeVisible()
    await expect(numberInput).toBeVisible()

    const numberBorder = await numberRoot.evaluate(
      element => window.getComputedStyle(element).borderColor
    )
    await numberRoot.hover()
    const numberHoverBorder = await numberRoot.evaluate(
      element => window.getComputedStyle(element).borderColor
    )
    if (numberHoverBorder === numberBorder) {
      await expect(numberRoot).toHaveClass(/hover:(?:!border-primary|border-primary\/50)/)
    }

    await numberInput.focus()
    const numberFocusShadow = await numberRoot.evaluate(
      element => window.getComputedStyle(element).boxShadow
    )
    const numberInputOutline = await numberInput.evaluate(
      element => window.getComputedStyle(element).outlineStyle
    )
    expect(numberFocusShadow).not.toBe('none')
    expect(numberInputOutline).toBe('none')

    const passwordRoot = page.locator('.p-password').first()
    await expect(passwordRoot).toBeVisible()
    await page.getByPlaceholder('Password').focus()
    const passwordFocusShadow = await passwordRoot.evaluate(
      element => window.getComputedStyle(element).boxShadow
    )
    expect(passwordFocusShadow).not.toBe('none')

    const dateRoot = page.locator('.p-datepicker').first()
    const dateInput = page.getByPlaceholder('DatePicker')
    await expect(dateRoot).toBeVisible()
    await dateInput.focus()
    const dateFocusShadow = await dateRoot.evaluate(
      element => window.getComputedStyle(element).boxShadow
    )
    const dateInputBorder = await dateInput.evaluate(
      element => window.getComputedStyle(element).borderWidth
    )
    expect(dateFocusShadow).not.toBe('none')
    expect(dateInputBorder).toBe('0px')
  })

  test('Icons color controls use generated semantic classes', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 960 })
    await openRoute(page, '/example/components/icons')

    const previewIcon = page.locator('.icons-preview span[class*="i-lucide-"]').first()
    await expect(previewIcon).toBeVisible()
    const beforeColor = await previewIcon.evaluate(
      element => window.getComputedStyle(element).color
    )

    await page.getByRole('button', { name: 'danger' }).click()
    await expect(previewIcon).toHaveClass(/text-danger/)
    const afterColor = await previewIcon.evaluate(element => window.getComputedStyle(element).color)
    expect(afterColor).not.toBe(beforeColor)

    const codeText = await page
      .locator('pre')
      .filter({ hasText: 'text-danger' })
      .first()
      .textContent()
    expect(codeText).toContain('text-danger')
  })
})
