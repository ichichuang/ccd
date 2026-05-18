import { describe, expect, it } from 'vitest'
import { parseEChartsOption } from './echarts.adapter'
import { isHttpRequestError } from '@/utils/http/errors'

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

  it('accepts objects with only unknown valid fields', () => {
    const option = parseEChartsOption({
      color: ['currentColor', 'inherit'],
      backgroundColor: 'transparent',
    })
    expect(option).toMatchObject({
      color: ['currentColor', 'inherit'],
      backgroundColor: 'transparent',
    })
  })

  it('accepts empty objects', () => {
    const option = parseEChartsOption({})
    expect(option).toEqual({})
  })

  it('throws HttpRequestError for non-object inputs', () => {
    let caught: unknown
    try {
      parseEChartsOption(null)
    } catch (e) {
      caught = e
    }
    expect(isHttpRequestError(caught)).toBe(true)
  })

  it('throws HttpRequestError for arrays', () => {
    let caught: unknown
    try {
      parseEChartsOption([1, 2])
    } catch (e) {
      caught = e
    }
    expect(isHttpRequestError(caught)).toBe(true)
  })

  it('throws HttpRequestError for invalid known field structures', () => {
    let caught: unknown
    try {
      parseEChartsOption({ series: 'bar' })
    } catch (e) {
      caught = e
    }
    expect(isHttpRequestError(caught)).toBe(true)
  })

  it('accepts valid known fields alongside unknown fields', () => {
    const option = parseEChartsOption({
      color: ['currentColor'],
      xAxis: { type: 'category' },
      series: [{ type: 'line' }],
    })
    expect(option).toMatchObject({
      color: ['currentColor'],
      xAxis: { type: 'category' },
    })
  })
})
