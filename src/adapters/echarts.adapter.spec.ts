import { describe, expect, it, vi } from 'vitest'
import { parseEChartsOption } from './echarts.adapter'

describe('parseEChartsOption', () => {
  it('accepts known ECharts option object shapes', () => {
    const option = parseEChartsOption({
      title: { text: 'Revenue' },
      xAxis: { type: 'category' },
      yAxis: { type: 'value' },
      series: [{ type: 'bar', data: [1, 2, 3] }],
    })

    expect(option).toMatchObject({
      title: { text: 'Revenue' },
      series: [{ type: 'bar', data: [1, 2, 3] }],
    })
  })

  it('rejects non-object chart payloads', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)

    expect(parseEChartsOption(null)).toEqual({})
    expect(parseEChartsOption([])).toEqual({})
    expect(warn).toHaveBeenCalled()

    warn.mockRestore()
  })

  it('rejects invalid known option field structures', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)

    expect(parseEChartsOption({ series: 'bar' })).toEqual({})
    expect(parseEChartsOption({ xAxis: ['category'] })).toEqual({})
    expect(warn).toHaveBeenCalled()

    warn.mockRestore()
  })
})
