// @vitest-environment jsdom
import { flushPromises, mount } from '@vue/test-utils'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import type { ComponentCustomProperties } from 'vue'
import { nextTick } from 'vue'
import ProTable from './ProTable.vue'
import type { ProTableColumn, ProTableColumnGroupRow } from './engine/types/column'

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
  $primevue: { config: { zIndex: { modal: 1100, overlay: 1000, menu: 1000, tooltip: 1100 } } },
} as unknown as ComponentCustomProperties & Record<string, unknown>

interface ExposedColumnSettings {
  updateColumnSettings: (newOrder: string[], newHidden: string[]) => void
}

const columns: ProTableColumn[] = [
  { id: 'name', title: 'Name', field: 'name', sortable: true },
  { id: 'team', title: 'Team', field: 'team', filterable: true },
  { id: 'status', title: 'Status', field: 'status', sortable: true },
  { id: 'score', title: 'Score', field: 'score', sortable: true, align: 'right' },
]

const data: Array<Record<string, unknown>> = [
  { id: '1', name: 'Bravo', team: 'Core', status: 'ready', score: 2 },
  { id: '2', name: 'Alpha', team: 'Core', status: 'ready', score: 1 },
  { id: '3', name: 'Charlie', team: 'Edge', status: 'preview', score: 3 },
]

const columnGroups: ProTableColumnGroupRow[] = [
  [
    { id: 'identity', title: 'Identity', columnIds: ['name', 'team'] },
    { id: 'state', title: 'State', columnIds: ['status', 'score'] },
  ],
  [
    { id: 'ownership', title: 'Ownership', columnIds: ['name', 'team'] },
    { id: 'metrics', title: 'Metrics', columnIds: ['status', 'score'] },
  ],
]

function mountTable(
  options: {
    groups?: ProTableColumnGroupRow[]
    tableColumns?: ProTableColumn[]
    virtualScroll?: boolean
  } = {}
) {
  return mount(ProTable, {
    attachTo: document.body,
    props: {
      columns: options.tableColumns ?? columns,
      columnGroups: options.groups,
      data,
      heightMode: 'auto',
      pagination: false,
      showToolbar: false,
      virtualScroll: options.virtualScroll ?? false,
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
        ProgressSpinner: true,
        EmptyState: true,
        Icons: true,
      },
    },
  })
}

function headerByText(wrapper: ReturnType<typeof mount>, text: string) {
  const th = wrapper.findAll('thead th').find(candidate => candidate.text().includes(text))
  if (!th) throw new Error(`No header cell containing "${text}"`)
  return th
}

function groupHeaders(wrapper: ReturnType<typeof mount>, groupId: string) {
  return wrapper.findAll(`[data-pro-table-column-group="${groupId}"]`)
}

async function settle(): Promise<void> {
  await flushPromises()
  await nextTick()
  await flushPromises()
}

describe('ProTable column grouping baseline (P1-C1)', () => {
  it('keeps the default DataTable header unchanged when no groups are provided', async () => {
    const wrapper = mountTable()
    try {
      await settle()
      expect(wrapper.findAll('thead tr')).toHaveLength(1)
      expect(wrapper.findAll('[data-pro-table-column-group]').length).toBe(0)
      expect(headerByText(wrapper, 'Name').exists()).toBe(true)
      expect(headerByText(wrapper, 'Score').exists()).toBe(true)
    } finally {
      wrapper.unmount()
    }
  })

  it('renders grouped DataTable header rows with derived colspan semantics', async () => {
    const wrapper = mountTable({ groups: columnGroups })
    try {
      await settle()
      expect(wrapper.findAll('thead tr')).toHaveLength(3)
      expect(groupHeaders(wrapper, 'identity')).toHaveLength(1)
      expect(groupHeaders(wrapper, 'identity')[0].attributes('colspan')).toBe('2')
      expect(groupHeaders(wrapper, 'state')[0].attributes('colspan')).toBe('2')
      expect(groupHeaders(wrapper, 'ownership')[0].attributes('colspan')).toBe('2')
      expect(groupHeaders(wrapper, 'metrics')[0].attributes('colspan')).toBe('2')
      expect(headerByText(wrapper, 'Name').attributes('aria-sort')).toBe('none')
      expect(headerByText(wrapper, 'Team').find('[data-pro-table-filter-toggle]').exists()).toBe(
        true
      )
    } finally {
      wrapper.unmount()
    }
  })

  it('keeps leaf sort and filter controls working under grouped headers', async () => {
    const wrapper = mountTable({ groups: columnGroups })
    try {
      await settle()
      await headerByText(wrapper, 'Name').find('[data-pro-table-sort="true"]').trigger('click')
      await settle()
      expect(headerByText(wrapper, 'Name').attributes('aria-sort')).toBe('ascending')
      expect(wrapper.emitted('sort-change')?.at(-1)?.[0]).toMatchObject({
        field: 'name',
        direction: 'asc',
      })

      await headerByText(wrapper, 'Team').find('[data-pro-table-filter-toggle]').trigger('click')
      await settle()
      const input = document.body.querySelector(
        'input[data-pro-table-filter-input]'
      ) as HTMLInputElement | null
      expect(input).toBeTruthy()
      input!.value = 'Edge'
      input!.dispatchEvent(new Event('input', { bubbles: true }))
      await settle()

      expect(wrapper.findAll('tbody tr')).toHaveLength(1)
      expect(wrapper.find('tbody').text()).toContain('Charlie')
      expect(wrapper.emitted('filter-change')?.at(-1)?.[0]).toMatchObject({
        columns: { team: 'Edge' },
      })
    } finally {
      wrapper.unmount()
    }
  })

  it('derives grouped spans from current visibility and column order', async () => {
    const wrapper = mountTable({
      groups: columnGroups,
      tableColumns: columns.map(column =>
        column.id === 'status' ? { ...column, hidden: true } : column
      ),
    })
    try {
      await settle()
      expect(wrapper.findAll('thead th').some(th => th.text().includes('Status'))).toBe(false)
      expect(groupHeaders(wrapper, 'state')[0].attributes('colspan')).toBe('1')
      ;(wrapper.vm as unknown as ExposedColumnSettings).updateColumnSettings(
        ['score', 'name', 'team', 'status'],
        ['status']
      )
      await settle()

      const topGroupTexts = wrapper
        .findAll('thead tr')[0]
        .findAll('th')
        .map(th => th.text())
      expect(topGroupTexts).toEqual(['State', 'Identity'])
      expect(groupHeaders(wrapper, 'state')[0].attributes('colspan')).toBe('1')
      expect(groupHeaders(wrapper, 'identity')[0].attributes('colspan')).toBe('2')
    } finally {
      wrapper.unmount()
    }
  })

  it('leaves VirtualGridRenderer unchanged and does not render grouped headers in virtual mode', async () => {
    const wrapper = mountTable({ groups: columnGroups, virtualScroll: true })
    try {
      await settle()
      expect(wrapper.find('[data-virtual-grid-renderer]').exists()).toBe(true)
      expect(wrapper.find('thead').exists()).toBe(false)
      expect(wrapper.text()).not.toContain('Identity')
      expect(wrapper.text()).not.toContain('Metrics')
    } finally {
      wrapper.unmount()
    }
  })
})
