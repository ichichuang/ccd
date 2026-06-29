import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { TableController } from './TableController'
import type { ProTableColumn } from '../types/column'
import type { ProTableLoadParams, ProTableRequestResult, RequestFn } from '../types/props'

type Row = { id: string } & Record<string, unknown>

interface PendingRequest {
  signal?: AbortSignal
  resolve: (result: ProTableRequestResult<Row>) => void
}

const columns: ProTableColumn<Row>[] = [{ id: 'id', title: 'ID', field: 'id' }]
const namedColumns: ProTableColumn<Row>[] = [
  { id: 'id', title: 'ID', field: 'id' },
  { id: 'name', title: 'Name', field: 'name' },
]
const sortableColumns: ProTableColumn<Row>[] = [
  { id: 'owner', title: 'Owner', field: 'owner', sortable: true },
  { id: 'records', title: 'Records', field: 'records', sortable: true },
]

describe('TableController request cancellation', () => {
  it('aborts stale requests and ignores stale results when reloading', async () => {
    const pending: PendingRequest[] = []
    const ctrl = new TableController<Row>({
      columns,
      serverMode: true,
      requestConfig: { immediate: false },
      request: params =>
        new Promise(resolve => {
          pending.push({ signal: params.signal, resolve })
        }),
    })

    ctrl.requestReload()
    ctrl.requestReload()

    expect(pending).toHaveLength(2)
    expect(pending[0].signal?.aborted).toBe(true)
    expect(pending[1].signal?.aborted).toBe(false)

    pending[1].resolve({ data: [{ id: 'latest' }], total: 1 })
    await nextTick()

    expect(ctrl.processedRows.value).toEqual([{ id: 'latest' }])
    expect(ctrl.state.pagination.total).toBe(1)

    pending[0].resolve({ data: [{ id: 'stale' }], total: 1 })
    await nextTick()

    expect(ctrl.processedRows.value).toEqual([{ id: 'latest' }])
    ctrl.destroy()
  })
})

describe('TableController dynamic request configuration', () => {
  it('loads once and accumulates after request mode is enabled on an existing controller', async () => {
    const calls: ProTableLoadParams[] = []
    const request: RequestFn<Row> = async params => {
      calls.push(params)
      return {
        data: [{ id: `page-${params.page}` }],
        total: 2,
      }
    }
    const ctrl = new TableController<Row>({
      columns,
      data: [{ id: 'local' }],
      paginationEnabled: false,
    })

    ctrl.setRequest(request, { immediate: true, accumulate: true })

    expect(calls).toHaveLength(1)
    expect(calls[0].page).toBe(1)
    await nextTick()

    expect(ctrl.processedRows.value).toEqual([{ id: 'page-1' }])

    ctrl.fetchMore()

    expect(calls).toHaveLength(2)
    expect(calls[1].page).toBe(2)
    await nextTick()

    expect(ctrl.processedRows.value).toEqual([{ id: 'page-1' }, { id: 'page-2' }])
    expect(ctrl.state.fetch.hasMore).toBe(false)
    ctrl.destroy()
  })

  it('keeps request filter payload stable when fuzzy search is enabled', async () => {
    const calls: ProTableLoadParams[] = []
    const ctrl = new TableController<Row>({
      columns: namedColumns,
      data: [],
      serverMode: true,
      globalSearchMode: 'fuzzy',
      requestConfig: { immediate: false },
      request: async params => {
        calls.push(params)
        return { data: [], total: 0 }
      },
    })

    ctrl.setGlobalFilter('protable')
    await nextTick()

    expect(calls).toHaveLength(1)
    expect(calls[0].filter).toEqual({ global: 'protable', columns: {} })
    expect(Object.keys(calls[0].filter)).toEqual(['global', 'columns'])

    calls.length = 0
    ctrl.setColumnFilter('joinedAt', '2026-01-08')
    await nextTick()

    expect(calls).toHaveLength(1)
    expect(calls[0].filter).toEqual({
      global: 'protable',
      columns: { joinedAt: '2026-01-08' },
    })
    expect(Object.keys(calls[0].filter)).toEqual(['global', 'columns'])
    ctrl.destroy()
  })

  it('keeps default single-sort request payload compatible', async () => {
    const calls: ProTableLoadParams[] = []
    const ctrl = new TableController<Row>({
      columns: namedColumns,
      data: [],
      serverMode: true,
      requestConfig: { immediate: false },
      request: async params => {
        calls.push(params)
        return { data: [], total: 0 }
      },
    })

    ctrl.updateSort('name')
    await nextTick()

    expect(calls).toHaveLength(1)
    expect(calls[0].sort).toEqual({ field: 'name', direction: 'asc' })
    expect(Object.keys(calls[0].sort)).toEqual(['field', 'direction'])
    ctrl.destroy()
  })

  it('exposes ordered multi-sort metadata only when multiple mode is opted in', async () => {
    const calls: ProTableLoadParams[] = []
    const ctrl = new TableController<Row>({
      columns: sortableColumns,
      data: [],
      serverMode: true,
      sortMode: 'multiple',
      requestConfig: { immediate: false },
      request: async params => {
        calls.push(params)
        return { data: [], total: 0 }
      },
    })

    ctrl.updateSort('owner')
    ctrl.updateSort('records')
    await nextTick()

    expect(calls.at(-1)?.sort).toEqual({
      field: 'owner',
      direction: 'asc',
      multi: [
        { field: 'owner', direction: 'asc' },
        { field: 'records', direction: 'asc' },
      ],
    })
    ctrl.destroy()
  })
})

describe('TableController shared renderer contract', () => {
  it('preserves default single-column sorting behavior', () => {
    const ctrl = new TableController<Row>({
      columns: sortableColumns,
      data: [
        { id: 'a', owner: 'core', records: 2 },
        { id: 'b', owner: 'app', records: 3 },
        { id: 'c', owner: 'app', records: 1 },
      ],
      paginationEnabled: false,
    })

    ctrl.updateSort('owner')
    expect(ctrl.processedRows.value.map(row => row.id)).toEqual(['b', 'c', 'a'])
    expect(ctrl.state.sort).toEqual({ field: 'owner', direction: 'asc' })

    ctrl.updateSort('records')
    expect(ctrl.state.sort).toEqual({ field: 'records', direction: 'asc' })
    expect(ctrl.processedRows.value.map(row => row.id)).toEqual(['c', 'a', 'b'])
    ctrl.destroy()
  })

  it('sorts by ordered multi-sort priority and removes a column on the third click', () => {
    const ctrl = new TableController<Row>({
      columns: sortableColumns,
      data: [
        { id: 'a', owner: 'core', records: 2 },
        { id: 'b', owner: 'app', records: 3 },
        { id: 'c', owner: 'app', records: 1 },
        { id: 'd', owner: 'core', records: 1 },
      ],
      sortMode: 'multiple',
      paginationEnabled: false,
    })

    ctrl.updateSort('owner')
    ctrl.updateSort('records')

    expect(ctrl.state.sort).toEqual({
      field: 'owner',
      direction: 'asc',
      multi: [
        { field: 'owner', direction: 'asc' },
        { field: 'records', direction: 'asc' },
      ],
    })
    expect(ctrl.processedRows.value.map(row => row.id)).toEqual(['c', 'b', 'd', 'a'])

    ctrl.updateSort('owner')
    ctrl.updateSort('owner')

    expect(ctrl.state.sort).toEqual({
      field: 'records',
      direction: 'asc',
      multi: [{ field: 'records', direction: 'asc' }],
    })
    expect(ctrl.processedRows.value.map(row => row.id)).toEqual(['c', 'd', 'a', 'b'])
    ctrl.destroy()
  })

  it('uses the same selection state for DataTable and virtual-grid paths', () => {
    const ctrl = new TableController<Row>({
      columns,
      data: [{ id: 'a' }, { id: 'b' }, { id: 'c' }],
      maxSelection: 2,
    })

    ctrl.selectRow({ id: 'a' }, 'checkbox')
    ctrl.selectRow({ id: 'b' }, 'checkbox')
    ctrl.selectRow({ id: 'c' }, 'checkbox')

    expect(ctrl.state.selection.selectedRowKeys).toEqual(['a', 'b'])
    expect(ctrl.isRowSelected({ id: 'a' })).toBe(true)

    ctrl.clearSelection()
    expect(ctrl.state.selection.selectedRowKeys).toEqual([])
    ctrl.destroy()
  })

  it('keeps single selection behavior unchanged when range is requested', () => {
    const ctrl = new TableController<Row>({
      columns,
      data: [{ id: 'a' }, { id: 'b' }, { id: 'c' }],
    })

    ctrl.selectRow({ id: 'a' }, 'single')
    ctrl.selectRow({ id: 'c' }, 'single', { range: true })

    expect(ctrl.state.selection.selectedRowKeys).toEqual(['c'])
    ctrl.destroy()
  })

  it('selects an inclusive checkbox range in processed row order', () => {
    const ctrl = new TableController<Row>({
      columns,
      data: [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }],
    })

    ctrl.selectRow({ id: 'b' }, 'checkbox')
    ctrl.selectRow({ id: 'd' }, 'checkbox', { range: true })

    expect(ctrl.state.selection.selectedRowKeys).toEqual(['b', 'c', 'd'])
    ctrl.destroy()
  })

  it('uses the current sorted processed row order for checkbox ranges', () => {
    const ctrl = new TableController<Row & { name: string }>({
      columns: [
        { id: 'id', title: 'ID', field: 'id' },
        { id: 'name', title: 'Name', field: 'name', sortable: true },
      ],
      data: [
        { id: 'a', name: 'Delta' },
        { id: 'b', name: 'Alpha' },
        { id: 'c', name: 'Charlie' },
        { id: 'd', name: 'Bravo' },
      ],
    })

    ctrl.updateSort('name')
    expect(ctrl.processedRows.value.map(row => row.id)).toEqual(['b', 'd', 'c', 'a'])

    ctrl.selectRow({ id: 'b', name: 'Alpha' }, 'checkbox')
    ctrl.selectRow({ id: 'c', name: 'Charlie' }, 'checkbox', { range: true })

    expect(ctrl.state.selection.selectedRowKeys).toEqual(['b', 'd', 'c'])
    ctrl.destroy()
  })

  it('truncates checkbox range additions at maxSelection', () => {
    const ctrl = new TableController<Row>({
      columns,
      data: [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }],
      maxSelection: 3,
    })

    ctrl.selectRow({ id: 'a' }, 'checkbox')
    ctrl.selectRow({ id: 'd' }, 'checkbox', { range: true })

    expect(ctrl.state.selection.selectedRowKeys).toEqual(['a', 'b', 'c'])
    ctrl.destroy()
  })

  it('does not slice processed rows when virtual scrolling disables engine pagination', () => {
    const ctrl = new TableController<Row>({
      columns,
      data: [{ id: 'a' }, { id: 'b' }, { id: 'c' }],
      paginationEnabled: false,
      initialPageSize: 1,
    })

    ctrl.setPage(2)

    expect(ctrl.processedRows.value.map(row => row.id)).toEqual(['a', 'b', 'c'])
    ctrl.destroy()
  })

  it('preserves column settings across column definition updates', () => {
    const changes: Array<{ orderedKeys: string[]; hiddenKeys: string[] }> = []
    const ctrl = new TableController<Row>({
      columns: namedColumns,
      onColumnSettingsChange: state => changes.push(state),
    })

    ctrl.toggleColumnVisibility('name', false)
    ctrl.setColumns([
      { id: 'id', title: 'ID', field: 'id' },
      { id: 'name', title: 'Name', field: 'name' },
      { id: 'status', title: 'Status', field: 'status' },
    ])

    expect(ctrl.visibleColumns.value.map(col => col.id)).toEqual(['id', 'status'])
    expect(changes.at(-1)).toEqual({
      orderedKeys: ['id', 'name', 'status'],
      hiddenKeys: ['name'],
    })
    ctrl.destroy()
  })
})
