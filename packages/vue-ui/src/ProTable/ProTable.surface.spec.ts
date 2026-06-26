import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const currentDir = dirname(fileURLToPath(import.meta.url))
const source = readFileSync(join(currentDir, 'ProTable.vue'), 'utf8')
const toolbarSource = readFileSync(join(currentDir, 'components', 'ProTableToolbar.vue'), 'utf8')

describe('ProTable overlay surface contract', () => {
  it('uses package-owned CSS for the loading overlay without backdrop blur', () => {
    expect(source).toContain('pro-table-loading-overlay')
    expect(source).toContain('.pro-table-loading-overlay')
    expect(source).toContain(':global(.dark .pro-table-loading-overlay)')
    expect(source).not.toContain(':global(.dark) .pro-table-loading-overlay')
    expect(source).not.toContain('bg-background/70')
    expect(source).not.toContain('backdrop-blur-md')
    expect(source).not.toContain('backdrop-filter: blur')
  })

  it('keeps fullscreen scoped to the table region with a stable state contract', () => {
    expect(source).toContain('data-pro-table-root')
    expect(source).toContain('data-pro-table-fullscreen')
    expect(source).toContain('fullscreenWorkspaceStyle')
    expect(source).toContain('findFullscreenWorkspaceElement')
    expect(source).toContain('findFixedContainingBlock')
    expect(source).not.toContain('<Teleport')
    expect(source).not.toContain('to="body"')
    expect(source).not.toContain('fixed inset-0')
    expect(source).not.toContain('document.body.style.overflow')
    expect(toolbarSource).toContain('aria-pressed')
    expect(toolbarSource).toContain('data-pro-table-fullscreen-toggle')
    expect(toolbarSource).toContain('fullscreenControlLabel')
  })

  it('wires a scoped Escape keyboard exit for region fullscreen (PT-ESC-01)', () => {
    // Escape must exit region fullscreen, mirroring the native Fullscreen affordance.
    expect(source).toContain("event.key !== 'Escape'")
    expect(source).toContain('exitFullscreen()')
    // The keydown listener is registered through VueUse against a target that is
    // null unless fullscreen is active — i.e. no permanent global keydown listener.
    expect(source).toContain('fullscreenKeyboardTarget')
    expect(source).toContain("useEventListener(fullscreenKeyboardTarget, 'keydown'")
    expect(source).toContain('isFullscreen.value ? proTableRootView.value : null')
    // A keypress already consumed by a nested overlay must not be hijacked.
    expect(source).toContain('event.defaultPrevented')
  })

  it('provides a fullscreen dim overlay that separates the table from surrounding content', () => {
    // The overlay must exist as a distinct element for testing and styling
    expect(source).toContain('data-pro-table-fullscreen-overlay')
    // Overlay must use fixed positioning within the workspace (not viewport-filling)
    expect(source).toContain('fixed')
    // Overlay must dim surrounding content with semantic tokens, not raw neutral utilities
    expect(source).toContain('pro-table-fullscreen-overlay')
    expect(source).toContain('rgb(var(--foreground) / 24%)')
    expect(source).toContain('rgb(var(--background) / 72%)')
    expect(source).not.toContain('bg-black/')
    expect(source).not.toContain('backdrop-blur')
    // No body-level teleport
    expect(source).not.toContain('<Teleport')
    expect(source).not.toContain('to="body"')
    // No body overflow manipulation
    expect(source).not.toContain('document.body.style.overflow')
  })

  it('exposes stable density menu state hooks for hover and selected feedback', () => {
    expect(toolbarSource).toContain('data-pro-table-density-toggle')
    expect(toolbarSource).toContain('data-pro-table-density-menu')
    expect(toolbarSource).toContain('data-pro-table-density-option')
    expect(toolbarSource).toContain('data-pro-table-density-selected')
    expect(toolbarSource).toContain('pro-table-density-option')
    expect(toolbarSource).toContain('rgb(var(--muted) / 50%)')
    expect(toolbarSource).toContain('rgb(var(--ring))')
  })

  it('exposes popover accessibility state on density and column-settings triggers', () => {
    // Density trigger must communicate popover state to assistive technology
    expect(toolbarSource).toContain('aria-haspopup')
    expect(toolbarSource).toContain('aria-expanded')
    // Column settings trigger must communicate popover state to assistive technology
    const ariaHaspopupCount = (toolbarSource.match(/aria-haspopup/g) || []).length
    expect(ariaHaspopupCount).toBeGreaterThanOrEqual(2)
  })

  it('uses localized fullscreen labels not mixed-language concatenation', () => {
    // Expand label should come from i18n, not from code-concatenated "· expand" / "· restore"
    expect(toolbarSource).not.toContain('· expand')
    expect(toolbarSource).not.toContain('· restore')
    // Should reference translation keys for expand and restore states
    expect(toolbarSource).toContain('proTable.fullscreen')
  })

  it('gives toolbar icon controls a visible keyboard focus ring (A11Y-FOCUS-01)', () => {
    // Toolbar buttons declare outline-none, so they must restore a visible
    // focus-visible affordance via the semantic ring shortcut (not a bare
    // outline removal that leaves keyboard users with no focus indicator).
    expect(toolbarSource).toContain('outline-none')
    expect(toolbarSource).toContain('ring-focus-focus')
  })

  it('wraps loading / empty / error states in localized live regions (PT-UI-02)', () => {
    // Loading overlay announces a busy, localized status.
    expect(source).toContain('aria-busy="true"')
    expect(source).toContain("t('common.loading')")
    // Loading + empty are polite status regions; the fetch error is an assertive alert.
    expect(source).toContain('role="status"')
    expect(source).toContain('aria-live="polite"')
    expect(source).toContain('role="alert"')
    expect(source).toContain('aria-live="assertive"')
  })

  it('lets an open toolbar popover own Escape before fullscreen exits (PT-ESC-02)', () => {
    // The toolbar surfaces its popover open/close state…
    expect(toolbarSource).toContain('popover-toggle')
    // …and ProTable defers the fullscreen Escape exit while a popover is open,
    // so one Escape closes the popover and only the next one leaves fullscreen.
    expect(source).toContain('popover-toggle')
    expect(source).toContain('toolbarPopoverOpen')
    expect(source).toContain('if (toolbarPopoverOpen.value) return')
    // The Escape listener MUST run in the capture phase: PrimeVue's Popover
    // closes on Escape (without preventDefault) during the bubble phase, which
    // flips the popover state before a bubble-phase listener could read it.
    expect(source).toContain(
      "useEventListener(fullscreenKeyboardTarget, 'keydown', handleFullscreenEscape, {"
    )
    expect(source).toContain('capture: true')
  })

  it('gives the DataTable sortable header aria-sort + keyboard semantics (PT-SORT-A11Y)', () => {
    // aria-sort is placed on the real columnheader <th> via the headerCell passthrough.
    expect(source).toContain('function getAriaSort(')
    expect(source).toContain('columnHeaderPt')
    expect(source).toContain("headerCell: { 'aria-sort': ariaSort }")
    expect(source).toContain(':pt="columnHeaderPt(col)"')
    // The header control is a keyboard-operable button only when sortable.
    expect(source).toContain("col.sortable ? 'button' : undefined")
    expect(source).toContain('col.sortable ? 0 : undefined')
    expect(source).toContain('data-pro-table-sort')
    expect(source).toContain('@keydown.enter.prevent="handleSortClick(col)"')
    expect(source).toContain('@keydown.space.prevent="handleSortClick(col)"')
  })

  it('uses semantic design tokens for sort visual feedback and focus (PT-SORT-A11Y)', () => {
    // Active sort emphasis + focus ring come from existing token classes/shortcuts,
    // not hardcoded colors or raw px.
    expect(source).toContain("isColumnSorted(col) ? 'text-primary' : 'text-muted-foreground'")
    expect(source).toContain('ring-focus-focus')
    // No hardcoded hex colors introduced in the sort header markup/logic.
    expect(source).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
  })

  it('exposes a per-column filter trigger gated on filterable columns (PT-UI-03)', () => {
    // Filter UI opts in per column and routes through the existing engine action.
    expect(source).toContain('function isColumnFilterable(')
    expect(source).toContain('col.filterable === true && !!col.field')
    expect(source).toContain('ctrl.setColumnFilter(')
    // The trigger only renders for filterable columns and is an accessible control.
    expect(source).toContain('v-if="isColumnFilterable(col)"')
    expect(source).toContain('data-pro-table-filter-toggle')
    expect(source).toContain('aria-haspopup="dialog"')
    expect(source).toContain('isFilterPopoverOpenFor(col)')
    expect(source).toContain('isColumnFiltered(col)')
    // A clearable control exists.
    expect(source).toContain('data-pro-table-filter-clear')
    expect(source).toContain('clearActiveColumnFilter')
  })

  it('routes the filter popover through Escape-defer + token styling (PT-UI-03)', () => {
    // The shared filter popover mirrors the toolbar popover Escape contract:
    // its open state defers the capture-phase fullscreen Escape exit.
    expect(source).toContain('columnFilterPopoverOpen = true')
    expect(source).toContain('columnFilterPopoverOpen = false')
    expect(source).toContain('if (columnFilterPopoverOpen.value) return')
    // Filter visual state uses semantic tokens (active emphasis + focus ring).
    expect(source).toContain("isColumnFiltered(col) ? 'text-primary' : 'text-muted-foreground'")
  })
})
