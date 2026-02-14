// @/components/schema-form/hooks/useSubmit.ts
/**
 * 表单提交 Hook
 * 处理表单提交逻辑
 */

import { nextTick, type Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { FormSubmitEvent } from '@primevue/forms'
import type {
  FieldErrorsMap,
  FormApiLike,
  FormValues,
  SchemaConfig,
  SchemaFormEmits,
  SimpleErrorMap,
} from '../utils/types'

export interface UseSubmitOptions<TValues extends FormValues = FormValues> {
  schema: Ref<SchemaConfig>
  formApiRef: Ref<FormApiLike<TValues> | null>
  markFieldTouched: (fieldName: string) => void
  submitTransform?: (values: TValues) => TValues
  emit: (
    event: keyof SchemaFormEmits,
    ...args: [TValues] | [{ errors: Record<string, string> }]
  ) => void
}

export interface UseSubmitReturn {
  onValidSubmit: (event: FormSubmitEvent<Record<string, any>>) => Promise<void>
}

/**
 * 使用表单提交 Hook
 */
export function useSubmit<TValues extends FormValues = FormValues>(
  options: UseSubmitOptions<TValues>
): UseSubmitReturn {
  const { t } = useI18n()
  const { schema, formApiRef, markFieldTouched, submitTransform, emit } = options

  /**
   * 提交成功处理
   */
  async function onValidSubmit(event: FormSubmitEvent<Record<string, any>>) {
    const { values, valid, errors } = event
    const typedValues = values as TValues
    const fieldErrors = (errors as unknown as FieldErrorsMap) || {}

    if (!valid) {
      // 🔥 关键：当表单提交失败时，标记所有有错误的字段为 touched，确保错误状态正确显示
      // 使用 nextTick 确保在 PrimeVue Form 完成校验状态更新后再标记字段
      nextTick(() => {
        if (formApiRef.value) {
          for (const fieldName of Object.keys(fieldErrors || {})) {
            markFieldTouched(fieldName)
          }
        }
      })

      const errorMap: SimpleErrorMap = {}
      for (const [fieldName, items] of Object.entries(fieldErrors)) {
        if (Array.isArray(items) && items.length > 0) {
          errorMap[fieldName] = items[0]?.message || t('schemaForm.validationFailed')
        }
      }
      emit('error', { errors: errorMap })
      return
    }

    // 字段输出转换（根据 hideValue 属性决定是否包含隐藏字段）
    const transformedValues: TValues = {} as TValues
    for (const column of schema.value.columns) {
      // 如果字段被隐藏且 hideValue 为 false，则跳过该字段
      if (column.hidden === true && column.hideValue !== true) {
        continue
      }

      const rawValue = typedValues[column.field]
      ;(transformedValues as Record<string, unknown>)[column.field] = column.transform?.output
        ? column.transform.output(rawValue, { values: typedValues, column })
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
