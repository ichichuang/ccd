import {
  addConfirmDialog,
  addDialog,
  addDynamicDialog,
  closeAllDialog,
  closeDialog,
  dialogStore,
  updateDialog,
  type ButtonProps,
  type ConfirmOptions,
  type DialogOptions,
} from '@/components/modules/prime-dialog'
import { h } from 'vue'

/**
 * 对话框操作 Hook
 * 提供便捷的对话框操作方法
 */
export function useDialog() {
  /**
   * 打开标准对话框
   * @returns 返回对话框索引，用于后续操作
   */
  const openDialog = (options: DialogOptions): number => {
    addDialog(options)
    return dialogStore.value.length - 1
  }

  /**
   * 打开确认对话框
   */
  const openConfirm = (confirmOptions: ConfirmOptions, callback?: (result: boolean) => void) => {
    addConfirmDialog(confirmOptions, callback)
  }

  /**
   * 打开动态对话框
   * @returns 返回对话框索引，用于后续操作
   */
  const openDynamic = (
    component: any,
    props?: any,
    data?: any,
    listeners?: any,
    style?: any,
    className?: string
  ): number => {
    addDynamicDialog(component, props, data, listeners, style, className)
    return dialogStore.value.length - 1
  }

  /**
   * 关闭指定索引的对话框
   * @param index 对话框索引
   * @param args 关闭参数
   */
  const closeDialogByIndex = (index: number, args?: any) => {
    if (dialogStore.value[index]) {
      closeDialog(dialogStore.value[index], index, args)
    }
  }

  /**
   * 关闭指定对话框（通过对话框对象）
   * @param dialog 对话框对象
   * @param args 关闭参数
   */
  const closeDialogByObject = (dialog: DialogOptions, args?: any) => {
    const index = dialogStore.value.findIndex((item: DialogOptions) => item === dialog)
    if (index !== -1) {
      closeDialog(dialog, index, args)
    }
  }

  /**
   * 关闭最后一个打开的对话框
   * @param args 关闭参数
   */
  const closeLastDialog = (args?: any) => {
    if (dialogStore.value.length > 0) {
      const lastIndex = dialogStore.value.length - 1
      closeDialog(dialogStore.value[lastIndex], lastIndex, args)
    }
  }

  /**
   * 关闭所有对话框
   */
  const closeAll = () => {
    closeAllDialog()
  }

  /**
   * 更新对话框属性
   * @param value 新值
   * @param key 属性键
   * @param index 对话框索引
   */
  const update = (value: any, key = 'header', index = 0) => {
    updateDialog(value, key, index)
  }

  /**
   * 获取当前打开的对话框数量
   */
  const getDialogCount = (): number => {
    return dialogStore.value.length
  }

  /**
   * 检查指定索引的对话框是否存在
   * @param index 对话框索引
   */
  const isDialogExists = (index: number): boolean => {
    return index >= 0 && index < dialogStore.value.length
  }

  /**
   * 快速打开信息对话框
   * @returns 返回对话框索引
   */
  const info = (message: string, title = '提示', options?: Partial<DialogOptions>): number => {
    const dialogIndex = openDialog({
      header: title,
      hideHeader: false,
      ...options,
      contentRenderer: () => h('div', { class: 'text-center text-infoColor' }, message),
      footerButtons: [
        {
          label: '确定',
          severity: 'primary',
          text: true,
          btnClick: () => {
            closeDialogByIndex(dialogIndex, { command: 'sure' })
          },
        },
      ],
    })
    return dialogIndex
  }

  /**
   * 快速打开成功对话框
   * @returns 返回对话框索引
   */
  const success = (message: string, title = '成功', options?: Partial<DialogOptions>): number => {
    const dialogIndex = openDialog({
      header: title,
      hideHeader: false,
      ...options,
      contentRenderer: () => h('div', { class: 'text-center text-successColor' }, message),
      footerButtons: [
        {
          label: '确定',
          severity: 'success',
          text: true,
          btnClick: () => {
            closeDialogByIndex(dialogIndex, { command: 'sure' })
          },
        },
      ],
    })
    return dialogIndex
  }

  /**
   * 快速打开警告对话框
   * @returns 返回对话框索引
   */
  const warning = (message: string, title = '警告', options?: Partial<DialogOptions>): number => {
    const dialogIndex = openDialog({
      header: title,
      hideHeader: false,
      ...options,
      contentRenderer: () => h('div', { class: 'text-center text-warnColor' }, message),
      footerButtons: [
        {
          label: '确定',
          severity: 'warning',
          text: true,
          btnClick: () => {
            closeDialogByIndex(dialogIndex, { command: 'sure' })
          },
        },
      ],
    })
    return dialogIndex
  }

  /**
   * 快速打开错误对话框
   * @returns 返回对话框索引
   */
  const error = (message: string, title = '错误', options?: Partial<DialogOptions>): number => {
    const dialogIndex = openDialog({
      header: title,
      hideHeader: false,
      ...options,
      contentRenderer: () => h('div', { class: 'text-center text-dangerColor' }, message),
      footerButtons: [
        {
          label: '确定',
          severity: 'danger',
          text: true,
          btnClick: () => {
            closeDialogByIndex(dialogIndex, { command: 'sure' })
          },
        },
      ],
    })
    return dialogIndex
  }

  /**
   * 快速打开确认对话框
   */
  const confirm = (
    message: string,
    title = '确认',
    options?: Partial<DialogOptions> & { onConfirm?: () => void; onCancel?: () => void }
  ) => {
    const dialogIndex = openDialog({
      header: title,
      hideHeader: false,
      ...options,
      contentRenderer: () => h('div', { class: 'text-center text-primaryColor' }, message),
      footerButtons: [
        {
          label: '取消',
          severity: 'secondary',
          text: true,
          btnClick: () => {
            closeDialogByIndex(dialogIndex, { command: 'cancel' })
            options?.onCancel?.()
          },
        },
        {
          label: '确定',
          severity: 'primary',
          text: true,
          btnClick: () => {
            closeDialogByIndex(dialogIndex, { command: 'sure' })
            options?.onConfirm?.()
          },
        },
      ],
    })
  }

  /**
   * 快速打开删除确认对话框
   */
  const confirmDelete = (
    message = '确定要删除吗？',
    title = '删除确认',
    options?: Partial<DialogOptions> & { onConfirm?: () => void; onCancel?: () => void }
  ) => {
    const dialogIndex = openDialog({
      header: title,
      hideHeader: false,
      ...options,
      contentRenderer: () => h('div', { class: 'text-center text-dangerColor' }, message),
      footerButtons: [
        {
          label: '取消',
          severity: 'secondary',
          text: true,
          btnClick: () => {
            closeDialogByIndex(dialogIndex, { command: 'cancel' })
            options?.onCancel?.()
          },
        },
        {
          label: '删除',
          severity: 'danger',
          text: true,
          btnClick: () => {
            closeDialogByIndex(dialogIndex, { command: 'sure' })
            options?.onConfirm?.()
          },
        },
      ],
    })
  }

  return {
    // 状态
    dialogStore,

    // 基础方法
    openDialog,
    openConfirm,
    openDynamic,
    closeDialog: closeDialogByIndex, // 保持向后兼容
    closeDialogByIndex,
    closeDialogByObject,
    closeLastDialog,
    closeAll,
    update,

    // 工具方法
    getDialogCount,
    isDialogExists,

    // 便捷方法
    info,
    success,
    warning,
    error,
    confirm,
    confirmDelete,
  }
}

export type { ButtonProps, ConfirmOptions, DialogOptions }
