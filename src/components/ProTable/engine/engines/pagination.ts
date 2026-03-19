import type { PaginationState } from '../types/tableState'

export function applyPagination<T extends Record<string, unknown>>(
  rows: T[],
  state: PaginationState,
  serverMode: boolean
): T[] {
  if (serverMode) return rows
  const start = (state.page - 1) * state.pageSize
  return rows.slice(start, start + state.pageSize)
}
