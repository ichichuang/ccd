import type { ComputedRef, ShallowRef, EffectScope } from 'vue'
import type { TableState, SortState, FilterState } from '../types/tableState'
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
import { applySort, nextSortDirection } from '../engines/sorting'
import { applyFilter } from '../engines/filtering'
import { applyPagination } from '../engines/pagination'
import { toggleRowSelection, toggleAllSelection, clearSelection } from '../engines/selection'
import { setColumnVisibility, getVisibleColumns } from '../engines/columnVisibility'
import { exportToCsv } from '../engines/export'

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
  onLoad?: (params: ProTableLoadParams) => void
  onSortChange?: (sort: SortState) => void
  onFilterChange?: (filter: FilterState) => void
  onPageChange?: (page: number, pageSize: number) => void

  /** Autonomous data-fetching callback. */
  request?: RequestFn<T>
  /** Configuration for the `request` behaviour. */
  requestConfig?: RequestConfig
  /** Emitted when request() rejects. */
  onRequestError?: (error: Error) => void
}

function getRowKey<T extends Record<string, unknown>>(row: T, keyField: string): string {
  return String(row[keyField as keyof T] ?? JSON.stringify(row))
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
  private _paginationEnabled: boolean
  private _scope: EffectScope
  private _request?: RequestFn<T>
  private _requestConfig: Required<RequestConfig>
  private _onRequestError?: (error: Error) => void
  private _fetchVersion = 0

  /** True when ProTable is in request mode (autonomous fetch). */
  get requestMode(): boolean {
    return !!this._request
  }

  filteredAndSorted!: ComputedRef<T[]>
  processedRows!: ComputedRef<T[]>
  visibleColumns!: ComputedRef<ProTableColumn<T>[]>
  totalCount!: ComputedRef<number>

  constructor(options: TableControllerOptions<T>) {
    this._columns = options.columns
    this._data = shallowRef(options.data ?? []) as ShallowRef<T[]>
    this._serverMode = options.serverMode ?? PRO_TABLE_PROPS_DEFAULTS.serverMode
    this._rowKey = String(options.rowKey ?? PRO_TABLE_PROPS_DEFAULTS.rowKey)
    this._paginationEnabled = options.paginationEnabled ?? PRO_TABLE_PROPS_DEFAULTS.pagination
    this._scope = effectScope()
    this._request = options.request
    this._requestConfig = {
      immediate: options.requestConfig?.immediate ?? REQUEST_DEFAULTS.immediate,
      accumulate: options.requestConfig?.accumulate ?? REQUEST_DEFAULTS.accumulate,
    }
    this._onRequestError = options.onRequestError

    const initialHidden = new Set<string>(options.columns.filter(c => c.hidden).map(c => c.id))

    this.state = shallowReactive<TableState<T>>({
      sort: SORT_DEFAULTS.initial,
      filter: FILTER_DEFAULTS.initial,
      pagination: {
        page: PAGINATION_DEFAULTS.initialPage,
        pageSize: options.initialPageSize ?? PAGINATION_DEFAULTS.pageSize,
        total: 0,
      },
      selection: { selectedRows: [], selectedRowKeys: [] },
      columnVisibility: { hiddenColumns: initialHidden },
      fetch: { ...FETCH_STATE_DEFAULTS },
    })

    this._scope.run(() => {
      this.filteredAndSorted = computed<T[]>(() => {
        if (this._serverMode) return this._data.value
        const filtered = applyFilter(this._data.value, this.state.filter, this._columns)
        return applySort(filtered, this.state.sort, (row, field) => row[field])
      })

      this.totalCount = computed<number>(() => {
        return this._serverMode ? this.state.pagination.total : this.filteredAndSorted.value.length
      })

      this.processedRows = computed<T[]>(() => {
        if (!this._paginationEnabled) return this.filteredAndSorted.value
        return applyPagination(
          this.filteredAndSorted.value,
          { ...this.state.pagination, total: this.totalCount.value },
          this._serverMode
        )
      })

      this.visibleColumns = computed<ProTableColumn<T>[]>(() => {
        return getVisibleColumns(this._columns, this.state.columnVisibility)
      })

      const fetchTriggerSources = () => [
        () => this.state.sort.field,
        () => this.state.sort.direction,
        () => this.state.filter.global,
        () => stableColumnFiltersKey(this.state.filter.columns),
        () => this.state.pagination.page,
        () => this.state.pagination.pageSize,
      ]

      if (this._serverMode && !this._request) {
        // Legacy mode: emit @load for parent-driven fetch
        watch(
          fetchTriggerSources(),
          () => {
            options.onLoad?.({
              page: this.state.pagination.page,
              pageSize: this.state.pagination.pageSize,
              sort: { ...this.state.sort },
              filter: { ...this.state.filter },
            })
          },
          { flush: 'post' }
        )
      }

      if (this._request && !this._requestConfig.accumulate) {
        // Request mode (standard pagination): auto-fetch on any state change
        watch(
          fetchTriggerSources(),
          () => {
            void this.executeFetchInternal(false)
          },
          { flush: 'post' }
        )
      }

      if (this._request && this._requestConfig.accumulate) {
        // Request mode (infinite scroll): sort/filter changes → reset & replace
        watch(
          [
            () => this.state.sort.field,
            () => this.state.sort.direction,
            () => this.state.filter.global,
            () => stableColumnFiltersKey(this.state.filter.columns),
          ],
          () => {
            this._data.value = []
            this.state.pagination = { ...this.state.pagination, page: 1 }
            this.state.fetch = { ...this.state.fetch, hasMore: true }
            void this.executeFetchInternal(false)
          },
          { flush: 'post' }
        )
      }
    })
  }

  setData(data: T[]): void {
    this._data.value = data
  }

  setTotal(total: number): void {
    if (this.state.pagination.total === total) return
    // shallowReactive 不追踪嵌套对象的原地修改，必须替换 `pagination` 引用才能驱动 totalCount / 分页 UI
    this.state.pagination = { ...this.state.pagination, total }
  }

  updateSort(field: string): void {
    if (this.state.sort.field !== field) {
      this.state.sort = { field, direction: SORT_DEFAULTS.firstDirection }
    } else {
      const dir = nextSortDirection(this.state.sort.direction)
      this.state.sort = { field: dir === null ? null : field, direction: dir }
    }
    if (this._serverMode) {
      // watch handles load emit
    }
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
    this.state.selection = toggleRowSelection(this.state.selection, row, key, mode)
  }

  selectAll(): void {
    this.state.selection = toggleAllSelection(this.state.selection, this.processedRows.value, r =>
      getRowKey(r, this._rowKey)
    )
  }

  clearSelection(): void {
    this.state.selection = clearSelection<T>()
  }

  isRowSelected(row: T): boolean {
    const key = getRowKey(row, this._rowKey)
    return this.state.selection.selectedRowKeys.includes(key)
  }

  toggleColumnVisibility(id: string, visible?: boolean): void {
    this.state.columnVisibility = setColumnVisibility(this.state.columnVisibility, id, visible)
  }

  isColumnVisible(id: string): boolean {
    return !this.state.columnVisibility.hiddenColumns.has(id)
  }

  // ── Request engine ──────────────────────────────────────────────────────────

  /**
   * Internal fetch executor. Handles loading state, error, data assignment,
   * and accumulate (infinite-scroll) mode.
   * @param append — true for infinite-scroll "load more"
   */
  private async executeFetchInternal(append: boolean): Promise<void> {
    if (!this._request) return

    const version = ++this._fetchVersion
    this.state.fetch = { ...this.state.fetch, loading: true, error: false, errorMessage: '' }

    try {
      const params: ProTableLoadParams = {
        page: this.state.pagination.page,
        pageSize: this.state.pagination.pageSize,
        sort: { ...this.state.sort },
        filter: { ...this.state.filter },
      }

      const result = await this._request(params)

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
      if (version !== this._fetchVersion) return
      const error = err instanceof Error ? err : new Error(String(err))
      this.state.fetch = {
        ...this.state.fetch,
        loading: false,
        error: true,
        errorMessage: error.message,
      }
      this._onRequestError?.(error)
    }
  }

  /**
   * Trigger the initial fetch (called from ProTable onMounted when immediate=true).
   */
  fetchInitial(): void {
    if (!this._request || !this._requestConfig.immediate) return
    void this.executeFetchInternal(false)
  }

  /**
   * Load the next page in accumulate (infinite-scroll) mode.
   */
  fetchMore(): void {
    if (!this._request || !this._requestConfig.accumulate) return
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
    if (!this._request) return
    if (this._requestConfig.accumulate) {
      this._data.value = []
      this.state.pagination = { ...this.state.pagination, page: 1 }
      this.state.fetch = { ...this.state.fetch, hasMore: true }
    }
    void this.executeFetchInternal(false)
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
    this._scope.stop()
  }
}
