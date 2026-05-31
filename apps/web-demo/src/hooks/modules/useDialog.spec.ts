import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { DialogOptions } from '@ccd/vue-ui'

type DialogCommand = 'cancel' | 'sure' | 'close'

type DialogFacadeButton = {
  label?: string | (() => string)
  severity?: string
  text?: boolean
  btnClick?: (params: {
    dialog: { index: number; options?: DialogFacadeOptions }
    button: { index: number }
  }) => void
}

type DialogFacadeOptions = {
  _instanceId?: string
  header?: string | (() => string)
  hideHeader?: boolean
  contentRenderer?: (params: { options: DialogFacadeOptions; index: number }) => {
    props?: Record<string, unknown>
  }
  footerButtons?: DialogFacadeButton[]
}

const { dialogCoreMock } = vi.hoisted(() => {
  const dialogStore = { value: [] as Record<string, unknown>[] }
  const addDialog = vi.fn((options: Record<string, unknown>) => {
    dialogStore.value.push(options)
    return dialogStore.value.length - 1
  })

  return {
    dialogCoreMock: {
      addDialog,
      closeAllDialog: vi.fn(() => {
        dialogStore.value = []
      }),
      closeDialog: vi.fn(),
      dialogStore,
      removeDialogByInstanceId: vi.fn(),
      updateDialog: vi.fn(),
    },
  }
})

vi.mock('@ccd/vue-ui', () => ({
  ['PrimeDialogMessageContent']: () => null,
  useDialogCore: () => dialogCoreMock,
}))

vi.mock('@/locales', () => ({
  t: (key: string) => `translated:${key}`,
}))

function resolveText(value: string | (() => string) | undefined): string | undefined {
  return typeof value === 'function' ? value() : value
}

function latestDialogOptions(): DialogFacadeOptions {
  const latestCall = dialogCoreMock.addDialog.mock.calls.at(-1)
  if (!latestCall) throw new Error('Expected addDialog to be called')
  return latestCall[0] as DialogFacadeOptions
}

function requireButton(options: DialogFacadeOptions, index: number): DialogFacadeButton {
  const button = options.footerButtons?.[index]
  if (!button) throw new Error(`Expected footer button ${index}`)
  return button
}

function invokeButton(
  button: DialogFacadeButton,
  options: DialogFacadeOptions,
  index: number
): void {
  button.btnClick?.({
    button: { index },
    dialog: { index: 0, options },
  })
}

describe('useDialog app facade', () => {
  beforeEach(() => {
    dialogCoreMock.dialogStore.value = []
    dialogCoreMock.addDialog.mockClear()
    dialogCoreMock.closeAllDialog.mockClear()
    dialogCoreMock.closeDialog.mockClear()
    dialogCoreMock.removeDialogByInstanceId.mockClear()
    dialogCoreMock.updateDialog.mockClear()
  })

  it('builds translated info dialogs over the package dialog core', async () => {
    const { useDialog } = await import('./useDialog')

    const index = useDialog().info('System ready')
    const options = latestDialogOptions()
    const confirmButton = requireButton(options, 0)
    const content = options.contentRenderer?.({ index, options })

    expect(index).toBe(0)
    expect(resolveText(options.header)).toBe('translated:dialog.infoTitle')
    expect(options.hideHeader).toBe(false)
    expect(content?.props?.message).toBe('System ready')
    expect(content?.props?.class).toBe('text-center text-primary')
    expect(resolveText(confirmButton.label)).toBe('translated:common.confirm')
    expect(confirmButton.severity).toBe('primary')
    expect(confirmButton.text).toBe(true)

    invokeButton(confirmButton, options, 0)

    expect(dialogCoreMock.closeDialog).toHaveBeenCalledWith(0, { command: 'sure' })
  })

  it('preserves confirmDelete default text, severities, and callbacks', async () => {
    const { useDialog } = await import('./useDialog')
    const onCancel = vi.fn()
    const onConfirm = vi.fn()

    useDialog().confirmDelete(undefined, undefined, { onCancel, onConfirm })
    const options = latestDialogOptions()
    const cancelButton = requireButton(options, 0)
    const deleteButton = requireButton(options, 1)
    const content = options.contentRenderer?.({ index: 0, options })

    expect(resolveText(options.header)).toBe('translated:dialog.deleteTitle')
    expect(content?.props?.message).toBe('translated:dialog.deleteMessage')
    expect(content?.props?.class).toBe('text-center text-danger')
    expect(resolveText(cancelButton.label)).toBe('translated:common.cancel')
    expect(cancelButton.severity).toBe('secondary')
    expect(resolveText(deleteButton.label)).toBe('translated:common.delete')
    expect(deleteButton.severity).toBe('danger')

    invokeButton(cancelButton, options, 0)
    invokeButton(deleteButton, options, 1)

    expect(dialogCoreMock.closeDialog).toHaveBeenNthCalledWith(1, 0, { command: 'cancel' })
    expect(dialogCoreMock.closeDialog).toHaveBeenNthCalledWith(2, 0, { command: 'sure' })
    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('delegates core store operations without adding package coupling', async () => {
    const { useDialog } = await import('./useDialog')
    const first = { _instanceId: 'first' }
    const second = { _instanceId: 'second' }
    dialogCoreMock.dialogStore.value = [first, second]

    const dialog = useDialog()
    expect(dialog.getDialogCount()).toBe(2)
    expect(dialog.isDialogExists(1)).toBe(true)
    expect(dialog.isDialogExists(2)).toBe(false)

    dialog.closeDialogByObject(second as DialogOptions, { command: 'close' as DialogCommand })
    dialog.closeLastDialog({ command: 'cancel' })
    dialog.removeDialog('first')
    dialog.update('Updated title')
    dialog.closeAll()

    expect(dialogCoreMock.closeDialog).toHaveBeenNthCalledWith(1, 1, { command: 'close' })
    expect(dialogCoreMock.closeDialog).toHaveBeenNthCalledWith(2, 1, { command: 'cancel' })
    expect(dialogCoreMock.removeDialogByInstanceId).toHaveBeenCalledWith('first')
    expect(dialogCoreMock.updateDialog).toHaveBeenCalledWith('Updated title', 'header', 0)
    expect(dialogCoreMock.closeAllDialog).toHaveBeenCalledTimes(1)
  })
})
