import type { SortState } from '../types/tableState'
import { SORT_DEFAULTS } from '../config'

export function applySort<T extends Record<string, unknown>>(
  rows: T[],
  state: SortState,
  getField: (row: T, field: string) => unknown
): T[] {
  if (!state.field || !state.direction) return rows
  const field = state.field
  const dir = state.direction
  return [...rows].sort((a, b) => {
    const av = getField(a, field)
    const bv = getField(b, field)
    if (av === null || av === undefined) return 1
    if (bv === null || bv === undefined) return -1
    let result = 0
    if (typeof av === 'number' && typeof bv === 'number') {
      result = av - bv
    } else {
      result = String(av).localeCompare(String(bv))
    }
    return dir === 'asc' ? result : -result
  })
}

export function nextSortDirection(current: SortState['direction']): SortState['direction'] {
  if (current === SORT_DEFAULTS.directionCycle[0]) return SORT_DEFAULTS.directionCycle[1]
  if (current === SORT_DEFAULTS.directionCycle[1]) return SORT_DEFAULTS.directionCycle[2]
  return SORT_DEFAULTS.directionCycle[0]
}
