import type { VxeTableUserPreferences } from '@/components/modules/vxe-table'
import store from '@/stores'
import { env } from '@/utils'
import { defineStore } from 'pinia'

/**
 * 表格列配置（持久化）
 * @deprecated 使用 VxeTableUserPreferences 代替
 */
export interface VxeTableColumnSettings {
  /** 列顺序（字段名数组） */
  columnOrder: string[]
  /** 列宽度（字段名: 宽度） */
  columnWidths: Record<string, number>
}

/**
 * 表格配置存储（以 tableId 为 key）
 */
interface VxeTableSettings {
  [tableId: string]: VxeTableUserPreferences
}

interface VxeTableState {
  vxeTableData: any[]
  /** 表格配置存储 */
  tableSettings: VxeTableSettings
}

export const useVxeTableStore = defineStore('vxeTable', {
  state: (): VxeTableState => ({
    vxeTableData: [],
    tableSettings: {},
  }),

  getters: {
    /**
     * 获取指定表格的配置
     * @param tableId 表格唯一标识
     * @returns 表格配置，如果不存在则返回 null
     */
    getTableSettings:
      (state: VxeTableState) =>
      (tableId: string): VxeTableUserPreferences | null => {
        return state.tableSettings[tableId] || null
      },
  },

  actions: {
    /**
     * 保存表格列顺序
     * @param tableId 表格唯一标识
     * @param columnOrder 列顺序（字段名数组）
     */
    saveColumnOrder(tableId: string, columnOrder: string[]) {
      if (!tableId) {
        console.warn('[VxeTableStore] tableId 不能为空')
        return
      }

      if (!this.tableSettings[tableId]) {
        this.tableSettings[tableId] = {}
      }

      this.tableSettings[tableId].columnOrder = columnOrder
    },

    /**
     * 保存表格列宽
     * @param tableId 表格唯一标识
     * @param field 字段名
     * @param width 列宽度（像素）
     */
    saveColumnWidth(tableId: string, field: string, width: number) {
      if (!tableId) {
        console.warn('[VxeTableStore] tableId 不能为空')
        return
      }

      if (!field) {
        console.warn('[VxeTableStore] field 不能为空')
        return
      }

      if (!this.tableSettings[tableId]) {
        this.tableSettings[tableId] = {}
      }

      if (!this.tableSettings[tableId].columnWidths) {
        this.tableSettings[tableId].columnWidths = {}
      }

      this.tableSettings[tableId].columnWidths![field] = width
    },

    /**
     * 批量保存表格列宽
     * @param tableId 表格唯一标识
     * @param columnWidths 列宽度映射（字段名: 宽度）
     */
    saveColumnWidths(tableId: string, columnWidths: Record<string, number>) {
      if (!tableId) {
        console.warn('[VxeTableStore] tableId 不能为空')
        return
      }

      if (!this.tableSettings[tableId]) {
        this.tableSettings[tableId] = {}
      }

      if (!this.tableSettings[tableId].columnWidths) {
        this.tableSettings[tableId].columnWidths = {}
      }

      this.tableSettings[tableId].columnWidths = {
        ...this.tableSettings[tableId].columnWidths,
        ...columnWidths,
      }
    },

    /**
     * 清除指定表格的配置
     * @param tableId 表格唯一标识
     */
    clearTableSettings(tableId: string) {
      if (!tableId) {
        console.warn('[VxeTableStore] tableId 不能为空')
        return
      }

      if (this.tableSettings[tableId]) {
        delete this.tableSettings[tableId]
      }
    },

    /**
     * 清除所有表格配置
     */
    clearAllTableSettings() {
      this.tableSettings = {}
    },

    /**
     * 保存用户偏好设置（完整更新）
     * @param tableId 表格唯一标识
     * @param preferences 用户偏好设置
     */
    saveUserPreferences(tableId: string, preferences: VxeTableUserPreferences) {
      if (!tableId) {
        console.warn('[VxeTableStore] tableId 不能为空')
        return
      }

      this.tableSettings[tableId] = {
        ...this.tableSettings[tableId],
        ...preferences,
      }
    },
  },

  persist: {
    key: `${env.piniaKeyPrefix}-vxeTable`,
    storage: localStorage,
  },
})

export const useVxeTableStoreWithOut = () => {
  return useVxeTableStore(store)
}
