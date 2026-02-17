/**
 * DataTable 用户偏好 Store
 * 存储表格列顺序、列宽等用户偏好
 */

import { defineStore } from 'pinia'

const PERSIST_KEY = `${import.meta.env?.VITE_PINIA_PERSIST_KEY_PREFIX ?? 'ccd-storage-kernel'}-dataTable`

export interface DataTableUserPreferences {
  columnOrder?: string[]
  columnWidths?: Record<string, number | string>
  hiddenColumns?: string[]
}

interface DataTableSettings {
  [tableId: string]: DataTableUserPreferences
}

interface DataTableState {
  tableSettings: DataTableSettings
}

export const useDataTableStore = defineStore('dataTable', {
  state: (): DataTableState => ({
    tableSettings: {},
  }),

  getters: {
    getTableSettings:
      (state: DataTableState) =>
      (tableId: string): DataTableUserPreferences | null => {
        return state.tableSettings[tableId] || null
      },
  },

  actions: {
    saveUserPreferences(tableId: string, preferences: DataTableUserPreferences) {
      if (!tableId) return
      this.tableSettings[tableId] = {
        ...this.tableSettings[tableId],
        ...preferences,
      }
    },

    clearTableSettings(tableId: string) {
      if (!tableId) return
      if (this.tableSettings[tableId]) {
        delete this.tableSettings[tableId]
      }
    },

    clearAllTableSettings() {
      this.tableSettings = {}
    },
  },

  persist: {
    key: PERSIST_KEY,
    storage: localStorage,
  },
})
