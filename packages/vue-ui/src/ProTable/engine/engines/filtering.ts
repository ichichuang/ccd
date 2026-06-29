import { compareItems, rankItem, type RankingInfo } from '@tanstack/match-sorter-utils'
import type { FilterState, GlobalSearchMode } from '../types/tableState'
import type { ProTableColumn } from '../types/column'

interface ApplyFilterOptions {
  globalSearchMode?: GlobalSearchMode
}

interface RankedRow<T extends Record<string, unknown>> {
  row: T
  rank: RankingInfo
  index: number
}

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

function getStringValue(value: unknown): string | null {
  if (value === null || value === undefined) return null
  return String(value)
}

function getBestGlobalRank<T extends Record<string, unknown>>(
  row: T,
  query: string,
  columns: ProTableColumn<T>[]
): RankingInfo | null {
  let bestRank: RankingInfo | null = null

  for (const col of columns) {
    const field = col.field
    if (!field) continue

    const value = getStringValue(getFieldValue(row, field))
    if (value === null) continue

    const rank = rankItem(value, query)
    if (!rank.passed) continue

    if (!bestRank || compareItems(rank, bestRank) < 0) {
      bestRank = rank
    }
  }

  return bestRank
}

function applyGlobalFuzzyFilter<T extends Record<string, unknown>>(
  rows: T[],
  query: string,
  columns: ProTableColumn<T>[]
): T[] {
  const rankedRows: RankedRow<T>[] = []

  rows.forEach((row, index) => {
    const rank = getBestGlobalRank(row, query, columns)
    if (rank) rankedRows.push({ row, rank, index })
  })

  return rankedRows
    .sort((left, right) => compareItems(left.rank, right.rank) || left.index - right.index)
    .map(item => item.row)
}

function applyGlobalSubstringFilter<T extends Record<string, unknown>>(
  rows: T[],
  query: string,
  columns: ProTableColumn<T>[]
): T[] {
  const normalizedQuery = query.toLowerCase()
  return rows.filter(row =>
    columns.some(col => {
      const field = col.field
      if (!field) return false

      const value = getStringValue(getFieldValue(row, field))
      return value !== null && value.toLowerCase().includes(normalizedQuery)
    })
  )
}

function padDatePart(value: number): string {
  return value < 10 ? `0${value}` : String(value)
}

function dateObjectToDateKey(value: Date): string | null {
  const time = value.getTime()
  if (!Number.isFinite(time)) return null

  return `${value.getFullYear()}-${padDatePart(value.getMonth() + 1)}-${padDatePart(
    value.getDate()
  )}`
}

function stringToDateKey(value: string): string | null {
  const normalized = value.trim()
  if (!normalized) return null

  const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})(?:$|[T\s])/.exec(normalized)
  if (dateOnlyMatch) {
    return `${dateOnlyMatch[1]}-${dateOnlyMatch[2]}-${dateOnlyMatch[3]}`
  }

  const timestamp = Number(normalized)
  if (Number.isFinite(timestamp)) {
    return dateObjectToDateKey(new Date(timestamp))
  }

  const parsed = Date.parse(normalized)
  return Number.isFinite(parsed) ? dateObjectToDateKey(new Date(parsed)) : null
}

function dateToDateKey(value: unknown): string | null {
  if (value instanceof Date) return dateObjectToDateKey(value)
  if (typeof value === 'string') return stringToDateKey(value)
  if (typeof value === 'number' && Number.isFinite(value))
    return dateObjectToDateKey(new Date(value))
  return null
}

export function applyFilter<T extends Record<string, unknown>>(
  rows: T[],
  state: FilterState,
  columns: ProTableColumn<T>[],
  options: ApplyFilterOptions = {}
): T[] {
  let result: T[] = rows

  if (state.global.trim()) {
    const query: string = state.global.trim()
    const searchableCols: ProTableColumn<T>[] = columns.filter(c => isSearchableColumn<T>(c))

    // If no columns are valid for searching, do not destroy the data. Return everything.
    if (searchableCols.length > 0) {
      result =
        options.globalSearchMode === 'fuzzy'
          ? applyGlobalFuzzyFilter(result, query, searchableCols)
          : applyGlobalSubstringFilter(result, query, searchableCols)
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
        const val: unknown = getFieldValue(row, col.field)
        if (col.filterType === 'select') {
          return val === filterVal
        }
        if (col.filterType === 'number') {
          return Number(val) === Number(filterVal)
        }
        if (col.filterType === 'date') {
          const rowDate = dateToDateKey(val)
          const filterDate = dateToDateKey(filterVal)
          return rowDate !== null && filterDate !== null && rowDate === filterDate
        }
        return String(val ?? '')
          .toLowerCase()
          .includes(String(filterVal).toLowerCase())
      })
    )
  }

  return result
}
