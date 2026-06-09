import { useLocalStorage } from '@vueuse/core'
import { toValue } from 'vue'
import type { MaybeRefOrGetter } from 'vue'
import { mergeColumnSettingsWithColumns } from '../engines/columnVisibility'
import type { ProTableColumn } from '../types/column'
import type { ColumnSettingsState } from '../types/tableState'

/** 单 key 下按表格 `stateKey` 分桶，避免 useLocalStorage 动态 key 限制 */
const STORAGE_BUCKET_KEY = 'pro-table-column-settings'

export interface UseProTableColumnSettingsStorageReturn {
  getInitialColumnSettings: <T extends Record<string, unknown>>(
    columns: ProTableColumn<T>[]
  ) => ColumnSettingsState
  onColumnSettingsChange: (next: ColumnSettingsState) => void
}

export function useProTableColumnSettingsStorage(
  stateKey: MaybeRefOrGetter<string | undefined>
): UseProTableColumnSettingsStorageReturn {
  const bucket = useLocalStorage<Record<string, ColumnSettingsState>>(STORAGE_BUCKET_KEY, {})

  function getInitialColumnSettings<T extends Record<string, unknown>>(
    columns: ProTableColumn<T>[]
  ): ColumnSettingsState {
    const k = toValue(stateKey)
    if (!k) return mergeColumnSettingsWithColumns(columns, null)
    const persisted = bucket.value[k]
    return mergeColumnSettingsWithColumns(columns, persisted)
  }

  function onColumnSettingsChange(next: ColumnSettingsState): void {
    const k = toValue(stateKey)
    if (!k) return
    bucket.value = {
      ...bucket.value,
      [k]: { orderedKeys: [...next.orderedKeys], hiddenKeys: [...next.hiddenKeys] },
    }
  }

  return { getInitialColumnSettings, onColumnSettingsChange }
}
