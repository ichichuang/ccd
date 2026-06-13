import { expect, test } from '@playwright/test'
import { gotoVisual, loginAsAdmin, waitForAppReady, waitForRuntimeLoadingIdle } from './helpers/app'

async function openChartsConsole(page: import('@playwright/test').Page): Promise<void> {
  await page.setViewportSize({ width: 1280, height: 720 })
  await loginAsAdmin(page)
  await gotoVisual(page, '/ui/charts')
  await waitForAppReady(page)
  await waitForRuntimeLoadingIdle(page)
  await expect(page).toHaveURL(/#\/ui\/charts$/)
}

async function expectUsableCanvas(page: import('@playwright/test').Page): Promise<void> {
  const canvas = page.locator('.echarts canvas').first()
  await expect(canvas).toBeVisible({ timeout: 15000 })

  const geometry = await canvas.evaluate(element => {
    const rect = element.getBoundingClientRect()
    const canvas = element as HTMLCanvasElement
    return {
      cssWidth: Math.round(rect.width),
      cssHeight: Math.round(rect.height),
      width: canvas.width,
      height: canvas.height,
    }
  })

  expect(geometry.cssWidth).toBeGreaterThan(0)
  expect(geometry.cssHeight).toBeGreaterThan(0)
  expect(geometry.width).toBeGreaterThan(0)
  expect(geometry.height).toBeGreaterThan(0)
}

test.describe('UseEcharts architecture-console smoke', () => {
  test('charts route renders a real canvas with non-zero dimensions', async ({ page }) => {
    await openChartsConsole(page)
    await expectUsableCanvas(page)
  })

  test('chart repaints after parent container resize', async ({ page }) => {
    await openChartsConsole(page)
    await expectUsableCanvas(page)

    const before = await page.locator('.echarts').first().boundingBox()
    expect(before?.width ?? 0).toBeGreaterThan(0)

    await page.locator('[data-testid="architecture-console-page"]').evaluate(element => {
      ;(element as HTMLElement).style.maxWidth = '760px'
    })

    await page.waitForFunction(previousWidth => {
      const chart = document.querySelector('.echarts')
      const canvas = chart?.querySelector('canvas')
      const rect = chart?.getBoundingClientRect()
      return !!canvas && !!rect && Math.abs(rect.width - previousWidth) > 20 && canvas.width > 0
    }, before?.width ?? 0)
    await expectUsableCanvas(page)
  })
})
