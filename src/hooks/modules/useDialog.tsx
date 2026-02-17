/**
 * useDialog Composable
 * 提供对话框便捷方法：openDialog、info、success、warn、danger、confirm、confirmDelete
 * 动态弹窗请使用 PrimeVue useDialog().open()；确认弹窗请使用 useConfirm().require()
 * 使用 TSX 语法 + UnoCSS 语义类（text-primary、text-success、text-warn、text-danger、text-foreground）
 */
import { MessageContent } from '@/components/PrimeDialog/MessageContent'
import { useDialogCore } from '@/components/PrimeDialog'
import type { ArgsType, ButtonProps, DialogOptions } from '@/components/PrimeDialog'
import { t } from '@/locales'

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
  warn: (message: string, title?: string, options?: Partial<DialogOptions>) => number
  danger: (message: string, title?: string, options?: Partial<DialogOptions>) => number
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
      header: title ?? (() => t('dialog.infoTitle')),
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
          label: () => t('common.confirm'),
          severity: 'primary',
          text: true,
          btnClick: ({ dialog }) => closeDialog(dialog.index, { command: 'sure' }),
        },
      ],
    })

  const success = (message: string, title?: string, options?: Partial<DialogOptions>): number =>
    openDialog({
      header: title ?? (() => t('dialog.successTitle')),
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
          label: () => t('common.confirm'),
          severity: 'success',
          text: true,
          btnClick: ({ dialog }) => closeDialog(dialog.index, { command: 'sure' }),
        },
      ],
    })

  const warn = (message: string, title?: string, options?: Partial<DialogOptions>): number =>
    openDialog({
      header: title ?? (() => t('dialog.warningTitle')),
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
          label: () => t('common.confirm'),
          severity: 'warn',
          text: true,
          btnClick: ({ dialog }) => closeDialog(dialog.index, { command: 'sure' }),
        },
      ],
    })

  const danger = (message: string, title?: string, options?: Partial<DialogOptions>): number =>
    openDialog({
      header: title ?? (() => t('dialog.errorTitle')),
      hideHeader: false,
      ...options,
      contentRenderer: () => (
        <MessageContent
          message={message}
          class="text-center text-danger"
        />
      ),
      footerButtons: [
        {
          label: () => t('common.confirm'),
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
      header: title ?? (() => t('dialog.confirmTitle')),
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
          label: () => t('common.cancel'),
          severity: 'secondary',
          text: true,
          btnClick: ({ dialog }) => {
            closeDialog(dialog.index, { command: 'cancel' })
            options?.onCancel?.()
          },
        },
        {
          label: () => t('common.confirm'),
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
      header: title ?? (() => t('dialog.deleteTitle')),
      hideHeader: false,
      ...options,
      contentRenderer: () => (
        <MessageContent
          message={message ?? t('dialog.deleteMessage')}
          class="text-center text-danger"
        />
      ),
      footerButtons: [
        {
          label: () => t('common.cancel'),
          severity: 'secondary',
          text: true,
          btnClick: ({ dialog }) => {
            closeDialog(dialog.index, { command: 'cancel' })
            options?.onCancel?.()
          },
        },
        {
          label: () => t('common.delete'),
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
    warn,
    danger,
    confirm,
    confirmDelete,
  }
}

export type { ArgsType, ButtonProps, DialogOptions }
