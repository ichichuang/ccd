/**
 * PrimeDialog 底层 Composable
 * 提供对话框状态管理与 addDialog/closeDialog 等核心方法
 */
import { generateUniqueId } from '@/utils/ids'
import { deepClone } from '@/utils/lodashes'
import type { Ref } from 'vue'
import { readonly, ref } from 'vue'
import { defaultContentRenderer } from './defaultContentRenderer'
import { defaultDialogProps } from './utils/constants'
import type { ArgsType, DialogOptions } from './utils/types'

export type UseDialogCoreReturn = {
  dialogStore: Readonly<Ref<readonly DialogOptions[]>>
  addDialog: (options: DialogOptions) => number
  closeDialog: (index: number, args?: ArgsType) => void
  updateDialog: (value: unknown, key?: string, index?: number) => void
  closeAllDialog: () => void
}

const _dialogStore = ref<DialogOptions[]>([])
const _closingInstanceIds = new Set<string>()

export function useDialogCore(): UseDialogCoreReturn {
  function addDialog(options: DialogOptions): number {
    const clonedOptions: DialogOptions = deepClone(options)
    const clonedDefaults: DialogOptions = deepClone(defaultDialogProps) as DialogOptions
    const hasOpenDelay = (options?.openDelay ?? 0) > 0
    const mergedOptions: DialogOptions = {
      ...clonedDefaults,
      ...clonedOptions,
      visible: !hasOpenDelay,
    }

    mergedOptions.contentRenderer = options.contentRenderer ?? defaultContentRenderer
    if (options.headerRenderer) mergedOptions.headerRenderer = options.headerRenderer
    if (options.footerRenderer) mergedOptions.footerRenderer = options.footerRenderer
    mergedOptions._instanceId = generateUniqueId()
    const instanceId = mergedOptions._instanceId

    _dialogStore.value.push(mergedOptions)
    const index = _dialogStore.value.length - 1

    if (hasOpenDelay) {
      const delay = options.openDelay!
      setTimeout(() => {
        const dialog = _dialogStore.value.find(d => d._instanceId === instanceId)
        if (dialog) {
          dialog.visible = true
        }
      }, delay)
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
    const delay = options?.closeDelay ?? defaultDialogProps.closeDelay ?? 200
    setTimeout(() => {
      const idx = _dialogStore.value.findIndex(d => d._instanceId === instanceId)
      if (idx !== -1) _dialogStore.value.splice(idx, 1)
      if (instanceId) _closingInstanceIds.delete(instanceId)
    }, delay)
  }

  function updateDialog(value: unknown, key = 'header', index = 0) {
    const item = _dialogStore.value[index]
    if (item && key in item) {
      ;(item as Record<string, unknown>)[key] = value
    }
  }

  function closeAllDialog() {
    _dialogStore.value = []
  }

  const dialogStore = readonly(_dialogStore) as Readonly<Ref<readonly DialogOptions[]>>
  return {
    dialogStore,
    addDialog,
    closeDialog,
    updateDialog,
    closeAllDialog,
  }
}
