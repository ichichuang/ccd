import type { ColumnVisibilityState } from '../types/tableState'
import type { ProTableColumn } from '../types/column'

export function toggleColumn(state: ColumnVisibilityState, id: string): ColumnVisibilityState {
  const next = new Set(state.hiddenColumns)
  if (next.has(id)) {
    next.delete(id)
  } else {
    next.add(id)
  }
  return { hiddenColumns: next }
}

/**
 * Set or toggle column visibility.
 * @param state - Current column visibility state
 * @param id - Column id
 * @param forceVisible - If provided, set visibility to this value; if undefined, toggle current state
 */
export function setColumnVisibility(
  state: ColumnVisibilityState,
  id: string,
  forceVisible?: boolean
): ColumnVisibilityState {
  const next = new Set(state.hiddenColumns)
  const isCurrentlyHidden = next.has(id)
  if (forceVisible !== undefined) {
    if (forceVisible) {
      next.delete(id)
    } else {
      next.add(id)
    }
  } else {
    if (isCurrentlyHidden) {
      next.delete(id)
    } else {
      next.add(id)
    }
  }
  return { hiddenColumns: next }
}

export function getVisibleColumns<T extends Record<string, unknown>>(
  columns: ProTableColumn<T>[],
  state: ColumnVisibilityState
): ProTableColumn<T>[] {
  const visible = columns.filter(col => !state.hiddenColumns.has(col.id))
  // PrimeVue sticky columns REQUIRE explicit DOM ordering: left first, unpinned middle, right last
  const leftPinned = visible.filter(col => col.pinned === 'left')
  const rightPinned = visible.filter(col => col.pinned === 'right')
  const unpinned = visible.filter(col => col.pinned !== 'left' && col.pinned !== 'right')
  return [...leftPinned, ...unpinned, ...rightPinned]
}
