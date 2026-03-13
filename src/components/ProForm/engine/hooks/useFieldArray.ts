import { FORM_CONTROLLER_KEY } from './useForm'
import type { FieldArrayReturn } from '../types'

let keyCounter = 0
const generateKey = (): string => `field-array-key-${keyCounter++}`

export function useFieldArray<TValue = unknown>(name: string): FieldArrayReturn<TValue> {
  const controller = inject(FORM_CONTROLLER_KEY)
  if (!controller) {
    throw new Error('[ProForm] useFieldArray must be used within a ProForm context')
  }

  // Keep track of stable keys for DOM rendering
  const keyMap = ref<string[]>([])

  const currentValues = computed<TValue[]>(() => {
    const val = controller.getValues()[name]
    return Array.isArray(val) ? (val as TValue[]) : []
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

  const append = (value: TValue): void => {
    const newArray = [...currentValues.value, value]
    keyMap.value.push(generateKey())
    controller.setFieldsValue({ [name]: newArray })
  }

  const remove = (index: number): void => {
    const newArray = [...currentValues.value]
    newArray.splice(index, 1)
    keyMap.value.splice(index, 1)
    controller.setFieldsValue({ [name]: newArray })
  }

  const move = (from: number, to: number): void => {
    if (to < 0 || to >= currentValues.value.length) return
    if (from < 0 || from >= currentValues.value.length) return
    if (from === to) return

    const newArray = [...currentValues.value]
    const newKeyMap = [...keyMap.value]

    const [item] = newArray.splice(from, 1)
    newArray.splice(to, 0, item as TValue)

    const [keyItem] = newKeyMap.splice(from, 1)
    newKeyMap.splice(to, 0, keyItem as string)

    keyMap.value = newKeyMap
    controller.setFieldsValue({ [name]: newArray })
  }

  return {
    fields,
    append,
    remove,
    move,
  }
}
