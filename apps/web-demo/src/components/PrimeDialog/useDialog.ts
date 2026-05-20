/**
 * PrimeDialog 底层 Composable
 * 提供对话框状态管理与 addDialog/closeDialog 等核心方法
 */
import { generateUniqueId } from '@ccd/shared-utils'
import { deepClone } from '@ccd/shared-utils'
import type { Ref } from 'vue'
import { defaultContentRenderer } from './defaultContentRenderer'
import { defaultDialogProps } from './utils/constants'
import type { ArgsType, DialogOptions } from './utils/types'

type DialogOptionKey = keyof DialogOptions

export type UseDialogCoreReturn = {
  dialogStore: Readonly<Ref<readonly DialogOptions[]>>
  addDialog: (options: DialogOptions) => number
  closeDialog: (index: number, args?: ArgsType) => void
  removeDialogByInstanceId: (instanceId: string) => void
  updateDialog: <TKey extends DialogOptionKey>(
    value: DialogOptions[TKey],
    key?: TKey,
    index?: number
  ) => void
  closeAllDialog: () => void
}

const _dialogStore = ref<DialogOptions[]>([])
const _closingInstanceIds = new Set<string>()
const _pendingOpenTimers = new Map<string, ReturnType<typeof globalThis.setTimeout>>()

function clearPendingOpenTimer(instanceId: string): void {
  const timerId = _pendingOpenTimers.get(instanceId)
  if (timerId !== undefined) {
    globalThis.clearTimeout(timerId)
    _pendingOpenTimers.delete(instanceId)
  }
}

export function useDialogCore(): UseDialogCoreReturn {
  function addDialog(options: DialogOptions): number {
    const clonedOptions: DialogOptions = deepClone(options)
    const clonedDefaults = deepClone(defaultDialogProps) as DialogOptions
    const hasOpenDelay = (options?.openDelay ?? 0) > 0
    const mergedOptions: DialogOptions = {
      ...clonedDefaults,
      ...clonedOptions,
      visible: !hasOpenDelay,
    }
    mergedOptions.class = [mergedOptions.sizeClass, clonedOptions.class].filter(Boolean).join(' ')

    mergedOptions.contentRenderer = options.contentRenderer ?? defaultContentRenderer
    if (options.headerRenderer) mergedOptions.headerRenderer = options.headerRenderer
    if (options.footerRenderer) mergedOptions.footerRenderer = options.footerRenderer
    mergedOptions._instanceId = generateUniqueId()
    const instanceId = mergedOptions._instanceId

    _dialogStore.value.push(mergedOptions)
    const index = _dialogStore.value.length - 1

    if (hasOpenDelay) {
      const delay = options.openDelay!
      const timerId = globalThis.setTimeout(() => {
        _pendingOpenTimers.delete(instanceId)
        const dialog = _dialogStore.value.find(d => d._instanceId === instanceId)
        if (dialog) {
          dialog.visible = true
        }
      }, delay)
      _pendingOpenTimers.set(instanceId, timerId)
    }

    return index
  }

  function closeDialog(index: number, _args?: ArgsType) {
    const options = _dialogStore.value[index]
    if (!options) return
    const instanceId = options._instanceId
    if (instanceId && _closingInstanceIds.has(instanceId)) return
    if (instanceId) _closingInstanceIds.add(instanceId)
    options.visible = false
  }

  function removeDialogByInstanceId(instanceId: string) {
    clearPendingOpenTimer(instanceId)
    const idx = _dialogStore.value.findIndex(d => d._instanceId === instanceId)
    if (idx !== -1) _dialogStore.value.splice(idx, 1)
    _closingInstanceIds.delete(instanceId)
  }

  function updateDialog<TKey extends DialogOptionKey>(
    value: DialogOptions[TKey],
    key: TKey = 'header' as TKey,
    index = 0
  ) {
    const item = _dialogStore.value[index]
    if (item && key in item) {
      item[key] = value
    }
  }

  function closeAllDialog() {
    _pendingOpenTimers.forEach(timerId => {
      globalThis.clearTimeout(timerId)
    })
    _pendingOpenTimers.clear()
    _closingInstanceIds.clear()
    _dialogStore.value = []
  }

  const dialogStore = readonly(_dialogStore) as Readonly<Ref<readonly DialogOptions[]>>
  return {
    dialogStore,
    addDialog,
    closeDialog,
    removeDialogByInstanceId,
    updateDialog,
    closeAllDialog,
  }
}
