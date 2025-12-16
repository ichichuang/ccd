/**
 * useTablePersistence Hook
 * - 负责表格用户偏好的加载、应用、保存和重置
 * - 使用 Pinia Store 进行持久化存储
 */

import type { VxeTableColumn, VxeTableUserPreferences } from '@/components/modules/vxe-table'
import { useVxeTableStore } from '@/stores/modules/vxetable'
import { debounce } from 'lodash-es'
import { computed, ref, watch, type MaybeRef, type Ref } from 'vue'

/**
 * useTablePersistence 返回值接口
 */
export interface UseTablePersistenceReturn<T = any> {
  /** 最终渲染的列（应用了用户偏好后的列） */
  effectiveColumns: Ref<VxeTableColumn<T>[]>
  /** 处理列宽调整事件 */
  handleColumnResize: (event: { element: HTMLElement; column: any; delta: number }) => void
  /** 处理列顺序变更事件 */
  handleColumnReorder: (event: { dragIndex: number; dropIndex: number }) => void
  /** 重置用户偏好（恢复默认） */
  resetPreferences: () => void
  /** 获取当前偏好设置 */
  getPreferences: () => VxeTableUserPreferences | null
  /** 手动保存偏好设置 */
  savePreferences: () => void
}

/**
 * 使用表格持久化功能
 * @param tableId 表格唯一标识（Ref 或普通值）
 * @param originalColumns 原始列配置（Ref 或普通值）
 * @returns 持久化相关的响应式数据和方法
 */
export function useTablePersistence<T>(
  tableId: MaybeRef<string | undefined>,
  originalColumns: MaybeRef<VxeTableColumn<T>[]>
): UseTablePersistenceReturn<T> {
  const vxeTableStore = useVxeTableStore()

  // 将参数转换为 Ref（如果还不是 Ref）
  const tableIdRef = typeof tableId === 'function' ? tableId : ref(tableId)
  const originalColumnsRef =
    typeof originalColumns === 'function' ? originalColumns : ref(originalColumns)

  // 内部维护的偏好状态（从 Store 加载）
  const preferences = ref<VxeTableUserPreferences>({})

  /**
   * 从 Store 加载偏好设置
   */
  const loadPreferences = () => {
    if (!tableIdRef.value) {
      preferences.value = {}
      return
    }

    const stored = vxeTableStore.getTableSettings(tableIdRef.value)
    if (stored) {
      preferences.value = { ...stored }
    } else {
      preferences.value = {}
    }
  }

  /**
   * 保存偏好设置到 Store（防抖 500ms）
   */
  const _savePreferences = () => {
    if (!tableIdRef.value) {
      return
    }

    try {
      vxeTableStore.saveUserPreferences(tableIdRef.value, preferences.value)
    } catch (error) {
      console.warn('[useTablePersistence] 保存偏好设置失败:', error)
    }
  }

  // 防抖保存函数
  const debouncedSavePreferences = debounce(_savePreferences, 500)

  /**
   * 立即保存偏好设置（不防抖）
   */
  const savePreferences = () => {
    debouncedSavePreferences.cancel() // 取消防抖
    _savePreferences()
  }

  /**
   * 计算属性：最终渲染的列
   * 核心逻辑：结合 originalColumns 和 preferences 生成最终数组
   */
  const effectiveColumns = computed(() => {
    const columns = [...originalColumnsRef.value]

    // 如果没有 tableId 或没有偏好设置，直接返回原始列
    if (!tableIdRef.value || !preferences.value.columnOrder) {
      // 即使没有列顺序偏好，也要应用列宽偏好
      if (
        preferences.value.columnWidths &&
        Object.keys(preferences.value.columnWidths).length > 0
      ) {
        return columns.map(col => {
          const field = String(col.field)
          const savedWidth = preferences.value.columnWidths?.[field]
          if (savedWidth !== undefined) {
            return {
              ...col,
              width: savedWidth,
            }
          }
          return col
        })
      }
      return columns
    }

    const { columnOrder, columnWidths, hiddenColumns } = preferences.value

    // 1. 创建映射以便快速查找
    const colMap = new Map(columns.map(col => [String(col.field), col]))

    // 2. 按记录的顺序构建新数组
    const sortedCols: VxeTableColumn<T>[] = []

    // 先添加记录在案的列
    columnOrder.forEach(field => {
      const col = colMap.get(field)
      if (col) {
        // 克隆对象以避免修改原始引用
        const newCol: VxeTableColumn<T> = { ...col }

        // 应用保存的宽度
        if (columnWidths && columnWidths[field] !== undefined) {
          newCol.width = columnWidths[field]
        }

        // 应用隐藏状态：如果不隐藏才加入
        if (!hiddenColumns?.includes(field)) {
          sortedCols.push(newCol)
        }

        colMap.delete(field) // 标记为已处理
      }
    })

    // 3. 把新增加的列（不在偏好记录里的）追加到末尾
    // 这种情况常发生在代码发布新版本增加列之后
    for (const [, col] of colMap.entries()) {
      // 新列也要应用宽度偏好（如果有）
      const field = String(col.field)
      const savedWidth = columnWidths?.[field]
      if (savedWidth !== undefined) {
        sortedCols.push({
          ...col,
          width: savedWidth,
        })
      } else {
        sortedCols.push(col)
      }
    }

    return sortedCols
  })

  /**
   * 处理列宽调整事件
   */
  const handleColumnResize = (event: { element: HTMLElement; column: any; delta: number }) => {
    if (!tableIdRef.value) {
      return
    }

    // 从事件中获取字段名
    const field = String(
      event.column?.field || event.column?.props?.field || event.column?.props?.field || ''
    )

    if (!field) {
      console.warn('[useTablePersistence] 无法获取列字段名')
      return
    }

    // 获取实际 DOM 宽度（最准确）
    const newWidth = event.element?.offsetWidth || 0

    if (newWidth > 0) {
      if (!preferences.value.columnWidths) {
        preferences.value.columnWidths = {}
      }
      preferences.value.columnWidths[field] = newWidth
      debouncedSavePreferences()
    }
  }

  /**
   * 处理列顺序变更事件
   */
  const handleColumnReorder = (event: { dragIndex: number; dropIndex: number }) => {
    if (!tableIdRef.value) {
      return
    }

    // 从 effectiveColumns 中获取当前列顺序（因为 effectiveColumns 已经是应用了偏好的列）
    const currentOrder = effectiveColumns.value.map(col => String(col.field))

    // 重新计算列顺序
    const newOrder = [...currentOrder]
    const [draggedColumn] = newOrder.splice(event.dragIndex, 1)
    newOrder.splice(event.dropIndex, 0, draggedColumn)

    preferences.value.columnOrder = newOrder
    debouncedSavePreferences()
  }

  /**
   * 重置用户偏好（恢复默认）
   */
  const resetPreferences = () => {
    if (!tableIdRef.value) {
      return
    }

    preferences.value = {}
    vxeTableStore.clearTableSettings(tableIdRef.value)
  }

  /**
   * 获取当前偏好设置
   */
  const getPreferences = (): VxeTableUserPreferences | null => {
    if (!tableIdRef.value) {
      return null
    }
    return { ...preferences.value }
  }

  // 监听 tableId 变化，重新加载偏好
  watch(
    tableIdRef,
    () => {
      loadPreferences()
    },
    { immediate: true }
  )

  // 监听原始列变化，如果列结构变化，可能需要更新偏好
  watch(
    originalColumnsRef,
    () => {
      // 当原始列变化时，检查是否有新列需要追加到偏好中
      // 这里不做自动追加，保持用户偏好不变
      // 新列会自动追加到 effectiveColumns 末尾（在 computed 中处理）
    },
    { deep: true }
  )

  return {
    effectiveColumns,
    handleColumnResize,
    handleColumnReorder,
    resetPreferences,
    getPreferences,
    savePreferences,
  }
}
