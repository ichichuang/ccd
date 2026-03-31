export interface SortState {
  field: string | null
  direction: 'asc' | 'desc' | null
}

export interface FilterState {
  global: string
  columns: Record<string, unknown>
}

export interface PaginationState {
  page: number
  pageSize: number
  total: number
}

export interface SelectionState<T extends Record<string, unknown>> {
  selectedRows: T[]
  selectedRowKeys: string[]
}

export interface ColumnVisibilityState {
  hiddenColumns: Set<string>
}

export interface FetchState {
  loading: boolean
  error: boolean
  errorMessage: string
  /** Infinite-scroll: more pages available */
  hasMore: boolean
}

export interface TableState<T extends Record<string, unknown>> {
  sort: SortState
  filter: FilterState
  pagination: PaginationState
  selection: SelectionState<T>
  columnVisibility: ColumnVisibilityState
  fetch: FetchState
}
