import { describe, expect, it } from 'vitest'
import { buildApiExecutorConfig, formatRequestParams, formatResponseData } from './apiAdapter'

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

describe('formatRequestParams', () => {
  it('keeps the single-sort query payload unchanged by default', () => {
    expect(
      formatRequestParams({
        page: 2,
        pageSize: 20,
        sort: { field: 'name', direction: 'asc' },
        filter: { global: ' ada ', columns: {} },
      })
    ).toEqual({
      page: 2,
      limit: 20,
      sortBy: 'name',
      order: 'asc',
      search: 'ada',
    })
  })

  it('adds multiSort only as an opt-in multi-column extension', () => {
    expect(
      formatRequestParams({
        page: 1,
        pageSize: 10,
        sort: {
          field: 'owner',
          direction: 'asc',
          multi: [
            { field: 'owner', direction: 'asc' },
            { field: 'records', direction: 'desc' },
          ],
        },
        filter: { global: '', columns: {} },
      })
    ).toEqual({
      page: 1,
      limit: 10,
      sortBy: 'owner',
      order: 'asc',
      multiSort: JSON.stringify([
        { field: 'owner', direction: 'asc' },
        { field: 'records', direction: 'desc' },
      ]),
    })
  })
})
