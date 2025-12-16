/**
 * useVxeTable Hook
 * - 提供操作表格数据、选择、分页、排序、筛选等方法
 * - 参考 useSchemaForm 的设计模式
 */

import { cloneDeep } from '@/common'
import type {
  ColumnWidthInfo,
  FilterState,
  PaginationState,
  SortState,
  VxeTableExpose,
} from '@/components/modules/vxe-table'
import { isRef, nextTick, onUnmounted, ref, unref, watchEffect, type Ref } from 'vue'
/**
 * 深度克隆工具函数
 */
const deepClone = <T>(value: T): T => {
  return cloneDeep(value)
}

/**
 * useVxeTable Hook 返回值接口
 */
export interface UseVxeTableReturn<T = any> {
  // ========== 响应式数据 ==========
  /** 响应式表格数据（稳定引用） */
  tableData: Ref<T[]>
  /** 响应式选中行（稳定引用） */
  selectedRows: Ref<T[]>
  /** 响应式展开行（稳定引用） */
  expandedRows: Ref<T[]>
  /** 响应式分页状态 */
  paginationState: Ref<PaginationState | null>
  /** 响应式排序状态 */
  sortState: Ref<SortState | null>
  /** 响应式筛选状态 */
  filterState: Ref<FilterState | null>
  /** 响应式列宽度 */
  columnWidths: Ref<ColumnWidthInfo[]>

  // ========== 数据操作方法 ==========
  /** 刷新表格数据 */
  refresh: () => Promise<void>
  /** 加载数据 */
  loadData: (data: T[]) => void
  /** 更新单行数据 */
  updateRow: (row: T, updates: Partial<T>) => boolean
  /** 删除单行数据 */
  deleteRow: (row: T | ((row: T) => boolean)) => boolean
  /** 添加单行数据 */
  addRow: (row: T, index?: number | 'first' | 'last') => boolean
  /** 批量更新数据 */
  updateRows: (updates: Array<{ row: T; data: Partial<T> }>) => number
  /** 批量删除数据 */
  deleteRows: (rows: T[] | ((row: T) => boolean)) => number

  // ========== 选择操作方法 ==========
  /** 选择单行 */
  selectRow: (row: T) => boolean
  /** 取消选择单行 */
  unselectRow: (row: T) => boolean
  /** 全选 */
  selectAll: () => void
  /** 清除选择 */
  clearSelection: () => void
  /** 切换选择状态 */
  toggleRowSelection: (row: T) => boolean
  /** 获取选中行的ID数组 */
  getSelectedRowIds: (idField?: string) => any[]
  /** 检查行是否被选中 */
  isRowSelected: (row: T) => boolean

  // ========== 展开操作方法 ==========
  /** 展开单行 */
  expandRow: (row: T) => boolean
  /** 收起单行 */
  collapseRow: (row: T) => boolean
  /** 全部展开 */
  expandAll: () => void
  /** 全部收起 */
  collapseAll: () => void
  /** 切换展开状态 */
  toggleRowExpand: (row: T) => boolean
  /** 检查行是否展开 */
  isRowExpanded: (row: T) => boolean

  // ========== 分页操作方法 ==========
  /** 跳转到指定页 */
  goToPage: (page: number) => void
  /** 设置每页数量 */
  setPageSize: (rows: number) => void
  /** 获取当前页码 */
  getCurrentPage: () => number
  /** 获取总页数 */
  getTotalPages: () => number
  /** 上一页 */
  previousPage: () => void
  /** 下一页 */
  nextPage: () => void

  // ========== 排序操作方法 ==========
  /** 设置排序 */
  setSort: (field: string, order?: 1 | -1 | 0) => void
  /** 清除排序 */
  clearSort: () => void
  /** 获取当前排序 */
  getCurrentSort: () => SortState | null

  // ========== 筛选操作方法 ==========
  /** 设置筛选 */
  setFilter: (field: string, value: any, matchMode?: string) => void
  /** 设置全局筛选 */
  setGlobalFilter: (value: string) => void
  /** 清除筛选 */
  clearFilters: () => void
  /** 清除指定字段筛选 */
  clearFilter: (field: string) => void
  /** 获取当前筛选 */
  getCurrentFilters: () => FilterState | null

  // ========== 导出操作方法 ==========
  /** 导出数据 */
  exportData: (format?: 'csv' | 'xlsx' | 'json', filename?: string) => void

  // ========== 列宽度操作方法 ==========
  /** 获取列宽度 */
  getColumnWidths: () => ColumnWidthInfo[]
  /** 更新列宽度 */
  updateColumnWidths: () => void

  // ========== 工具方法 ==========
  /** 根据ID获取行 */
  getRowById: (id: any, idField?: string) => T | undefined
  /** 查找行 */
  findRows: (predicate: (row: T) => boolean) => T[]
  /** 获取行索引 */
  getRowIndex: (row: T) => number
  /** 获取表格数据总数 */
  getTotalRecords: () => number
  /** 检查表格是否为空 */
  isEmpty: () => boolean
  /** 检查是否正在加载 */
  isLoading: () => boolean
}

/**
 * useVxeTable Hook
 * @param tableRef - VxeTable 组件的 ref 引用
 * @param options - 配置选项
 * @returns UseVxeTableReturn - 返回所有表格操作方法
 */
export const useVxeTable = <T = any>({
  tableRef,
  idField = 'id',
}: {
  tableRef: Ref<VxeTableExpose<T> | undefined>
  /** 行ID字段名，用于查找和比较 */
  idField?: string
}): UseVxeTableReturn<T> => {
  // ========== 响应式数据 ==========
  /** 稳定的表格数据引用 */
  const tableDataRef = ref<T[]>([])
  /** 稳定的选中行引用 */
  const selectedRowsRef = ref<T[]>([])
  /** 稳定的展开行引用 */
  const expandedRowsRef = ref<T[]>([])
  /** 分页状态引用 */
  const paginationStateRef = ref<PaginationState | null>(null)
  /** 排序状态引用 */
  const sortStateRef = ref<SortState | null>(null)
  /** 筛选状态引用 */
  const filterStateRef = ref<FilterState | null>(null)
  /** 列宽度引用 */
  const columnWidthsRef = ref<ColumnWidthInfo[]>([])

  // ========== 内部工具函数 ==========
  /**
   * 同步表格数据到稳定引用
   */
  const syncTableData = () => {
    const table = unref(tableRef)
    if (!table) {
      tableDataRef.value = []
      return
    }
    const data = table.data || []
    tableDataRef.value = deepClone(data)
  }

  /**
   * 同步选中行到稳定引用
   */
  const syncSelectedRows = () => {
    const table = unref(tableRef)
    if (!table) {
      selectedRowsRef.value = []
      return
    }
    const selected = table.selectedRows || []
    selectedRowsRef.value = deepClone(selected)
  }

  /**
   * 同步展开行到稳定引用
   */
  const syncExpandedRows = () => {
    const table = unref(tableRef)
    if (!table) {
      expandedRowsRef.value = []
      return
    }
    const expanded = (table as any).expandedRows || []
    expandedRowsRef.value = deepClone(expanded)
  }

  /**
   * 同步分页状态
   */
  const syncPaginationState = () => {
    const table = unref(tableRef)
    if (!table) {
      paginationStateRef.value = null
      return
    }
    const state = table.paginationState
    paginationStateRef.value = state ? deepClone(state) : null
  }

  /**
   * 同步排序状态
   */
  const syncSortState = () => {
    const table = unref(tableRef)
    if (!table) {
      sortStateRef.value = null
      return
    }
    const state = table.sortState
    sortStateRef.value = state ? deepClone(state) : null
  }

  /**
   * 同步筛选状态
   */
  const syncFilterState = () => {
    const table = unref(tableRef)
    if (!table) {
      filterStateRef.value = null
      return
    }
    const state = table.filterState
    filterStateRef.value = state ? deepClone(state) : null
  }

  /**
   * 同步列宽度
   */
  const syncColumnWidths = () => {
    const table = unref(tableRef)
    if (!table) {
      columnWidthsRef.value = []
      return
    }
    const widths = table.columnWidths || []
    columnWidthsRef.value = deepClone(widths)
  }

  /**
   * 根据ID字段比较行
   */
  const compareRows = (row1: T, row2: T): boolean => {
    const id1 = (row1 as any)[idField]
    const id2 = (row2 as any)[idField]
    if (id1 !== undefined && id2 !== undefined) {
      return id1 === id2
    }
    // 降级：使用对象引用比较
    return row1 === row2
  }

  // ========== 数据监听 ==========
  /** 防抖定时器 */
  let debounceTimer: NodeJS.Timeout | null = null

  /**
   * 深度监听表格状态并同步到稳定引用
   */
  const stopEffect = watchEffect(() => {
    const table: any = unref(tableRef)
    if (!table) {
      tableDataRef.value = []
      selectedRowsRef.value = []
      expandedRowsRef.value = []
      paginationStateRef.value = null
      sortStateRef.value = null
      filterStateRef.value = null
      columnWidthsRef.value = []
      return
    }

    // 同步表格数据
    const data = isRef(table.data) ? table.data.value : table.data
    if (Array.isArray(data)) {
      if (debounceTimer) {
        clearTimeout(debounceTimer)
      }
      debounceTimer = setTimeout(() => {
        tableDataRef.value = deepClone(data)
        debounceTimer = null
      }, 16)
    }

    // 同步选中行
    const selected = isRef(table.selectedRows) ? table.selectedRows.value : table.selectedRows
    if (Array.isArray(selected)) {
      selectedRowsRef.value = deepClone(selected)
    }

    // 同步展开行
    const expanded = isRef(table.expandedRows) ? table.expandedRows.value : table.expandedRows
    if (Array.isArray(expanded)) {
      expandedRowsRef.value = deepClone(expanded)
    }

    // 同步分页状态
    const pagination = isRef(table.paginationState)
      ? table.paginationState.value
      : table.paginationState
    paginationStateRef.value = pagination ? deepClone(pagination) : null

    // 同步排序状态
    const sort = isRef(table.sortState) ? table.sortState.value : table.sortState
    sortStateRef.value = sort ? deepClone(sort) : null

    // 同步筛选状态
    const filter = isRef(table.filterState) ? table.filterState.value : table.filterState
    filterStateRef.value = filter ? deepClone(filter) : null

    // 同步列宽度
    const widths = table.columnWidths || []
    columnWidthsRef.value = deepClone(widths)
  })

  // 清理函数
  onUnmounted(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
      debounceTimer = null
    }
    if (stopEffect) {
      stopEffect()
    }
  })

  // ========== 数据操作方法 ==========
  /**
   * 刷新表格数据
   */
  const refresh = async (): Promise<void> => {
    const table = unref(tableRef)
    if (table && typeof table.refresh === 'function') {
      table.refresh()
      await nextTick()
      syncTableData()
    }
  }

  /**
   * 加载数据（需要组件支持直接设置 data）
   */
  const loadData = (_data: T[]): void => {
    // 注意：这里需要组件支持直接设置 data
    // 如果组件不支持，需要通过其他方式（如 emit 事件）
    syncTableData()
  }

  /**
   * 更新单行数据
   */
  const updateRow = (row: T, updates: Partial<T>): boolean => {
    const index = getRowIndex(row)
    if (index >= 0) {
      const currentData = [...tableDataRef.value]
      const currentRow = currentData[index] as any
      currentData[index] = { ...currentRow, ...updates } as any
      tableDataRef.value = currentData as T[]
      return true
    }
    return false
  }

  /**
   * 删除单行数据
   */
  const deleteRow = (row: T | ((row: T) => boolean)): boolean => {
    const currentData = [...tableDataRef.value]
    let index = -1

    if (typeof row === 'function') {
      const predicate = row as (r: T) => boolean
      index = currentData.findIndex(r => predicate(r as T))
    } else {
      index = currentData.findIndex(r => compareRows(r as T, row))
    }

    if (index >= 0) {
      currentData.splice(index, 1)
      tableDataRef.value = currentData as T[]
      return true
    }
    return false
  }

  /**
   * 添加单行数据
   */
  const addRow = (row: T, index?: number | 'first' | 'last'): boolean => {
    const currentData = [...tableDataRef.value]
    let insertIndex: number

    if (typeof index === 'number') {
      insertIndex = Math.max(0, Math.min(index, currentData.length))
    } else if (index === 'first') {
      insertIndex = 0
    } else {
      insertIndex = currentData.length
    }

    currentData.splice(insertIndex, 0, deepClone(row) as any)
    tableDataRef.value = currentData as T[]
    return true
  }

  /**
   * 批量更新数据
   */
  const updateRows = (updates: Array<{ row: T; data: Partial<T> }>): number => {
    let count = 0
    updates.forEach(({ row, data: updates }) => {
      if (updateRow(row, updates)) {
        count++
      }
    })
    return count
  }

  /**
   * 批量删除数据
   */
  const deleteRows = (rows: T[] | ((row: T) => boolean)): number => {
    const currentData = [...tableDataRef.value]
    const indices: number[] = []

    if (typeof rows === 'function') {
      currentData.forEach((row, index) => {
        if (rows(row as T)) {
          indices.push(index)
        }
      })
    } else {
      rows.forEach(row => {
        const index = currentData.findIndex(r => compareRows(r as T, row))
        if (index >= 0) {
          indices.push(index)
        }
      })
    }

    // 从后往前删除，避免索引变化
    indices
      .sort((a, b) => b - a)
      .forEach(index => {
        currentData.splice(index, 1)
      })

    if (indices.length > 0) {
      tableDataRef.value = currentData as T[]
    }

    return indices.length
  }

  // ========== 选择操作方法 ==========
  /**
   * 选择单行
   */
  const selectRow = (row: T): boolean => {
    if (isRowSelected(row)) {
      return false
    }
    const table = unref(tableRef)
    if (!table) {
      return false
    }

    // 如果表格组件有 selectRow 方法，直接调用
    if (table && typeof (table as any).selectRow === 'function') {
      return (table as any).selectRow(row)
    }

    // 否则，手动更新选择状态
    const currentSelected = [...selectedRowsRef.value]
    currentSelected.push(deepClone(row) as any)
    selectedRowsRef.value = currentSelected as T[]
    syncSelectedRows()
    return true
  }

  /**
   * 取消选择单行
   */
  const unselectRow = (row: T): boolean => {
    const table = unref(tableRef)

    // 如果表格组件有 unselectRow 方法，直接调用
    if (table && typeof (table as any).unselectRow === 'function') {
      return (table as any).unselectRow(row)
    }

    // 否则，手动更新选择状态
    const currentSelected = [...selectedRowsRef.value]
    const index = currentSelected.findIndex(r => compareRows(r as T, row))
    if (index >= 0) {
      currentSelected.splice(index, 1)
      selectedRowsRef.value = currentSelected as T[]
      syncSelectedRows()
      return true
    }
    return false
  }

  /**
   * 全选
   */
  const selectAll = (): void => {
    const table = unref(tableRef)
    if (table && typeof table.selectAll === 'function') {
      table.selectAll()
    } else {
      // Fallback: 手动全选
      selectedRowsRef.value = deepClone(tableDataRef.value) as T[]
      syncSelectedRows()
    }
  }

  /**
   * 清除选择
   */
  const clearSelection = (): void => {
    const table = unref(tableRef)
    if (table && typeof table.clearSelection === 'function') {
      table.clearSelection()
    }
    selectedRowsRef.value = []
    syncSelectedRows()
  }

  /**
   * 切换选择状态
   */
  const toggleRowSelection = (row: T): boolean => {
    if (isRowSelected(row)) {
      return unselectRow(row)
    } else {
      return selectRow(row)
    }
  }

  /**
   * 获取选中行的ID数组
   */
  const getSelectedRowIds = (field?: string): any[] => {
    const fieldName = field || idField
    return selectedRowsRef.value.map(row => (row as any)[fieldName]).filter(id => id !== undefined)
  }

  /**
   * 检查行是否被选中
   */
  const isRowSelected = (row: T): boolean => {
    return selectedRowsRef.value.some(r => compareRows(r as T, row))
  }

  // ========== 展开操作方法 ==========
  /**
   * 展开单行
   */
  const expandRow = (row: T): boolean => {
    if (isRowExpanded(row)) {
      return false
    }
    const currentExpanded = [...expandedRowsRef.value]
    currentExpanded.push(deepClone(row) as any)
    expandedRowsRef.value = currentExpanded as T[]
    syncExpandedRows()
    return true
  }

  /**
   * 收起单行
   */
  const collapseRow = (row: T): boolean => {
    const currentExpanded = [...expandedRowsRef.value]
    const index = currentExpanded.findIndex(r => compareRows(r as T, row))
    if (index >= 0) {
      currentExpanded.splice(index, 1)
      expandedRowsRef.value = currentExpanded as T[]
      syncExpandedRows()
      return true
    }
    return false
  }

  /**
   * 全部展开
   */
  const expandAll = (): void => {
    expandedRowsRef.value = deepClone(tableDataRef.value) as T[]
    syncExpandedRows()
  }

  /**
   * 全部收起
   */
  const collapseAll = (): void => {
    expandedRowsRef.value = []
    syncExpandedRows()
  }

  /**
   * 切换展开状态
   */
  const toggleRowExpand = (row: T): boolean => {
    if (isRowExpanded(row)) {
      return collapseRow(row)
    } else {
      return expandRow(row)
    }
  }

  /**
   * 检查行是否展开
   */
  const isRowExpanded = (row: T): boolean => {
    return expandedRowsRef.value.some(r => compareRows(r as T, row))
  }

  // ========== 分页操作方法 ==========
  /**
   * 跳转到指定页
   */
  const goToPage = (page: number): void => {
    const table = unref(tableRef)
    // 如果表格组件有 goToPage 方法，直接调用
    if (table && typeof (table as any).goToPage === 'function') {
      ;(table as any).goToPage(page)
      return
    }

    // 否则，手动更新分页状态
    const state = paginationStateRef.value
    if (state) {
      const newState = { ...state, page, first: (page - 1) * state.rows }
      paginationStateRef.value = newState
      syncPaginationState()
    }
  }

  /**
   * 设置每页数量
   */
  const setPageSize = (rows: number): void => {
    const table = unref(tableRef)
    // 如果表格组件有 setPageSize 方法，直接调用
    if (table && typeof (table as any).setPageSize === 'function') {
      ;(table as any).setPageSize(rows)
      return
    }

    // 否则，手动更新分页状态
    const state = paginationStateRef.value
    if (state) {
      const newState = { ...state, rows, first: 0, page: 1 }
      paginationStateRef.value = newState
      syncPaginationState()
    }
  }

  /**
   * 获取当前页码
   */
  const getCurrentPage = (): number => {
    return paginationStateRef.value?.page || 1
  }

  /**
   * 获取总页数
   */
  const getTotalPages = (): number => {
    const state = paginationStateRef.value
    if (!state || !state.totalRecords || !state.rows) {
      return 1
    }
    return Math.ceil(state.totalRecords / state.rows)
  }

  /**
   * 上一页
   */
  const previousPage = (): void => {
    const current = getCurrentPage()
    if (current > 1) {
      goToPage(current - 1)
    }
  }

  /**
   * 下一页
   */
  const nextPage = (): void => {
    const current = getCurrentPage()
    const total = getTotalPages()
    if (current < total) {
      goToPage(current + 1)
    }
  }

  // ========== 排序操作方法 ==========
  /**
   * 设置排序
   */
  const setSort = (field: string, order: 1 | -1 | 0 = 1): void => {
    const table = unref(tableRef)
    if (table && typeof (table as any).setSort === 'function') {
      ;(table as any).setSort(field, order)
    }
    const newState: SortState = { sortField: field, sortOrder: order }
    sortStateRef.value = newState
    syncSortState()
  }

  /**
   * 清除排序
   */
  const clearSort = (): void => {
    const table = unref(tableRef)
    if (table && typeof table.clearSort === 'function') {
      table.clearSort()
    }
    sortStateRef.value = null
    syncSortState()
  }

  /**
   * 获取当前排序
   */
  const getCurrentSort = (): SortState | null => {
    return sortStateRef.value
  }

  // ========== 筛选操作方法 ==========
  /**
   * 设置筛选
   */
  const setFilter = (field: string, value: any, matchMode?: string): void => {
    const table = unref(tableRef)
    if (table && typeof (table as any).setFilter === 'function') {
      ;(table as any).setFilter(field, value, matchMode)
    }
    const current = filterStateRef.value || { filters: {} }
    const newFilters = {
      ...current.filters,
      [field]: { value, matchMode: matchMode || 'contains' },
    }
    const newState: FilterState = { ...current, filters: newFilters }
    filterStateRef.value = newState
    syncFilterState()
  }

  /**
   * 设置全局筛选
   */
  const setGlobalFilter = (value: string): void => {
    const table = unref(tableRef)
    if (table && typeof table.setGlobalFilter === 'function') {
      table.setGlobalFilter(value)
    } else {
      // Fallback: 手动更新筛选状态
      const current = filterStateRef.value || {}
      const newState: FilterState = { ...current, globalFilterValue: value }
      filterStateRef.value = newState
      syncFilterState()
    }
  }

  /**
   * 清除筛选
   */
  const clearFilters = (): void => {
    const table = unref(tableRef)
    if (table && typeof table.clearFilters === 'function') {
      table.clearFilters()
    }
    filterStateRef.value = { filters: {}, globalFilterValue: '' }
    syncFilterState()
  }

  /**
   * 清除指定字段筛选
   */
  const clearFilter = (field: string): void => {
    const current = filterStateRef.value || { filters: {} }
    const newFilters = { ...current.filters }
    delete newFilters[field]
    const newState: FilterState = { ...current, filters: newFilters }
    filterStateRef.value = newState
    syncFilterState()
  }

  /**
   * 获取当前筛选
   */
  const getCurrentFilters = (): FilterState | null => {
    return filterStateRef.value
  }

  // ========== 导出操作方法 ==========
  /**
   * 导出数据
   */
  const exportData = (format: 'csv' | 'xlsx' | 'json' = 'csv', _filename?: string): void => {
    const table = unref(tableRef)
    if (table && typeof table.exportData === 'function') {
      table.exportData(format)
    } else {
      console.warn('[useVxeTable] exportData method not available')
    }
  }

  // ========== 列宽度操作方法 ==========
  /**
   * 获取列宽度
   */
  const getColumnWidths = (): ColumnWidthInfo[] => {
    const table = unref(tableRef)
    if (table && typeof table.getColumnWidths === 'function') {
      return table.getColumnWidths()
    }
    return columnWidthsRef.value
  }

  /**
   * 更新列宽度
   */
  const updateColumnWidths = (): void => {
    const table = unref(tableRef)
    if (table && typeof table.updateColumnWidths === 'function') {
      table.updateColumnWidths()
      // 延迟同步，因为 updateColumnWidths 内部使用了 setTimeout (200ms) + nextTick
      // 我们使用 300ms 确保列宽度已经更新完成
      setTimeout(() => {
        syncColumnWidths()
      }, 300)
    } else {
      // 如果表格方法不可用，直接同步当前状态
      syncColumnWidths()
    }
  }

  // ========== 工具方法 ==========
  /**
   * 根据ID获取行
   */
  const getRowById = (id: any, field?: string): T | undefined => {
    const fieldName = field || idField
    return tableDataRef.value.find(row => (row as any)[fieldName] === id) as T | undefined
  }

  /**
   * 查找行
   */
  const findRows = (predicate: (row: T) => boolean): T[] => {
    return tableDataRef.value.filter(r => predicate(r as T)) as T[]
  }

  /**
   * 获取行索引
   */
  const getRowIndex = (row: T): number => {
    return tableDataRef.value.findIndex(r => compareRows(r as T, row))
  }

  /**
   * 获取表格数据总数
   */
  const getTotalRecords = (): number => {
    return paginationStateRef.value?.totalRecords || tableDataRef.value.length
  }

  /**
   * 检查表格是否为空
   */
  const isEmpty = (): boolean => {
    return tableDataRef.value.length === 0
  }

  /**
   * 检查是否正在加载
   */
  const isLoading = (): boolean => {
    // 这里需要从组件获取 loading 状态
    // 由于组件可能不暴露 loading，这里返回 false
    return false
  }

  return {
    // 响应式数据
    tableData: tableDataRef as Ref<T[]>,
    selectedRows: selectedRowsRef as Ref<T[]>,
    expandedRows: expandedRowsRef as Ref<T[]>,
    paginationState: paginationStateRef,
    sortState: sortStateRef,
    filterState: filterStateRef,
    columnWidths: columnWidthsRef,

    // 数据操作方法
    refresh,
    loadData,
    updateRow,
    deleteRow,
    addRow,
    updateRows,
    deleteRows,

    // 选择操作方法
    selectRow,
    unselectRow,
    selectAll,
    clearSelection,
    toggleRowSelection,
    getSelectedRowIds,
    isRowSelected,

    // 展开操作方法
    expandRow,
    collapseRow,
    expandAll,
    collapseAll,
    toggleRowExpand,
    isRowExpanded,

    // 分页操作方法
    goToPage,
    setPageSize,
    getCurrentPage,
    getTotalPages,
    previousPage,
    nextPage,

    // 排序操作方法
    setSort,
    clearSort,
    getCurrentSort,

    // 筛选操作方法
    setFilter,
    setGlobalFilter,
    clearFilters,
    clearFilter,
    getCurrentFilters,

    // 导出操作方法
    exportData,

    // 列宽度操作方法
    getColumnWidths,
    updateColumnWidths,

    // 工具方法
    getRowById,
    findRows,
    getRowIndex,
    getTotalRecords,
    isEmpty,
    isLoading,
  }
}
