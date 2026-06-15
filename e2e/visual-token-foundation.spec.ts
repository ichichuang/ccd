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

interface PrimaryTintSnapshot {
  backgroundAlpha: number
  isPrimaryText: boolean
  isPrimaryTint: boolean
}

async function primaryTintSnapshot(
  locator: ReturnType<Page['locator']>
): Promise<PrimaryTintSnapshot> {
  return locator.first().evaluate(element => {
    const readChannels = (value: string): string => {
      const channels = value.match(/\d+(?:\.\d+)?/g)?.slice(0, 3) ?? []
      return channels.map(channel => String(Math.round(Number(channel)))).join(' ')
    }

    const readAlpha = (value: string): number => {
      const channels = value.match(/\d+(?:\.\d+)?/g) ?? []
      return channels[3] === undefined ? 1 : Number(channels[3])
    }

    const style = window.getComputedStyle(element)
    const rootStyle = window.getComputedStyle(document.documentElement)
    const primaryChannels = readChannels(rootStyle.getPropertyValue('--primary'))
    const backgroundChannels = readChannels(style.backgroundColor)
    const textChannels = readChannels(style.color)
    const backgroundAlpha = readAlpha(style.backgroundColor)

    return {
      backgroundAlpha,
      isPrimaryText: textChannels === primaryChannels,
      isPrimaryTint:
        backgroundChannels === primaryChannels && backgroundAlpha > 0 && backgroundAlpha < 1,
    }
  })
}

interface FormControlSnapshot {
  borderColor: string
  boxShadow: string
  iconColor: string | null
}

async function formControlSnapshot(
  locator: ReturnType<Page['locator']>,
  iconSelector?: string
): Promise<FormControlSnapshot> {
  return locator.first().evaluate((element, selector) => {
    const style = window.getComputedStyle(element)
    const icon = selector
      ? document.querySelector(selector)
      : element.querySelector(
          '.p-inputicon,.p-password-toggle-mask-icon,.p-select-dropdown,.p-multiselect-dropdown,.p-autocomplete-dropdown,.p-datepicker-dropdown,.p-inputnumber-button'
        )
    const iconStyle = icon ? window.getComputedStyle(icon) : null
    return {
      borderColor: style.borderColor,
      boxShadow: style.boxShadow,
      iconColor: iconStyle?.color ?? null,
    }
  }, iconSelector)
}

function expectUnifiedFocusSnapshot(
  actual: FormControlSnapshot,
  expected: FormControlSnapshot
): void {
  expect(actual.borderColor).toBe(expected.borderColor)
  expect(actual.boxShadow).toBe(expected.boxShadow)
}

function expectDistinctStyle(actual: string, baseline: string): void {
  expect(actual.trim()).not.toBe('')
  expect(actual).not.toBe(baseline)
}

function expectQuietNavigationBorder(weight: number): void {
  expect(weight).toBeLessThanOrEqual(2)
}

test.describe('visual token foundation', () => {
  test('LayoutAdmin active and hover states are visually distinct @visual', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 960 })
    await openRouteWithMixLayout(page, '/ui/primevue-adapter')

    const sidebar = page.locator('[data-layout-sidebar="true"]')
    await expect(sidebar).toBeVisible()

    const sidebarIdleItem = sidebar
      .locator('.admin-sidebar-menu__item[data-menu-state="idle"]')
      .first()
    await expect(sidebarIdleItem).toBeVisible()
    const idleSignature = await visualSignature(sidebarIdleItem)

    const sidebarOpenParent = sidebar
      .locator('.admin-sidebar-menu__item[data-menu-state="ancestor"]')
      .filter({ hasText: /UI|界面|用户界面/ })
      .first()
    await expect(sidebarOpenParent).toBeVisible()
    const parentSignature = await visualSignature(sidebarOpenParent)
    expectDistinctStyle(parentSignature, idleSignature)
    expectQuietNavigationBorder(await borderWeight(sidebarOpenParent))

    const sidebarActiveChild = sidebar
      .locator('.admin-sidebar-menu__item[data-menu-state="active"]')
      .filter({ hasText: /PrimeVue Adapter|PrimeVue 适配器/ })
      .first()
    await expect(sidebarActiveChild).toBeVisible()
    const childSignature = await visualSignature(sidebarActiveChild)
    expectDistinctStyle(childSignature, parentSignature)
    expectQuietNavigationBorder(await borderWeight(sidebarActiveChild))

    const hoverItem = sidebar.locator('.admin-sidebar-menu__item[data-menu-state="idle"]').nth(1)
    await expect(hoverItem).toBeVisible()
    const hoverItemContent = hoverItem.locator('.admin-sidebar-menu__item-content').first()
    await expect(hoverItemContent).toBeVisible()
    const hoverSignatureBefore = await visualSignature(hoverItemContent)
    await hoverItemContent.hover()
    await page.waitForTimeout(250)
    const hoverSignatureAfter = await visualSignature(hoverItemContent)
    expectDistinctStyle(hoverSignatureAfter, hoverSignatureBefore)

    const topbarParent = page
      .locator('[data-layout-header="true"] [data-menu-state="ancestor"]')
      .first()
    if ((await topbarParent.count()) > 0) {
      await topbarParent.click()
      const popupIdleItem = page.locator('.admin-menu-popup__item[data-menu-state="idle"]').first()
      const popupActiveItem = page
        .locator(
          '.admin-menu-popup__item[data-menu-state="active"], .admin-menu-popup__item[data-menu-state="ancestor"]'
        )
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
    const activeTabPrimaryTint = await primaryTintSnapshot(activeTab)
    expect(activeTabPrimaryTint.isPrimaryText).toBe(true)
    expect(activeTabPrimaryTint.isPrimaryTint).toBe(true)
    expect(activeTabPrimaryTint.backgroundAlpha).toBeGreaterThanOrEqual(0.12)

    const breadcrumbCurrent = page
      .locator('main [data-menu-state="active"]')
      .filter({ hasText: /PrimeVue Adapter|PrimeVue 适配器/ })
      .first()
    await expect(breadcrumbCurrent).toBeVisible()
    expectDistinctStyle(await visualSignature(breadcrumbCurrent), idleSignature)
    expectQuietNavigationBorder(await borderWeight(breadcrumbCurrent))
  })

  test('PrimeVue form controls expose hover and focus feedback @visual', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 960 })
    await openRoute(page, '/ui/primevue-adapter')

    const controls = [
      {
        locator: page.getByTestId('prime-input-text').first(),
        focus: async (): Promise<void> => {
          await page.getByTestId('prime-input-text').first().focus()
        },
      },
      {
        locator: page.locator('.p-inputnumber').first(),
        focus: async (): Promise<void> => {
          await page.locator('#primevue-input-number').focus()
        },
      },
      {
        locator: page.locator('.p-password').first(),
        focus: async (): Promise<void> => {
          await page.locator('.p-password input').first().focus()
        },
      },
      {
        locator: page.locator('.p-select').first(),
        focus: async (): Promise<void> => {
          await page.locator('.p-select').first().click()
        },
      },
      {
        locator: page.locator('.p-autocomplete').first(),
        focus: async (): Promise<void> => {
          await page.locator('.p-autocomplete input').first().fill('架')
        },
      },
      {
        locator: page.locator('.p-datepicker').first(),
        focus: async (): Promise<void> => {
          await page.locator('.p-datepicker input').first().click()
        },
      },
    ]

    const [inputControl, ...compoundControls] = controls
    await expect(inputControl.locator).toBeVisible()
    const inputIdle = await formControlSnapshot(inputControl.locator)
    await inputControl.locator.hover()
    const inputHoverBorder = await waitForStyleChange(
      page,
      '[data-testid="prime-input-text"]',
      'border-color',
      inputIdle.borderColor
    )
    await inputControl.focus()
    const inputFocus = await formControlSnapshot(inputControl.locator)
    expect(inputHoverBorder).not.toBe(inputIdle.borderColor)
    expect(inputFocus.boxShadow).not.toBe('none')
    await page.keyboard.press('Escape')

    for (const control of compoundControls) {
      await expect(control.locator).toBeVisible()
      const idle = await formControlSnapshot(control.locator)
      expect(idle.borderColor).toBe(inputIdle.borderColor)
      await control.locator.hover()
      await page.waitForTimeout(300)
      const hover = await formControlSnapshot(control.locator)
      expect(hover.borderColor).toBe(inputHoverBorder)
      expect(hover.boxShadow).toBe('none')
      await control.focus()
      await page.waitForTimeout(300)
      const focus = await formControlSnapshot(control.locator)
      expectUnifiedFocusSnapshot(focus, inputFocus)
      await page.keyboard.press('Escape')
    }

    const numberInputOutline = await page
      .locator('#primevue-input-number')
      .evaluate(element => window.getComputedStyle(element).outlineStyle)
    expect(numberInputOutline).toBe('none')

    const dateInputBorder = await page
      .locator('.p-datepicker input')
      .first()
      .evaluate(element => window.getComputedStyle(element).borderWidth)
    expect(dateInputBorder).toBe('0px')
  })

  test('feedback icons use generated semantic classes @visual', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 960 })
    await openRoute(page, '/ui/feedback')

    const previewIcon = page.locator('span.i-lucide-message-circle.text-primary').first()
    await expect(previewIcon).toBeVisible()
    const iconColor = await previewIcon.evaluate(element => window.getComputedStyle(element).color)

    expect(iconColor).toMatch(/rgb\(/)
    await expect(previewIcon).toHaveClass(/text-primary/)
  })
})
