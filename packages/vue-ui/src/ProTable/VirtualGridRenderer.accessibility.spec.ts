// @vitest-environment jsdom
import { mount } from '@vue/test-utils'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import VirtualGridRenderer from './VirtualGridRenderer.vue'
import { TableController } from './engine/core/TableController'
import type { ProTableColumn } from './engine/types/column'

interface MockVirtualItem {
  key: string
  index: number
  start: number
  size: number
  end: number
}

const virtualizerHarness = vi.hoisted(() => ({
  virtualItems: [] as MockVirtualItem[],
  totalSize: 0,
  resizeItem: vi.fn(),
  scrollToIndex: vi.fn(),
}))

vi.mock('@tanstack/vue-virtual', async () => {
  const { computed } = await import('vue')
  return {
    useVirtualizer: () =>
      computed(() => ({
        getVirtualItems: () => virtualizerHarness.virtualItems,
        getTotalSize: () => virtualizerHarness.totalSize,
        resizeItem: virtualizerHarness.resizeItem,
        scrollToIndex: virtualizerHarness.scrollToIndex,
      })),
  }
})

type Row = Record<string, unknown>

const columns: ProTableColumn<Row>[] = [
  { id: 'locked', field: 'locked', title: 'Locked', pinned: 'left', minWidth: '90px' },
  { id: 'name', field: 'name', title: 'Name', minWidth: '140px' },
  { id: 'status', field: 'status', title: 'Status', minWidth: '120px' },
  { id: 'action', field: 'action', title: 'Action', pinned: 'right', minWidth: '100px' },
]

function createRows(count = 10): Row[] {
  return Array.from({ length: count }, (_entry, index) => ({
    id: `row-${index + 1}`,
    locked: `L${index + 1}`,
    name: `Name ${index + 1}`,
    status: index % 2 === 0 ? 'ready' : 'guarded',
    action: `A${index + 1}`,
  }))
}

function setVirtualItems(indexes: number[]): void {
  virtualizerHarness.virtualItems = indexes.map(index => ({
    key: String(index),
    index,
    start: index * 40,
    size: 40,
    end: index * 40 + 40,
  }))
  virtualizerHarness.totalSize = 400
}

function mountGrid(
  options: {
    loading?: boolean
    selectable?: false | 'single' | 'checkbox'
    columns?: ProTableColumn<Row>[]
    sortMode?: 'single' | 'multiple'
  } = {}
) {
  const data = createRows()
  const controller = new TableController<Row>({
    columns: options.columns ?? columns,
    data,
    rowKey: 'id',
    sortMode: options.sortMode,
    paginationEnabled: false,
  })

  const wrapper = mount(VirtualGridRenderer, {
    attachTo: document.body,
    props: {
      controller,
      columns: options.columns ?? columns,
      data,
      loading: options.loading ?? false,
      selectable: options.selectable ?? false,
    },
    global: {
      stubs: {
        Icons: true,
        ProTableCell: {
          props: ['node', 'alignClass', 'extraClass'],
          template: '<span class="pro-table-cell-stub">{{ node }}</span>',
        },
      },
    },
  })

  return { wrapper, controller }
}

function headerByText(wrapper: ReturnType<typeof mount>, text: string) {
  const header = wrapper
    .findAll('[role="columnheader"]')
    .find(candidate => candidate.text() === text)
  if (!header) throw new Error(`No virtual header cell containing "${text}"`)
  return header
}

describe('VirtualGridRenderer accessibility contract', () => {
  beforeAll(() => {
    if (!('ResizeObserver' in globalThis)) {
      ;(globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver = class {
        observe(): void {}
        unobserve(): void {}
        disconnect(): void {}
      }
    }
    if (!Element.prototype.scrollIntoView) {
      Element.prototype.scrollIntoView = vi.fn()
    }
  })

  beforeEach(() => {
    setVirtualItems([0, 1, 2])
    virtualizerHarness.resizeItem.mockClear()
    virtualizerHarness.scrollToIndex.mockClear()
    document.body.innerHTML = ''
  })

  it('exposes grid counts, virtual row offsets, and pinned column indexes', () => {
    setVirtualItems([4, 5])
    const { wrapper, controller } = mountGrid({ loading: true })

    try {
      const grid = wrapper.get('[role="grid"]')
      expect(grid.attributes('tabindex')).toBe('0')
      expect(grid.attributes('aria-rowcount')).toBe('11')
      expect(grid.attributes('aria-colcount')).toBe('4')
      expect(grid.attributes('aria-busy')).toBe('true')
      expect(wrapper.findAll('[tabindex="0"]')).toHaveLength(1)

      const headers = wrapper.findAll('[role="columnheader"]')
      expect(headers.map(header => header.attributes('aria-colindex'))).toEqual([
        '1',
        '2',
        '3',
        '4',
      ])

      expect(wrapper.findAll('[role="row"][aria-rowindex="6"]')).toHaveLength(1)
      expect(wrapper.findAll('[role="row"][aria-rowindex="7"]')).toHaveLength(1)

      const firstRenderedRowCells = wrapper
        .findAll('[role="gridcell"]')
        .filter(cell => cell.attributes('id')?.includes('-r5-'))
      expect(firstRenderedRowCells.map(cell => cell.attributes('aria-colindex')).sort()).toEqual([
        '1',
        '2',
        '3',
        '4',
      ])
    } finally {
      wrapper.unmount()
      controller.destroy()
    }
  })

  it('moves the active grid cell with arrow, Home, and End keys', async () => {
    const { wrapper, controller } = mountGrid()

    try {
      const grid = wrapper.get('[role="grid"]')
      expect(grid.attributes('aria-activedescendant')).toContain('-r1-c1')

      await grid.trigger('keydown', { key: 'ArrowRight' })
      expect(grid.attributes('aria-activedescendant')).toContain('-r1-c2')

      await grid.trigger('keydown', { key: 'ArrowDown' })
      expect(grid.attributes('aria-activedescendant')).toContain('-r2-c2')
      expect(virtualizerHarness.scrollToIndex).toHaveBeenLastCalledWith(1, { align: 'auto' })

      await grid.trigger('keydown', { key: 'End' })
      expect(grid.attributes('aria-activedescendant')).toContain('-r2-c4')

      await grid.trigger('keydown', { key: 'Home' })
      expect(grid.attributes('aria-activedescendant')).toContain('-r2-c1')
    } finally {
      wrapper.unmount()
      controller.destroy()
    }
  })

  it('keeps Enter row selection on the active virtual row', async () => {
    const { wrapper, controller } = mountGrid({ selectable: 'single' })

    try {
      const grid = wrapper.get('[role="grid"]')
      await grid.trigger('keydown', { key: 'ArrowDown' })
      await grid.trigger('keydown', { key: 'Enter' })

      expect(controller.state.selection.selectedRows).toHaveLength(1)
      expect(controller.state.selection.selectedRows[0]?.id).toBe('row-2')
    } finally {
      wrapper.unmount()
      controller.destroy()
    }
  })

  it('supports opt-in multi-column sorting while keeping aria-sort on the primary column', async () => {
    const sortableColumns: ProTableColumn<Row>[] = columns.map(col =>
      col.id === 'name' || col.id === 'status' ? { ...col, sortable: true } : col
    )
    const { wrapper, controller } = mountGrid({
      columns: sortableColumns,
      sortMode: 'multiple',
    })

    try {
      await headerByText(wrapper, 'Name').find('[data-pro-table-sort="true"]').trigger('click')
      await headerByText(wrapper, 'Status').find('[data-pro-table-sort="true"]').trigger('click')

      expect(controller.state.sort).toEqual({
        field: 'name',
        direction: 'asc',
        multi: [
          { field: 'name', direction: 'asc' },
          { field: 'status', direction: 'asc' },
        ],
      })
      expect(headerByText(wrapper, 'Name').attributes('aria-sort')).toBe('ascending')
      expect(headerByText(wrapper, 'Status').attributes('aria-sort')).toBe('none')
      expect(
        headerByText(wrapper, 'Status')
          .find('[data-pro-table-sort="true"]')
          .attributes('aria-label')
      ).toContain('priority 2')
    } finally {
      wrapper.unmount()
      controller.destroy()
    }
  })
})
