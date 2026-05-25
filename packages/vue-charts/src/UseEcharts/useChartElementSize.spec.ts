import { describe, expect, it, vi } from 'vitest'
import {
  createRafCoalescer,
  normalizeChartSizeValue,
  toNormalizedContentRect,
} from './useChartElementSize'

describe('useChartElementSize helpers', () => {
  it('normalizes invalid size values to zero', () => {
    expect(normalizeChartSizeValue(undefined)).toBe(0)
    expect(normalizeChartSizeValue(NaN)).toBe(0)
    expect(normalizeChartSizeValue(-1)).toBe(0)
    expect(normalizeChartSizeValue(0)).toBe(0)
    expect(normalizeChartSizeValue(12.5)).toBe(12.5)
  })

  it('normalizes content rect width/height', () => {
    const normalized = toNormalizedContentRect({
      width: Number.NaN,
      height: -10,
    } as DOMRectReadOnly)

    expect(normalized.width).toBe(0)
    expect(normalized.height).toBe(0)
  })

  it('coalesces repeated schedule calls and runs only latest entry once per frame', () => {
    const queue: FrameRequestCallback[] = []
    const run = vi.fn()
    const requestAnimationFrameMock = vi.fn((callback: FrameRequestCallback) => {
      queue.push(callback)
      return queue.length
    })
    const cancelAnimationFrameMock = vi.fn()

    const coalescer = createRafCoalescer(
      run,
      requestAnimationFrameMock as unknown as typeof globalThis.requestAnimationFrame,
      cancelAnimationFrameMock as unknown as typeof globalThis.cancelAnimationFrame
    )

    coalescer.schedule({ width: 100, height: 50 } as DOMRectReadOnly)
    coalescer.schedule({ width: 200, height: 80 } as DOMRectReadOnly)
    coalescer.schedule({ width: 300, height: 120 } as DOMRectReadOnly)

    expect(queue.length).toBe(1)

    queue[0](16)

    expect(run).toHaveBeenCalledTimes(1)
    expect(run).toHaveBeenCalledWith({ width: 300, height: 120 })
  })

  it('cancels pending RAF safely', () => {
    const queue: FrameRequestCallback[] = []
    const run = vi.fn()
    const requestAnimationFrameMock = vi.fn((callback: FrameRequestCallback) => {
      queue.push(callback)
      return 42
    })
    const cancelAnimationFrameMock = vi.fn()

    const coalescer = createRafCoalescer(
      run,
      requestAnimationFrameMock as unknown as typeof globalThis.requestAnimationFrame,
      cancelAnimationFrameMock as unknown as typeof globalThis.cancelAnimationFrame
    )

    coalescer.schedule({ width: 100, height: 50 } as DOMRectReadOnly)
    coalescer.cancel()

    expect(cancelAnimationFrameMock).toHaveBeenCalledWith(42)

    queue[0](16)
    expect(run).not.toHaveBeenCalled()
  })
})
