import { expect, test, type Page } from '@playwright/test'
import { gotoVisual, loginAsAdmin, waitForAppReady, waitForRuntimeLoadingIdle } from './helpers/app'

async function expectUsableCanvas(page: Page): Promise<void> {
  await expect(page.locator('canvas').first()).toBeVisible({ timeout: 15000 })
  await page.waitForFunction(() => {
    const canvases = Array.from(document.querySelectorAll('canvas'))
    return canvases.some(canvas => {
      const rect = canvas.getBoundingClientRect()
      return rect.width > 0 && rect.height > 0 && canvas.width > 0 && canvas.height > 0
    })
  })
  await expectVisibleCanvasHasPaint(page)
}

async function expectVisibleCanvasHasPaint(page: Page): Promise<void> {
  await page.waitForFunction(() => {
    const canvases = Array.from(document.querySelectorAll('canvas')).filter(canvas => {
      const rect = canvas.getBoundingClientRect()
      return rect.width > 0 && rect.height > 0 && canvas.offsetParent !== null
    })

    return canvases.some(canvas => {
      const context = canvas.getContext('2d')
      if (!context) return false
      const { width, height } = canvas
      if (width <= 0 || height <= 0) return false
      const image = context.getImageData(0, 0, width, height).data
      for (let index = 3; index < image.length; index += 4) {
        if (image[index] > 0) return true
      }
      return false
    })
  })
}

async function activateTab(page: Page, label: string): Promise<void> {
  await page.getByRole('tab', { name: label }).click()
  await expect(page.getByRole('tab', { name: label })).toHaveAttribute('aria-selected', 'true')
  await expectUsableCanvas(page)
}

async function firstVisibleCanvasSize(page: Page): Promise<{ cssWidth: number; width: number }> {
  return page.evaluate(() => {
    const canvas = Array.from(document.querySelectorAll('canvas')).find(item => {
      const rect = item.getBoundingClientRect()
      return rect.width > 0 && rect.height > 0 && item.offsetParent !== null
    })
    if (!canvas) return { cssWidth: 0, width: 0 }
    return {
      cssWidth: canvas.getBoundingClientRect().width,
      width: canvas.width,
    }
  })
}

test.describe('UseEcharts render smoke', () => {
  test('example charts route renders a real canvas with non-zero dimensions', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await loginAsAdmin(page)
    await gotoVisual(page, '/example/charts')
    await waitForAppReady(page)
    await waitForRuntimeLoadingIdle(page)
    await expect(page).toHaveURL(/#\/example\/charts$/)
    await expectUsableCanvas(page)
  })

  test('example charts route renders after each tab becomes visible', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await loginAsAdmin(page)
    await gotoVisual(page, '/example/charts')
    await waitForAppReady(page)
    await waitForRuntimeLoadingIdle(page)

    for (const label of ['基础', '动态', '高级', '多图表联动', '自定义配色', '事件与 Ref']) {
      await activateTab(page, label)
    }
  })

  test('example chart repaints after parent container resize', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await loginAsAdmin(page)
    await gotoVisual(page, '/example/charts')
    await waitForAppReady(page)
    await waitForRuntimeLoadingIdle(page)
    await expectUsableCanvas(page)

    const before = await firstVisibleCanvasSize(page)
    expect(before.width).toBeGreaterThan(0)

    await page.locator('.p-tabpanels').evaluate(element => {
      const panel = element as HTMLElement
      panel.style.width = '34vw'
      panel.style.flex = '0 0 34vw'
    })

    await page.waitForFunction(previousWidth => {
      const canvas = Array.from(document.querySelectorAll('canvas')).find(item => {
        const rect = item.getBoundingClientRect()
        return rect.width > 0 && rect.height > 0 && item.offsetParent !== null
      })
      if (!canvas) return false
      const cssWidth = canvas.getBoundingClientRect().width
      return cssWidth > 0 && Math.abs(cssWidth - previousWidth) > 20 && canvas.width > 0
    }, before.cssWidth)
    await expectVisibleCanvasHasPaint(page)
  })

  test('example chart repaints after display none toggle', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await loginAsAdmin(page)
    await gotoVisual(page, '/example/charts')
    await waitForAppReady(page)
    await waitForRuntimeLoadingIdle(page)
    await expectUsableCanvas(page)

    await page.locator('.p-tabpanels').evaluate(element => {
      ;(element as HTMLElement).style.display = 'none'
    })
    await expect(page.locator('canvas').first()).toBeHidden()

    await page.locator('.p-tabpanels').evaluate(element => {
      ;(element as HTMLElement).style.display = ''
    })

    await expectUsableCanvas(page)
  })

  test('example chart remains painted after tab container reuse and option update', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await loginAsAdmin(page)
    await gotoVisual(page, '/example/charts')
    await waitForAppReady(page)
    await waitForRuntimeLoadingIdle(page)
    await activateTab(page, '事件与 Ref')

    const before = await firstVisibleCanvasSize(page)
    expect(before.width).toBeGreaterThan(0)

    await page.locator('.p-tabpanels').evaluate(element => {
      const panel = element as HTMLElement
      panel.style.transform = 'translateY(120px)'
      panel.style.position = 'relative'
    })
    await page.getByRole('button', { name: 'setOption(新数据)' }).click()

    await page.waitForFunction(previousWidth => {
      const canvas = Array.from(document.querySelectorAll('canvas')).find(item => {
        const rect = item.getBoundingClientRect()
        return rect.width > 0 && rect.height > 0 && item.offsetParent !== null
      })
      return !!canvas && canvas.width === previousWidth
    }, before.width)
    await expectVisibleCanvasHasPaint(page)
  })
})
