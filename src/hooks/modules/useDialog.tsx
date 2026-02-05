/**
 * useDialog Composable
 * 提供对话框便捷方法：openDialog、info、success、warning、error、confirm、confirmDelete
 * 动态弹窗请使用 PrimeVue useDialog().open()；确认弹窗请使用 useConfirm().require()
 * 使用 TSX 语法 + UnoCSS 语义类（text-primary、text-success、text-warn、text-destructive、text-foreground）
 */
import { MessageContent } from '@/components/prime-dialog/MessageContent'
import { useDialogCore } from '@/components/prime-dialog'
import type { ArgsType, ButtonProps, DialogOptions } from '@/components/prime-dialog'
import { t } from '@/locales'

function getTranslation(key: string, fallback: string): string {
  const translation = t(key)
  return translation === key ? fallback : translation
}

export interface UseDialogReturn {
  dialogStore: ReturnType<typeof useDialogCore>['dialogStore']
  openDialog: (options: DialogOptions) => number
  closeDialog: (index: number, args?: ArgsType) => void
  closeDialogByIndex: (index: number, args?: ArgsType) => void
  closeDialogByObject: (dialog: DialogOptions, args?: ArgsType) => void
  closeLastDialog: (args?: ArgsType) => void
  closeAll: () => void
  update: (value: unknown, key?: string, index?: number) => void
  getDialogCount: () => number
  isDialogExists: (index: number) => boolean
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

export function useDialog(): UseDialogReturn {
  const { dialogStore, addDialog, closeDialog, updateDialog, closeAllDialog } = useDialogCore()

  const openDialog = (options: DialogOptions): number => addDialog(options)

  const closeDialogByIndex = (index: number, args?: ArgsType) => closeDialog(index, args)

  const closeDialogByObject = (dialog: DialogOptions, args?: ArgsType) => {
    const foundIndex = dialogStore.value.findIndex(d => d === dialog)
    if (foundIndex !== -1) closeDialog(foundIndex, args)
  }

  const closeLastDialog = (args?: ArgsType) => {
    if (dialogStore.value.length > 0) {
      closeDialog(dialogStore.value.length - 1, args)
    }
  }

  const closeAll = () => closeAllDialog()

  const update = (value: unknown, key = 'header', index = 0) => updateDialog(value, key, index)

  const getDialogCount = () => dialogStore.value.length

  const isDialogExists = (index: number) => index >= 0 && index < dialogStore.value.length

  const info = (message: string, title?: string, options?: Partial<DialogOptions>): number =>
    openDialog({
      header: title ?? (() => getTranslation('dialog.infoTitle', '提示')),
      hideHeader: false,
      ...options,
      contentRenderer: () => (
        <MessageContent
          message={message}
          class="text-center text-primary"
        />
      ),
      footerButtons: [
        {
          label: () => getTranslation('common.confirm', '确定'),
          severity: 'primary',
          text: true,
          btnClick: ({ dialog }) => closeDialog(dialog.index, { command: 'sure' }),
        },
      ],
    })

  const success = (message: string, title?: string, options?: Partial<DialogOptions>): number =>
    openDialog({
      header: title ?? (() => getTranslation('dialog.successTitle', '成功')),
      hideHeader: false,
      ...options,
      contentRenderer: () => (
        <MessageContent
          message={message}
          class="text-center text-success"
        />
      ),
      footerButtons: [
        {
          label: () => getTranslation('common.confirm', '确定'),
          severity: 'success',
          text: true,
          btnClick: ({ dialog }) => closeDialog(dialog.index, { command: 'sure' }),
        },
      ],
    })

  const warning = (message: string, title?: string, options?: Partial<DialogOptions>): number =>
    openDialog({
      header: title ?? (() => getTranslation('dialog.warningTitle', '警告')),
      hideHeader: false,
      ...options,
      contentRenderer: () => (
        <MessageContent
          message={message}
          class="text-center text-warn"
        />
      ),
      footerButtons: [
        {
          label: () => getTranslation('common.confirm', '确定'),
          severity: 'warning',
          text: true,
          btnClick: ({ dialog }) => closeDialog(dialog.index, { command: 'sure' }),
        },
      ],
    })

  const error = (message: string, title?: string, options?: Partial<DialogOptions>): number =>
    openDialog({
      header: title ?? (() => getTranslation('dialog.errorTitle', '错误')),
      hideHeader: false,
      ...options,
      contentRenderer: () => (
        <MessageContent
          message={message}
          class="text-center text-destructive"
        />
      ),
      footerButtons: [
        {
          label: () => getTranslation('common.confirm', '确定'),
          severity: 'danger',
          text: true,
          btnClick: ({ dialog }) => closeDialog(dialog.index, { command: 'sure' }),
        },
      ],
    })

  const confirm = (
    message: string,
    title?: string,
    options?: Partial<DialogOptions> & { onConfirm?: () => void; onCancel?: () => void }
  ): number =>
    openDialog({
      header: title ?? (() => getTranslation('dialog.confirmTitle', '确认')),
      hideHeader: false,
      ...options,
      contentRenderer: () => (
        <MessageContent
          message={message}
          class="text-center text-foreground"
        />
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

  const confirmDelete = (
    message?: string,
    title?: string,
    options?: Partial<DialogOptions> & { onConfirm?: () => void; onCancel?: () => void }
  ): number =>
    openDialog({
      header: title ?? (() => getTranslation('dialog.deleteTitle', '删除确认')),
      hideHeader: false,
      ...options,
      contentRenderer: () => (
        <MessageContent
          message={message ?? getTranslation('dialog.deleteMessage', '确定要删除吗？')}
          class="text-center text-destructive"
        />
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

  return {
    dialogStore,
    openDialog,
    closeDialog: closeDialogByIndex,
    closeDialogByIndex,
    closeDialogByObject,
    closeLastDialog,
    closeAll,
    update,
    getDialogCount,
    isDialogExists,
    info,
    success,
    warning,
    error,
    confirm,
    confirmDelete,
  }
}

export type { ArgsType, ButtonProps, DialogOptions }
