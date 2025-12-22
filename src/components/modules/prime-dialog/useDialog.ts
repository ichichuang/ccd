/**
 * useDialog Composable
 *
 * 提供对话框状态管理和操作方法
 * 封装 dialogStore 和相关方法，确保状态管理的单一数据源和封装性
 */
import type { Ref } from 'vue'
import { readonly, ref } from 'vue'
import { defaultDialogProps } from './utils/constants'
import type { ArgsType, ConfirmOptions, DialogOptions } from './utils/types'

type UseDialogReturn = {
  dialogStore: Readonly<Ref<readonly DialogOptions[]>>
  addDialog: (options: DialogOptions) => number
  closeDialog: (index: number, args?: ArgsType) => void
  updateDialog: (value: unknown, key?: string, index?: number) => void
  closeAllDialog: () => void
  addConfirmDialog: (confirmOptions: ConfirmOptions, callback?: (result: boolean) => void) => number
  addDynamicDialog: (
    component: unknown,
    props?: unknown,
    data?: unknown,
    listeners?: unknown,
    style?: unknown,
    className?: string
  ) => number
}

// 私有状态：对话框存储
const _dialogStore = ref<DialogOptions[]>([])

/**
 * useDialog Hook
 *
 * 返回只读的 dialogStore 和所有操作方法
 *
 * @example
 * ```typescript
 * const { dialogStore, addDialog, closeDialog } = useDialog()
 *
 * // 添加对话框
 * addDialog({
 *   header: '标题',
 *   contentRenderer: ({ options, index }) => h('div', '内容')
 * })
 *
 * // 关闭对话框
 * closeDialog(options, index)
 * ```
 */
export function useDialog(): UseDialogReturn {
  /**
   * 添加对话框
   * @returns 返回新创建的对话框的索引
   */
  function addDialog(options: DialogOptions): number {
    const mergedOptions = {
      ...defaultDialogProps,
      ...options,
      visible: true,
      type: 'dialog' as const,
    }
    _dialogStore.value.push(mergedOptions)
    const index = _dialogStore.value.length - 1

    if (options?.openDelay) {
      setTimeout(() => {
        if (_dialogStore.value[index]) {
          _dialogStore.value[index].visible = true
        }
      }, options.openDelay)
    }

    return index
  }

  /**
   * 关闭对话框
   * @param index 对话框索引
   * @param args 关闭参数
   */
  function closeDialog(index: number, _args?: ArgsType) {
    if (_dialogStore.value[index]) {
      const options = _dialogStore.value[index]
      // 先设置 visible 为 false 触发关闭动画
      options.visible = false

      // 延时移除对话框，等待动画完成
      const delay = options?.closeDelay || 200
      setTimeout(() => {
        // 再次检查索引是否有效（可能在延时期间已被其他操作修改）
        if (_dialogStore.value[index]) {
          _dialogStore.value.splice(index, 1)
        }
      }, delay)
    }
  }

  /**
   * 更新对话框
   */
  function updateDialog(value: unknown, key = 'header', index = 0) {
    if (_dialogStore.value[index]) {
      ;(_dialogStore.value[index] as any)[key] = value
    }
  }

  /**
   * 关闭所有对话框
   */
  function closeAllDialog() {
    _dialogStore.value = []
  }

  /**
   * 添加确认对话框
   * @returns 返回新创建的对话框的索引
   */
  function addConfirmDialog(
    confirmOptions: ConfirmOptions,
    callback?: (result: boolean) => void
  ): number {
    const options: DialogOptions = {
      type: 'confirm',
      visible: true,
      confirmOptions,
      closeCallBack: ({ args }) => {
        const result = args?.command === 'sure'
        if (callback) {
          callback(result)
        }
      },
    }
    return addDialog(options)
  }

  /**
   * 添加动态对话框
   * @returns 返回新创建的对话框的索引
   */
  function addDynamicDialog(
    component: any,
    props?: any,
    data?: any,
    listeners?: any,
    style?: any,
    className?: string
  ): number {
    const options: DialogOptions = {
      type: 'dynamic',
      visible: true,
      component,
      props,
      data,
      listeners,
      style,
      class: className,
    }
    return addDialog(options)
  }

  const dialogStore = readonly(_dialogStore) as Readonly<Ref<DialogOptions[]>>

  // 返回只读状态和所有方法
  return {
    dialogStore,
    addDialog,
    closeDialog,
    updateDialog,
    closeAllDialog,
    addConfirmDialog,
    addDynamicDialog,
  }
}
