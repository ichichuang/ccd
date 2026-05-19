/**
 * A4 Table + Drawer 页面的全局状态
 * 托管 Drawer 显隐与当前选中行（详情）
 */
import { defineStore } from 'pinia'

export interface TableDrawerState {
  drawerVisible: boolean
  selectedRow: Record<string, unknown> | null
}

export const useTableDrawerStore = defineStore('tableDrawer', {
  state: (): TableDrawerState => ({
    drawerVisible: false,
    selectedRow: null,
  }),

  actions: {
    openDrawer(row: Record<string, unknown> | null): void {
      this.selectedRow = row
      this.drawerVisible = true
    },

    closeDrawer(): void {
      this.drawerVisible = false
      this.selectedRow = null
    },
  },
})
