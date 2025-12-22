// @/components/schema-form/hooks/useFormActions.ts
/**
 * 表单操作 Hook
 * 处理表单的暴露 API（defineExpose）
 */

import { nextTick, type Ref } from 'vue'
import { getEmptyValues, getResetValues } from '../utils/emptyValues'
import type { SchemaColumnsItem, SchemaConfig } from '../utils/types'
import { filterEmptyValues } from '../utils/valueHelpers'

export interface UseFormActionsOptions {
  schema: Ref<SchemaConfig>
  formApiRef: Ref<any>
  formContainerRef: Ref<HTMLElement | null>
  valuesRef: Ref<Record<string, any>>
  cachedFormValues: Ref<Record<string, any> | null>
  rememberEnabled: Ref<boolean>
  formMemory: {
    saveValuesImmediate: (values: Record<string, any>) => Promise<void>
    isRestoring: Ref<boolean>
  }
  collectLatestValues: () => Record<string, any>
  syncValuesRefImmediately: () => void
  clearAllFieldValidationStates: (targetFields?: string[]) => void
  validateField: (
    column: SchemaColumnsItem,
    value: any,
    allValues: Record<string, any>
  ) => string | null
  deepClone: <T>(value: T) => T
  withPausedFieldWatchers: <T>(
    fn: () => Promise<T> | T,
    clearValidationBeforeResume?: boolean
  ) => Promise<T>
  debugSchemaForm: (...args: any[]) => void
}

export interface UseFormActionsReturn {
  getFormValues: () => Record<string, any>
  validate: () => Promise<{ valid: boolean; errors: Record<string, Array<{ message: string }>> }>
  submit: () => void
  reset: () => Promise<void>
  clear: () => Promise<void>
  setFieldValue: (field: string, value: any) => void
  setValues: (newValues: Record<string, any>) => void
}

/**
 * 使用表单操作 Hook
 */
export function useFormActions(options: UseFormActionsOptions): UseFormActionsReturn {
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
    clearAllFieldValidationStates,
    validateField,
    deepClone,
    withPausedFieldWatchers,
    debugSchemaForm,
  } = options

  /**
   * 获取当前值（过滤掉空值字段）
   */
  function getFormValues(): Record<string, any> {
    const allValues = collectLatestValues()
    const fieldValues: Record<string, any> = {}
    for (const column of schema.value.columns) {
      if (column.hidden === true && column.hideValue !== true) {
        continue
      }
      fieldValues[column.field] = allValues[column.field]
    }
    return filterEmptyValues(fieldValues)
  }

  /**
   * 触发验证，返回 { valid, errors }
   */
  async function validate(): Promise<{
    valid: boolean
    errors: Record<string, Array<{ message: string }>>
  }> {
    const allValues = collectLatestValues()
    const values: Record<string, any> = {}
    for (const column of schema.value.columns) {
      if (column.hidden === true && column.hideValue !== true) {
        continue
      }
      values[column.field] = allValues[column.field]
    }

    const errorMap: Record<string, Array<{ message: string }>> = {}
    for (const column of schema.value.columns) {
      if (column.hidden === true && column.hideValue !== true) {
        continue
      }

      if (!column.rules) {
        continue
      }
      const value = values[column.field]
      const err = validateField(column, value, values)
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
    const allResetValues: Record<string, any> = {}

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

    cachedFormValues.value = deepClone(resetValues)

    if (formApiRef.value) {
      await withPausedFieldWatchers(async () => {
        if (formApiRef.value.values && typeof formApiRef.value.values === 'object') {
          Object.keys(formApiRef.value.values).forEach(key => {
            delete (formApiRef.value.values as any)[key]
          })
        }

        for (const column of schema.value.columns) {
          const key = column.field
          const fieldRef = formApiRef.value[key]
          if (fieldRef && typeof fieldRef === 'object' && 'value' in fieldRef) {
            ;(fieldRef as Record<string, any>).value = allResetValues[key]
          }
        }

        if (typeof formApiRef.value.setValues === 'function') {
          formApiRef.value.setValues(allResetValues)
        }
      }, true)
    }

    await nextTick()
    clearAllFieldValidationStates()

    if (rememberEnabled.value) {
      const completeResetValues: Record<string, any> = {}
      for (const column of schema.value.columns) {
        if (column.hidden === true && column.hideValue !== true) {
          continue
        }
        const field = column.field
        if (Object.prototype.hasOwnProperty.call(allResetValues, field)) {
          completeResetValues[field] = allResetValues[field]
        }
      }
      await formMemory.saveValuesImmediate(completeResetValues)
    }
  }

  /**
   * 清空表单（所有字段设置为合适的空值）
   */
  async function clear(): Promise<void> {
    debugSchemaForm('[SchemaForm][clear]')

    clearAllFieldValidationStates()

    debugSchemaForm('[SchemaForm][clear] clearing all fields')

    cachedFormValues.value = {}
    const emptyValues = getEmptyValues(schema.value.columns)

    if (formApiRef.value) {
      await withPausedFieldWatchers(async () => {
        if (formApiRef.value.values && typeof formApiRef.value.values === 'object') {
          Object.keys(formApiRef.value.values).forEach(key => {
            delete (formApiRef.value.values as any)[key]
          })
        }

        for (const column of schema.value.columns) {
          const key = column.field
          const fieldRef = formApiRef.value[key]
          if (fieldRef && typeof fieldRef === 'object' && 'value' in fieldRef) {
            ;(fieldRef as Record<string, any>).value = emptyValues[key]
          }
        }

        if (typeof formApiRef.value.setValues === 'function') {
          formApiRef.value.setValues(emptyValues)
        }
      }, true)
    }

    await nextTick()
    clearAllFieldValidationStates()

    if (rememberEnabled.value) {
      await formMemory.saveValuesImmediate({})
    }
  }

  /**
   * 设置某个字段值
   */
  function setFieldValue(field: string, value: any): void {
    debugSchemaForm('[SchemaForm][setFieldValue]', {
      field,
      value,
      hasFormApiRef: !!formApiRef.value,
    })
    if (!formApiRef.value) {
      console.warn('[SchemaForm][setFieldValue] formApiRef is null')
      return
    }

    if (formApiRef.value.values && typeof formApiRef.value.values === 'object') {
      ;(formApiRef.value.values as Record<string, any>)[field] = value
    }

    const fieldRef = formApiRef.value[field]
    if (fieldRef && typeof fieldRef === 'object' && 'value' in fieldRef) {
      ;(fieldRef as Record<string, any>).value = value
    }

    if (typeof formApiRef.value.setFieldValue === 'function') {
      debugSchemaForm('[SchemaForm][setFieldValue] calling PrimeVue Form setFieldValue', {
        field,
        value,
      })
      formApiRef.value.setFieldValue(field, value)
    } else {
      debugSchemaForm('[SchemaForm][setFieldValue] fallback: setting formApiRef.value[field]', {
        field,
        value,
      })
      formApiRef.value[field] = value
    }

    nextTick(() => {
      syncValuesRefImmediately()
    })
  }

  /**
   * 批量设置值
   */
  function setValues(newValues: Record<string, any>): void {
    if (!formApiRef.value) {
      return
    }

    debugSchemaForm('[SchemaForm][setValues]', {
      newValues,
      hasFormApiRef: !!formApiRef.value,
      keys: Object.keys(newValues),
    })

    if (formApiRef.value.values && typeof formApiRef.value.values === 'object') {
      Object.keys(newValues).forEach(key => {
        ;(formApiRef.value.values as any)[key] = newValues[key]
      })
    }

    for (const column of schema.value.columns) {
      const key = column.field
      if (Object.prototype.hasOwnProperty.call(newValues, key)) {
        const fieldRef = formApiRef.value[key]
        if (fieldRef && typeof fieldRef === 'object' && 'value' in fieldRef) {
          ;(fieldRef as Record<string, any>).value = newValues[key]
        }
      }
    }

    if (typeof formApiRef.value.setValues === 'function') {
      formApiRef.value.setValues(newValues)
    }

    nextTick(() => {
      syncValuesRefImmediately()

      if (rememberEnabled.value && !formMemory.isRestoring.value) {
        const filtered: Record<string, any> = {}
        for (const column of schema.value.columns) {
          if (column.hidden === true && column.hideValue !== true) {
            continue
          }
          if (Object.prototype.hasOwnProperty.call(newValues, column.field)) {
            filtered[column.field] = newValues[column.field]
          }
        }
        formMemory.saveValuesImmediate(filtered)
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
