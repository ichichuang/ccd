// @/components/SchemaForm/hooks/useFormActions.ts
/**
 * 表单操作 Hook
 * 处理表单的暴露 API（defineExpose）
 */

import { nextTick, type Ref } from 'vue'
import { getEmptyValues, getResetValues } from '../utils/emptyValues'
import type {
  DebugLogger,
  FieldErrorsMap,
  FormApiLike,
  FormValues,
  SchemaColumnsItem,
  SchemaConfig,
} from '../utils/types'
import { filterEmptyValues } from '../utils/valueHelpers'

export interface UseFormActionsOptions<TValues extends FormValues = FormValues> {
  schema: Ref<SchemaConfig>
  formApiRef: Ref<FormApiLike<TValues> | null>
  formContainerRef: Ref<HTMLElement | null>
  valuesRef: Ref<TValues>
  cachedFormValues: Ref<TValues | null>
  rememberEnabled: Ref<boolean>
  formMemory: {
    saveValuesImmediate: (values: TValues) => Promise<void>
    isRestoring: Ref<boolean>
  }
  collectLatestValues: () => TValues
  syncValuesRefImmediately: () => void
  /** reset/clear 后立即同步到 modelValue，避免依赖 watch 防抖导致 UI 不同步 */
  syncToModelValue: () => string
  clearAllFieldValidationStates: (targetFields?: string[]) => void
  validateField: (
    column: SchemaColumnsItem,
    value: unknown,
    allValues: TValues
  ) => Promise<string | null>
  deepClone: <T>(value: T) => T
  withPausedFieldWatchers: <T>(
    fn: () => Promise<T> | T,
    clearValidationBeforeResume?: boolean
  ) => Promise<T>
  debugSchemaForm: DebugLogger
}

export interface UseFormActionsReturn<TValues extends FormValues = FormValues> {
  getFormValues: () => TValues
  validate: () => Promise<{ valid: boolean; errors: FieldErrorsMap }>
  submit: () => void
  reset: () => Promise<void>
  clear: () => Promise<void>
  setFieldValue: (field: string, value: unknown) => void
  setValues: (newValues: Partial<TValues>) => void
}

/**
 * 使用表单操作 Hook
 */
export function useFormActions<TValues extends FormValues = FormValues>(
  options: UseFormActionsOptions<TValues>
): UseFormActionsReturn<TValues> {
  const {
    schema,
    formApiRef,
    formContainerRef,
    valuesRef: _valuesRef,
    cachedFormValues,
    rememberEnabled,
    formMemory,
    collectLatestValues,
    syncValuesRefImmediately,
    syncToModelValue,
    clearAllFieldValidationStates,
    validateField,
    deepClone,
    withPausedFieldWatchers,
    debugSchemaForm,
  } = options

  /**
   * 获取当前值（过滤掉空值字段）
   */
  function getFormValues(): TValues {
    const allValues = collectLatestValues()
    const fieldValues: Record<string, unknown> = {}
    for (const column of schema.value.columns) {
      if (column.hidden === true && column.hideValue !== true) {
        continue
      }
      fieldValues[column.field] = allValues[column.field]
    }
    return filterEmptyValues(fieldValues) as TValues
  }

  /**
   * 触发验证，返回 { valid, errors }
   */
  async function validate(): Promise<{
    valid: boolean
    errors: FieldErrorsMap
  }> {
    const allValues = collectLatestValues()
    const values: Record<string, unknown> = {}
    for (const column of schema.value.columns) {
      if (column.hidden === true && column.hideValue !== true) {
        continue
      }
      values[column.field] = allValues[column.field]
    }

    const errorMap: FieldErrorsMap = {}
    for (const column of schema.value.columns) {
      if (column.hidden === true && column.hideValue !== true) {
        continue
      }

      if (!column.rules) {
        continue
      }
      const value = values[column.field]
      // values 是根据 allValues 过滤后的普通对象，这里显式断言为 TValues 以满足签名
      const err = await validateField(column, value, values as TValues)
      if (err) {
        errorMap[column.field] = [{ message: err }]
      }
    }
    const valid = Object.keys(errorMap).length === 0
    return { valid, errors: errorMap }
  }

  /**
   * 提交（走内部 onValidSubmit 流程）
   */
  function submit(): void {
    const formEl = formContainerRef.value?.querySelector('form') as HTMLFormElement | null
    if (formEl) {
      formEl.requestSubmit()
    }
  }

  /**
   * 重置（恢复 defaultValue）
   */
  async function reset(): Promise<void> {
    debugSchemaForm('[SchemaForm][reset]')

    clearAllFieldValidationStates()

    const resetValues = getResetValues(schema.value.columns)

    debugSchemaForm('[SchemaForm][reset] resetValues', {
      resetValues,
      keys: Object.keys(resetValues),
    })

    const emptyValues = getEmptyValues(schema.value.columns)
    const allResetValues: Record<string, unknown> = {}

    for (const column of schema.value.columns) {
      const key = column.field
      if (key in resetValues) {
        allResetValues[key] = resetValues[key]
      } else {
        allResetValues[key] = emptyValues[key]
      }
    }

    debugSchemaForm('[SchemaForm][reset] allResetValues', {
      allResetValues,
      keys: Object.keys(allResetValues),
    })

    cachedFormValues.value = deepClone(resetValues) as TValues

    if (formApiRef.value) {
      await withPausedFieldWatchers(async () => {
        const api = formApiRef.value
        if (!api) return
        if (typeof api.setValues === 'function') {
          api.setValues(allResetValues as Partial<TValues>)
          return
        }
        const values = api.values
        if (values && typeof values === 'object') {
          const keys = Object.keys(values)
          keys.forEach(k => {
            delete (values as Record<string, unknown>)[k]
          })
        }
        for (const column of schema.value.columns) {
          const key = column.field
          const fieldRef = api[key]
          if (fieldRef && typeof fieldRef === 'object' && 'value' in fieldRef) {
            ;(fieldRef as Record<string, unknown>).value = allResetValues[key]
          }
        }
      }, true)
    }

    await nextTick()
    clearAllFieldValidationStates()
    // 立即同步到 modelValue，使 FormItems 通过 form.modelValue 拿到最新值，避免 watch 防抖导致 UI 不同步
    syncToModelValue()

    if (rememberEnabled.value) {
      const completeResetValues: Record<string, unknown> = {}
      for (const column of schema.value.columns) {
        if (column.hidden === true && column.hideValue !== true) {
          continue
        }
        const field = column.field
        if (Object.prototype.hasOwnProperty.call(allResetValues, field)) {
          completeResetValues[field] = allResetValues[field]
        }
      }
      await formMemory.saveValuesImmediate(completeResetValues as TValues)
    }
  }

  /**
   * 清空表单（所有字段设置为合适的空值）
   */
  async function clear(): Promise<void> {
    debugSchemaForm('[SchemaForm][clear]')

    clearAllFieldValidationStates()

    debugSchemaForm('[SchemaForm][clear] clearing all fields')

    cachedFormValues.value = {} as TValues
    const emptyValues = getEmptyValues(schema.value.columns)

    if (formApiRef.value) {
      await withPausedFieldWatchers(async () => {
        const api = formApiRef.value
        if (!api) return
        if (typeof api.setValues === 'function') {
          api.setValues(emptyValues as Partial<TValues>)
          return
        }
        const values = api.values
        if (values && typeof values === 'object') {
          const keys = Object.keys(values)
          keys.forEach(k => {
            delete (values as Record<string, unknown>)[k]
          })
        }
        for (const column of schema.value.columns) {
          const key = column.field
          const fieldRef = api[key]
          if (fieldRef && typeof fieldRef === 'object' && 'value' in fieldRef) {
            ;(fieldRef as Record<string, unknown>).value = emptyValues[key]
          }
        }
      }, true)
    }

    await nextTick()
    clearAllFieldValidationStates()
    // 立即同步到 modelValue，使 FormItems 通过 form.modelValue 拿到最新值
    syncToModelValue()

    if (rememberEnabled.value) {
      await formMemory.saveValuesImmediate({} as TValues)
    }
  }

  /**
   * 设置某个字段值
   * 优先使用 PrimeVue Form 官方 API，必要时才回退到 values / 字段 ref
   */
  function setFieldValue(field: string, value: unknown): void {
    debugSchemaForm('[SchemaForm][setFieldValue]', {
      field,
      value,
      hasFormApiRef: !!formApiRef.value,
    })
    const api = formApiRef.value
    if (!api) {
      console.warn('[SchemaForm][setFieldValue] formApiRef is null')
      return
    }

    // 1. 优先使用 PrimeVue 官方 API
    if (typeof api.setFieldValue === 'function') {
      debugSchemaForm('[SchemaForm][setFieldValue] calling PrimeVue Form setFieldValue', {
        field,
        value,
      })
      api.setFieldValue(field, value)
    } else {
      // 2. 回退到字段 ref.value
      const fieldRef = api[field]
      if (fieldRef && typeof fieldRef === 'object' && 'value' in fieldRef) {
        ;(fieldRef as Record<string, unknown>).value = value
      } else if (api.values && typeof api.values === 'object') {
        // 3. 最后才直接写 values，避免过度依赖内部结构
        ;(api.values as Record<string, unknown>)[field] = value
      } else {
        debugSchemaForm(
          '[SchemaForm][setFieldValue] fallback: setting formApiRef.value[field] directly',
          {
            field,
            value,
          }
        )
        api[field] = value
      }
    }

    nextTick(() => {
      syncValuesRefImmediately()
    })
  }

  /**
   * 批量设置值
   * 优先使用 PrimeVue Form 官方 API，仅在必要时回退到 values / 字段 ref
   */
  function setValues(newValues: Partial<TValues>): void {
    const api = formApiRef.value
    if (!api) {
      return
    }

    debugSchemaForm('[SchemaForm][setValues]', {
      newValues,
      hasFormApiRef: !!api,
      keys: Object.keys(newValues),
    })

    // 1. 优先使用 PrimeVue 官方 API
    if (typeof api.setValues === 'function') {
      api.setValues(newValues)
    } else {
      // 2. 回退到 values 和字段 ref
      if (api.values && typeof api.values === 'object') {
        const valuesRef = api.values as Record<string, unknown>
        Object.keys(newValues).forEach(key => {
          valuesRef[key] = newValues[key]
        })
      }

      for (const column of schema.value.columns) {
        const key = column.field
        if (Object.prototype.hasOwnProperty.call(newValues, key)) {
          const fieldRef = api[key]
          if (fieldRef && typeof fieldRef === 'object' && 'value' in fieldRef) {
            ;(fieldRef as Record<string, unknown>).value = newValues[key]
          }
        }
      }
    }

    nextTick(() => {
      syncValuesRefImmediately()

      if (rememberEnabled.value && !formMemory.isRestoring.value) {
        const filtered: Record<string, unknown> = {}
        for (const column of schema.value.columns) {
          if (column.hidden === true && column.hideValue !== true) {
            continue
          }
          if (Object.prototype.hasOwnProperty.call(newValues, column.field)) {
            filtered[column.field] = newValues[column.field]
          }
        }
        formMemory.saveValuesImmediate(filtered as TValues)
      }
    })
  }

  return {
    getFormValues,
    validate,
    submit,
    reset,
    clear,
    setFieldValue,
    setValues,
  }
}
