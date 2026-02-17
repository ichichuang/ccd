/**
 * useTablePersistence - 表格列持久化 Hook
 * 负责列顺序、列宽的加载、应用、保存和重置
 */

import type { DataTableColumn, DataTableUserPreferences } from '@/components/DataTable/utils/types'
import { useDataTableStore } from '@/stores/modules/dataTable'
import { debounceFn } from '@/utils/lodashes'
import { computed, ref, unref, watch, type MaybeRef, type Ref } from 'vue'

export interface UseTablePersistenceReturn<T = unknown> {
  effectiveColumns: Ref<DataTableColumn<T>[]>
  handleColumnResize: (event: {
    element: HTMLElement
    column: { field?: string }
    delta: number
  }) => void
  handleColumnReorder: (event: { dragIndex: number; dropIndex: number }) => void
  resetPreferences: () => void
  getPreferences: () => DataTableUserPreferences | null
  savePreferences: () => void
}

export function useTablePersistence<T>(
  tableId: MaybeRef<string | undefined>,
  originalColumns: MaybeRef<DataTableColumn<T>[]>
): UseTablePersistenceReturn<T> {
  const dataTableStore = useDataTableStore()
  const tableIdRef = computed(() => unref(tableId))
  const originalColumnsRef = computed(() => unref(originalColumns))
  const preferences = ref<DataTableUserPreferences>({})

  const loadPreferences = () => {
    if (!tableIdRef.value) {
      preferences.value = {}
      return
    }
    const stored = dataTableStore.getTableSettings(tableIdRef.value)
    preferences.value = stored ? { ...stored } : {}
  }

  const _savePreferences = () => {
    if (!tableIdRef.value) return
    try {
      dataTableStore.saveUserPreferences(tableIdRef.value, preferences.value)
    } catch (error) {
      console.warn('[useTablePersistence] Failed to save preferences:', error)
    }
  }

  const debouncedSave = debounceFn(_savePreferences, 500)

  const savePreferences = () => {
    ;(debouncedSave as { cancel?: () => void }).cancel?.()
    _savePreferences()
  }

  const effectiveColumns = computed(() => {
    const columns = [...originalColumnsRef.value]
    if (!tableIdRef.value || !preferences.value.columnOrder) {
      if (
        preferences.value.columnWidths &&
        Object.keys(preferences.value.columnWidths).length > 0
      ) {
        return columns.map(col => {
          const field = String(col.field)
          const savedWidth = preferences.value.columnWidths?.[field]
          return savedWidth !== undefined ? { ...col, width: savedWidth } : col
        })
      }
      return columns
    }

    const { columnOrder, columnWidths, hiddenColumns } = preferences.value
    const colMap = new Map(columns.map(col => [String(col.field), col]))
    const sortedCols: DataTableColumn<T>[] = []

    columnOrder?.forEach(field => {
      const col = colMap.get(field)
      if (col) {
        const newCol: DataTableColumn<T> = { ...col }
        if (columnWidths?.[field] !== undefined) newCol.width = columnWidths[field]
        if (!hiddenColumns?.includes(field)) sortedCols.push(newCol)
        colMap.delete(field)
      }
    })

    for (const col of colMap.values()) {
      const field = String(col.field)
      const savedWidth = columnWidths?.[field]
      sortedCols.push(savedWidth !== undefined ? { ...col, width: savedWidth } : col)
    }

    return sortedCols
  })

  const handleColumnResize = (event: {
    element: HTMLElement
    column: { field?: string; props?: { field?: string } }
    delta: number
  }) => {
    if (!tableIdRef.value) return
    const field = String(event.column?.field ?? event.column?.props?.field ?? '')
    if (!field) return
    const newWidth = event.element?.offsetWidth ?? 0
    if (newWidth > 0) {
      preferences.value.columnWidths = {
        ...preferences.value.columnWidths,
        [field]: newWidth,
      }
      debouncedSave()
    }
  }

  const handleColumnReorder = (event: { dragIndex: number; dropIndex: number }) => {
    if (!tableIdRef.value) return
    const currentOrder = effectiveColumns.value.map(col => String(col.field))
    const newOrder = [...currentOrder]
    const [dragged] = newOrder.splice(event.dragIndex, 1)
    newOrder.splice(event.dropIndex, 0, dragged)
    preferences.value.columnOrder = newOrder
    debouncedSave()
  }

  const resetPreferences = () => {
    if (!tableIdRef.value) return
    preferences.value = {}
    dataTableStore.clearTableSettings(tableIdRef.value)
  }

  const getPreferences = (): DataTableUserPreferences | null => {
    if (!tableIdRef.value) return null
    return { ...preferences.value }
  }

  watch(tableIdRef, loadPreferences, { immediate: true })

  return {
    effectiveColumns,
    handleColumnResize,
    handleColumnReorder,
    resetPreferences,
    getPreferences,
    savePreferences,
  }
}
