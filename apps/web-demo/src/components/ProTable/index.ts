export { default as ProTable } from './ProTable.vue'
export { useProTable } from './engine/hooks/useProTable'
export { useRecordOverlay } from './hooks/useRecordOverlay'

export type { UseRecordOverlayOptions, UseRecordOverlayReturn } from './hooks/useRecordOverlay'
export type {
  ProTableColumn,
  ColumnRenderParams,
  ProTableValueEnumItem,
  ProTableValueEnum,
} from './engine/types/column'
export type {
  TableState,
  SortState,
  FilterState,
  PaginationState,
  SelectionState,
  ColumnSettingsState,
} from './engine/types/tableState'

/** @deprecated 使用 ColumnSettingsState */
export type { ColumnSettingsState as ColumnVisibilityState } from './engine/types/tableState'
export type {
  ProTableProps,
  PaginationConfig,
  ProTableLoadParams,
  StandardTableParams,
  ProTableApiQueryParams,
  ProTableApiConfig,
  ProTableApiExecutor,
  ProTableApiExecutorContext,
  ProTableSearchParams,
  ProTableApiFn,
  ProTableRequestResult,
  ProTableExposed,
  RequestFn,
  RequestConfig,
  HeightMode,
  ProTableApiMethod,
  ProTableUrlSyncOptions,
  SearchPathResolver,
} from './engine/types/props'
export { formatRequestParams, formatResponseData, resolveApiUrl } from './engine/config/apiAdapter'
export type { FetchState } from './engine/types/tableState'
