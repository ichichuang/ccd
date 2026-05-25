import { expect, test, type Page } from '@playwright/test'
import { gotoVisual, loginAsAdmin, waitForAppReady, waitForRuntimeLoadingIdle } from './helpers/app'

async function expectUsableCanvas(page: Page): Promise<void> {
  await page.waitForFunction(() => {
    const nodes = Array.from(document.querySelectorAll('canvas, svg'))
    return nodes.some(node => {
      const rect = node.getBoundingClientRect()
      return rect.width > 0 && rect.height > 0 && (node as HTMLElement).offsetParent !== null
    })
  })
  await page.waitForFunction(() => {
    const nodes = Array.from(document.querySelectorAll('canvas, svg'))
    return nodes.some(node => {
      const rect = node.getBoundingClientRect()
      if (rect.width <= 0 || rect.height <= 0 || (node as HTMLElement).offsetParent === null)
        return false
      if (node instanceof HTMLCanvasElement) {
        return node.width > 0 && node.height > 0
      }
      return node instanceof SVGElement
    })
  })
  await expectVisibleCanvasHasPaint(page)
}

async function expectVisibleCanvasHasPaint(page: Page): Promise<void> {
  await page.waitForFunction(() => {
    const nodes = Array.from(document.querySelectorAll('canvas, svg')).filter(node => {
      const rect = node.getBoundingClientRect()
      return rect.width > 0 && rect.height > 0 && (node as HTMLElement).offsetParent !== null
    })

    return nodes.some(node => {
      if (node instanceof HTMLCanvasElement) {
        const context = node.getContext('2d')
        if (!context) return false
        const { width, height } = node
        if (width <= 0 || height <= 0) return false
        const image = context.getImageData(0, 0, width, height).data
        for (let index = 3; index < image.length; index += 4) {
          if (image[index] > 0) return true
        }
        return false
      }

      if (!(node instanceof SVGElement)) return false
      const marks = node.querySelectorAll('path,rect,circle,polyline,polygon,line')
      return marks.length > 0
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

async function activateConnectTab(page: Page): Promise<void> {
  await activateTab(page, '多图表联动')
  await expect(page.getByTestId('connect-cartesian-group')).toBeVisible()
}

async function chartCenter(page: Page, selector: string): Promise<{ x: number; y: number }> {
  const locator = page.locator(selector)
  await locator.scrollIntoViewIfNeeded()
  const box = await locator.boundingBox()
  if (!box) {
    throw new Error(`chart box not found: ${selector}`)
  }
  return { x: box.x + box.width * 0.6, y: box.y + box.height * 0.4 }
}

async function installEventCollector(page: Page, selectors: string[]): Promise<void> {
  await page.evaluate(inputSelectors => {
    type Entry = {
      chart: number
      event: string
      dataIndex: number | null
      seriesIndex: number | null
      timestamp: number
    }

    const charts = inputSelectors
      .map(selector => {
        const root = document.querySelector(selector)
        const echartsHost = root?.querySelector('.echarts') as HTMLElement | null
        const chartRef = echartsHost?.__vueParentComponent?.exposed?.chart
        return chartRef?.value ?? null
      })
      .filter(Boolean)

    const eventLog: Entry[] = []
    ;(window as Window & { ccdConnectEventLog?: Entry[] }).ccdConnectEventLog = eventLog

    charts.forEach((chart, chartIndex) => {
      ;[
        'updateAxisPointer',
        'updateaxispointer',
        'showTip',
        'showtip',
        'highlight',
        'globalout',
      ].forEach(eventName => {
        chart.on(
          eventName,
          (params: {
            dataIndex?: number
            axesInfo?: Array<{ dataIndex?: number }>
            seriesIndex?: number
          }) => {
            eventLog.push({
              chart: chartIndex,
              event: eventName,
              dataIndex: params?.dataIndex ?? params?.axesInfo?.[0]?.dataIndex ?? null,
              seriesIndex: params?.seriesIndex ?? null,
              timestamp: Date.now(),
            })
          }
        )
      })
    })
  }, selectors)
}

async function readEventCollector(
  page: Page
): Promise<
  Array<{ chart: number; event: string; dataIndex: number | null; seriesIndex: number | null }>
> {
  return page.evaluate(() => {
    return (
      (
        window as Window & {
          ccdConnectEventLog?: Array<{
            chart: number
            event: string
            dataIndex: number | null
            seriesIndex: number | null
          }>
        }
      ).ccdConnectEventLog ?? []
    )
  })
}

async function readGroupSnapshot(
  page: Page
): Promise<Array<{ selector: string; group: string | null }>> {
  return page.evaluate(() => {
    const selectors = [
      '[data-testid="connect-cartesian-chart-0"] .echarts',
      '[data-testid="connect-cartesian-chart-1"] .echarts',
      '[data-testid="connect-cartesian-chart-2"] .echarts',
      '[data-testid="connect-mixed-chart-line"] .echarts',
      '[data-testid="connect-mixed-chart-bar"] .echarts',
      '[data-testid="connect-mixed-chart-pie"] .echarts',
    ]

    return selectors.map(selector => {
      const host = document.querySelector(selector) as HTMLElement | null
      const chartRef = host?.__vueParentComponent?.exposed?.chart
      const chart = chartRef?.value ?? null
      return { selector, group: chart?.group ?? null }
    })
  })
}

async function mixedCartesianPoint(
  page: Page,
  chartSelector: string,
  dataIndex: number
): Promise<{ x: number; y: number }> {
  await page.locator(chartSelector).scrollIntoViewIfNeeded()
  return page.evaluate(
    ({ selector, idx }) => {
      const host = document.querySelector(selector)
      const rect = host?.getBoundingClientRect()
      if (!rect) return { x: 0, y: 0 }
      return {
        x: Math.round(rect.left + rect.width * (0.14 + idx * 0.11)),
        y: Math.round(rect.top + rect.height * 0.4),
      }
    },
    { selector: `${chartSelector} .echarts`, idx: dataIndex }
  )
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
      const charts = Array.from(document.querySelectorAll('.echarts'))
      return charts.some(chart => {
        const chartRect = chart.getBoundingClientRect()
        const canvas = chart.querySelector('canvas')
        if (
          !canvas ||
          chartRect.width <= 0 ||
          chartRect.height <= 0 ||
          canvas.offsetParent === null
        ) {
          return false
        }
        return Math.abs(chartRect.width - previousWidth) > 20 && canvas.width > 0
      })
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

  test('connect linkage works in canvas and survives renderer/tab switches', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await loginAsAdmin(page)
    await gotoVisual(page, '/example/charts')
    await waitForAppReady(page)
    await waitForRuntimeLoadingIdle(page)
    await activateConnectTab(page)

    const cartesianSelectors = [
      '[data-testid="connect-cartesian-chart-0"]',
      '[data-testid="connect-cartesian-chart-1"]',
      '[data-testid="connect-cartesian-chart-2"]',
    ]
    const mixedSelectors = [
      '[data-testid="connect-mixed-chart-line"]',
      '[data-testid="connect-mixed-chart-bar"]',
      '[data-testid="connect-mixed-chart-pie"]',
    ]

    const groupsBefore = await readGroupSnapshot(page)
    const cartesianGroups = groupsBefore
      .filter(entry => entry.selector.includes('connect-cartesian'))
      .map(entry => entry.group)
    const mixedGroups = groupsBefore
      .filter(entry => entry.selector.includes('connect-mixed'))
      .map(entry => entry.group)
    expect(new Set(cartesianGroups).size).toBe(1)
    expect(new Set(mixedGroups).size).toBe(1)
    expect(cartesianGroups[0]).not.toBe(mixedGroups[0])

    await installEventCollector(page, [...cartesianSelectors, ...mixedSelectors])
    const p0 = await chartCenter(page, `${cartesianSelectors[0]} .echarts`)
    await page.mouse.move(p0.x, p0.y)
    await page.mouse.move(p0.x + 20, p0.y - 15)

    await expect
      .poll(async () => {
        const events = await readEventCollector(page)
        const hasTargetUpdate = events.some(
          entry => entry.chart === 1 && entry.event === 'updateAxisPointer'
        )
        const hasTargetTip = events.some(entry => entry.chart === 1 && entry.event === 'showTip')
        const noMixedReaction = !events.some(entry => entry.chart >= 3)
        return hasTargetUpdate && hasTargetTip && noMixedReaction
      })
      .toBe(true)

    await page.getByRole('button', { name: 'SVG', exact: true }).click()
    await page.waitForFunction(() => {
      const group = document.querySelector('[data-testid="connect-cartesian-group"]')
      if (!group) return false
      return group.querySelectorAll('.echarts svg').length >= 3
    })

    await installEventCollector(page, [...cartesianSelectors, ...mixedSelectors])
    const pSvg = await chartCenter(page, `${cartesianSelectors[0]} .echarts`)
    await page.mouse.move(pSvg.x, pSvg.y)
    await page.mouse.move(pSvg.x + 20, pSvg.y - 15)

    await expect
      .poll(async () => {
        const events = await readEventCollector(page)
        const hasTargetUpdate = events.some(
          entry => entry.chart === 1 && entry.event === 'updateAxisPointer'
        )
        const hasTargetTip = events.some(entry => entry.chart === 1 && entry.event === 'showTip')
        const noMixedReaction = !events.some(entry => entry.chart >= 3)
        return hasTargetUpdate && hasTargetTip && noMixedReaction
      })
      .toBe(true)

    await activateTab(page, '基础')
    await activateConnectTab(page)
    await installEventCollector(page, [...cartesianSelectors, ...mixedSelectors])
    const pBack = await chartCenter(page, `${cartesianSelectors[0]} .echarts`)
    await page.mouse.move(pBack.x, pBack.y)
    await page.mouse.move(pBack.x + 20, pBack.y - 15)

    await expect
      .poll(async () => {
        const events = await readEventCollector(page)
        const hasTargetUpdate = events.some(
          entry => entry.chart === 1 && entry.event === 'updateAxisPointer'
        )
        const hasTargetTip = events.some(entry => entry.chart === 1 && entry.event === 'showTip')
        const noMixedReaction = !events.some(entry => entry.chart >= 3)
        return hasTargetUpdate && hasTargetTip && noMixedReaction
      })
      .toBe(true)

    const groupsAfter = await readGroupSnapshot(page)
    const cartesianGroupsAfter = groupsAfter
      .filter(entry => entry.selector.includes('connect-cartesian'))
      .map(entry => entry.group)
    const mixedGroupsAfter = groupsAfter
      .filter(entry => entry.selector.includes('connect-mixed'))
      .map(entry => entry.group)
    expect(new Set(cartesianGroupsAfter).size).toBe(1)
    expect(new Set(mixedGroupsAfter).size).toBe(1)
    expect(cartesianGroupsAfter[0]).not.toBe(mixedGroupsAfter[0])
  })

  test('mixed group keeps bidirectional line/bar/pie linkage and stays isolated', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1720, height: 980 })
    await loginAsAdmin(page)
    await gotoVisual(page, '/example/charts')
    await waitForAppReady(page)
    await waitForRuntimeLoadingIdle(page)
    await activateConnectTab(page)

    const mixedSelectors = [
      '[data-testid="connect-mixed-chart-line"]',
      '[data-testid="connect-mixed-chart-bar"]',
      '[data-testid="connect-mixed-chart-pie"]',
    ]
    const cartesianSelectors = [
      '[data-testid="connect-cartesian-chart-0"]',
      '[data-testid="connect-cartesian-chart-1"]',
      '[data-testid="connect-cartesian-chart-2"]',
    ]

    await installEventCollector(page, [...mixedSelectors, ...cartesianSelectors])

    const linePoint3 = await mixedCartesianPoint(page, mixedSelectors[0], 2)
    await page.mouse.move(linePoint3.x, linePoint3.y)

    await expect
      .poll(async () => {
        const events = await readEventCollector(page)
        const pieHighlighted = events.some(
          entry =>
            entry.chart === 2 &&
            entry.event.toLowerCase() === 'highlight' &&
            entry.seriesIndex === 0 &&
            entry.dataIndex === 1
        )
        const pieTipShown = events.some(
          entry =>
            entry.chart === 2 &&
            entry.event.toLowerCase() === 'showtip' &&
            entry.seriesIndex === 0 &&
            entry.dataIndex === 1
        )
        const noUpperReaction = !events.some(entry => entry.chart >= 3)
        return pieHighlighted && pieTipShown && noUpperReaction
      })
      .toBe(true)

    const barPoint5 = await mixedCartesianPoint(page, mixedSelectors[1], 4)
    await page.mouse.move(barPoint5.x, barPoint5.y)

    await expect
      .poll(async () => {
        const events = await readEventCollector(page)
        const pieHighlighted = events.some(
          entry =>
            entry.chart === 2 &&
            entry.event.toLowerCase() === 'highlight' &&
            entry.seriesIndex === 0 &&
            entry.dataIndex === 3
        )
        const pieTipShown = events.some(
          entry =>
            entry.chart === 2 &&
            entry.event.toLowerCase() === 'showtip' &&
            entry.seriesIndex === 0 &&
            entry.dataIndex === 3
        )
        return pieHighlighted && pieTipShown
      })
      .toBe(true)

    await page.evaluate(() => {
      const host = document.querySelector(
        '[data-testid="connect-mixed-chart-pie"] .echarts'
      ) as HTMLElement | null
      const chart = host?.__vueParentComponent?.exposed?.chart?.value
      chart?.dispatchAction({ type: 'highlight', seriesIndex: 0, dataIndex: 2 })
    })

    await expect
      .poll(async () => {
        const events = await readEventCollector(page)
        const lineTip = events.some(
          entry =>
            entry.chart === 0 &&
            entry.event.toLowerCase() === 'showtip' &&
            entry.seriesIndex === 0 &&
            entry.dataIndex === 2
        )
        const barTip = events.some(
          entry =>
            entry.chart === 1 &&
            entry.event.toLowerCase() === 'showtip' &&
            entry.seriesIndex === 0 &&
            entry.dataIndex === 2
        )
        const linePointer = events.some(
          entry =>
            entry.chart === 0 &&
            entry.event.toLowerCase() === 'updateaxispointer' &&
            entry.seriesIndex === 0 &&
            entry.dataIndex === 2
        )
        const barPointer = events.some(
          entry =>
            entry.chart === 1 &&
            entry.event.toLowerCase() === 'updateaxispointer' &&
            entry.seriesIndex === 0 &&
            entry.dataIndex === 2
        )
        return lineTip && barTip && linePointer && barPointer
      })
      .toBe(true)

    await page.evaluate(() => {
      const host = document.querySelector(
        '[data-testid="connect-mixed-chart-pie"] .echarts'
      ) as HTMLElement | null
      const chart = host?.__vueParentComponent?.exposed?.chart?.value
      chart?.dispatchAction({ type: 'highlight', seriesIndex: 0, dataIndex: 4 })
    })

    await expect
      .poll(async () => {
        const events = await readEventCollector(page)
        const lineTip = events.some(
          entry =>
            entry.chart === 0 &&
            entry.event.toLowerCase() === 'showtip' &&
            entry.seriesIndex === 0 &&
            entry.dataIndex === 4
        )
        const barTip = events.some(
          entry =>
            entry.chart === 1 &&
            entry.event.toLowerCase() === 'showtip' &&
            entry.seriesIndex === 0 &&
            entry.dataIndex === 4
        )
        return lineTip && barTip
      })
      .toBe(true)

    await page.mouse.move(10, 10)
    await expect
      .poll(async () => {
        const events = await readEventCollector(page)
        const hasGlobalOut = events.some(
          entry => entry.chart <= 2 && entry.event.toLowerCase() === 'globalout'
        )
        return hasGlobalOut
      })
      .toBe(true)

    await installEventCollector(page, [...mixedSelectors, ...cartesianSelectors])
    await page.getByRole('button', { name: '同步高亮第 3 点（线/柱/饼）', exact: true }).click()

    await expect
      .poll(async () => {
        const events = await readEventCollector(page)
        const lineUpdated = events.some(
          entry => entry.chart === 0 && entry.event === 'updateAxisPointer'
        )
        const barUpdated = events.some(
          entry => entry.chart === 1 && entry.event === 'updateAxisPointer'
        )
        const pieHighlighted = events.some(
          entry => entry.chart === 2 && entry.event === 'highlight'
        )
        const noUpperReaction = !events.some(entry => entry.chart >= 3)
        return lineUpdated && barUpdated && pieHighlighted && noUpperReaction
      })
      .toBe(true)
  })
})
