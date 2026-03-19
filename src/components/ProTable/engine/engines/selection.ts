import type { SelectionState } from '../types/tableState'

export function toggleRowSelection<T extends Record<string, unknown>>(
  state: SelectionState<T>,
  row: T,
  key: string,
  mode: 'single' | 'checkbox'
): SelectionState<T> {
  if (mode === 'single') {
    const alreadySelected = state.selectedRowKeys[0] === key
    return alreadySelected
      ? { selectedRows: [], selectedRowKeys: [] }
      : { selectedRows: [row], selectedRowKeys: [key] }
  }
  const idx = state.selectedRowKeys.indexOf(key)
  if (idx === -1) {
    return {
      selectedRows: [...state.selectedRows, row],
      selectedRowKeys: [...state.selectedRowKeys, key],
    }
  }
  return {
    selectedRows: state.selectedRows.filter((_, i) => i !== idx),
    selectedRowKeys: state.selectedRowKeys.filter((_, i) => i !== idx),
  }
}

export function toggleAllSelection<T extends Record<string, unknown>>(
  state: SelectionState<T>,
  rows: T[],
  getKey: (row: T) => string
): SelectionState<T> {
  if (state.selectedRowKeys.length === rows.length && rows.length > 0) {
    return { selectedRows: [], selectedRowKeys: [] }
  }
  return {
    selectedRows: [...rows],
    selectedRowKeys: rows.map(getKey),
  }
}

export function clearSelection<T extends Record<string, unknown>>(): SelectionState<T> {
  return { selectedRows: [], selectedRowKeys: [] }
}
