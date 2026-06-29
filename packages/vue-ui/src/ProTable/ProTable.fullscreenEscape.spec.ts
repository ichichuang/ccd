// @vitest-environment jsdom
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import ProTable from './ProTable.vue'
import type { ProTableColumn } from './engine/types/column'

// ProTable only consumes `t` for static labels; a passthrough keeps the mount
// free of an i18n instance while exercising the real component logic.
vi.mock('vue-i18n', async importOriginal => {
  const actual = await importOriginal<typeof import('vue-i18n')>()
  return { ...actual, useI18n: () => ({ t: (key: string) => key }) }
})

interface FullscreenApi {
  toggleFullscreen: () => void
}

/**
 * Mount ProTable with child components stubbed so the test isolates the
 * region-fullscreen state machine (root `data-pro-table-fullscreen`, dim
 * overlay) and the Escape keyboard contract — not PrimeVue rendering.
 */
function mountProTable(): ReturnType<typeof mount> {
  const columns: ProTableColumn[] = [{ id: 'name', title: 'Name', field: 'name' }]
  const data: Array<Record<string, unknown>> = [{ name: 'Alpha' }, { name: 'Bravo' }]
  return mount(ProTable, {
    attachTo: document.body,
    props: { columns, data },
    global: {
      stubs: {
        ProTableToolbar: true,
        ProTablePagination: true,
        VirtualGridRenderer: true,
        DataTable: true,
        Column: true,
        ProgressSpinner: true,
        Button: true,
        Tag: true,
        EmptyState: true,
        Icons: true,
        ProTableCell: true,
      },
    },
  })
}

function pressEscape(): void {
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
}

describe('ProTable region fullscreen — Escape contract (PT-ESC-01)', () => {
  it('exits region fullscreen on Escape, clears state, preserves body overflow, keeps table usable', async () => {
    const wrapper = mountProTable()
    try {
      await nextTick()
      const bodyOverflowBefore = document.body.style.overflow
      const root = () => wrapper.get('[data-pro-table-root]')
      const overlayPresent = () => wrapper.find('[data-pro-table-fullscreen-overlay]').exists()

      // Baseline: not fullscreen.
      expect(root().attributes('data-pro-table-fullscreen')).toBeUndefined()
      expect(overlayPresent()).toBe(false)

      // Enter region fullscreen via the public toggle (same path as the toolbar button).
      ;(wrapper.vm as unknown as FullscreenApi).toggleFullscreen()
      await nextTick()
      await nextTick()
      expect(root().attributes('data-pro-table-fullscreen')).toBe('true')
      expect(overlayPresent()).toBe(true)
      expect(root().classes()).toContain('z-overlay')

      // Press Escape — the desired behavior: fullscreen exits.
      pressEscape()
      await nextTick()
      await nextTick()

      // Fullscreen state + overlay cleared.
      expect(root().attributes('data-pro-table-fullscreen')).toBeUndefined()
      expect(overlayPresent()).toBe(false)
      // Table remains mounted and returned to its normal (non-fixed) layout.
      expect(wrapper.find('[data-pro-table-root]').exists()).toBe(true)
      expect(root().classes()).not.toContain('z-overlay')
      // Body overflow is never mutated by the region-scoped fullscreen.
      expect(document.body.style.overflow).toBe(bodyOverflowBefore)
    } finally {
      wrapper.unmount()
    }
  })

  it('ignores Escape when fullscreen is not active without throwing or mutating state', async () => {
    const wrapper = mountProTable()
    try {
      await nextTick()
      const root = () => wrapper.get('[data-pro-table-root]')
      const bodyOverflowBefore = document.body.style.overflow

      expect(root().attributes('data-pro-table-fullscreen')).toBeUndefined()
      expect(() => pressEscape()).not.toThrow()
      await nextTick()

      expect(root().attributes('data-pro-table-fullscreen')).toBeUndefined()
      expect(wrapper.find('[data-pro-table-fullscreen-overlay]').exists()).toBe(false)
      expect(document.body.style.overflow).toBe(bodyOverflowBefore)
    } finally {
      wrapper.unmount()
    }
  })

  it('removes the Escape listener on unmount', async () => {
    const wrapper = mountProTable()
    await nextTick()
    ;(wrapper.vm as unknown as FullscreenApi).toggleFullscreen()
    await nextTick()
    await nextTick()
    expect(wrapper.get('[data-pro-table-root]').attributes('data-pro-table-fullscreen')).toBe(
      'true'
    )

    wrapper.unmount()

    // After teardown the scoped listener must be gone — a stray Escape is inert.
    expect(() => pressEscape()).not.toThrow()
  })

  it('defers fullscreen exit while a toolbar popover is open, then exits on the next Escape (PT-ESC-02)', async () => {
    const wrapper = mountProTable()
    try {
      await nextTick()
      const root = () => wrapper.get('[data-pro-table-root]')
      const toolbar = wrapper.findComponent({ name: 'ProTableToolbar' })
      expect(toolbar.exists()).toBe(true)

      // Enter region fullscreen.
      ;(wrapper.vm as unknown as FullscreenApi).toggleFullscreen()
      await nextTick()
      await nextTick()
      expect(root().attributes('data-pro-table-fullscreen')).toBe('true')

      // A density / column-settings popover is open. PrimeVue closes it on Escape
      // without preventDefault, so ProTable must not also collapse fullscreen.
      toolbar.vm.$emit('popover-toggle', true)
      await nextTick()
      pressEscape()
      await nextTick()
      await nextTick()
      expect(root().attributes('data-pro-table-fullscreen')).toBe('true')

      // Popover closed → the next Escape is free to exit fullscreen.
      toolbar.vm.$emit('popover-toggle', false)
      await nextTick()
      pressEscape()
      await nextTick()
      await nextTick()
      expect(root().attributes('data-pro-table-fullscreen')).toBeUndefined()
    } finally {
      wrapper.unmount()
    }
  })

  it('renders loading and empty states as polite live regions (PT-UI-02)', async () => {
    const columns: ProTableColumn[] = [{ id: 'name', title: 'Name', field: 'name' }]
    const wrapper = mount(ProTable, {
      attachTo: document.body,
      props: { columns, data: [] as Array<Record<string, unknown>>, loading: true },
      global: {
        stubs: {
          ProTableToolbar: true,
          ProTablePagination: true,
          VirtualGridRenderer: true,
          DataTable: true,
          Column: true,
          ProgressSpinner: true,
          Button: true,
          Tag: true,
          EmptyState: true,
          Icons: true,
          ProTableCell: true,
        },
      },
    })
    try {
      await nextTick()
      const loading = wrapper.find('.pro-table-loading-overlay')
      expect(loading.exists()).toBe(true)
      expect(loading.attributes('role')).toBe('status')
      expect(loading.attributes('aria-live')).toBe('polite')
      expect(loading.attributes('aria-busy')).toBe('true')

      // Flip to a settled, empty result set.
      await wrapper.setProps({ loading: false })
      await nextTick()
      const status = wrapper.findAll('[role="status"]')
      // Both the (now hidden) overlay contract and the empty region are polite status regions.
      expect(status.length).toBeGreaterThanOrEqual(1)
      const emptyRegion = status.find(node => node.attributes('aria-live') === 'polite')
      expect(emptyRegion).toBeTruthy()
    } finally {
      wrapper.unmount()
    }
  })
})
