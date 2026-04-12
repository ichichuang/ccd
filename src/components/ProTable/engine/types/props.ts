import type { FilterState, SortState } from './tableState'
import type { ProTableColumn } from './column'
import type { RequestConfig as HttpRequestConfig } from '@/utils/http/types'

export interface PaginationConfig {
  pageSize?: number
  pageSizeOptions?: number[]
}

/**
 * Standard response shape returned by a `request` callback.
 */
export interface ProTableRequestResult<T> {
  data: T[]
  total: number
}

/**
 * The callback ProTable calls to fetch data.
 * Receives the current table state and must return `{ data, total }`.
 */
export type RequestFn<T> = (params: ProTableLoadParams) => Promise<ProTableRequestResult<T>>

/**
 * Optional configuration for the `request` behaviour.
 */
export interface RequestConfig {
  /** Fire the first request on mount. @default true */
  immediate?: boolean
  /** Append results (infinite scroll) instead of replacing. @default false */
  accumulate?: boolean
}

/**
 * HTTP method for config-driven API mode.
 */
export type ProTableApiMethod = 'GET' | 'POST'

/**
 * apiUrl 模式下的外部请求执行器上下文（防腐层注入）
 */
export interface ProTableApiExecutorContext {
  url: string
  method: ProTableApiMethod
  query: ProTableApiQueryParams
  config?: HttpRequestConfig
}

/**
 * apiUrl 模式下的请求执行器（由业务层注入，避免 ProTable 耦合具体请求库）
 */
export type ProTableApiExecutor = (ctx: ProTableApiExecutorContext) => Promise<unknown>

/**
 * Configurable search-path resolver.
 * Receives the base URL and the current formatted query params.
 * Returns the final URL to call (e.g., '/users' -> '/users/search').
 * When undefined, the built-in REST resolver is used.
 */
export type SearchPathResolver = (
  baseUrl: string,
  query: Record<string, string | number | boolean | undefined>
) => string

export type HeightMode = 'fill' | 'auto' | 'fixed'

export interface ProTableUrlSyncOptions {
  /**
   * 是否启用 URL query 同步（分页/排序/关键字）
   * @default true
   */
  enabled?: boolean
  /**
   * query key 映射，可用于同页多表隔离
   */
  keys?: {
    page?: string
    pageSize?: string
    sortField?: string
    sortDirection?: string
    keyword?: string
  }
  /**
   * 路由写回方式
   * @default 'replace'
   */
  mode?: 'replace' | 'push'
}

/**
 * Extra query params merged into api/apiUrl requests (e.g. ProForm filter object).
 * Values are narrowed at runtime to HTTP-query-safe primitives.
 */
export type ProTableSearchParams = Record<string, unknown>

export interface ProTableProps<T extends Record<string, unknown> = Record<string, unknown>> {
  columns: ProTableColumn<T>[]
  /** Row data array. Required in standard mode, ignored in request mode. */
  data?: T[]
  loading?: boolean
  rowKey?: keyof T | string
  showToolbar?: boolean
  /** 工具栏是否显示表格区域尺寸密度切换（紧凑 / 适中 / 宽松）；仅在 ProTable 内容子树覆盖 CSS 变量，不改全局 `useSizeStore`。 @default true */
  showDensityControl?: boolean
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
  /**
   * Checkbox 多选时的最大条数；超出时不再追加选中，且从父级同步 / DataTable 回写时会截断。
   * 不传则不限制。
   */
  maxSelection?: number
  /** Enable Virtual Grid engine (bypass PrimeVue DataTable) */
  virtualScroll?: boolean

  /**
   * Autonomous data-fetching callback.
   * When provided, ProTable manages loading, data, total, and error state internally.
   * The `:data`, `:total`, and `:loading` props are ignored in request mode.
   */
  request?: RequestFn<T>
  /**
   * 黑盒 API：返回原始响应，配合 `dataKey` / `totalKey` 解包。
   * 若同时提供 `api` 与 `request`，优先使用 `request`。
   */
  api?: ProTableApiFn
  /** 列表数据在响应中的路径，默认 `data`（支持 `data.records` 等点路径）。 */
  dataKey?: string
  /** 总条数在响应中的路径，默认 `total`。 */
  totalKey?: string
  /** Configuration for the `request` behaviour. */
  requestConfig?: RequestConfig

  /**
   * Config-driven API mode: HTTP endpoint URL.
   * 当设置该字段时，ProTable 会通过 `apiExecutor` 执行请求。
   * Priority: request > api > apiUrl.
   */
  apiUrl?: string
  /** HTTP method for config-driven mode. @default 'GET' */
  apiMethod?: ProTableApiMethod
  /** Extra HTTP config passed to external apiExecutor (headers, timeout, enableCache, retry, etc.) */
  apiConfig?: HttpRequestConfig
  /**
   * apiUrl 模式的请求执行器（防腐层）
   * 未提供时，apiUrl 模式将抛错，避免组件直接绑定底层请求库
   */
  apiExecutor?: ProTableApiExecutor
  /**
   * Custom search-path resolver for config-driven mode.
   * Called when filter.global is non-empty.
   * Default: pure REST behavior (no path rewrite).
   * Set to `false` to disable search-path routing entirely.
   */
  searchPathResolver?: SearchPathResolver | false
  /** Additional query params merged with formatted table params (api/apiUrl modes only). */
  searchParams?: ProTableSearchParams
  /**
   * URL query 同步配置：
   * - true: 使用默认 keys 与 replace
   * - false/undefined: 禁用
   * - object: 自定义策略
   */
  urlSync?: boolean | ProTableUrlSyncOptions
}

export interface ProTableLoadParams {
  page: number
  pageSize: number
  sort: SortState
  filter: FilterState
  /**
   * 当前请求的 AbortSignal。消费方应传递给 HTTP 客户端
   * （如 `fetch(url, { signal })` 或 `axios.get(url, { signal })`）
   * 以实现过期请求的自动取消。
   */
  signal?: AbortSignal
}

/** 与 `ProTableLoadParams` 同构 — 表格标准请求参数（分页 / 排序 / 筛选）。 */
export type StandardTableParams = ProTableLoadParams

/**
 * `:api` 接收的 query：由引擎内 `formatRequestParams` 生成，与后端分页约定对齐。
 */
export type ProTableApiQueryParams = Record<string, string | number | boolean | undefined>

/**
 * 黑盒模式：接收已格式化的 query，返回原始 JSON；引擎再经 `formatResponseData` 解包。
 */
export type ProTableApiFn = (query: ProTableApiQueryParams) => Promise<unknown>

/** Shape of the object exposed by ProTable via defineExpose (generic-safe). */
export interface ProTableExposed {
  reload: () => void
  clearSelection: () => void
  setPage: (page: number) => void
  setPageSize: (pageSize: number) => void
  toggleColumnVisibility: (columnId: string, visible?: boolean) => void
  updateColumnSettings: (newOrder: string[], newHidden: string[]) => void
  getSelection: () => Record<string, unknown>[]
  getState: () => {
    pagination: { page: number; pageSize: number; total: number }
    sort: SortState
    filter: FilterState
    columnSettings: { orderedKeys: string[]; hiddenKeys: string[] }
  }
  getFetchState: () => { loading: boolean; error: boolean; errorMessage: string; hasMore: boolean }
  exportData: (mode?: 'page' | 'selected', filename?: string) => void
}
