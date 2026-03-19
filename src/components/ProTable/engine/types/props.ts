import type { FilterState, SortState } from './tableState'
import type { ProTableColumn } from './column'

export interface PaginationConfig {
  pageSize?: number
  pageSizeOptions?: number[]
}

export type HeightMode = 'fill' | 'auto' | 'fixed'

export interface ProTableProps<T extends Record<string, unknown> = Record<string, unknown>> {
  columns: ProTableColumn<T>[]
  data: T[]
  loading?: boolean
  rowKey?: keyof T | string
  showToolbar?: boolean
  title?: string
  selectable?: false | 'single' | 'checkbox'
  /**
   * Controls if and where the selection column (checkbox) is pinned.
   * 'left': Pinned to the left (frozen).
   * 'right': Pinned to the right (frozen).
   * false / undefined: Rendered on the left, but NOT frozen.
   */
  selectionPinned?: 'left' | 'right' | false
  pagination?: boolean | PaginationConfig
  total?: number
  serverMode?: boolean
  globalFilter?: boolean
  heightMode?: HeightMode
  height?: string
  /**
   * Controls the CSS table-layout property.
   * 'fixed' (default for scrollable): Columns respect explicit widths.
   * 'auto': Columns size based on content.
   */
  tableLayout?: 'auto' | 'fixed'
  infiniteScroll?: boolean
  stripedRows?: boolean
  showHorizontalLines?: boolean
  showVerticalLines?: boolean
  rowHover?: boolean
  rowClassName?: (row: T, index: number) => string

  // --- Advanced Features ---
  /** Enable column resizing (drag borders to resize) */
  resizableColumns?: boolean
  /** 'fit' (keeps total table width) or 'expand' (grows table width) */
  columnResizeMode?: 'fit' | 'expand'
  /** Enable drag-and-drop column reordering */
  reorderableColumns?: boolean
  /** Store table state (resizing, reordering, etc.) in browser storage */
  stateStorage?: 'session' | 'local' | false
  /** Unique key for state storage (Required if stateStorage is enabled) */
  stateKey?: string

  /** Optional controlled selection (v-model:selected). Single mode: T | undefined; checkbox: T[] */
  selected?: T[] | T
  /** Enable Virtual Grid engine (bypass PrimeVue DataTable) */
  virtualScroll?: boolean
}

export interface ProTableLoadParams {
  page: number
  pageSize: number
  sort: SortState
  filter: FilterState
}
