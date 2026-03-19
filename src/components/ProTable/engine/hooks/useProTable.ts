import type { ComputedRef, Ref } from 'vue'
import { TableController } from '../core/TableController'
import type { TableControllerOptions } from '../core/TableController'
import type { TableState } from '../types/tableState'
import type { ProTableColumn } from '../types/column'
import type { ProTableLoadParams } from '../types/props'

export interface UseProTableOptions<
  T extends Record<string, unknown>,
> extends TableControllerOptions<T> {
  dataRef?: Ref<T[]>
  totalRef?: Ref<number>
}

export interface UseProTableReturn<T extends Record<string, unknown>> {
  state: TableState<T>
  processedRows: ComputedRef<T[]>
  visibleColumns: ComputedRef<ProTableColumn<T>[]>
  totalCount: ComputedRef<number>
  toggleSort: (field: string) => void
  setGlobalFilter: (val: string) => void
  selectRow: (row: T, mode: 'single' | 'checkbox') => void
  selectAll: () => void
  clearSelection: () => void
  isRowSelected: (row: T) => boolean
  toggleColumnVisibility: (id: string, visible?: boolean) => void
  isColumnVisible: (id: string) => boolean
  setPage: (p: number) => void
  setPageSize: (s: number) => void
  emitLoad: (params: ProTableLoadParams) => void
  destroy: () => void
}

export function useProTable<T extends Record<string, unknown>>(
  options: UseProTableOptions<T>
): UseProTableReturn<T> {
  const ctrl = new TableController<T>(options)

  if (options.dataRef) {
    ctrl.setData(options.dataRef.value)
    watch(options.dataRef, data => ctrl.setData(data), { deep: false })
  }

  if (options.totalRef) {
    ctrl.setTotal(options.totalRef.value)
    watch(options.totalRef, total => ctrl.setTotal(total))
  }

  onUnmounted(() => ctrl.destroy())

  function emitLoad(params: ProTableLoadParams): void {
    options.onLoad?.(params)
  }

  return {
    state: ctrl.state,
    processedRows: ctrl.processedRows,
    visibleColumns: ctrl.visibleColumns,
    totalCount: ctrl.totalCount,
    toggleSort: (field: string) => ctrl.updateSort(field),
    setGlobalFilter: (val: string) => ctrl.setGlobalFilter(val),
    selectRow: (row: T, mode: 'single' | 'checkbox') => ctrl.selectRow(row, mode),
    selectAll: () => ctrl.selectAll(),
    clearSelection: () => ctrl.clearSelection(),
    isRowSelected: (row: T) => ctrl.isRowSelected(row),
    toggleColumnVisibility: (id: string, visible?: boolean) =>
      ctrl.toggleColumnVisibility(id, visible),
    isColumnVisible: (id: string) => ctrl.isColumnVisible(id),
    setPage: (p: number) => ctrl.setPage(p),
    setPageSize: (s: number) => ctrl.setPageSize(s),
    emitLoad,
    destroy: () => ctrl.destroy(),
  }
}
