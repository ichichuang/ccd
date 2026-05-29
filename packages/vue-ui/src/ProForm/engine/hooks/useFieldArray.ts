import { computed, inject, ref, watch } from 'vue'
import type { FieldArrayReturn, FormState } from '../types'
import { PRO_FORM_STATE_KEY } from '../constants'
import { useFormContext } from './useFormContext'
import { castValue } from '@ccd/shared-utils'

export function useFieldArray<
  TItem = unknown,
  TValues extends Record<string, unknown> = Record<string, unknown>,
>(name: string): FieldArrayReturn<TItem> {
  let keyCounter = 0
  const generateKey = (): string => `field-array-${name}-${keyCounter++}`
  const controller = useFormContext<TValues>()
  const globalState = inject(PRO_FORM_STATE_KEY, null) as FormState<TValues> | null

  // Keep track of stable keys for DOM rendering
  const keyMap = ref<string[]>([])

  const currentValues = computed<TItem[]>(() => {
    const values = globalState?.values ?? controller.getValues()
    const val = values[name as keyof TValues]
    return Array.isArray(val) ? castValue<TItem[]>(val) : []
  })

  const syncKeyMapByLength = (length: number): void => {
    if (length > keyMap.value.length) {
      const missingCount = length - keyMap.value.length
      for (let i = 0; i < missingCount; i++) {
        keyMap.value.push(generateKey())
      }
      return
    }
    if (length < keyMap.value.length) {
      keyMap.value.length = length
    }
  }

  watch(
    () => currentValues.value.length,
    len => {
      syncKeyMapByLength(len)
    },
    { immediate: true }
  )

  const fields = computed(() => {
    return currentValues.value.map((value, index) => ({
      id: keyMap.value[index] || generateKey(),
      value,
      index,
    }))
  })

  const append = (value: TItem): void => {
    const newArray = [...currentValues.value, value]
    keyMap.value.push(generateKey())
    controller.setFieldsValue(castValue<Partial<TValues>>({ [name]: newArray }))
  }

  const remove = (index: number): void => {
    const newArray = currentValues.value.filter((_, i) => i !== index)
    keyMap.value = keyMap.value.filter((_, i) => i !== index)
    controller.setFieldsValue(castValue<Partial<TValues>>({ [name]: newArray }))
  }

  const move = (from: number, to: number): void => {
    if (to < 0 || to >= currentValues.value.length) return
    if (from < 0 || from >= currentValues.value.length) return
    if (from === to) return

    const arr = currentValues.value
    const keys = keyMap.value
    const item = arr[from]
    const keyItem = keys[from]

    const withoutFrom = arr.filter((_, i) => i !== from)
    const newArray = [...withoutFrom.slice(0, to), item, ...withoutFrom.slice(to)]

    const keysWithoutFrom = keys.filter((_, i) => i !== from)
    const newKeyMap = [...keysWithoutFrom.slice(0, to), keyItem, ...keysWithoutFrom.slice(to)]

    keyMap.value = newKeyMap
    controller.setFieldsValue(castValue<Partial<TValues>>({ [name]: newArray }))
  }

  return {
    fields,
    append,
    remove,
    move,
  }
}
