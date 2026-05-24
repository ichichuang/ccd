import { expect, test, type Page } from '@playwright/test'
import { gotoVisual, loginAsAdmin, waitForAppReady, waitForRuntimeLoadingIdle } from './helpers/app'

async function openRoute(page: Page, hashPath: string): Promise<void> {
  await loginAsAdmin(page)
  await gotoVisual(page, hashPath)
  await waitForAppReady(page)
  await waitForRuntimeLoadingIdle(page)
}

async function openRouteWithMixLayout(page: Page, hashPath: string): Promise<void> {
  await loginAsAdmin(page)
  await gotoVisual(page, hashPath)
  await waitForAppReady(page)
  await waitForRuntimeLoadingIdle(page)
  await page.evaluate(() => {
    const app = document.querySelector('#app') as HTMLElement & { __vue_app__?: unknown }
    const vueApp = app?.__vue_app__ as {
      config?: { globalProperties?: Record<string, unknown> }
    }
    const pinia = vueApp?.config?.globalProperties?.$pinia as
      | { _s?: Map<string, { setPreferredMode?: (mode: 'mix') => void }> }
      | undefined
    pinia?._s?.get('layout')?.setPreferredMode?.('mix')
  })
  await waitForRuntimeLoadingIdle(page)
  await page.waitForFunction(
    () =>
      document.querySelector(
        '[data-layout-sidebar="true"] .admin-sidebar-menu__item[data-menu-state="active"]'
      ) != null
  )
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
async function visualSignature(locator: ReturnType<Page['locator']>): Promise<string> {
  return locator.first().evaluate(element => {
    const style = window.getComputedStyle(element)
    return [style.backgroundColor, style.color, style.boxShadow].join('|')
  })
}

async function borderWeight(locator: ReturnType<Page['locator']>): Promise<number> {
  return locator.first().evaluate(element => {
    const style = window.getComputedStyle(element)
    return [
      style.borderTopWidth,
      style.borderRightWidth,
      style.borderBottomWidth,
      style.borderLeftWidth,
    ].reduce((total, value) => total + Number.parseFloat(value || '0'), 0)
  })
}

function expectDistinctStyle(actual: string, baseline: string): void {
  expect(actual.trim()).not.toBe('')
  expect(actual).not.toBe(baseline)
}

function expectQuietNavigationBorder(weight: number): void {
  expect(weight).toBeLessThanOrEqual(2)
}

test.describe('visual token foundation', () => {
  test('LayoutAdmin active and hover states are visually distinct', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 960 })
    await openRouteWithMixLayout(page, '/example/primevue-collection/overview')

    const sidebar = page.locator('[data-layout-sidebar="true"]')
    await expect(sidebar).toBeVisible()

    const sidebarIdleItem = sidebar
      .locator('.admin-sidebar-menu__item[data-menu-state="idle"]')
      .first()
    await expect(sidebarIdleItem).toBeVisible()
    const idleSignature = await visualSignature(sidebarIdleItem)

    const sidebarOpenParent = sidebar
      .locator('.admin-sidebar-menu__item[data-menu-state="ancestor"]')
      .filter({ hasText: /PrimeVue|组件合集/ })
      .first()
    await expect(sidebarOpenParent).toBeVisible()
    const parentSignature = await visualSignature(sidebarOpenParent)
    expectDistinctStyle(parentSignature, idleSignature)
    expectQuietNavigationBorder(await borderWeight(sidebarOpenParent))

    const sidebarActiveChild = sidebar
      .locator('.admin-sidebar-menu__item[data-menu-state="active"]')
      .filter({ hasText: 'PrimeVue 概览' })
      .first()
    await expect(sidebarActiveChild).toBeVisible()
    const childSignature = await visualSignature(sidebarActiveChild)
    expectDistinctStyle(childSignature, parentSignature)
    expectQuietNavigationBorder(await borderWeight(sidebarActiveChild))

    const hoverItem = sidebar.locator('.admin-sidebar-menu__item[data-menu-state="idle"]').nth(1)
    await expect(hoverItem).toBeVisible()
    const hoverSignatureBefore = await visualSignature(hoverItem)
    await hoverItem.hover()
    await page.waitForTimeout(250)
    const hoverSignatureAfter = await visualSignature(hoverItem)
    expectDistinctStyle(hoverSignatureAfter, hoverSignatureBefore)

    const topbarParent = page
      .locator('[data-layout-header="true"] [data-menu-state="ancestor"]')
      .first()
    if ((await topbarParent.count()) > 0) {
      await topbarParent.click()
      const popupIdleItem = page.locator('.admin-menu-popup__item[data-menu-state="idle"]').first()
      const popupActiveItem = page
        .locator('.admin-menu-popup__item[data-menu-state="ancestor"]')
        .first()
      await expect(popupIdleItem).toBeVisible()
      await expect(popupActiveItem).toBeVisible()
      expectDistinctStyle(
        await visualSignature(popupActiveItem),
        await visualSignature(popupIdleItem)
      )
    }

    const activeTab = page
      .locator('[data-admin-tabs-bar="true"] [data-menu-state="active"]')
      .first()
    const idleTab = page.locator('[data-admin-tabs-bar="true"] [data-menu-state="idle"]').first()
    await expect(activeTab).toBeVisible()
    await expect(idleTab).toBeVisible()
    expectDistinctStyle(await visualSignature(activeTab), await visualSignature(idleTab))
    expectQuietNavigationBorder(await borderWeight(activeTab))

    const breadcrumbCurrent = page
      .locator('main [data-menu-state="active"]')
      .filter({ hasText: 'PrimeVue 概览' })
      .first()
    await expect(breadcrumbCurrent).toBeVisible()
    expectDistinctStyle(await visualSignature(breadcrumbCurrent), idleSignature)
    expectQuietNavigationBorder(await borderWeight(breadcrumbCurrent))
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
