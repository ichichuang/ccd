// @vitest-environment jsdom
import { flushPromises, mount } from '@vue/test-utils'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import type { ComponentCustomProperties } from 'vue'
import { nextTick } from 'vue'
import ProTable from './ProTable.vue'
import type { ProTableColumn } from './engine/types/column'

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
      locale: {
        aria: {
          selectAll: 'Select all',
          unselectAll: 'Unselect all',
          selectRow: 'Select row',
          unselectRow: 'Unselect row',
        },
      },
      zIndex: { modal: 1100, overlay: 1000, menu: 1000, tooltip: 1100 },
    },
  },
} as unknown as ComponentCustomProperties & Record<string, unknown>

type Row = { id: string; name: string } & Record<string, unknown>

interface ProTableSelectionExpose {
  getSelection: () => Row[]
}

const columns: ProTableColumn[] = [{ id: 'name', title: 'Name', field: 'name' }]

const data: Row[] = [
  { id: '1', name: 'Alpha' },
  { id: '2', name: 'Bravo' },
  { id: '3', name: 'Charlie' },
  { id: '4', name: 'Delta' },
  { id: '5', name: 'Echo' },
]

function mountTable(
  options: {
    selectable?: false | 'single' | 'checkbox'
    maxSelection?: number
    selected?: Row[] | Row
  } = {}
) {
  return mount(ProTable, {
    attachTo: document.body,
    props: {
      columns,
      data,
      heightMode: 'auto',
      pagination: false,
      showToolbar: false,
      selectable: options.selectable ?? 'checkbox',
      maxSelection: options.maxSelection,
      selected: options.selected,
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

async function settle(): Promise<void> {
  await flushPromises()
  await nextTick()
  await flushPromises()
}

function bodyRows(wrapper: ReturnType<typeof mount>) {
  return wrapper.findAll('tbody tr')
}

function rowCheckboxes(wrapper: ReturnType<typeof mount>) {
  return wrapper.findAll('tbody input[type="checkbox"]')
}

function isRowArray(value: unknown): value is Row[] {
  return (
    Array.isArray(value) &&
    value.every(
      (row: unknown) =>
        typeof row === 'object' && row !== null && 'id' in row && typeof row.id === 'string'
    )
  )
}

function selectedIdsFromLastEmit(wrapper: ReturnType<typeof mount>): string[] {
  const payload = wrapper.emitted('update:selected')?.at(-1)?.[0]
  if (!isRowArray(payload)) return []
  return payload.map(row => row.id)
}

describe('ProTable DataTable range selection', () => {
  it('keeps single selection behavior unchanged when Shift-clicking rows', async () => {
    const wrapper = mountTable({ selectable: 'single' })
    try {
      await settle()
      await bodyRows(wrapper)[0].trigger('click')
      await bodyRows(wrapper)[2].trigger('click', { shiftKey: true })
      await settle()

      expect(selectedIdsFromLastEmit(wrapper)).toEqual(['3'])
    } finally {
      wrapper.unmount()
    }
  })

  it('keeps plain checkbox row clicks additive', async () => {
    const wrapper = mountTable()
    try {
      await settle()
      await bodyRows(wrapper)[0].trigger('click')
      await bodyRows(wrapper)[2].trigger('click')
      await settle()

      expect(selectedIdsFromLastEmit(wrapper)).toEqual(['1', '3'])
    } finally {
      wrapper.unmount()
    }
  })

  it('selects an inclusive checkbox range with Shift-click', async () => {
    const wrapper = mountTable()
    try {
      await settle()
      await bodyRows(wrapper)[0].trigger('click')
      await bodyRows(wrapper)[3].trigger('click', { shiftKey: true })
      await settle()

      expect(selectedIdsFromLastEmit(wrapper)).toEqual(['1', '2', '3', '4'])
    } finally {
      wrapper.unmount()
    }
  })

  it('selects an inclusive range from checkbox-cell Shift-clicks', async () => {
    const wrapper = mountTable()
    try {
      await settle()
      await rowCheckboxes(wrapper)[0].trigger('click')
      await rowCheckboxes(wrapper)[3].trigger('click', { shiftKey: true })
      await settle()

      expect(selectedIdsFromLastEmit(wrapper)).toEqual(['1', '2', '3', '4'])
    } finally {
      wrapper.unmount()
    }
  })

  it('respects maxSelection by truncating checkbox ranges in processed order', async () => {
    const wrapper = mountTable({ maxSelection: 3 })
    try {
      await settle()
      await bodyRows(wrapper)[0].trigger('click')
      await bodyRows(wrapper)[4].trigger('click', { shiftKey: true })
      await settle()

      expect(selectedIdsFromLastEmit(wrapper)).toEqual(['1', '2', '3'])
    } finally {
      wrapper.unmount()
    }
  })

  it('keeps controlled selected sync compatible with subsequent range selection', async () => {
    const wrapper = mountTable({ selected: [data[0]] })
    try {
      await settle()
      expect(
        (wrapper.vm as unknown as ProTableSelectionExpose).getSelection().map(row => row.id)
      ).toEqual(['1'])

      await bodyRows(wrapper)[3].trigger('click', { shiftKey: true })
      await settle()

      expect(selectedIdsFromLastEmit(wrapper)).toEqual(['1', '2', '3', '4'])
    } finally {
      wrapper.unmount()
    }
  })
})
