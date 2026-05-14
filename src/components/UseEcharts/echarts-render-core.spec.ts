import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { EChartsOption } from 'echarts'
import { createEChartsRenderCore } from './echarts-render-core'

describe('createEChartsRenderCore', () => {
  const rect = { width: 640, height: 320 } as DOMRect
  const element = {
    getBoundingClientRect: vi.fn(() => rect),
  } as unknown as HTMLElement
  const chart = {
    resize: vi.fn(),
    setOption: vi.fn(),
    isDisposed: vi.fn(() => false),
  }

  beforeEach(() => {
    element.getBoundingClientRect = vi.fn(() => rect)
    chart.resize.mockClear()
    chart.setOption.mockClear()
    chart.isDisposed.mockClear()
    chart.isDisposed.mockReturnValue(false)
  })

  it('resizes through a single scheduled entry point', () => {
    const requestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
      callback(1)
      return 1
    })
    const core = createEChartsRenderCore({
      getElement: () => element,
      getInstance: () => chart,
      canRender: () => true,
      requestAnimationFrame,
      cancelAnimationFrame: vi.fn(),
    })

    core.schedule('resize')

    expect(requestAnimationFrame).toHaveBeenCalledTimes(1)
    expect(chart.resize).toHaveBeenCalledTimes(1)
  })

  it('defers setOption until the container has size', () => {
    let hasSize = false
    const option = { series: [{ type: 'line', data: [1, 2, 3] }] } satisfies EChartsOption
    element.getBoundingClientRect = vi.fn(() => ({
      width: hasSize ? 640 : 0,
      height: hasSize ? 320 : 0,
    })) as unknown as HTMLElement['getBoundingClientRect']
    const core = createEChartsRenderCore({
      getElement: () => element,
      getInstance: () => chart,
      canRender: () => hasSize,
      requestAnimationFrame: vi.fn((callback: FrameRequestCallback) => {
        callback(1)
        return 1
      }),
      cancelAnimationFrame: vi.fn(),
    })

    core.setOption(option, { lazyUpdate: true })

    expect(chart.setOption).not.toHaveBeenCalled()

    hasSize = true
    core.schedule('visible')

    expect(chart.resize).toHaveBeenCalledTimes(1)
    expect(chart.setOption).toHaveBeenCalledWith(option, { lazyUpdate: true })
  })

  it('does not resize after dispose', () => {
    const core = createEChartsRenderCore({
      getElement: () => element,
      getInstance: () => chart,
      canRender: () => true,
      requestAnimationFrame: vi.fn((callback: FrameRequestCallback) => {
        callback(1)
        return 1
      }),
      cancelAnimationFrame: vi.fn(),
    })

    core.dispose()
    core.schedule('resize')

    expect(chart.resize).not.toHaveBeenCalled()
  })
})
