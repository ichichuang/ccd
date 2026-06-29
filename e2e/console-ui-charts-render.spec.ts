import { expect, test, type Page, type TestInfo } from '@playwright/test'
import { gotoVisual, loginAsAdmin, waitForAppReady, waitForRuntimeLoadingIdle } from './helpers/app'

/**
 * Regression: CHART-01 — the ConsolePage `/ui/charts` view must render a real chart.
 *
 * `/ui/charts` resolves to `views/architecture-console/ConsolePage.vue` (page model id
 * `UiCharts`) and embeds the chart via the `UseEcharts` adapter. The bug: the sizing was
 * passed as `class` directly on `<UseEcharts>`, but the adapter has `inheritAttrs:false`
 * and forwards `$attrs` via `v-on="$attrs"`, which misroutes the `class` string as an
 * `onClass` event handler (Vue warns "Wrong type passed as event handler to onClass") and
 * drops the height. With no height the package gates the chart mount on container size, so
 * zero `<canvas>` / ECharts instance / SVG ever renders — a blank chart region — while the
 * standalone showcase charts (which size a parent element and pass no class) render fine.
 *
 * This spec asserts the DESIRED behavior: `/ui/charts` renders a real chart canvas with
 * non-zero dimensions, the chart host has a non-zero box, and the `onClass` Vue warning is
 * absent. It fails until the source fix lands and guards against regression afterwards.
 */

const CONSOLE_PAGE_SELECTOR = '[data-testid="architecture-console-page"]'
const CHART_HOST_SELECTOR = '[data-testid="console-chart-region"]'
const CHART_CANVAS_SELECTOR = `${CONSOLE_PAGE_SELECTOR} .echarts canvas`

interface ChartDiagnostics {
  url: string
  title: string
  consolePagePresent: boolean
  canvasCount: number
  svgCount: number
  echartsHostCount: number
  hostBox: { width: number; height: number } | null
  chartAreaHtmlSample: string
}

/** A Vue runtime warning produced by misrouting `class` through `v-on="$attrs"`. */
function isOnClassWarning(text: string): boolean {
  return /onClass/.test(text) || /Wrong type passed as event handler/.test(text)
}

async function collectChartDiagnostics(page: Page): Promise<ChartDiagnostics> {
  return page.evaluate(
    ({ consoleSel, hostSel }) => {
      const root = document.querySelector(consoleSel)
      const host = document.querySelector(hostSel)
      const hostRect = host?.getBoundingClientRect()
      // Prefer the explicit chart host; otherwise sample the first ECharts host on the page.
      const chartArea = host ?? root?.querySelector('.echarts')?.parentElement ?? root
      return {
        url: window.location.href,
        title: document.title,
        consolePagePresent: !!root,
        canvasCount: root ? root.querySelectorAll('canvas').length : 0,
        svgCount: root ? root.querySelectorAll('svg').length : 0,
        echartsHostCount: root ? root.querySelectorAll('.echarts').length : 0,
        hostBox: hostRect
          ? { width: Math.round(hostRect.width), height: Math.round(hostRect.height) }
          : null,
        chartAreaHtmlSample: (chartArea?.innerHTML ?? '').replace(/\s+/g, ' ').trim().slice(0, 400),
      }
    },
    { consoleSel: CONSOLE_PAGE_SELECTOR, hostSel: CHART_HOST_SELECTOR }
  )
}

async function attachDiagnostics(
  testInfo: TestInfo,
  payload: Record<string, unknown>
): Promise<string> {
  const body = JSON.stringify(payload, null, 2)
  await testInfo.attach('console-ui-charts-render-diagnostics', {
    body,
    contentType: 'application/json',
  })
  return body
}

test.describe('ConsolePage /ui/charts render regression (CHART-01)', () => {
  test('renders a real ECharts canvas with non-zero dimensions and no onClass warning', async ({
    page,
  }, testInfo) => {
    const consoleWarnings: string[] = []
    const onClassWarnings: string[] = []
    page.on('console', message => {
      if (message.type() !== 'warning' && message.type() !== 'error') return
      const text = message.text()
      consoleWarnings.push(text)
      if (isOnClassWarning(text)) onClassWarnings.push(text)
    })

    await page.setViewportSize({ width: 1280, height: 720 })
    await loginAsAdmin(page)
    await gotoVisual(page, '/ui/charts')
    await waitForAppReady(page)
    await waitForRuntimeLoadingIdle(page)

    // The ConsolePage shell itself must render (isolates "blank chart" from "blank page").
    await expect(page.locator(CONSOLE_PAGE_SELECTOR)).toBeVisible()
    await expect(page).toHaveURL(/#\/ui\/charts$/)

    // Bounded wait for the chart to mount. On the broken build this never appears; we still
    // capture diagnostics + assert below so the failure carries full evidence.
    await page
      .locator(CHART_CANVAS_SELECTOR)
      .first()
      .waitFor({ state: 'visible', timeout: 12000 })
      .catch(() => undefined)

    const diagnostics = await collectChartDiagnostics(page)
    const evidence = await attachDiagnostics(testInfo, {
      ...diagnostics,
      onClassWarnings,
      consoleWarningSample: consoleWarnings.slice(0, 12),
    })

    // No `class`-as-event misrouting warning may be emitted.
    expect(onClassWarnings, `unexpected onClass/event-handler Vue warning.\n${evidence}`).toEqual(
      []
    )

    // A real chart canvas must be present with non-zero CSS + backing-store dimensions.
    const canvas = page.locator(CHART_CANVAS_SELECTOR).first()
    await expect(
      canvas,
      `expected a rendered ECharts canvas on /ui/charts.\n${evidence}`
    ).toBeVisible()
    const geometry = await canvas.evaluate(element => {
      const rect = element.getBoundingClientRect()
      const el = element as HTMLCanvasElement
      return {
        cssWidth: Math.round(rect.width),
        cssHeight: Math.round(rect.height),
        width: el.width,
        height: el.height,
      }
    })
    expect(geometry.cssWidth, `chart canvas CSS width must be > 0.\n${evidence}`).toBeGreaterThan(0)
    expect(geometry.cssHeight, `chart canvas CSS height must be > 0.\n${evidence}`).toBeGreaterThan(
      0
    )
    expect(geometry.width).toBeGreaterThan(0)
    expect(geometry.height).toBeGreaterThan(0)

    // The chart host element must have a non-zero box (the zero-height container was the bug).
    await expect(page.locator(CHART_HOST_SELECTOR)).toBeVisible()
    expect(
      diagnostics.hostBox?.height ?? 0,
      `chart host height must be > 0.\n${evidence}`
    ).toBeGreaterThan(0)
  })
})
