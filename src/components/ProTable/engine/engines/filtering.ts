import type { FilterState } from '../types/tableState'
import type { ProTableColumn } from '../types/column'

function isSearchableColumn<T extends Record<string, unknown>>(col: ProTableColumn<T>): boolean {
  if (!col.field) return false
  if (col.filterable === false) return false

  const meta: Record<string, unknown> | undefined = col.meta
  if (meta?.searchable === false) return false

  // Default to true for all columns with `field` unless explicitly opted out.
  return true
}

function getFieldValue(obj: unknown, path: string): unknown {
  if (!path.includes('.')) {
    if (!obj || typeof obj !== 'object') return undefined
    return (obj as Record<string, unknown>)[path]
  }

  const parts: string[] = path.split('.')
  let current: unknown = obj
  for (const part of parts) {
    if (!current || typeof current !== 'object') return undefined
    current = (current as Record<string, unknown>)[part]
  }
  return current
}

export function applyFilter<T extends Record<string, unknown>>(
  rows: T[],
  state: FilterState,
  columns: ProTableColumn<T>[]
): T[] {
  let result: T[] = rows

  if (state.global.trim()) {
    const query: string = state.global.trim().toLowerCase()
    const searchableCols: ProTableColumn<T>[] = columns.filter(c => isSearchableColumn<T>(c))

    // If no columns are valid for searching, do not destroy the data. Return everything.
    if (searchableCols.length > 0) {
      result = result.filter(row =>
        searchableCols.some(col => {
          const field: string = col.field as string
          const val: unknown = getFieldValue(row, field)
          return val !== null && val !== undefined && String(val).toLowerCase().includes(query)
        })
      )
    }
  }

  const colFilters: [string, unknown][] = Object.entries(state.columns).filter(
    ([, v]) => v !== null && v !== undefined && v !== ''
  )
  if (colFilters.length > 0) {
    const colMap = new Map<string, ProTableColumn<T>>(columns.map(c => [c.id, c]))
    result = result.filter(row =>
      colFilters.every(([colId, filterVal]) => {
        const col: ProTableColumn<T> | undefined = colMap.get(colId)
        if (!col?.field) return true
        const val: unknown = row[col.field as keyof T]
        if (col.filterType === 'select') {
          return val === filterVal
        }
        if (col.filterType === 'number') {
          return Number(val) === Number(filterVal)
        }
        return String(val ?? '')
          .toLowerCase()
          .includes(String(filterVal).toLowerCase())
      })
    )
  }

  return result
}
