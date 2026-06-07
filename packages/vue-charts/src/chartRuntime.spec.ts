import { describe, expect, it, vi } from 'vitest'
import {
  clearAutoHighlight,
  dispatchAutoHighlightStep,
  resolveCategoryAxisDataLength,
  unwrapChartRef,
} from './chartRuntime'
import type { EChartsOption } from 'echarts'

const option = {
  xAxis: { type: 'category', data: ['A', 'B', 'C'] },
  yAxis: { type: 'value' },
  series: [{ type: 'bar', data: [1, 2, 3] }],
} satisfies EChartsOption

describe('chart runtime helpers', () => {
  it('unwraps chart refs that may come from v-for template refs', () => {
    const first = { id: 'first' }
    const second = { id: 'second' }

    expect(unwrapChartRef(first)).toBe(first)
    expect(unwrapChartRef([first, second])).toBe(first)
    expect(unwrapChartRef([])).toBeNull()
    expect(unwrapChartRef(null)).toBeNull()
  })

  it('resolves category axis data length', () => {
    expect(resolveCategoryAxisDataLength(option)).toBe(3)
    expect(resolveCategoryAxisDataLength({ xAxis: { type: 'value' } })).toBe(0)
  })

  it('dispatches and clears auto-highlight actions', () => {
    const dispatchAction = vi.fn()

    expect(dispatchAutoHighlightStep({ dispatchAction }, option, 1)).toBe(true)
    clearAutoHighlight({ dispatchAction })

    expect(dispatchAction.mock.calls.map(call => call[0])).toEqual([
      { type: 'downplay', seriesIndex: 0 },
      { type: 'hideTip' },
      { type: 'highlight', seriesIndex: 0, dataIndex: 1 },
      { type: 'updateAxisPointer', seriesIndex: 0, dataIndex: 1 },
      { type: 'showTip', seriesIndex: 0, dataIndex: 1 },
      { type: 'downplay', seriesIndex: 0 },
      { type: 'hideTip' },
    ])
  })
})
