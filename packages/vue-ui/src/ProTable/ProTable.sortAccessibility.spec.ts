// @vitest-environment jsdom
import { mount } from '@vue/test-utils'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import type { ComponentCustomProperties } from 'vue'
import { nextTick } from 'vue'
import DataTable from 'primevue/datatable'
import ProTable from './ProTable.vue'
import type { ProTableColumn } from './engine/types/column'
import type { ProTableSortMode } from './engine/types/tableState'

// ProTable only consumes `t` for static labels; a passthrough keeps the mount
// free of an i18n instance while exercising the real DataTable render path.
vi.mock('vue-i18n', async importOriginal => {
  const actual = await importOriginal<typeof import('vue-i18n')>()
  return { ...actual, useI18n: () => ({ t: (key: string) => key }) }
})

// PrimeVue DataTable references ResizeObserver, which jsdom does not provide.
beforeAll(() => {
  if (!('ResizeObserver' in globalThis)) {
    ;(globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver = class {
      observe(): void {}
      unobserve(): void {}
      disconnect(): void {}
    }
  }
})

const primeVueGlobalProperties = {
  $primevue: { config: {} },
} as unknown as ComponentCustomProperties & Record<string, unknown>

/**
 * Mount ProTable through the DEFAULT (PrimeVue DataTable) render path with
 * real DataTable/Column/ProTableCell so the header `<th>` semantics can be
 * asserted. Toolbar/pagination/virtual/empty/icons are stubbed — they are not
 * the subject and keep the render deterministic. Columns/data use the default
 * `Record<string, unknown>` generic so the mount infers ProTable's `T` cleanly.
 */
const semanticStatusOrder = ['guarded', 'request', 'preview', 'ready'] as const

function getOrderedRank(value: unknown, order: readonly string[]): number {
  if (typeof value !== 'string') return order.length
  const index = order.indexOf(value)
  return index >= 0 ? index : order.length
}

function mountTable(
  options: {
    sortMode?: ProTableSortMode
    columns?: ProTableColumn[]
    data?: Array<Record<string, unknown>>
  } = {}
): ReturnType<typeof mount> {
  const columns: ProTableColumn[] = options.columns ?? [
    { id: 'name', title: 'Name', field: 'name', sortable: true },
    { id: 'age', title: 'Age', field: 'age', sortable: true },
    { id: 'status', title: 'Status', field: 'status' },
  ]
  const data: Array<Record<string, unknown>> = options.data ?? [
    { name: 'Bravo', age: 2, status: 'on' },
    { name: 'Alpha', age: 2, status: 'on' },
    { name: 'Alpha', age: 1, status: 'off' },
  ]
  return mount(ProTable, {
    attachTo: document.body,
    props: {
      columns,
      data,
      heightMode: 'auto',
      pagination: false,
      showToolbar: false,
      sortMode: options.sortMode,
    },
    global: {
      config: { globalProperties: primeVueGlobalProperties },
      stubs: {
        ProTableToolbar: true,
        ProTablePagination: true,
        VirtualGridRenderer: true,
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

function bodyRowTexts(wrapper: ReturnType<typeof mount>): string[] {
  return wrapper.findAll('tbody tr').map(row => row.text())
}

describe('ProTable DataTable header sorting accessibility (PT-SORT-A11Y)', () => {
  it('renders real DataTable headers with columnheader semantics', async () => {
    const wrapper = mountTable()
    try {
      await nextTick()
      await nextTick()
      const ths = wrapper.findAll('thead th')
      expect(ths.length).toBeGreaterThanOrEqual(3)
      // PrimeVue gives every header an implicit columnheader role.
      expect(ths.every(th => th.attributes('role') === 'columnheader')).toBe(true)
    } finally {
      wrapper.unmount()
    }
  })

  it('exposes aria-sort=none on sortable headers and nothing on non-sortable headers', async () => {
    const wrapper = mountTable()
    try {
      await nextTick()
      await nextTick()
      expect(headerByText(wrapper, 'Name').attributes('aria-sort')).toBe('none')
      expect(headerByText(wrapper, 'Age').attributes('aria-sort')).toBe('none')
      // Non-sortable column must NOT be announced as sortable.
      expect(headerByText(wrapper, 'Status').attributes('aria-sort')).toBeUndefined()
    } finally {
      wrapper.unmount()
    }
  })

  it('makes sortable headers keyboard-focusable button controls; non-sortable are inert', async () => {
    const wrapper = mountTable()
    try {
      await nextTick()
      await nextTick()
      const nameControl = headerByText(wrapper, 'Name').find('[data-pro-table-sort="true"]')
      expect(nameControl.exists()).toBe(true)
      expect(nameControl.attributes('role')).toBe('button')
      expect(nameControl.attributes('tabindex')).toBe('0')
      // Non-sortable header exposes no button/focusable control.
      expect(headerByText(wrapper, 'Status').find('[data-pro-table-sort="true"]').exists()).toBe(
        false
      )
      expect(headerByText(wrapper, 'Status').find('[role="button"]').exists()).toBe(false)
    } finally {
      wrapper.unmount()
    }
  })

  it('sorts on mouse click, updates aria-sort, and emits sort-change', async () => {
    const wrapper = mountTable()
    try {
      await nextTick()
      await nextTick()
      await headerByText(wrapper, 'Name').find('[data-pro-table-sort="true"]').trigger('click')
      await nextTick()
      expect(headerByText(wrapper, 'Name').attributes('aria-sort')).toBe('ascending')
      const events = wrapper.emitted('sort-change')
      expect(events).toBeTruthy()
      expect(events?.at(-1)?.[0]).toMatchObject({ field: 'name', direction: 'asc' })
    } finally {
      wrapper.unmount()
    }
  })

  it('toggles sort with Enter and Space through the single-column 3-state cycle', async () => {
    const wrapper = mountTable()
    try {
      await nextTick()
      await nextTick()
      const control = () => headerByText(wrapper, 'Name').find('[data-pro-table-sort="true"]')

      await control().trigger('keydown', { key: 'Enter' }) // none -> asc
      await nextTick()
      expect(headerByText(wrapper, 'Name').attributes('aria-sort')).toBe('ascending')

      await control().trigger('keydown', { key: 'Enter' }) // asc -> desc
      await nextTick()
      expect(headerByText(wrapper, 'Name').attributes('aria-sort')).toBe('descending')

      await control().trigger('keydown', { key: ' ' }) // desc -> none (cleared)
      await nextTick()
      expect(headerByText(wrapper, 'Name').attributes('aria-sort')).toBe('none')
    } finally {
      wrapper.unmount()
    }
  })

  it('keeps sorting single-column: sorting a second header clears the first', async () => {
    const wrapper = mountTable()
    try {
      await nextTick()
      await nextTick()
      await headerByText(wrapper, 'Name').find('[data-pro-table-sort="true"]').trigger('click')
      await nextTick()
      expect(headerByText(wrapper, 'Name').attributes('aria-sort')).toBe('ascending')

      await headerByText(wrapper, 'Age').find('[data-pro-table-sort="true"]').trigger('click')
      await nextTick()
      expect(headerByText(wrapper, 'Age').attributes('aria-sort')).toBe('ascending')
      // Single-column truth: the previously-sorted column resets to none.
      expect(headerByText(wrapper, 'Name').attributes('aria-sort')).toBe('none')
    } finally {
      wrapper.unmount()
    }
  })

  it('supports opt-in multi-column sorting and exposes secondary priority labels', async () => {
    const wrapper = mountTable({ sortMode: 'multiple' })
    try {
      await nextTick()
      await nextTick()

      await headerByText(wrapper, 'Name').find('[data-pro-table-sort="true"]').trigger('click')
      await headerByText(wrapper, 'Age').find('[data-pro-table-sort="true"]').trigger('click')
      await nextTick()

      expect(headerByText(wrapper, 'Name').attributes('aria-sort')).toBe('ascending')
      expect(headerByText(wrapper, 'Age').attributes('aria-sort')).toBe('none')
      expect(
        headerByText(wrapper, 'Age').find('[data-pro-table-sort="true"]').attributes('aria-label')
      ).toContain('priority 2')
      expect(bodyRowTexts(wrapper)[0]).toContain('Alpha1off')
      expect(bodyRowTexts(wrapper)[1]).toContain('Alpha2on')

      const events = wrapper.emitted('sort-change')
      expect(events?.at(-1)?.[0]).toMatchObject({
        field: 'name',
        direction: 'asc',
        multi: [
          { field: 'name', direction: 'asc' },
          { field: 'age', direction: 'asc' },
        ],
      })
    } finally {
      wrapper.unmount()
    }
  })

  it('removes a secondary multi-sort column on the third header activation', async () => {
    const wrapper = mountTable({ sortMode: 'multiple' })
    try {
      await nextTick()
      await nextTick()
      const ageControl = () => headerByText(wrapper, 'Age').find('[data-pro-table-sort="true"]')

      await headerByText(wrapper, 'Name').find('[data-pro-table-sort="true"]').trigger('click')
      await ageControl().trigger('click')
      await ageControl().trigger('click')
      await ageControl().trigger('click')
      await nextTick()

      expect(ageControl().attributes('aria-label')).toBe('Sort by Age')
      expect(wrapper.emitted('sort-change')?.at(-1)?.[0]).toMatchObject({
        field: 'name',
        direction: 'asc',
        multi: [{ field: 'name', direction: 'asc' }],
      })
    } finally {
      wrapper.unmount()
    }
  })

  it('maps PrimeVue DataTable multiple sort events into ProTable sort state', async () => {
    const wrapper = mountTable({ sortMode: 'multiple' })
    try {
      await nextTick()
      await nextTick()

      wrapper.findComponent(DataTable).vm.$emit('sort', {
        originalEvent: new Event('click'),
        first: 0,
        rows: 10,
        sortField: 'name',
        sortOrder: 1,
        multiSortMeta: [
          { field: 'name', order: 1 },
          { field: 'age', order: -1 },
        ],
        filters: {},
        filterMatchModes: undefined,
      })
      await nextTick()

      expect(wrapper.emitted('sort-change')?.at(-1)?.[0]).toMatchObject({
        field: 'name',
        direction: 'asc',
        multi: [
          { field: 'name', direction: 'asc' },
          { field: 'age', direction: 'desc' },
        ],
      })
      expect(
        headerByText(wrapper, 'Age').find('[data-pro-table-sort="true"]').attributes('aria-label')
      ).toContain('descending, priority 2')
    } finally {
      wrapper.unmount()
    }
  })

  it('renders DataTable rows using the shared custom comparator sort result', async () => {
    const wrapper = mountTable({
      columns: [
        { id: 'name', title: 'Name', field: 'name' },
        {
          id: 'status',
          title: 'Status',
          field: 'status',
          sortable: 'custom',
          sortCompare: (left, right) =>
            getOrderedRank(left, semanticStatusOrder) - getOrderedRank(right, semanticStatusOrder),
        },
      ],
      data: [
        { name: 'Ready row', status: 'ready' },
        { name: 'Guarded row', status: 'guarded' },
        { name: 'Request row', status: 'request' },
      ],
    })
    try {
      await nextTick()
      await nextTick()

      await headerByText(wrapper, 'Status').find('[data-pro-table-sort="true"]').trigger('click')
      await nextTick()

      expect(bodyRowTexts(wrapper)[0]).toContain('Guarded row')
      expect(bodyRowTexts(wrapper)[1]).toContain('Request row')
      expect(bodyRowTexts(wrapper)[2]).toContain('Ready row')
    } finally {
      wrapper.unmount()
    }
  })
})
