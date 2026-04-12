import type { ColumnSettingsState } from '../types/tableState'
import type { ProTableColumn } from '../types/column'

function uniquePreserve(ids: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const id of ids) {
    if (!seen.has(id)) {
      seen.add(id)
      out.push(id)
    }
  }
  return out
}

/** 合并持久化与当前列定义：去掉无效 id、补全新列 id（按定义顺序追加到 orderedKeys 末尾） */
export function mergeColumnSettingsWithColumns<T extends Record<string, unknown>>(
  columns: ProTableColumn<T>[],
  persisted: ColumnSettingsState | null | undefined
): ColumnSettingsState {
  const validIds = new Set(columns.map(c => c.id))
  const definitionOrder = columns.map(c => c.id)

  if (!persisted) {
    return {
      orderedKeys: [],
      hiddenKeys: uniquePreserve(columns.filter(c => c.hidden).map(c => c.id)),
    }
  }

  const fromOrder = persisted.orderedKeys.filter(id => validIds.has(id))
  const seen = new Set(fromOrder)
  const orderedKeys = uniquePreserve([...fromOrder, ...definitionOrder.filter(id => !seen.has(id))])

  const hiddenSet = new Set(persisted.hiddenKeys.filter(id => validIds.has(id)))
  for (const c of columns) {
    if (c.hidden) hiddenSet.add(c.id)
  }

  return { orderedKeys, hiddenKeys: Array.from(hiddenSet) }
}

/**
 * 计算最终列 id 顺序：orderedKeys 为空则用 columns 定义顺序；否则按 orderedKeys 并追加未出现的新列。
 */
export function resolveColumnIdOrder<T extends Record<string, unknown>>(
  columns: ProTableColumn<T>[],
  orderedKeys: string[]
): string[] {
  const validIds = new Set(columns.map(c => c.id))
  const definitionOrder = columns.map(c => c.id)

  if (orderedKeys.length === 0) {
    return definitionOrder.filter(id => validIds.has(id))
  }

  const seen = new Set<string>()
  const result: string[] = []

  for (const id of orderedKeys) {
    if (validIds.has(id) && !seen.has(id)) {
      seen.add(id)
      result.push(id)
    }
  }
  for (const id of definitionOrder) {
    if (!seen.has(id)) {
      seen.add(id)
      result.push(id)
    }
  }
  return result
}

/**
 * 可见列：按 orderedKeys/定义顺序 → 剔除 hidden → 按 left / 非固定 / right 三段拼接（满足 PrimeVue frozen 顺序）。
 */
export function buildVisibleColumns<T extends Record<string, unknown>>(
  columns: ProTableColumn<T>[],
  state: ColumnSettingsState
): ProTableColumn<T>[] {
  const hidden = new Set(state.hiddenKeys)
  const map = new Map(columns.map(c => [c.id, c] as const))
  const idOrder = resolveColumnIdOrder(columns, state.orderedKeys)

  const flat: ProTableColumn<T>[] = []
  for (const id of idOrder) {
    if (hidden.has(id)) continue
    const col = map.get(id)
    if (col) flat.push(col)
  }

  const leftPinned: ProTableColumn<T>[] = []
  const unpinned: ProTableColumn<T>[] = []
  const rightPinned: ProTableColumn<T>[] = []

  for (const col of flat) {
    if (col.pinned === 'left') leftPinned.push(col)
    else if (col.pinned === 'right') rightPinned.push(col)
    else unpinned.push(col)
  }

  return [...leftPinned, ...unpinned, ...rightPinned]
}

export function setColumnVisibility(
  state: ColumnSettingsState,
  id: string,
  forceVisible?: boolean
): ColumnSettingsState {
  const hidden = new Set(state.hiddenKeys)
  const isHidden = hidden.has(id)
  if (forceVisible !== undefined) {
    if (forceVisible) {
      hidden.delete(id)
    } else {
      hidden.add(id)
    }
  } else {
    if (isHidden) {
      hidden.delete(id)
    } else {
      hidden.add(id)
    }
  }
  return { ...state, hiddenKeys: Array.from(hidden) }
}

/** 由 UI 传入的新顺序 / 隐藏列表生成合法 ColumnSettingsState */
export function normalizeColumnSettingsKeys<T extends Record<string, unknown>>(
  columns: ProTableColumn<T>[],
  newOrder: string[],
  newHidden: string[]
): ColumnSettingsState {
  const validIds = new Set(columns.map(c => c.id))
  const orderedKeys = uniquePreserve(newOrder.filter(id => validIds.has(id)))
  const hiddenKeys = uniquePreserve(newHidden.filter(id => validIds.has(id)))
  return { orderedKeys, hiddenKeys }
}
