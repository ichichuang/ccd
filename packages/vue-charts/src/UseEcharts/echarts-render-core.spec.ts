import { describe, expect, it, vi } from 'vitest'
import { createEChartsRenderCore, getStableElementSize } from './echarts-render-core'

function createMockElement(
  init: Partial<{
    clientWidth: number
    clientHeight: number
    offsetWidth: number
    offsetHeight: number
    rectWidth: number
    rectHeight: number
  }>
): HTMLElement {
  const element = {
    clientWidth: init.clientWidth ?? 0,
    clientHeight: init.clientHeight ?? 0,
    offsetWidth: init.offsetWidth ?? 0,
    offsetHeight: init.offsetHeight ?? 0,
    getBoundingClientRect: () =>
      ({
        width: init.rectWidth ?? 0,
        height: init.rectHeight ?? 0,
      }) as DOMRect,
  } as unknown as HTMLElement

  return element
}

describe('getStableElementSize', () => {
  it('prefers client size over transformed DOMRect size', () => {
    const el = createMockElement({
      clientWidth: 693,
      clientHeight: 353,
      offsetWidth: 693,
      offsetHeight: 353,
      rectWidth: 671.88,
      rectHeight: 342.41,
    })

    expect(getStableElementSize(el)).toEqual({ width: 693, height: 353 })
  })

  it('falls back to offset size when client size is unavailable', () => {
    const el = createMockElement({
      clientWidth: 0,
      clientHeight: 0,
      offsetWidth: 692,
      offsetHeight: 352,
      rectWidth: 671.88,
      rectHeight: 342.41,
    })

    expect(getStableElementSize(el)).toEqual({ width: 692, height: 352 })
  })

  it('falls back to DOMRect when client and offset sizes are unavailable', () => {
    const el = createMockElement({
      clientWidth: 0,
      clientHeight: 0,
      offsetWidth: 0,
      offsetHeight: 0,
      rectWidth: 671.88,
      rectHeight: 342.41,
    })

    expect(getStableElementSize(el)).toEqual({ width: 671.88, height: 342.41 })
  })
})

describe('createEChartsRenderCore sizing', () => {
  it('resizes using stable layout size instead of transformed rect size', () => {
    const resizeCalls: Array<{ width?: number; height?: number }> = []

    const el = createMockElement({
      clientWidth: 693,
      clientHeight: 353,
      offsetWidth: 693,
      offsetHeight: 353,
      rectWidth: 671.88,
      rectHeight: 342.41,
    })

    const rafQueue: FrameRequestCallback[] = []
    const requestAnimationFrameMock = vi.fn((callback: FrameRequestCallback) => {
      rafQueue.push(callback)
      return rafQueue.length
    })
    const cancelAnimationFrameMock = vi.fn()

    const core = createEChartsRenderCore({
      getElement: () => el,
      getInstance: () => ({
        resize: opts => {
          resizeCalls.push(opts ?? {})
        },
        setOption: () => void 0,
        isDisposed: () => false,
      }),
      canRender: () => true,
      autoResize: () => true,
      requestAnimationFrame:
        requestAnimationFrameMock as unknown as typeof globalThis.requestAnimationFrame,
      cancelAnimationFrame:
        cancelAnimationFrameMock as unknown as typeof globalThis.cancelAnimationFrame,
    })

    core.schedule('resize')
    expect(rafQueue.length).toBeGreaterThan(0)
    const first = rafQueue.shift()
    expect(first).toBeTypeOf('function')
    first!(0)

    const second = rafQueue.shift()
    expect(second).toBeTypeOf('function')
    second!(16)

    expect(resizeCalls).toEqual([
      { width: 693, height: 353 },
      { width: 693, height: 353 },
    ])
  })
})
