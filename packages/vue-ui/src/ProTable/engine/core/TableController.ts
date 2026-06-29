import type { ComputedRef, EffectScope, ShallowRef } from 'vue'
import { computed, effectScope, shallowReactive, shallowRef, watch } from 'vue'
import type {
  TableState,
  SortState,
  SortMeta,
  FilterState,
  ColumnSettingsState,
  GlobalSearchMode,
  ProTableSortMode,
} from '../types/tableState'
import type { ProTableColumn } from '../types/column'
import type { ProTableLoadParams, RequestFn, RequestConfig } from '../types/props'
import {
  FETCH_STATE_DEFAULTS,
  FILTER_DEFAULTS,
  PAGINATION_DEFAULTS,
  PRO_TABLE_PROPS_DEFAULTS,
  REQUEST_DEFAULTS,
  SORT_DEFAULTS,
} from '../config'
import {
  applySort,
  createMultiSortState,
  createSingleSortState,
  nextSortDirection,
  sortMetaSignature,
  toMultiSortMeta,
} from '../engines/sorting'
import { applyFilter } from '../engines/filtering'
import { applyPagination } from '../engines/pagination'
import { toggleRowSelection, toggleAllSelection, clearSelection } from '../engines/selection'
import {
  buildVisibleColumns,
  mergeColumnSettingsWithColumns,
  setColumnVisibility,
  normalizeColumnSettingsKeys,
} from '../engines/columnVisibility'
import { exportToCsv } from '../engines/export'
import { objectGet } from '@ccd/shared-utils'

export interface TableControllerOptions<T extends Record<string, unknown>> {
  columns: ProTableColumn<T>[]
  data?: T[]
  rowKey?: keyof T | string
  serverMode?: boolean
  /**
   * Engine-level pagination switch.
   * When disabled, `processedRows` will NOT slice by page/pageSize.
   */
  paginationEnabled?: boolean
  initialPageSize?: number
  sortMode?: ProTableSortMode
  onLoad?: (params: ProTableLoadParams) => void
  onSortChange?: (sort: SortState) => void
  onFilterChange?: (filter: FilterState) => void
  onPageChange?: (page: number, pageSize: number) => void
  globalSearchMode?: GlobalSearchMode

  /** Autonomous data-fetching callback. */
  request?: RequestFn<T>
  /** Configuration for the `request` behaviour. */
  requestConfig?: RequestConfig
  /** Emitted when request() rejects. */
  onRequestError?: (error: Error) => void
  /** Checkbox 多选最大条数；不传不限制 */
  maxSelection?: number

  /** 初始列顺序与显隐（如自 LocalStorage 恢复）；缺省由列定义推导 */
  initialColumnSettings?: ColumnSettingsState
  /** 列设置变化时回调（用于持久化） */
  onColumnSettingsChange?: (state: ColumnSettingsState) => void
}

interface SetRequestOptions {
  reload?: boolean
}

function normalizeRequestConfig(config?: RequestConfig): Required<RequestConfig> {
  return {
    immediate: config?.immediate ?? REQUEST_DEFAULTS.immediate,
    accumulate: config?.accumulate ?? REQUEST_DEFAULTS.accumulate,
  }
}

function isSameRequestConfig(
  left: Required<RequestConfig>,
  right: Required<RequestConfig>
): boolean {
  return left.immediate === right.immediate && left.accumulate === right.accumulate
}

function getRowKey<T extends Record<string, unknown>>(row: T, keyField: string): string {
  return String((row as Record<string, unknown>)[keyField] ?? JSON.stringify(row))
}

/** Stable fingerprint for column filters so watch deps stay scalar-comparable. */
function stableColumnFiltersKey(columns: Record<string, unknown>): string {
  return Object.keys(columns)
    .sort()
    .map(k => `${k}:${JSON.stringify(columns[k])}`)
    .join('|')
}

export class TableController<T extends Record<string, unknown>> {
  readonly state: TableState<T>
  private _columns: ProTableColumn<T>[]
  private _data: ShallowRef<T[]>
  private _serverMode: boolean
  private _rowKey: string
  private _paginationEnabled: ShallowRef<boolean>
  private _sortMode: ShallowRef<ProTableSortMode>
  private _globalSearchMode: ShallowRef<GlobalSearchMode>
  private _scope: EffectScope
  private _request: ShallowRef<RequestFn<T> | undefined>
  private _requestConfig: Required<RequestConfig>
  private _onRequestError?: (error: Error) => void
  private _fetchVersion = 0
  private _abortController: AbortController | null = null
  private _maxSelection: number | undefined
  private _onColumnSettingsChange?: (state: ColumnSettingsState) => void

  /** True when ProTable is in request mode (autonomous fetch). */
  get requestMode(): boolean {
    return !!this._request.value
  }

  get sortMode(): ProTableSortMode {
    return this._sortMode.value
  }

  filteredAndSorted!: ComputedRef<T[]>
  processedRows!: ComputedRef<T[]>
  visibleColumns!: ComputedRef<ProTableColumn<T>[]>
  totalCount!: ComputedRef<number>

  constructor(options: TableControllerOptions<T>) {
    this._columns = options.columns
    this._data = shallowRef<T[]>(options.data ?? [])
    this._serverMode = options.serverMode ?? PRO_TABLE_PROPS_DEFAULTS.serverMode
    this._rowKey = String(options.rowKey ?? PRO_TABLE_PROPS_DEFAULTS.rowKey)
    this._paginationEnabled = shallowRef(
      options.paginationEnabled ?? PRO_TABLE_PROPS_DEFAULTS.pagination
    )
    this._sortMode = shallowRef(options.sortMode ?? PRO_TABLE_PROPS_DEFAULTS.sortMode)
    this._globalSearchMode = shallowRef(
      options.globalSearchMode ?? PRO_TABLE_PROPS_DEFAULTS.globalSearchMode
    )
    this._scope = effectScope()
    this._request = shallowRef(options.request)
    this._requestConfig = normalizeRequestConfig(options.requestConfig)
    this._onRequestError = options.onRequestError
    this._maxSelection = options.maxSelection
    this._onColumnSettingsChange = options.onColumnSettingsChange

    const initialColumnSettings = mergeColumnSettingsWithColumns(
      options.columns,
      options.initialColumnSettings ?? null
    )

    this.state = shallowReactive<TableState<T>>({
      sort: this._sortMode.value === 'multiple' ? createMultiSortState([]) : SORT_DEFAULTS.initial,
      filter: FILTER_DEFAULTS.initial,
      pagination: {
        page: PAGINATION_DEFAULTS.initialPage,
        pageSize: options.initialPageSize ?? PAGINATION_DEFAULTS.pageSize,
        total: 0,
      },
      selection: { selectedRows: [], selectedRowKeys: [] },
      columnSettings: initialColumnSettings,
      fetch: { ...FETCH_STATE_DEFAULTS },
    })

    this._scope.run(() => {
      this.filteredAndSorted = computed<T[]>(() => {
        if (this._serverMode) return this._data.value
        const filtered = applyFilter(this._data.value, this.state.filter, this._columns, {
          globalSearchMode: this._globalSearchMode.value,
        })
        return applySort(filtered, this.state.sort, (row, field) =>
          field.includes('.') ? objectGet(row, field) : row[field]
        )
      })

      this.totalCount = computed<number>(() => {
        return this._serverMode ? this.state.pagination.total : this.filteredAndSorted.value.length
      })

      this.processedRows = computed<T[]>(() => {
        if (!this._paginationEnabled.value) return this.filteredAndSorted.value
        return applyPagination(
          this.filteredAndSorted.value,
          { ...this.state.pagination, total: this.totalCount.value },
          this._serverMode
        )
      })

      this.visibleColumns = computed<ProTableColumn<T>[]>(() => {
        return buildVisibleColumns(this._columns, this.state.columnSettings)
      })

      const fetchTriggerSources = () => [
        () => this.state.sort.field,
        () => this.state.sort.direction,
        () => sortMetaSignature(this.state.sort),
        () => this.state.filter.global,
        () => stableColumnFiltersKey(this.state.filter.columns),
        () => this.state.pagination.page,
        () => this.state.pagination.pageSize,
      ]

      watch(
        fetchTriggerSources(),
        () => {
          if (this._request.value) {
            if (!this._requestConfig.accumulate) {
              void this.executeFetchInternal(false)
            }
            return
          }

          if (this._serverMode) {
            options.onLoad?.({
              page: this.state.pagination.page,
              pageSize: this.state.pagination.pageSize,
              sort: { ...this.state.sort },
              filter: { ...this.state.filter },
            })
          }
        },
        { flush: 'post' }
      )

      watch(
        [
          () => this.state.sort.field,
          () => this.state.sort.direction,
          () => sortMetaSignature(this.state.sort),
          () => this.state.filter.global,
          () => stableColumnFiltersKey(this.state.filter.columns),
        ],
        () => {
          if (!this._request.value || !this._requestConfig.accumulate) return
          this._data.value = []
          this.state.pagination = { ...this.state.pagination, page: 1 }
          this.state.fetch = { ...this.state.fetch, hasMore: true }
          void this.executeFetchInternal(false)
        },
        { flush: 'post' }
      )
    })
  }

  setData(data: T[]): void {
    this._data.value = data
  }

  /**
   * Replace the request function at runtime (e.g. when apiUrl prop changes).
   */
  setRequest(
    request: RequestFn<T> | undefined,
    requestConfig?: RequestConfig,
    options: SetRequestOptions = {}
  ): void {
    const nextConfig = normalizeRequestConfig(requestConfig)
    const requestChanged = this._request.value !== request
    const configChanged = !isSameRequestConfig(this._requestConfig, nextConfig)

    if (!requestChanged && !configChanged) return

    this.invalidateActiveFetch()
    this._request.value = request
    this._requestConfig = nextConfig
    this.resetRowsForRequestChange()

    const shouldReload = options.reload ?? true
    if (shouldReload && this._request.value && this._requestConfig.immediate) {
      void this.executeFetchInternal(false)
    }
  }

  /**
   * Replace only the request configuration at runtime.
   */
  setRequestConfig(requestConfig?: RequestConfig): void {
    this.setRequest(this._request.value, requestConfig)
  }

  /**
   * Toggle client-side pagination processing at runtime.
   */
  setPaginationEnabled(enabled: boolean): void {
    this._paginationEnabled.value = enabled
  }

  /**
   * Switch sort mode at runtime without losing the primary sort.
   * Multiple mode materializes `sort.multi`; single mode collapses back to
   * the primary `{ field, direction }` payload.
   */
  setSortMode(mode: ProTableSortMode): void {
    if (this._sortMode.value === mode) return
    this._sortMode.value = mode
    this.state.sort =
      mode === 'multiple'
        ? createMultiSortState(toMultiSortMeta(this.state.sort))
        : createSingleSortState(this.state.sort.field, this.state.sort.direction)
  }

  /**
   * Update local global-search matching without changing the public FilterState payload.
   */
  setGlobalSearchMode(mode: GlobalSearchMode): void {
    this._globalSearchMode.value = mode
  }

  /**
   * Replace column definitions (e.g. parent passes new `render` closures).
   * Preserves user toggled visibility for ids that still exist; applies `hidden` from new defs.
   */
  setColumns(next: ProTableColumn<T>[]): void {
    this._columns = next
    this.state.columnSettings = mergeColumnSettingsWithColumns(next, this.state.columnSettings)
    this.notifyColumnSettingsChange()
  }

  private notifyColumnSettingsChange(): void {
    const s = this.state.columnSettings
    this._onColumnSettingsChange?.({
      orderedKeys: [...s.orderedKeys],
      hiddenKeys: [...s.hiddenKeys],
    })
  }

  setTotal(total: number): void {
    if (this.state.pagination.total === total) return
    // shallowReactive 不追踪嵌套对象的原地修改，必须替换 `pagination` 引用才能驱动 totalCount / 分页 UI
    this.state.pagination = { ...this.state.pagination, total }
  }

  private updateSingleSort(field: string): void {
    if (this.state.sort.field !== field) {
      this.state.sort = { field, direction: SORT_DEFAULTS.firstDirection }
    } else {
      const dir = nextSortDirection(this.state.sort.direction)
      this.state.sort = { field: dir === null ? null : field, direction: dir }
    }
  }

  private updateMultiSort(field: string): void {
    const currentMeta = toMultiSortMeta(this.state.sort)
    const current = currentMeta.find(meta => meta.field === field)
    const nextDirection = nextSortDirection(current?.direction ?? null)
    const nextMeta =
      nextDirection === null
        ? currentMeta.filter(meta => meta.field !== field)
        : current
          ? currentMeta.map(meta =>
              meta.field === field ? { field, direction: nextDirection } : meta
            )
          : [...currentMeta, { field, direction: nextDirection }]

    this.state.sort = createMultiSortState(nextMeta)
  }

  updateSort(field: string): void {
    if (this._sortMode.value === 'multiple') {
      this.updateMultiSort(field)
    } else {
      this.updateSingleSort(field)
    }
    if (this._serverMode) {
      // watch handles load emit
    }
  }

  setSort(sort: SortState): void {
    this.state.sort =
      this._sortMode.value === 'multiple'
        ? createMultiSortState(toMultiSortMeta(sort))
        : createSingleSortState(sort.field, sort.direction)
  }

  setMultiSort(multi: readonly SortMeta[]): void {
    this.state.sort =
      this._sortMode.value === 'multiple'
        ? createMultiSortState(multi)
        : createSingleSortState(multi[0]?.field ?? null, multi[0]?.direction ?? null)
  }

  setGlobalFilter(value: string): void {
    this.state.filter = { ...this.state.filter, global: value }
    this.state.pagination = { ...this.state.pagination, page: 1 }
  }

  setColumnFilter(colId: string, value: unknown): void {
    this.state.filter = {
      ...this.state.filter,
      columns: { ...this.state.filter.columns, [colId]: value },
    }
    this.state.pagination = { ...this.state.pagination, page: 1 }
  }

  setPage(page: number): void {
    if (this.state.pagination.page === page) return
    this.state.pagination = { ...this.state.pagination, page }
  }

  setPageSize(pageSize: number): void {
    this.state.pagination = { ...this.state.pagination, pageSize, page: 1 }
  }

  selectRow(row: T, mode: 'single' | 'checkbox'): void {
    const key = getRowKey(row, this._rowKey)
    if (mode === 'checkbox' && this._maxSelection != null && this._maxSelection > 0) {
      const idx = this.state.selection.selectedRowKeys.indexOf(key)
      if (idx === -1 && this.state.selection.selectedRowKeys.length >= this._maxSelection) {
        return
      }
    }
    this.state.selection = toggleRowSelection(this.state.selection, row, key, mode)
  }

  selectAll(): void {
    this.state.selection = toggleAllSelection(
      this.state.selection,
      this.processedRows.value,
      r => getRowKey(r, this._rowKey),
      this._maxSelection
    )
  }

  /**
   * 更新多选上限；若当前选中超过上限则截断。返回是否发生了截断。
   */
  setMaxSelection(max: number | undefined): boolean {
    this._maxSelection = max
    if (max != null && max > 0 && this.state.selection.selectedRowKeys.length > max) {
      this.state.selection = {
        selectedRows: this.state.selection.selectedRows.slice(0, max),
        selectedRowKeys: this.state.selection.selectedRowKeys.slice(0, max),
      }
      return true
    }
    return false
  }

  clearSelection(): void {
    this.state.selection = clearSelection<T>()
  }

  isRowSelected(row: T): boolean {
    const key = getRowKey(row, this._rowKey)
    return this.state.selection.selectedRowKeys.includes(key)
  }

  toggleColumnVisibility(id: string, visible?: boolean): void {
    this.state.columnSettings = setColumnVisibility(this.state.columnSettings, id, visible)
    this.notifyColumnSettingsChange()
  }

  isColumnVisible(id: string): boolean {
    return !this.state.columnSettings.hiddenKeys.includes(id)
  }

  /**
   * 更新列顺序与显隐（供后续列设置 UI / 拖拽使用）
   */
  updateColumnSettings(newOrder: string[], newHidden: string[]): void {
    this.state.columnSettings = normalizeColumnSettingsKeys(this._columns, newOrder, newHidden)
    this.notifyColumnSettingsChange()
  }

  // ── Request engine ──────────────────────────────────────────────────────────

  /**
   * Internal fetch executor. Handles loading state, error, data assignment,
   * and accumulate (infinite-scroll) mode.
   * @param append — true for infinite-scroll "load more"
   */
  private async executeFetchInternal(append: boolean): Promise<void> {
    const request = this._request.value
    if (!request) return

    // 取消前一个正在进行的请求
    if (this._abortController) {
      this._abortController.abort()
    }
    const abortController = new AbortController()
    this._abortController = abortController

    const version = ++this._fetchVersion
    this.state.fetch = { ...this.state.fetch, loading: true, error: false, errorMessage: '' }

    try {
      const params: ProTableLoadParams = {
        page: this.state.pagination.page,
        pageSize: this.state.pagination.pageSize,
        sort: { ...this.state.sort },
        filter: { ...this.state.filter },
        signal: abortController.signal,
      }

      const result = await request(params)

      // Stale response guard: ignore if a newer fetch was started
      if (version !== this._fetchVersion) return

      if (append && this._requestConfig.accumulate) {
        this._data.value = [...this._data.value, ...result.data]
      } else {
        this._data.value = result.data
      }
      this.setTotal(result.total)

      // Update hasMore for infinite-scroll mode
      this.state.fetch = {
        ...this.state.fetch,
        loading: false,
        hasMore: this._data.value.length < result.total,
      }
    } catch (err) {
      // AbortError 是预期行为（请求被新请求取代），静默丢弃
      if (err instanceof DOMException && err.name === 'AbortError') return

      if (version !== this._fetchVersion) return
      const error = err instanceof Error ? err : new Error(String(err))
      this.state.fetch = {
        ...this.state.fetch,
        loading: false,
        error: true,
        errorMessage: error.message,
      }
      this._onRequestError?.(error)
    } finally {
      // 仅清理属于本次请求的 controller 引用
      if (this._abortController === abortController) {
        this._abortController = null
      }
    }
  }

  /**
   * Trigger the initial fetch (called from ProTable onMounted when immediate=true).
   */
  fetchInitial(): void {
    if (!this._request.value || !this._requestConfig.immediate) return
    void this.executeFetchInternal(false)
  }

  /**
   * Load the next page in accumulate (infinite-scroll) mode.
   */
  fetchMore(): void {
    if (!this._request.value || !this._requestConfig.accumulate) return
    if (this.state.fetch.loading || !this.state.fetch.hasMore) return
    // In accumulate mode, page watch is not active — increment and fetch manually
    this.state.pagination = {
      ...this.state.pagination,
      page: this.state.pagination.page + 1,
    }
    void this.executeFetchInternal(true)
  }

  /**
   * Force reload the current page (or reset to page 1 in accumulate mode).
   */
  requestReload(): void {
    if (!this._request.value) return
    if (this._requestConfig.accumulate) {
      this._data.value = []
      this.state.pagination = { ...this.state.pagination, page: 1 }
      this.state.fetch = { ...this.state.fetch, hasMore: true }
    }
    void this.executeFetchInternal(false)
  }

  private invalidateActiveFetch(): void {
    this._fetchVersion += 1
    if (this._abortController) {
      this._abortController.abort()
      this._abortController = null
    }
  }

  private resetRowsForRequestChange(): void {
    this._data.value = []
    this.state.pagination = { ...this.state.pagination, page: 1, total: 0 }
    this.state.fetch = { ...FETCH_STATE_DEFAULTS }
  }

  /**
   * Export visible data to CSV and trigger a browser download.
   * @param mode — 'page' exports current processedRows; 'selected' exports selected rows.
   * @param filename — download filename (default: 'export.csv').
   */
  exportData(mode: 'page' | 'selected' = 'page', filename?: string): void {
    const columns = this.visibleColumns.value
    const rows = mode === 'selected' ? this.state.selection.selectedRows : this.processedRows.value
    exportToCsv(columns, rows as T[], filename)
  }

  destroy(): void {
    // 取消任何进行中的请求
    if (this._abortController) {
      this._abortController.abort()
      this._abortController = null
    }
    this._scope.stop()
  }
}
