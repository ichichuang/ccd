// @vitest-environment jsdom
import { flushPromises, mount } from '@vue/test-utils'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import type { ComponentCustomProperties } from 'vue'
import { nextTick } from 'vue'
import ProTable from './ProTable.vue'
import type { ProTableColumn } from './engine/types/column'

// ProTable only consumes `t` for static labels; a passthrough keeps the mount
// free of an i18n instance while exercising the real DataTable + Popover path.
vi.mock('vue-i18n', async importOriginal => {
  const actual = await importOriginal<typeof import('vue-i18n')>()
  return { ...actual, useI18n: () => ({ t: (key: string) => key }) }
})

// PrimeVue DataTable / overlay components reference ResizeObserver and
// matchMedia, neither of which jsdom provides.
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

// PrimeVue overlays read `$primevue.config.zIndex.*` in their transition-enter
// hook (before emitting `@show`); provide the default zIndex map so the popover
// open lifecycle (and thus aria-expanded / open-state) completes under jsdom.
const primeVueGlobalProperties = {
  $primevue: { config: { zIndex: { modal: 1100, overlay: 1000, menu: 1000, tooltip: 1100 } } },
} as unknown as ComponentCustomProperties & Record<string, unknown>

/**
 * Mount ProTable through the DEFAULT (PrimeVue DataTable) render path with the
 * real DataTable/Column/Popover/InputText/Select so the per-column filter UI
 * (PT-UI-03) can be asserted. `name`/`team` are text-filterable, `role` is a
 * select filter, and `status` is intentionally NOT filterable.
 */
function mountTable(): ReturnType<typeof mount> {
  const columns: ProTableColumn[] = [
    { id: 'name', title: 'Name', field: 'name', sortable: true, filterable: true },
    { id: 'team', title: 'Team', field: 'team', filterable: true },
    {
      id: 'role',
      title: 'Role',
      field: 'role',
      filterable: true,
      filterType: 'select',
      filterOptions: [
        { label: 'Admin', value: 'admin' },
        { label: 'User', value: 'user' },
      ],
    },
    { id: 'joinedAt', title: 'Joined', field: 'joinedAt', filterable: true, filterType: 'date' },
    { id: 'status', title: 'Status', field: 'status' },
  ]
  const data: Array<Record<string, unknown>> = [
    { name: 'Alpha', team: 'Core', role: 'admin', joinedAt: '2026-01-08', status: 'on' },
    { name: 'Bravo', team: 'Core', role: 'user', joinedAt: '2026-01-09', status: 'off' },
    { name: 'Charlie', team: 'Edge', role: 'user', joinedAt: '2026-01-10', status: 'on' },
  ]
  return mount(ProTable, {
    attachTo: document.body,
    props: { columns, data, heightMode: 'auto', pagination: false, showToolbar: false },
    global: {
      config: { globalProperties: primeVueGlobalProperties },
      stubs: {
        ProTableToolbar: true,
        ProTablePagination: true,
        VirtualGridRenderer: true,
        DatePicker: {
          name: 'DatePicker',
          template: '<div class="p-datepicker" data-pro-table-filter-input />',
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

const bodyRowCount = (wrapper: ReturnType<typeof mount>): number =>
  wrapper.findAll('tbody tr').length

async function settle(): Promise<void> {
  // Flush PrimeVue's overlay open lifecycle (microtask-scheduled) so the
  // teleported popover content + filtered rows settle before assertions.
  await flushPromises()
  await nextTick()
  await flushPromises()
}

describe('ProTable per-column filtering UI (PT-UI-03)', () => {
  it('shows a filter trigger only on filterable columns', async () => {
    const wrapper = mountTable()
    try {
      await settle()
      expect(headerByText(wrapper, 'Name').find('[data-pro-table-filter-toggle]').exists()).toBe(
        true
      )
      expect(headerByText(wrapper, 'Team').find('[data-pro-table-filter-toggle]').exists()).toBe(
        true
      )
      expect(headerByText(wrapper, 'Role').find('[data-pro-table-filter-toggle]').exists()).toBe(
        true
      )
      expect(headerByText(wrapper, 'Joined').find('[data-pro-table-filter-toggle]').exists()).toBe(
        true
      )
      // Non-filterable column must NOT expose any filter affordance.
      expect(headerByText(wrapper, 'Status').find('[data-pro-table-filter-toggle]').exists()).toBe(
        false
      )
    } finally {
      wrapper.unmount()
    }
  })

  it('exposes accessible state on the filter trigger and opens a popover with an input', async () => {
    const wrapper = mountTable()
    try {
      await settle()
      const trigger = headerByText(wrapper, 'Name').find('[data-pro-table-filter-toggle]')
      // Static accessibility contract on the trigger.
      expect(trigger.attributes('aria-haspopup')).toBe('dialog')
      expect(trigger.attributes('aria-expanded')).toBe('false')
      expect(trigger.attributes('aria-pressed')).toBe('false')
      expect(trigger.attributes('aria-label')).toContain('Name')

      // Activating the trigger opens the filter popover (content teleported to <body>).
      await trigger.trigger('click')
      await settle()
      expect(document.body.querySelector('[data-pro-table-filter-popover]')).toBeTruthy()
      expect(document.body.querySelector('input[data-pro-table-filter-input]')).toBeTruthy()
    } finally {
      wrapper.unmount()
    }
  })

  it('filters visible rows when a value is entered, and announces the active state', async () => {
    const wrapper = mountTable()
    try {
      await settle()
      expect(bodyRowCount(wrapper)).toBe(3)

      await headerByText(wrapper, 'Name').find('[data-pro-table-filter-toggle]').trigger('click')
      await settle()
      const input = document.body.querySelector(
        'input[data-pro-table-filter-input]'
      ) as HTMLInputElement | null
      expect(input).toBeTruthy()
      input!.value = 'Alpha'
      input!.dispatchEvent(new Event('input', { bubbles: true }))
      await settle()

      // Rows reduced to the single match through the existing engine contract.
      expect(bodyRowCount(wrapper)).toBe(1)
      const events = wrapper.emitted('filter-change')
      expect(events).toBeTruthy()
      expect((events?.at(-1)?.[0] as { columns: Record<string, unknown> }).columns.name).toBe(
        'Alpha'
      )
      // Active filter state is announced on the trigger.
      const trigger = headerByText(wrapper, 'Name').find('[data-pro-table-filter-toggle]')
      expect(trigger.attributes('aria-pressed')).toBe('true')
      expect(trigger.attributes('data-pro-table-filter-active')).toBe('true')
    } finally {
      wrapper.unmount()
    }
  })

  it('clears a filter and restores rows', async () => {
    const wrapper = mountTable()
    try {
      await settle()
      await headerByText(wrapper, 'Name').find('[data-pro-table-filter-toggle]').trigger('click')
      await settle()
      const input = document.body.querySelector(
        'input[data-pro-table-filter-input]'
      ) as HTMLInputElement
      input.value = 'Alpha'
      input.dispatchEvent(new Event('input', { bubbles: true }))
      await settle()
      expect(bodyRowCount(wrapper)).toBe(1)

      const clearBtn = document.body.querySelector(
        '[data-pro-table-filter-clear]'
      ) as HTMLButtonElement | null
      expect(clearBtn).toBeTruthy()
      clearBtn!.click()
      await settle()

      expect(bodyRowCount(wrapper)).toBe(3)
      expect(
        headerByText(wrapper, 'Name')
          .find('[data-pro-table-filter-toggle]')
          .attributes('data-pro-table-filter-active')
      ).toBeUndefined()
    } finally {
      wrapper.unmount()
    }
  })

  it('supports multiple simultaneous column filters (AND), matching the engine contract', async () => {
    const wrapper = mountTable()
    try {
      await settle()
      // Filter Team = "Core" → Alpha + Bravo.
      await headerByText(wrapper, 'Team').find('[data-pro-table-filter-toggle]').trigger('click')
      await settle()
      let input = document.body.querySelector(
        'input[data-pro-table-filter-input]'
      ) as HTMLInputElement
      input.value = 'Core'
      input.dispatchEvent(new Event('input', { bubbles: true }))
      await settle()
      expect(bodyRowCount(wrapper)).toBe(2)
      // Close the shared popover (Enter) before opening another column's filter —
      // the engine retains the Team value in controller state regardless.
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
      await settle()

      // Add Name = "Alpha" → within Core, only Alpha remains (AND semantics).
      await headerByText(wrapper, 'Name').find('[data-pro-table-filter-toggle]').trigger('click')
      await settle()
      input = document.body.querySelector('input[data-pro-table-filter-input]') as HTMLInputElement
      input.value = 'Alpha'
      input.dispatchEvent(new Event('input', { bubbles: true }))
      await settle()

      expect(bodyRowCount(wrapper)).toBe(1)
      expect(
        headerByText(wrapper, 'Team')
          .find('[data-pro-table-filter-toggle]')
          .attributes('data-pro-table-filter-active')
      ).toBe('true')
      expect(
        headerByText(wrapper, 'Name')
          .find('[data-pro-table-filter-toggle]')
          .attributes('data-pro-table-filter-active')
      ).toBe('true')
    } finally {
      wrapper.unmount()
    }
  })

  it('renders a select control for select-type filter columns', async () => {
    const wrapper = mountTable()
    try {
      await settle()
      await headerByText(wrapper, 'Role').find('[data-pro-table-filter-toggle]').trigger('click')
      await settle()
      // The select-type filter renders a PrimeVue Select, not a text input.
      expect(document.body.querySelector('[data-pro-table-filter-popover] .p-select')).toBeTruthy()
    } finally {
      wrapper.unmount()
    }
  })

  it('renders a DatePicker control for date-type filter columns', async () => {
    const wrapper = mountTable()
    try {
      await settle()
      await headerByText(wrapper, 'Joined').find('[data-pro-table-filter-toggle]').trigger('click')
      await settle()
      // The date-type filter renders a PrimeVue DatePicker, not the fallback text input.
      expect(
        document.body.querySelector('[data-pro-table-filter-popover] .p-datepicker')
      ).toBeTruthy()
    } finally {
      wrapper.unmount()
    }
  })

  it('keeps Step-13 sorting working on the same table', async () => {
    const wrapper = mountTable()
    try {
      await settle()
      await headerByText(wrapper, 'Name').find('[data-pro-table-sort="true"]').trigger('click')
      await nextTick()
      expect(headerByText(wrapper, 'Name').attributes('aria-sort')).toBe('ascending')
    } finally {
      wrapper.unmount()
    }
  })

  // NOTE: the "Escape closes the filter popover without exiting fullscreen" guard
  // relies on the Popover's `@show` (→ columnFilterPopoverOpen) firing, which the
  // PrimeVue overlay does NOT do under jsdom (its transition-enter hook short-circuits
  // on DOM APIs jsdom lacks). The guard is identical to the toolbar-popover guard that
  // IS behaviorally proven in ProTable.fullscreenEscape.spec.ts (PT-ESC-02) and is
  // locked here structurally in ProTable.surface.spec.ts (PT-UI-03).
})
