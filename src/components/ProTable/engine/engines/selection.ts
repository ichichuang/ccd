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
  getKey: (row: T) => string,
  max?: number
): SelectionState<T> {
  const capRows = max != null && max > 0 && rows.length > max ? rows.slice(0, max) : rows
  const capKeys = capRows.map(getKey)
  const allCapSelected =
    capKeys.length > 0 &&
    capKeys.length === state.selectedRowKeys.length &&
    capKeys.every((k, i) => state.selectedRowKeys[i] === k)
  if (allCapSelected) {
    return { selectedRows: [], selectedRowKeys: [] }
  }
  return {
    selectedRows: [...capRows],
    selectedRowKeys: capKeys,
  }
}

export function clearSelection<T extends Record<string, unknown>>(): SelectionState<T> {
  return { selectedRows: [], selectedRowKeys: [] }
}
