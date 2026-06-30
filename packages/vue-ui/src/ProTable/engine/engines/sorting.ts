import type { ActiveSortDirection, SortMeta, SortState } from '../types/tableState'
import type { ProTableColumn } from '../types/column'
import { SORT_DEFAULTS } from '../config'

function isActiveDirection(direction: SortState['direction']): direction is ActiveSortDirection {
  return direction === 'asc' || direction === 'desc'
}

export function toMultiSortMeta(state: SortState): SortMeta[] {
  if (state.multi) return state.multi.map(meta => ({ ...meta }))
  if (!state.field || !isActiveDirection(state.direction)) return []
  return [{ field: state.field, direction: state.direction }]
}

export function createSingleSortState(
  field: string | null,
  direction: SortState['direction']
): SortState {
  if (!field || !isActiveDirection(direction)) return { field: null, direction: null }
  return { field, direction }
}

export function createMultiSortState(meta: readonly SortMeta[]): SortState {
  const multi = meta
    .filter(item => item.field && isActiveDirection(item.direction))
    .map(item => ({ field: item.field, direction: item.direction }))
  const first = multi[0]
  if (!first) return { field: null, direction: null, multi: [] }
  return { field: first.field, direction: first.direction, multi }
}

export function sortMetaSignature(state: SortState): string {
  return toMultiSortMeta(state)
    .map(meta => `${meta.field}:${meta.direction}`)
    .join('|')
}

function getColumnSortField<T extends Record<string, unknown>>(column: ProTableColumn<T>): string {
  return String(column.field ?? column.id)
}

function resolveSortColumn<T extends Record<string, unknown>>(
  columns: readonly ProTableColumn<T>[],
  field: string
): ProTableColumn<T> | undefined {
  return (
    columns.find(column => getColumnSortField(column) === field) ??
    columns.find(column => column.id === field)
  )
}

function compareLegacySingle<T extends Record<string, unknown>>(
  left: T,
  right: T,
  meta: SortMeta,
  getField: (row: T, field: string) => unknown
): number {
  const av = getField(left, meta.field)
  const bv = getField(right, meta.field)
  if (av === null || av === undefined) return 1
  if (bv === null || bv === undefined) return -1
  const result =
    typeof av === 'number' && typeof bv === 'number'
      ? av - bv
      : String(av).localeCompare(String(bv))
  return meta.direction === 'asc' ? result : -result
}

function compareMultiValue<T extends Record<string, unknown>>(
  left: T,
  right: T,
  meta: SortMeta,
  getField: (row: T, field: string) => unknown
): number {
  const av = getField(left, meta.field)
  const bv = getField(right, meta.field)
  if ((av === null || av === undefined) && (bv === null || bv === undefined)) return 0
  if (av === null || av === undefined) return 1
  if (bv === null || bv === undefined) return -1
  const result =
    typeof av === 'number' && typeof bv === 'number'
      ? av - bv
      : String(av).localeCompare(String(bv))
  return meta.direction === 'asc' ? result : -result
}

function compareCustomValue<T extends Record<string, unknown>>(
  left: T,
  right: T,
  meta: SortMeta,
  column: ProTableColumn<T>,
  getField: (row: T, field: string) => unknown
): number {
  const leftValue = getField(left, meta.field)
  const rightValue = getField(right, meta.field)
  const result = column.sortCompare?.(leftValue, rightValue, {
    field: meta.field,
    column,
    leftRow: left,
    rightRow: right,
  })
  return meta.direction === 'asc' ? (result ?? 0) : -(result ?? 0)
}

function compareSortableValue<T extends Record<string, unknown>>(
  left: T,
  right: T,
  meta: SortMeta,
  columns: readonly ProTableColumn<T>[],
  getField: (row: T, field: string) => unknown
): number {
  const column = resolveSortColumn(columns, meta.field)
  if (column?.sortCompare) {
    return compareCustomValue(left, right, meta, column, getField)
  }
  return compareMultiValue(left, right, meta, getField)
}

export function applySort<T extends Record<string, unknown>>(
  rows: T[],
  state: SortState,
  columns: readonly ProTableColumn<T>[],
  getField: (row: T, field: string) => unknown
): T[] {
  const criteria = toMultiSortMeta(state)
  if (criteria.length === 0) return rows
  if (criteria.length === 1 && !state.multi) {
    const column = resolveSortColumn(columns, criteria[0].field)
    if (column?.sortCompare) {
      return rows
        .map((row, index) => ({ row, index }))
        .sort((left, right) => {
          const result = compareCustomValue(left.row, right.row, criteria[0], column, getField)
          return result !== 0 ? result : left.index - right.index
        })
        .map(item => item.row)
    }
    return [...rows].sort((a, b) => compareLegacySingle(a, b, criteria[0], getField))
  }

  return rows
    .map((row, index) => ({ row, index }))
    .sort((left, right) => {
      for (const meta of criteria) {
        const result = compareSortableValue(left.row, right.row, meta, columns, getField)
        if (result !== 0) return result
      }
      return left.index - right.index
    })
    .map(item => item.row)
}

export function nextSortDirection(current: SortState['direction']): SortState['direction'] {
  if (current === SORT_DEFAULTS.directionCycle[0]) return SORT_DEFAULTS.directionCycle[1]
  if (current === SORT_DEFAULTS.directionCycle[1]) return SORT_DEFAULTS.directionCycle[2]
  return SORT_DEFAULTS.directionCycle[0]
}
