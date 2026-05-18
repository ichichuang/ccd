import { describe, expect, it } from 'vitest'
import { buildApiExecutorConfig, formatResponseData } from './apiAdapter'

describe('formatResponseData', () => {
  it('unwraps valid row arrays and totals', () => {
    expect(
      formatResponseData<{ id: string }>(
        { data: { records: [{ id: '1' }] }, total: 1 },
        'data.records',
        'total'
      )
    ).toEqual({
      data: [{ id: '1' }],
      total: 1,
    })
  })

  it('rejects invalid row shapes at the adapter boundary', () => {
    expect(() => formatResponseData({ data: [1], total: 1 }, 'data', 'total')).toThrow(
      'invalid row shape'
    )
  })
})

describe('buildApiExecutorConfig', () => {
  it('forwards AbortSignal and defaults apiUrl mode to cancel previous uncached requests', () => {
    const controller = new AbortController()

    expect(
      buildApiExecutorConfig({ headers: { Accept: 'application/json' } }, controller.signal)
    ).toEqual({
      headers: { Accept: 'application/json' },
      enableCache: false,
      cancelStrategy: 'cancelPrevious',
      signal: controller.signal,
    })
  })
})
