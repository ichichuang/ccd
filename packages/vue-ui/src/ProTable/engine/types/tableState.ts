export interface SortState {
  field: string | null
  direction: 'asc' | 'desc' | null
}

export interface FilterState {
  global: string
  columns: Record<string, unknown>
}

export type GlobalSearchMode = 'substring' | 'fuzzy'

export interface PaginationState {
  page: number
  pageSize: number
  total: number
}

export interface SelectionState<T extends Record<string, unknown>> {
  selectedRows: T[]
  selectedRowKeys: string[]
}

/** 列显隐 + 顺序（orderedKeys 为空表示沿用 columns 定义顺序） */
export interface ColumnSettingsState {
  orderedKeys: string[]
  hiddenKeys: string[]
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
  columnSettings: ColumnSettingsState
  fetch: FetchState
}
