/**
 * useTableSelection - 表格行选择 Composable
 * 负责：selectedRows、idField、selection 模式、行点击选择、全选、checkbox/radio
 */

import { computed, ref, watch, type ComputedRef, type Ref } from 'vue'
import type { DataTableProps } from '../utils/types'

export interface UseTableSelectionOptions<T> {
  props: DataTableProps<T>
  sourceData: ComputedRef<T[]>
  filteredData: ComputedRef<T[]>
  dataToRender: ComputedRef<T[]>
  emit: {
    (e: 'update:selectedRows', rows: T[]): void
    (e: 'row-select', event: unknown): void
    (e: 'row-unselect', event: unknown): void
    (e: 'row-click', event: unknown): void
  }
}

export interface UseTableSelectionReturn<T> {
  selectedRows: Ref<T[]>
  idField: ComputedRef<string | undefined>
  selectionModeComputed: ComputedRef<'single' | 'multiple' | undefined>
  selectionComputed: ComputedRef<T | T[] | null>
  isAllSelected: ComputedRef<boolean>
  isRowSelected: (row: T) => boolean
  handleRadioSelect: (row: T) => void
  handleCheckboxChange: (checked: boolean, row: T) => void
  handleSelectAllChange: (checked: boolean) => void
  handleRowClick: (event: { data: T; index: number; originalEvent: Event }) => void
  handleRowSelect: (event: { data: T | T[]; type?: string }) => void
  handleRowUnselect: (event: { data: T; type?: string }) => void
  handleTableWrapperClick: (e: MouseEvent) => void
  clearSelection: () => void
  selectAll: () => void
  selectRow: (row: T) => boolean
  unselectRow: (row: T) => boolean
}

export function useTableSelection<T extends object>(
  options: UseTableSelectionOptions<T>
): UseTableSelectionReturn<T> {
  const { props, sourceData, filteredData, dataToRender, emit } = options

  const selectedRows = ref<T[]>(props.selectedRows ?? []) as Ref<T[]>

  const emitSelectedRows = (rows: T[]) => emit('update:selectedRows', rows)

  const idField = computed(() => {
    if (sourceData.value.length > 0) {
      const first = sourceData.value[0] as Record<string, unknown>
      if ('id' in first) return 'id'
      if ('_id' in first) return '_id'
    }
    return undefined
  })

  const selectionModeComputed = computed(() => {
    if (props.selectable === false) return undefined
    return props.selectionMode ?? 'multiple'
  })

  const selectionComputed = computed(() => {
    if (selectionModeComputed.value === 'single') return selectedRows.value[0] ?? null
    return selectedRows.value
  })

  const isRowSelected = (row: T) => {
    const field = idField.value
    const rows = selectedRows.value as T[]
    if (field) {
      return rows.some(
        s => (s as Record<string, unknown>)[field] === (row as Record<string, unknown>)[field]
      )
    }
    return rows.includes(row)
  }

  const isAllSelected = computed(
    () => sourceData.value.length > 0 && sourceData.value.every(row => isRowSelected(row))
  )

  const handleRadioSelect = (row: T) => {
    selectedRows.value = [row] as T[]
    emitSelectedRows(selectedRows.value as T[])
  }

  const handleCheckboxChange = (checked: boolean, row: T) => {
    const field = idField.value
    const rows = selectedRows.value as T[]
    if (checked) {
      if (selectionModeComputed.value === 'single') selectedRows.value = [row]
      else if (!isRowSelected(row)) selectedRows.value = [...rows, row] as T[]
    } else {
      if (field) {
        selectedRows.value = rows.filter(
          s => (s as Record<string, unknown>)[field] !== (row as Record<string, unknown>)[field]
        ) as T[]
      } else {
        selectedRows.value = rows.filter(s => s !== row) as T[]
      }
    }
    emitSelectedRows(selectedRows.value as T[])
  }

  const handleSelectAllChange = (checked: boolean) => {
    selectedRows.value = (checked ? [...filteredData.value] : []) as T[]
    emitSelectedRows(selectedRows.value as T[])
  }

  const handleRowClick = (event: { data: T; index: number; originalEvent: Event }) => {
    emit('row-click', event)
    if (!props.selectable || !props.rowSelectable) return

    const { data } = event
    const isSelected = isRowSelected(data)
    let newRows: T[] = []

    if (selectionModeComputed.value === 'single') {
      if (isSelected) return
      newRows = [data]
    } else {
      const rows = selectedRows.value as T[]
      const field = idField.value

      if (isSelected) {
        newRows = field
          ? (rows.filter(
              s =>
                (s as Record<string, unknown>)[field] !== (data as Record<string, unknown>)[field]
            ) as T[])
          : (rows.filter(s => s !== data) as T[])
        emit('row-unselect', { originalEvent: event.originalEvent, data, type: 'row' })
      } else {
        newRows = [...rows, data]
        emit('row-select', { originalEvent: event.originalEvent, data, type: 'row' })
      }
    }

    selectedRows.value = newRows
    emitSelectedRows(newRows)
  }

  const handleRowSelect = (event: { data: T | T[]; type?: string }) => {
    if (event.type === 'row' && !props.rowSelectable) return
    const rows = (Array.isArray(event.data) ? event.data : [event.data]) as T[]
    selectedRows.value = rows
    emitSelectedRows(rows)
    emit('row-select', event)
  }

  const handleRowUnselect = (event: { data: T; type?: string }) => {
    if (event.type === 'row' && !props.rowSelectable) return
    const rows = selectedRows.value as T[]
    selectedRows.value = rows.filter(r => r !== event.data) as T[]
    emitSelectedRows(selectedRows.value as T[])
    emit('row-unselect', event)
  }

  const handleTableWrapperClick = (e: MouseEvent) => {
    if (!props.selectable || !props.rowSelectable || !selectionModeComputed.value) return
    if ((e.target as HTMLElement).closest?.('.c-dt-selection-cell')) return
    const tr = (e.target as HTMLElement).closest?.('tr[data-p-selectable-row="true"]')
    if (!tr) return
    const idx = tr.getAttribute('data-p-index')
    if (idx == null) return
    const index = parseInt(idx, 10)
    if (Number.isNaN(index)) return
    const data = dataToRender.value
    const rowData = data[index] as T | undefined
    if (!rowData) return
    if (selectionModeComputed.value === 'single') {
      selectedRows.value = [rowData]
      emitSelectedRows(selectedRows.value as T[])
      return
    }
    const rows = selectedRows.value as T[]
    const field = idField.value
    if (isRowSelected(rowData)) {
      selectedRows.value = field
        ? (rows.filter(
            s =>
              (s as Record<string, unknown>)[field] !== (rowData as Record<string, unknown>)[field]
          ) as T[])
        : (rows.filter(s => s !== rowData) as T[])
    } else {
      selectedRows.value = [...rows, rowData] as T[]
    }
    emitSelectedRows(selectedRows.value as T[])
  }

  const clearSelection = () => {
    selectedRows.value = []
    emitSelectedRows([])
  }

  const selectAll = () => {
    const rows = filteredData.value as unknown as T[]
    selectedRows.value = rows as unknown as T[]
    emitSelectedRows(rows)
  }

  const selectRow = (row: T): boolean => {
    if (isRowSelected(row)) return false
    const rows = selectedRows.value as T[]
    selectedRows.value = (selectionModeComputed.value === 'single' ? [row] : [...rows, row]) as T[]
    emitSelectedRows(selectedRows.value as T[])
    return true
  }

  const unselectRow = (row: T): boolean => {
    const rows = selectedRows.value as T[]
    const before = rows.length
    selectedRows.value = rows.filter(r => r !== row) as T[]
    if (selectedRows.value.length !== before) emitSelectedRows(selectedRows.value as T[])
    return before !== selectedRows.value.length
  }

  // Sync external selectedRows prop
  watch(
    () => props.selectedRows,
    v => {
      if (v && Array.isArray(v)) selectedRows.value = v
    },
    { deep: true }
  )

  return {
    selectedRows,
    idField,
    selectionModeComputed,
    selectionComputed,
    isAllSelected,
    isRowSelected,
    handleRadioSelect,
    handleCheckboxChange,
    handleSelectAllChange,
    handleRowClick,
    handleRowSelect,
    handleRowUnselect,
    handleTableWrapperClick,
    clearSelection,
    selectAll,
    selectRow,
    unselectRow,
  }
}
