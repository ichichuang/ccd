export const PRO_TABLE_PROPS_DEFAULTS = {
  loading: false,
  rowKey: 'id',
  showToolbar: true,
  title: undefined,
  selectable: false,
  selectionPinned: false,
  pagination: true,
  total: undefined,
  serverMode: false,
  globalFilter: true,
  heightMode: 'fill',
  height: undefined,
  tableLayout: undefined,
  infiniteScroll: false,
  stripedRows: false,
  showHorizontalLines: true,
  showVerticalLines: false,
  rowHover: true,
  rowClassName: undefined,
  resizableColumns: false,
  columnResizeMode: 'fit',
  reorderableColumns: false,
  stateStorage: false,
  stateKey: undefined,
  selected: undefined,
  virtualScroll: false,
} as const

export const PAGINATION_DEFAULTS = {
  initialPage: 1,
  pageSize: 10,
  pageSizeOptions: [10, 20, 50, 100],
} as const

export const SORT_DEFAULTS = {
  initial: { field: null, direction: null },
  firstDirection: 'asc',
  directionCycle: [null, 'asc', 'desc'] as const,
  nullsLast: true,
} as const

export const FILTER_DEFAULTS = {
  initial: { global: '', columns: {} },
} as const

export const REQUEST_DEFAULTS = {
  immediate: true,
  accumulate: false,
} as const

export const FETCH_STATE_DEFAULTS = {
  loading: false,
  error: false,
  errorMessage: '',
  hasMore: true,
} as const

export const INFINITE_SCROLL_DEFAULTS = {
  setupDelayMs: 100,
  bottomDistancePx: 80,
} as const

export const VIRTUAL_GRID_DEFAULTS = {
  estimateRowHeightPx: 48,
  overscan: 5,
  gridColumnFallback: 'minmax(var(--spacing-5xl), 1fr)',
} as const

export const TOOLBAR_DEFAULTS = {
  globalSearchDebounceMs: 300,
} as const

export const UI_DEFAULTS = {
  selectionColumnWidth: '48px',
  fixedHeightFallback: '400px',
} as const
