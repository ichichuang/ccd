// @/components/schema-form/hooks/useSubmit.ts
/**
 * 表单提交 Hook
 * 处理表单提交逻辑
 */

import { nextTick, type Ref } from 'vue'
import type { SchemaConfig, SchemaFormEmits } from '../utils/types'

export interface UseSubmitOptions {
  schema: Ref<SchemaConfig>
  formApiRef: Ref<any>
  markFieldTouched: (fieldName: string) => void
  submitTransform?: (values: Record<string, any>) => Record<string, any>
  emit: (event: keyof SchemaFormEmits, ...args: any[]) => void
}

export interface UseSubmitReturn {
  onValidSubmit: (event: {
    values: Record<string, any>
    valid: boolean
    errors: any
  }) => Promise<void>
}

/**
 * 使用表单提交 Hook
 */
export function useSubmit(options: UseSubmitOptions): UseSubmitReturn {
  const { schema, formApiRef, markFieldTouched, submitTransform, emit } = options

  /**
   * 提交成功处理
   */
  async function onValidSubmit(event: {
    values: Record<string, any>
    valid: boolean
    errors: any
  }) {
    const { values, valid, errors } = event

    if (!valid) {
      // 🔥 关键：当表单提交失败时，标记所有有错误的字段为 touched，确保错误状态正确显示
      // 使用 nextTick 确保在 PrimeVue Form 完成校验状态更新后再标记字段
      nextTick(() => {
        if (formApiRef.value) {
          for (const fieldName of Object.keys(errors || {})) {
            markFieldTouched(fieldName)
          }
        }
      })

      const errorMap: Record<string, string> = {}
      for (const [fieldName, fieldErrors] of Object.entries(
        errors as Record<string, Array<{ message?: string }>>
      )) {
        if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
          errorMap[fieldName] = fieldErrors[0]?.message || '验证失败'
        }
      }
      emit('error', { errors: errorMap })
      return
    }

    // 字段输出转换（根据 hideValue 属性决定是否包含隐藏字段）
    const transformedValues: Record<string, any> = {}
    for (const column of schema.value.columns) {
      // 如果字段被隐藏且 hideValue 为 false，则跳过该字段
      if (column.hidden === true && column.hideValue !== true) {
        continue
      }

      const rawValue = values[column.field]
      transformedValues[column.field] = column.transform?.output
        ? column.transform.output(rawValue, { values, column })
        : rawValue
    }

    // 全局提交转换
    const finalValues = submitTransform ? submitTransform(transformedValues) : transformedValues

    emit('submit', finalValues)
  }

  return {
    onValidSubmit,
  }
}
