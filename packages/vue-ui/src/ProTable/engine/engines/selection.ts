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

export function selectRangeSelection<T extends Record<string, unknown>>(
  state: SelectionState<T>,
  rows: T[],
  getKey: (row: T) => string,
  anchorKey: string,
  targetKey: string,
  max?: number
): SelectionState<T> | null {
  const anchorIndex = rows.findIndex(row => getKey(row) === anchorKey)
  const targetIndex = rows.findIndex(row => getKey(row) === targetKey)
  if (anchorIndex === -1 || targetIndex === -1) return null

  const start = Math.min(anchorIndex, targetIndex)
  const end = Math.max(anchorIndex, targetIndex)
  const rangeRows = rows.slice(start, end + 1)
  const rangeKeys = new Set(rangeRows.map(getKey))
  const outsideRows: T[] = []
  const outsideKeys: string[] = []

  state.selectedRows.forEach((row, index) => {
    const key = state.selectedRowKeys[index]
    if (key && !rangeKeys.has(key)) {
      outsideRows.push(row)
      outsideKeys.push(key)
    }
  })

  const maxCount = max != null && max > 0 ? max : undefined
  const cappedOutsideRows = maxCount ? outsideRows.slice(0, maxCount) : outsideRows
  const cappedOutsideKeys = maxCount ? outsideKeys.slice(0, maxCount) : outsideKeys
  const remainingCapacity = maxCount
    ? Math.max(0, maxCount - cappedOutsideRows.length)
    : rangeRows.length
  const cappedRangeRows = rangeRows.slice(0, remainingCapacity)
  const cappedRangeKeys = cappedRangeRows.map(getKey)

  return {
    selectedRows: [...cappedOutsideRows, ...cappedRangeRows],
    selectedRowKeys: [...cappedOutsideKeys, ...cappedRangeKeys],
  }
}

export function clearSelection<T extends Record<string, unknown>>(): SelectionState<T> {
  return { selectedRows: [], selectedRowKeys: [] }
}
