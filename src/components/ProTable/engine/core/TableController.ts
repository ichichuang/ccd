import type { ComputedRef, ShallowRef, EffectScope } from 'vue'
import type { TableState, SortState, FilterState } from '../types/tableState'
import type { ProTableColumn } from '../types/column'
import type { ProTableLoadParams } from '../types/props'
import {
  FILTER_DEFAULTS,
  PAGINATION_DEFAULTS,
  PRO_TABLE_PROPS_DEFAULTS,
  SORT_DEFAULTS,
} from '../config'
import { applySort, nextSortDirection } from '../engines/sorting'
import { applyFilter } from '../engines/filtering'
import { applyPagination } from '../engines/pagination'
import { toggleRowSelection, toggleAllSelection, clearSelection } from '../engines/selection'
import { setColumnVisibility, getVisibleColumns } from '../engines/columnVisibility'

export interface TableControllerOptions<T extends Record<string, unknown>> {
  columns: ProTableColumn<T>[]
  data: T[]
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
}

function getRowKey<T extends Record<string, unknown>>(row: T, keyField: string): string {
  return String(row[keyField as keyof T] ?? JSON.stringify(row))
}

export class TableController<T extends Record<string, unknown>> {
  readonly state: TableState<T>
  private _columns: ProTableColumn<T>[]
  private _data: ShallowRef<T[]>
  private _serverMode: boolean
  private _rowKey: string
  private _paginationEnabled: boolean
  private _scope: EffectScope

  filteredAndSorted!: ComputedRef<T[]>
  processedRows!: ComputedRef<T[]>
  visibleColumns!: ComputedRef<ProTableColumn<T>[]>
  totalCount!: ComputedRef<number>

  constructor(options: TableControllerOptions<T>) {
    this._columns = options.columns
    this._data = shallowRef(options.data) as ShallowRef<T[]>
    this._serverMode = options.serverMode ?? PRO_TABLE_PROPS_DEFAULTS.serverMode
    this._rowKey = String(options.rowKey ?? PRO_TABLE_PROPS_DEFAULTS.rowKey)
    this._paginationEnabled = options.paginationEnabled ?? PRO_TABLE_PROPS_DEFAULTS.pagination
    this._scope = effectScope()

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

      if (this._serverMode) {
        watch(
          () =>
            [
              this.state.sort,
              this.state.filter,
              this.state.pagination.page,
              this.state.pagination.pageSize,
            ] as const,
          () => {
            options.onLoad?.({
              page: this.state.pagination.page,
              pageSize: this.state.pagination.pageSize,
              sort: { ...this.state.sort },
              filter: { ...this.state.filter },
            })
          },
          { deep: true }
        )
      }
    })
  }

  setData(data: T[]): void {
    this._data.value = data
  }

  setTotal(total: number): void {
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

  destroy(): void {
    this._scope.stop()
  }
}
