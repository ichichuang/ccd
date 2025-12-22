import {
  useDialog as usePrimeDialog,
  type ButtonProps,
  type ConfirmOptions,
  type DialogOptions,
} from '@/components/modules/prime-dialog'
import { t } from '@/locales'
import { h } from 'vue'

/**
 * 获取翻译文本，如果翻译不存在则返回默认值
 */
function getTranslation(key: string, fallback: string): string {
  const translation = t(key)
  // 如果翻译不存在（返回的是 key 本身），使用默认值
  return translation === key ? fallback : translation
}

// 获取 usePrimeDialog 的返回类型
type PrimeDialogReturn = ReturnType<typeof usePrimeDialog>

/**
 * useDialog Hook 返回值接口
 */
export interface UseDialogReturn {
  // 状态
  dialogStore: PrimeDialogReturn['dialogStore']
  // 基础方法
  openDialog: (options: DialogOptions) => number
  openConfirm: (confirmOptions: ConfirmOptions, callback?: (result: boolean) => void) => number
  openDynamic: (
    component: any,
    props?: any,
    data?: any,
    listeners?: any,
    style?: any,
    className?: string
  ) => number
  closeDialog: (index: number, args?: any) => void
  closeDialogByIndex: (index: number, args?: any) => void
  closeDialogByObject: (dialog: DialogOptions, args?: any) => void
  closeLastDialog: (args?: any) => void
  closeAll: () => void
  update: (value: any, key?: string, index?: number) => void
  // 工具方法
  getDialogCount: () => number
  isDialogExists: (index: number) => boolean
  // 便捷方法
  info: (message: string, title?: string, options?: Partial<DialogOptions>) => number
  success: (message: string, title?: string, options?: Partial<DialogOptions>) => number
  warning: (message: string, title?: string, options?: Partial<DialogOptions>) => number
  error: (message: string, title?: string, options?: Partial<DialogOptions>) => number
  confirm: (
    message: string,
    title?: string,
    options?: Partial<DialogOptions> & { onConfirm?: () => void; onCancel?: () => void }
  ) => number
  confirmDelete: (
    message?: string,
    title?: string,
    options?: Partial<DialogOptions> & { onConfirm?: () => void; onCancel?: () => void }
  ) => number
}

/**
 * 对话框操作 Hook
 * 提供便捷的对话框操作方法
 *
 * 这是对 prime-dialog 模块的二次封装，提供更便捷的方法
 */
export function useDialog(): UseDialogReturn {
  // 使用 prime-dialog 的 useDialog hook
  const {
    dialogStore,
    addDialog,
    addConfirmDialog,
    addDynamicDialog,
    closeDialog,
    closeAllDialog,
    updateDialog,
  } = usePrimeDialog()

  /**
   * 打开标准对话框
   * @returns 返回对话框索引，用于后续操作
   */
  const openDialog = (options: DialogOptions): number => {
    return addDialog(options)
  }

  /**
   * 打开确认对话框
   * @returns 返回对话框索引
   */
  const openConfirm = (
    confirmOptions: ConfirmOptions,
    callback?: (result: boolean) => void
  ): number => {
    return addConfirmDialog(confirmOptions, callback)
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
    return addDynamicDialog(component, props, data, listeners, style, className)
  }

  /**
   * 关闭指定索引的对话框
   * @param index 对话框索引
   * @param args 关闭参数
   */
  const closeDialogByIndex = (index: number, args?: any) => {
    closeDialog(index, args)
  }

  /**
   * 关闭指定对话框（通过对话框对象）
   * @param dialog 对话框对象
   * @param args 关闭参数
   */
  const closeDialogByObject = (dialog: DialogOptions, args?: any) => {
    // 由于 dialogStore 是 readonly，我们需要通过遍历来查找
    let foundIndex = -1
    for (let i = 0; i < dialogStore.value.length; i++) {
      if (dialogStore.value[i] === dialog) {
        foundIndex = i
        break
      }
    }
    if (foundIndex !== -1) {
      closeDialog(foundIndex, args)
    }
  }

  /**
   * 关闭最后一个打开的对话框
   * @param args 关闭参数
   */
  const closeLastDialog = (args?: any) => {
    if (dialogStore.value.length > 0) {
      const lastIndex = dialogStore.value.length - 1
      closeDialog(lastIndex, args)
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
  const info = (message: string, title?: string, options?: Partial<DialogOptions>): number => {
    return openDialog({
      header: title ?? (() => getTranslation('dialog.infoTitle', '提示')),
      hideHeader: false,
      ...options,
      contentRenderer: () => h('div', { class: 'text-center text-infoColor' }, message),
      footerButtons: [
        {
          label: () => getTranslation('common.confirm', '确定'),
          severity: 'primary',
          text: true,
          btnClick: ({ dialog }) => {
            closeDialog(dialog.index, { command: 'sure' })
          },
        },
      ],
    })
  }

  /**
   * 快速打开成功对话框
   * @returns 返回对话框索引
   */
  const success = (message: string, title?: string, options?: Partial<DialogOptions>): number => {
    return openDialog({
      header: title ?? (() => getTranslation('dialog.successTitle', '成功')),
      hideHeader: false,
      ...options,
      contentRenderer: () => h('div', { class: 'text-center text-successColor' }, message),
      footerButtons: [
        {
          label: () => getTranslation('common.confirm', '确定'),
          severity: 'success',
          text: true,
          btnClick: ({ dialog }) => {
            closeDialog(dialog.index, { command: 'sure' })
          },
        },
      ],
    })
  }

  /**
   * 快速打开警告对话框
   * @returns 返回对话框索引
   */
  const warning = (message: string, title?: string, options?: Partial<DialogOptions>): number => {
    return openDialog({
      header: title ?? (() => getTranslation('dialog.warningTitle', '警告')),
      hideHeader: false,
      ...options,
      contentRenderer: () => h('div', { class: 'text-center text-warnColor' }, message),
      footerButtons: [
        {
          label: () => getTranslation('common.confirm', '确定'),
          severity: 'warning',
          text: true,
          btnClick: ({ dialog }) => {
            closeDialog(dialog.index, { command: 'sure' })
          },
        },
      ],
    })
  }

  /**
   * 快速打开错误对话框
   * @returns 返回对话框索引
   */
  const error = (message: string, title?: string, options?: Partial<DialogOptions>): number => {
    return openDialog({
      header: title ?? (() => getTranslation('dialog.errorTitle', '错误')),
      hideHeader: false,
      ...options,
      contentRenderer: () => h('div', { class: 'text-center text-dangerColor' }, message),
      footerButtons: [
        {
          label: () => getTranslation('common.confirm', '确定'),
          severity: 'danger',
          text: true,
          btnClick: ({ dialog }) => {
            closeDialog(dialog.index, { command: 'sure' })
          },
        },
      ],
    })
  }

  /**
   * 快速打开确认对话框
   */
  const confirm = (
    message: string,
    title?: string,
    options?: Partial<DialogOptions> & { onConfirm?: () => void; onCancel?: () => void }
  ): number => {
    return openDialog({
      header: title ?? (() => getTranslation('dialog.confirmTitle', '确认')),
      hideHeader: false,
      ...options,
      contentRenderer: () => h('div', { class: 'text-center text-primaryColor' }, message),
      footerButtons: [
        {
          label: () => getTranslation('common.cancel', '取消'),
          severity: 'secondary',
          text: true,
          btnClick: ({ dialog }) => {
            closeDialog(dialog.index, { command: 'cancel' })
            options?.onCancel?.()
          },
        },
        {
          label: () => getTranslation('common.confirm', '确定'),
          severity: 'primary',
          text: true,
          btnClick: ({ dialog }) => {
            closeDialog(dialog.index, { command: 'sure' })
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
    message?: string,
    title?: string,
    options?: Partial<DialogOptions> & { onConfirm?: () => void; onCancel?: () => void }
  ): number => {
    return openDialog({
      header: title ?? (() => getTranslation('dialog.deleteTitle', '删除确认')),
      hideHeader: false,
      ...options,
      contentRenderer: () =>
        h(
          'div',
          { class: 'text-center text-dangerColor' },
          message || getTranslation('dialog.deleteMessage', '确定要删除吗？')
        ),
      footerButtons: [
        {
          label: () => getTranslation('common.cancel', '取消'),
          severity: 'secondary',
          text: true,
          btnClick: ({ dialog }) => {
            closeDialog(dialog.index, { command: 'cancel' })
            options?.onCancel?.()
          },
        },
        {
          label: () => getTranslation('common.delete', '删除'),
          severity: 'danger',
          text: true,
          btnClick: ({ dialog }) => {
            closeDialog(dialog.index, { command: 'sure' })
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
