// @vitest-environment jsdom
import { mount } from '@vue/test-utils'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import VirtualGridRenderer from './VirtualGridRenderer.vue'
import { TableController } from './engine/core/TableController'
import type { ProTableColumn, ProTableColumnGroupRow } from './engine/types/column'

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

const columnGroups: ProTableColumnGroupRow[] = [
  [
    { id: 'record', title: 'Record', columnIds: ['locked', 'name', 'status'] },
    { id: 'operations', title: 'Operations', columnIds: ['action'] },
  ],
  [
    { id: 'identity', title: 'Identity', columnIds: ['locked', 'name'] },
    { id: 'state', title: 'State', columnIds: ['status', 'action'] },
  ],
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
    columnGroups?: ProTableColumnGroupRow[]
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
      columnGroups: options.columnGroups,
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

function groupHeaders(wrapper: ReturnType<typeof mount>, groupId: string) {
  return wrapper.findAll(`[data-pro-table-column-group="${groupId}"]`)
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
      expect(wrapper.findAll('[data-pro-table-column-group]')).toHaveLength(0)
      expect(wrapper.findAll('[role="row"][aria-rowindex="1"]')).toHaveLength(1)

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

  it('renders grouped headers and offsets data row indexes when columnGroups are provided', () => {
    setVirtualItems([4, 5])
    const { wrapper, controller } = mountGrid({ columnGroups })

    try {
      const grid = wrapper.get('[role="grid"]')
      expect(grid.attributes('aria-rowcount')).toBe('13')
      expect(wrapper.findAll('[role="row"][aria-rowindex="1"]')).toHaveLength(1)
      expect(wrapper.findAll('[role="row"][aria-rowindex="2"]')).toHaveLength(1)
      expect(wrapper.findAll('[role="row"][aria-rowindex="3"]')).toHaveLength(1)

      expect(groupHeaders(wrapper, 'record')).toHaveLength(2)
      expect(groupHeaders(wrapper, 'record')[0].attributes('aria-colindex')).toBe('1')
      expect(groupHeaders(wrapper, 'record')[1].attributes('aria-colindex')).toBe('2')
      expect(groupHeaders(wrapper, 'record')[1].attributes('aria-colspan')).toBe('2')
      expect(groupHeaders(wrapper, 'operations')).toHaveLength(1)
      expect(groupHeaders(wrapper, 'operations')[0].attributes('aria-colindex')).toBe('4')

      expect(wrapper.findAll('[role="row"][aria-rowindex="8"]')).toHaveLength(1)
      expect(wrapper.findAll('[role="row"][aria-rowindex="9"]')).toHaveLength(1)
    } finally {
      wrapper.unmount()
      controller.destroy()
    }
  })

  it('derives grouped spans from ordered visible columns', () => {
    const reorderedColumns: ProTableColumn<Row>[] = [columns[0], columns[2], columns[1], columns[3]]
    const orderedGroups: ProTableColumnGroupRow[] = [
      [{ id: 'identity', title: 'Identity', columnIds: ['name', 'status'] }],
    ]
    const { wrapper, controller } = mountGrid({
      columns: reorderedColumns,
      columnGroups: orderedGroups,
    })

    try {
      const identity = groupHeaders(wrapper, 'identity')
      expect(identity).toHaveLength(1)
      expect(identity[0].attributes('aria-colindex')).toBe('2')
      expect(identity[0].attributes('aria-colspan')).toBe('2')

      const leafHeaders = wrapper
        .findAll('[role="row"][aria-rowindex="2"] [role="columnheader"]')
        .map(header => header.text())
      expect(leafHeaders).toEqual(['Locked', 'Status', 'Name', 'Action'])
    } finally {
      wrapper.unmount()
      controller.destroy()
    }
  })

  it('splits pinned group cells across left, center, and right sections', () => {
    const splitGroups: ProTableColumnGroupRow[] = [
      [{ id: 'full', title: 'Full row', columnIds: ['locked', 'name', 'status', 'action'] }],
    ]
    const { wrapper, controller } = mountGrid({ columnGroups: splitGroups })

    try {
      const splitCells = groupHeaders(wrapper, 'full')
      expect(splitCells).toHaveLength(3)
      expect(splitCells.map(cell => cell.attributes('aria-colindex'))).toEqual(['1', '2', '4'])
      expect(splitCells.map(cell => cell.attributes('aria-colspan') ?? '1')).toEqual([
        '1',
        '2',
        '1',
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

  it('keeps keyboard navigation and active descendant stable under grouped headers', async () => {
    const { wrapper, controller } = mountGrid({ columnGroups })

    try {
      const grid = wrapper.get('[role="grid"]')
      expect(grid.attributes('aria-activedescendant')).toContain('-r1-c1')

      await grid.trigger('keydown', { key: 'ArrowRight' })
      await grid.trigger('keydown', { key: 'ArrowDown' })

      expect(grid.attributes('aria-activedescendant')).toContain('-r2-c2')
      expect(virtualizerHarness.scrollToIndex).toHaveBeenLastCalledWith(1, { align: 'auto' })
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

  it('selects an inclusive checkbox range with Shift-click', async () => {
    setVirtualItems([0, 1, 2, 3])
    const { wrapper, controller } = mountGrid({ selectable: 'checkbox' })

    try {
      await wrapper.findAll('[role="row"][aria-rowindex="2"]')[0].trigger('click')
      await wrapper.findAll('[role="row"][aria-rowindex="5"]')[0].trigger('click', {
        shiftKey: true,
      })

      expect(controller.state.selection.selectedRowKeys).toEqual([
        'row-1',
        'row-2',
        'row-3',
        'row-4',
      ])
      expect(
        wrapper.findAll('[role="row"][aria-rowindex="4"]')[0].attributes('aria-selected')
      ).toBe('true')
    } finally {
      wrapper.unmount()
      controller.destroy()
    }
  })

  it('keeps keyboard Enter activation as a plain checkbox toggle', async () => {
    const { wrapper, controller } = mountGrid({ selectable: 'checkbox' })

    try {
      const grid = wrapper.get('[role="grid"]')
      await wrapper.findAll('[role="row"][aria-rowindex="2"]')[0].trigger('click')
      await grid.trigger('keydown', { key: 'ArrowDown' })
      await grid.trigger('keydown', { key: 'Enter' })

      expect(controller.state.selection.selectedRowKeys).toEqual(['row-1', 'row-2'])
      expect(grid.attributes('aria-activedescendant')).toContain('-r2-c1')
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

  it('keeps leaf sorting active under grouped virtual headers', async () => {
    const sortableColumns: ProTableColumn<Row>[] = columns.map(col =>
      col.id === 'name' ? { ...col, sortable: true } : col
    )
    const { wrapper, controller } = mountGrid({
      columns: sortableColumns,
      columnGroups,
    })

    try {
      await headerByText(wrapper, 'Name').find('[data-pro-table-sort="true"]').trigger('click')

      expect(controller.state.sort).toMatchObject({ field: 'name', direction: 'asc' })
      expect(headerByText(wrapper, 'Name').attributes('aria-sort')).toBe('ascending')
      expect(groupHeaders(wrapper, 'record')[1].attributes('aria-sort')).toBeUndefined()
    } finally {
      wrapper.unmount()
      controller.destroy()
    }
  })
})
