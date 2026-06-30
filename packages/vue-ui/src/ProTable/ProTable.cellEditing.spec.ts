// @vitest-environment jsdom
import { flushPromises, mount } from '@vue/test-utils'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import type { ComponentCustomProperties } from 'vue'
import { nextTick } from 'vue'
import DataTable from 'primevue/datatable'
import ProTable from './ProTable.vue'
import type { ProTableColumn, ProTableColumnGroupRow } from './engine/types/column'
import type {
  ProTableApiExecutor,
  ProTableApiFn,
  ProTableCellEditCompletePrimeEvent,
  ProTableRowEditSavePrimeEvent,
  RequestFn,
} from './engine/types/props'

vi.mock('vue-i18n', async importOriginal => {
  const actual = await importOriginal<typeof import('vue-i18n')>()
  return { ...actual, useI18n: () => ({ t: (key: string) => key }) }
})

beforeAll(() => {
  if (!('ResizeObserver' in globalThis)) {
    ;(globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver = class {
      observe(): void {}
      unobserve(): void {}
      disconnect(): void {}
    }
  }
  if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
    window.matchMedia = ((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    })) as unknown as typeof window.matchMedia
  }
})

const primeVueGlobalProperties = {
  $primevue: {
    config: {
      zIndex: { modal: 1100, overlay: 1000, menu: 1000, tooltip: 1100 },
      locale: { aria: { editRow: 'Edit row', saveEdit: 'Save edit', cancelEdit: 'Cancel edit' } },
    },
  },
} as unknown as ComponentCustomProperties & Record<string, unknown>

type Row = Record<string, unknown>

const baseColumns: ProTableColumn<Row>[] = [
  { id: 'name', title: 'Name', field: 'name', sortable: true, filterable: true },
  { id: 'status', title: 'Status', field: 'status' },
  { id: 'records', title: 'Records', field: 'records', sortable: true, editorType: 'number' },
]

const editableColumns: ProTableColumn<Row>[] = [
  { ...baseColumns[0], editable: true, editorType: 'text' },
  {
    ...baseColumns[1],
    editable: true,
    editorType: 'select',
    editorOptions: [
      { label: 'Ready', value: 'ready' },
      { label: 'Draft', value: 'draft' },
    ],
  },
  { ...baseColumns[2], editable: true, editorType: 'number' },
]

const editableNameOnlyColumns: ProTableColumn<Row>[] = [
  { ...baseColumns[0], editable: true, editorType: 'text' },
  baseColumns[1],
  baseColumns[2],
]

const rows: Row[] = [
  { id: '1', name: 'Bravo', status: 'ready', records: 2 },
  { id: '2', name: 'Alpha', status: 'draft', records: 1 },
]

function mountTable(
  options: {
    columns?: ProTableColumn<Row>[]
    data?: Row[]
    editMode?: 'cell' | 'row' | false
    virtualScroll?: boolean
    columnGroups?: ProTableColumnGroupRow[]
    request?: RequestFn<Row>
    api?: ProTableApiFn
    apiUrl?: string
    apiExecutor?: ProTableApiExecutor
  } = {}
): ReturnType<typeof mount> {
  return mount(ProTable, {
    attachTo: document.body,
    props: {
      columns: options.columns ?? baseColumns,
      columnGroups: options.columnGroups,
      data: options.data ?? rows,
      editMode: options.editMode,
      virtualScroll: options.virtualScroll ?? false,
      request: options.request,
      api: options.api,
      apiUrl: options.apiUrl,
      apiExecutor: options.apiExecutor,
      dataKey: 'data',
      totalKey: 'total',
      heightMode: 'auto',
      pagination: false,
      showToolbar: false,
    },
    global: {
      config: { globalProperties: primeVueGlobalProperties },
      stubs: {
        ProTableToolbar: true,
        ProTablePagination: true,
        VirtualGridRenderer: {
          props: ['columns'],
          template: '<div data-virtual-grid-renderer>{{ columns.length }}</div>',
        },
        DatePicker: {
          name: 'DatePicker',
          template: '<input class="p-datepicker" data-pro-table-cell-editor />',
        },
        ProgressSpinner: true,
        EmptyState: true,
        Icons: true,
      },
    },
  })
}

async function settle(): Promise<void> {
  await flushPromises()
  await nextTick()
  await flushPromises()
}

function bodyCell(wrapper: ReturnType<typeof mount>, rowIndex: number, cellIndex: number) {
  return wrapper.findAll('tbody tr')[rowIndex].findAll('td')[cellIndex]
}

function headerByText(wrapper: ReturnType<typeof mount>, text: string) {
  const th = wrapper.findAll('thead th').find(candidate => candidate.text().includes(text))
  if (!th) throw new Error(`No header cell containing "${text}"`)
  return th
}

function bodyRowTexts(wrapper: ReturnType<typeof mount>): string[] {
  return wrapper.findAll('tbody tr').map(row => row.text())
}

function createPrimeCellEvent(
  row: Row,
  field: string,
  value: unknown,
  newValue: unknown
): ProTableCellEditCompletePrimeEvent<Row> {
  return {
    originalEvent: new Event('keydown'),
    data: row,
    newData: { ...row, [field]: newValue },
    value,
    newValue,
    field,
    index: 0,
    type: 'enter',
  }
}

function createPrimeRowEvent(row: Row, newRow: Row): ProTableRowEditSavePrimeEvent<Row> {
  return {
    originalEvent: new Event('click'),
    data: row,
    newData: newRow,
    field: 'name',
    index: 0,
  }
}

describe('ProTable DataTable editing baseline (P1-F1/P1-F2)', () => {
  it('keeps the default DataTable path non-editable', async () => {
    const wrapper = mountTable()
    try {
      await settle()
      expect(wrapper.findComponent(DataTable).props('editMode')).not.toBe('cell')
      expect(wrapper.findComponent(DataTable).props('editMode')).not.toBe('row')
      await bodyCell(wrapper, 0, 0).trigger('click')
      await settle()
      expect(wrapper.find('[data-pro-table-cell-editor]').exists()).toBe(false)
    } finally {
      wrapper.unmount()
    }
  })

  it('keeps editMode="cell" emitting the existing cell-edit-complete payload', async () => {
    const data = rows.map(row => ({ ...row }))
    const wrapper = mountTable({ columns: editableColumns, data, editMode: 'cell' })
    try {
      await settle()
      const primeEvent = createPrimeCellEvent(data[0], 'name', 'Bravo', 'Charlie')
      wrapper.findComponent(DataTable).vm.$emit('cell-edit-complete', primeEvent)
      await settle()

      expect(wrapper.emitted('cell-edit-complete')?.[0]?.[0]).toMatchObject({
        row: data[0],
        rowKey: '1',
        field: 'name',
        oldValue: 'Bravo',
        newValue: 'Charlie',
        primeEvent,
      })
    } finally {
      wrapper.unmount()
    }
  })

  it('renders row editor controls in DataTable row edit mode', async () => {
    const wrapper = mountTable({ columns: editableColumns, editMode: 'row' })
    try {
      await settle()
      expect(wrapper.findComponent(DataTable).props('editMode')).toBe('row')
      expect(wrapper.findAll('tbody tr')[0].findAll('td')).toHaveLength(baseColumns.length + 1)
      expect(bodyCell(wrapper, 0, baseColumns.length).find('button').exists()).toBe(true)
    } finally {
      wrapper.unmount()
    }
  })

  it('renders row-mode editors only for editable columns', async () => {
    const wrapper = mountTable({ columns: editableNameOnlyColumns, editMode: 'row' })
    try {
      await settle()
      wrapper.findComponent(DataTable).vm.$emit('update:editingRows', [rows[0]])
      await settle()

      expect(bodyCell(wrapper, 0, 0).find('[data-pro-table-cell-editor]').exists()).toBe(true)
      expect(bodyCell(wrapper, 0, 1).find('[data-pro-table-cell-editor]').exists()).toBe(false)
    } finally {
      wrapper.unmount()
    }
  })

  it('emits row-edit-save payload without mutating props.data', async () => {
    const data = rows.map(row => ({ ...row }))
    const wrapper = mountTable({ columns: editableColumns, data, editMode: 'row' })
    try {
      await settle()
      const primeEvent = createPrimeRowEvent(data[0], {
        ...data[0],
        name: 'Charlie',
        status: 'draft',
        records: 8,
      })
      wrapper.findComponent(DataTable).vm.$emit('row-edit-save', primeEvent)
      await settle()

      expect(data[0]).toMatchObject({ name: 'Bravo', status: 'ready', records: 2 })
      expect(wrapper.emitted('row-edit-save')?.[0]?.[0]).toMatchObject({
        row: data[0],
        rowKey: '1',
        oldRow: data[0],
        newRow: primeEvent.newData,
        changedFields: [
          { field: 'name', oldValue: 'Bravo', newValue: 'Charlie' },
          { field: 'status', oldValue: 'ready', newValue: 'draft' },
          { field: 'records', oldValue: 2, newValue: 8 },
        ],
        primeEvent,
      })
    } finally {
      wrapper.unmount()
    }
  })

  it('renders an editor only for explicitly editable columns', async () => {
    const wrapper = mountTable({
      columns: [{ ...baseColumns[0], editable: true }, baseColumns[1]],
      editMode: 'cell',
    })
    try {
      await settle()
      expect(wrapper.findComponent(DataTable).props('editMode')).toBe('cell')

      await bodyCell(wrapper, 0, 0).trigger('click')
      await settle()
      expect(wrapper.find('[data-pro-table-cell-editor]').exists()).toBe(true)

      wrapper.unmount()
      const nonEditableWrapper = mountTable({
        columns: [{ ...baseColumns[0], editable: true }, baseColumns[1]],
        editMode: 'cell',
      })
      try {
        await settle()
        await bodyCell(nonEditableWrapper, 0, 1).trigger('click')
        await settle()
        expect(nonEditableWrapper.find('[data-pro-table-cell-editor]').exists()).toBe(false)
      } finally {
        nonEditableWrapper.unmount()
      }
    } finally {
      if (wrapper.exists()) wrapper.unmount()
    }
  })

  it('emits a typed cell-edit-complete payload without mutating props.data', async () => {
    const data = rows.map(row => ({ ...row }))
    const wrapper = mountTable({ columns: editableColumns, data, editMode: 'cell' })
    try {
      await settle()
      const primeEvent = createPrimeCellEvent(data[0], 'name', 'Bravo', 'Charlie')
      wrapper.findComponent(DataTable).vm.$emit('cell-edit-complete', primeEvent)
      await settle()

      expect(data[0].name).toBe('Bravo')
      expect(wrapper.emitted('cell-edit-complete')?.[0]?.[0]).toMatchObject({
        row: data[0],
        rowKey: '1',
        field: 'name',
        oldValue: 'Bravo',
        newValue: 'Charlie',
        primeEvent,
      })
    } finally {
      wrapper.unmount()
    }
  })

  it('keeps sorting and per-column filtering working when editable columns are enabled', async () => {
    const wrapper = mountTable({ columns: editableColumns, editMode: 'row' })
    try {
      await settle()
      await headerByText(wrapper, 'Name').find('[data-pro-table-sort="true"]').trigger('click')
      await settle()
      expect(bodyRowTexts(wrapper)[0]).toContain('Alpha')

      await headerByText(wrapper, 'Name').find('[data-pro-table-filter-toggle]').trigger('click')
      await settle()
      const input = document.body.querySelector(
        'input[data-pro-table-filter-input]'
      ) as HTMLInputElement | null
      expect(input).toBeTruthy()
      input!.value = 'Bravo'
      input!.dispatchEvent(new Event('input', { bubbles: true }))
      await settle()

      expect(wrapper.findAll('tbody tr')).toHaveLength(1)
      expect(wrapper.find('tbody').text()).toContain('Bravo')
    } finally {
      wrapper.unmount()
    }
  })

  it('keeps grouped DataTable headers stable with editable leaf columns', async () => {
    const columnGroups: ProTableColumnGroupRow[] = [
      [{ id: 'identity', title: 'Identity', columnIds: ['name', 'status'] }],
    ]
    const wrapper = mountTable({ columns: editableColumns, columnGroups, editMode: 'row' })
    try {
      await settle()
      expect(wrapper.findAll('thead tr')).toHaveLength(2)
      expect(wrapper.find('[data-pro-table-column-group="identity"]').attributes('colspan')).toBe(
        '2'
      )

      expect(wrapper.find('tbody button').exists()).toBe(true)
    } finally {
      wrapper.unmount()
    }
  })

  it('keeps request, api, and apiUrl modes adapter-owned while emitting edit payloads', async () => {
    const request = vi.fn<RequestFn<Row>>(async () => ({ data: rows, total: rows.length }))
    const api = vi.fn<ProTableApiFn>(async () => ({ data: rows, total: rows.length }))
    const apiExecutor = vi.fn<ProTableApiExecutor>(async () => ({ data: rows, total: rows.length }))

    const modes = [
      mountTable({ columns: editableColumns, editMode: 'row', request }),
      mountTable({ columns: editableColumns, editMode: 'row', api }),
      mountTable({
        columns: editableColumns,
        editMode: 'row',
        apiUrl: '/local/pro-table',
        apiExecutor,
      }),
    ]

    try {
      await settle()
      for (const wrapper of modes) {
        const primeEvent = createPrimeRowEvent(rows[0], { ...rows[0], name: 'Delta' })
        wrapper.findComponent(DataTable).vm.$emit('row-edit-save', primeEvent)
        await settle()
        expect(wrapper.emitted('row-edit-save')?.[0]?.[0]).toMatchObject({
          rowKey: '1',
          newRow: expect.objectContaining({ name: 'Delta' }),
        })
      }
      expect(request).toHaveBeenCalled()
      expect(api).toHaveBeenCalled()
      expect(apiExecutor).toHaveBeenCalled()
    } finally {
      modes.forEach(wrapper => wrapper.unmount())
    }
  })

  it('keeps VirtualGridRenderer stable and ignores editing with a dev warning', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const wrapper = mountTable({ columns: editableColumns, editMode: 'row', virtualScroll: true })
    try {
      await settle()
      expect(wrapper.findComponent(DataTable).exists()).toBe(false)
      expect(wrapper.find('[data-virtual-grid-renderer]').exists()).toBe(true)
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('editMode="cell" and editMode="row" are supported only')
      )
    } finally {
      wrapper.unmount()
      warnSpy.mockRestore()
    }
  })
})
