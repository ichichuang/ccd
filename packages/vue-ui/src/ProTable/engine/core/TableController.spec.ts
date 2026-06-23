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
})

describe('TableController shared renderer contract', () => {
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
