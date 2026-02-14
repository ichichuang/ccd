// @/components/schema-form/utils/useValidation.ts
/**
 * 表单验证 Hook
 * 封装验证流程
 */

import type { Ref } from 'vue'
import type {
  FieldErrorsMap,
  FormApiLike,
  FormValues,
  SchemaColumnsItem,
  SchemaConfig,
} from './types'

export interface UseValidationOptions<TValues extends FormValues = FormValues> {
  schema: Ref<SchemaConfig>
  formApiRef: Ref<FormApiLike<TValues> | null>
}

export interface UseValidationReturn<TValues extends FormValues = FormValues> {
  validationResolver: (incoming: { values: TValues } | TValues) => {
    values: TValues
    errors: FieldErrorsMap
  }
  validateField: (column: SchemaColumnsItem, value: unknown, allValues: TValues) => string | null
  markFieldTouched: (fieldName: string) => void
  clearAllFieldValidationStates: (targetFields?: string[]) => void
}

/**
 * 验证字符串规则
 */
function validateStringRules(rules: string, value: any): string | null {
  const ruleList = rules.split('|')

  for (const rule of ruleList) {
    if (!rule) {
      continue
    }

    // required：仅在字符串为空串/空白、null/undefined 时判定为空；
    // 对于对象/数组/数字/布尔（包括 false）不当作"空"。
    if (
      rule === 'required' &&
      (value === null || value === undefined || (typeof value === 'string' && value.trim() === ''))
    ) {
      return '必填项'
    } else if (rule.startsWith('min:')) {
      const min = parseInt(rule.split(':')[1])
      if (typeof value === 'string' && value.length < min) {
        return `至少 ${min} 个字符`
      } else if (typeof value === 'number' && value < min) {
        return `最小值为 ${min}`
      }
    } else if (rule.startsWith('max:')) {
      const max = parseInt(rule.split(':')[1])
      if (typeof value === 'string' && value.length > max) {
        return `最多 ${max} 个字符`
      } else if (typeof value === 'number' && value > max) {
        return `最大值为 ${max}`
      }
    } else if (rule === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(value)) {
        return '邮箱格式不正确'
      }
    } else if (rule === 'integer' && value) {
      if (!Number.isInteger(Number(value))) {
        return '必须为整数'
      }
    }
  }

  return null
}

/**
 * 验证函数规则
 */
function validateFunctionRule(
  // 规则来自业务 Schema，类型由调用方决定，这里作为边界保留 any
  rule: (value: any, ctx: any) => true | string | Promise<true | string>,
  value: any,
  ctx: any
): string | null {
  try {
    const result = rule(value, ctx)
    if (result instanceof Promise) {
      // 对于异步函数，暂时返回 null，实际验证会在异步流程中处理
      // 可以考虑添加异步验证状态管理
      return null
    }
    return result === true ? null : typeof result === 'string' ? result : '校验失败'
  } catch (error) {
    console.error('验证函数执行失败:', error)
    return '校验失败'
  }
}

/**
 * 验证 Yup Schema
 */
function validateYupSchema(schema: any, value: any): string | null {
  try {
    schema.validateSync(value)
    return null
  } catch (error: any) {
    return error.message
  }
}

/**
 * 使用表单验证 Hook
 */
export function useValidation<TValues extends FormValues = FormValues>(
  options: UseValidationOptions<TValues>
): UseValidationReturn<TValues> {
  const { schema, formApiRef } = options

  /**
   * 验证单个字段
   */
  function validateField(
    column: SchemaColumnsItem,
    value: unknown,
    allValues: TValues
  ): string | null {
    const ctx = { values: allValues, column }

    if (typeof column.rules === 'string') {
      return validateStringRules(column.rules, value)
    } else if (typeof column.rules === 'function') {
      return validateFunctionRule(column.rules, value, ctx)
    } else if (column.rules && typeof column.rules === 'object' && 'validate' in column.rules) {
      return validateYupSchema(column.rules, value)
    }

    return null
  }

  /**
   * 标记字段为已触摸
   */
  function markFieldTouched(fieldName: string) {
    if (!formApiRef.value) {
      return
    }

    const fieldState = formApiRef.value[fieldName]
    if (fieldState && typeof fieldState === 'object') {
      try {
        const state = fieldState as { touch?: () => void; touched?: boolean }
        if (typeof state.touch === 'function') {
          state.touch()
        } else if ('touched' in state) {
          state.touched = true
        }
      } catch {
        /* ignore touch errors */
      }
    }

    // 检查是否已经 touched，避免重复触发
    const isTouched =
      fieldState &&
      typeof fieldState === 'object' &&
      (('touched' in fieldState && (fieldState as any).touched) ||
        (fieldState as any).states?.touched)

    if (isTouched) {
      return
    }

    try {
      if (typeof formApiRef.value.markAsTouched === 'function') {
        formApiRef.value.markAsTouched(fieldName)
      }
    } catch {
      /* ignore markAsTouched errors */
    }
  }

  /**
   * 构建验证解析器（PrimeVue 期望的错误格式：{ field: [{ message }] }）
   */
  function buildValidationResolver() {
    return (incoming: { values: TValues } | TValues) => {
      // PrimeVue 会传入形如 { names: [...], values: {...} } 的对象，这里做兼容
      const values =
        incoming && typeof incoming === 'object' && 'values' in incoming
          ? (incoming as { values: TValues }).values
          : (incoming as TValues)
      const errors: FieldErrorsMap = {}

      for (const column of schema.value.columns) {
        // 跳过完全不渲染的隐藏字段的验证
        if (column.hidden === true && column.hideValue !== true) {
          continue
        }

        if (!column.rules) {
          continue
        }

        const value = values[column.field]
        const fieldError = validateField(column, value, values)

        if (fieldError) {
          errors[column.field] = [{ message: fieldError }]
        }
      }

      return { values, errors }
    }
  }

  /**
   * 清除所有字段的验证状态
   */
  function clearAllFieldValidationStates(targetFields?: string[]) {
    if (!formApiRef.value) {
      return
    }

    const targetSet = targetFields && targetFields.length ? new Set(targetFields) : null

    // 🔥 关键：清除每个字段的验证状态
    for (const column of schema.value.columns) {
      if (targetSet && !targetSet.has(column.field)) {
        continue
      }
      const fieldState = formApiRef.value[column.field]
      if (fieldState && typeof fieldState === 'object') {
        try {
          // 重置字段状态到初始状态
          if ('touched' in fieldState) {
            ;(fieldState as any).touched = false
          }
          if ('dirty' in fieldState) {
            ;(fieldState as any).dirty = false
          }
          if ('pristine' in fieldState) {
            ;(fieldState as any).pristine = true
          }
          if ('error' in fieldState) {
            ;(fieldState as any).error = null
          }
          if ('errors' in fieldState) {
            ;(fieldState as any).errors = []
          }
          if ('invalid' in fieldState) {
            ;(fieldState as any).invalid = false
          }
          if ('valid' in fieldState) {
            ;(fieldState as any).valid = true
          }
        } catch {
          /* ignore reset errors */
        }
      }
    }

    // 🔥 关键：通过 fields 对象清除所有字段的验证状态（PrimeVue Form 的内部结构）
    const formFields = formApiRef.value.fields
    if (formFields && typeof formFields === 'object') {
      try {
        Object.values(formFields).forEach((field: any) => {
          if (targetSet) {
            const fieldName = field?.name || field?.params?.name
            if (fieldName && !targetSet.has(fieldName)) {
              return
            }
          }
          if (field && typeof field === 'object' && field.states) {
            const states = field.states
            if (states && typeof states === 'object') {
              states.touched = false
              states.dirty = false
              states.pristine = true
              states.error = null
              states.errors = []
              states.invalid = false
              states.valid = true
            }
          }
        })
      } catch {
        /* ignore fields reset errors */
      }
    }

    // 🔥 关键：调用 PrimeVue Form 的 resetValidation 方法清除整体验证状态
    if (typeof formApiRef.value.resetValidation === 'function') {
      try {
        formApiRef.value.resetValidation()
      } catch {
        /* ignore resetValidation errors */
      }
    }
  }

  // 使用稳定的函数引用，避免 computed 包裹导致的解包问题
  const validationResolver = buildValidationResolver()

  return {
    validationResolver,
    validateField,
    markFieldTouched,
    clearAllFieldValidationStates,
  }
}
