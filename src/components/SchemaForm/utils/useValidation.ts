// @/components/SchemaForm/utils/useValidation.ts
/**
 * 表单验证 Hook
 * 封装验证流程
 */

import type { Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { validateStringRules } from './helper'
import type {
  EvalCtx,
  FieldErrorsMap,
  FormApiLike,
  FormValues,
  SchemaColumnsItem,
  SchemaConfig,
} from './types'

/** PrimeVue 字段状态最小接口（用于 markFieldTouched / clearAllFieldValidationStates，避免 any） */
interface MinimalFieldState {
  touch?: () => void
  touched?: boolean
  states?: {
    touched?: boolean
    dirty?: boolean
    pristine?: boolean
    error?: unknown
    errors?: unknown[]
    invalid?: boolean
    valid?: boolean
  }
  dirty?: boolean
  pristine?: boolean
  error?: unknown
  errors?: unknown[]
  invalid?: boolean
  valid?: boolean
}

/** PrimeVue fields 项最小形状（用于 clearAllFieldValidationStates 遍历） */
interface MinimalFieldRef {
  name?: string
  params?: { name?: string }
  states?: {
    touched?: boolean
    dirty?: boolean
    pristine?: boolean
    error?: unknown
    errors?: unknown[]
    invalid?: boolean
    valid?: boolean
  }
}

export interface UseValidationOptions<TValues extends FormValues = FormValues> {
  schema: Ref<SchemaConfig>
  formApiRef: Ref<FormApiLike<TValues> | null>
}

export interface UseValidationReturn<TValues extends FormValues = FormValues> {
  validationResolver: (incoming: { values: TValues } | TValues) => Promise<{
    values: TValues
    errors: FieldErrorsMap
  }>
  validateField: (
    column: SchemaColumnsItem,
    value: unknown,
    allValues: TValues
  ) => Promise<string | null>
  markFieldTouched: (fieldName: string) => void
  clearAllFieldValidationStates: (targetFields?: string[]) => void
}

/**
 * 验证函数规则（支持同步和异步）
 * 异步规则当前返回 null（同步路径），异步完成后可通过 formApiRef 更新字段状态
 */
/**
 * 验证函数规则（支持同步和异步）
 * 异步规则支持：await 结果并返回
 */
async function validateFunctionRule(
  rule: (
    value: unknown,
    ctx: EvalCtx & { values: FormValues }
  ) => true | string | Promise<true | string>,
  value: unknown,
  ctx: EvalCtx & { values: FormValues },
  t: (key: string) => string
): Promise<string | null> {
  try {
    const result = rule(value, ctx)
    // 支持 async 规则：统一 await
    const resolved = result instanceof Promise ? await result : result
    return resolved === true
      ? null
      : typeof resolved === 'string'
        ? resolved
        : t('schemaForm.validationFailed')
  } catch {
    return t('schemaForm.validationFailed')
  }
}

/**
 * 验证 Yup Schema
 */
function validateYupSchema(
  schema: { validateSync: (value: unknown) => void },
  value: unknown,
  t: (key: string) => string
): string | null {
  try {
    schema.validateSync(value)
    return null
  } catch (error: unknown) {
    return (error as { message?: string })?.message ?? t('schemaForm.validationFailed')
  }
}

/**
 * 使用表单验证 Hook
 */
export function useValidation<TValues extends FormValues = FormValues>(
  options: UseValidationOptions<TValues>
): UseValidationReturn<TValues> {
  const { schema, formApiRef } = options
  const { t } = useI18n()

  /**
   * 验证单个字段
   */
  async function validateField(
    column: SchemaColumnsItem,
    value: unknown,
    allValues: TValues
  ): Promise<string | null> {
    const ctx = { values: allValues, column }

    if (typeof column.rules === 'string') {
      return validateStringRules(column.rules, value, t)
    } else if (typeof column.rules === 'function') {
      return await validateFunctionRule(column.rules, value, ctx, t)
    } else if (column.rules && typeof column.rules === 'object' && 'validate' in column.rules) {
      return validateYupSchema(column.rules, value, t)
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
    // 若字段不存在或不是对象，直接返回
    if (!fieldState || typeof fieldState !== 'object') {
      return
    }

    const state = fieldState as MinimalFieldState

    // 检查是否已经 touched，避免重复触发
    const isTouched = state.touched === true || state.states?.touched === true
    if (isTouched) {
      return
    }

    try {
      // 优先使用 touch() 方法
      if (typeof state.touch === 'function') {
        state.touch()
        return
      }
      // 降级：直接设置属性
      if ('touched' in state) {
        state.touched = true
      }

      // 最后尝试 PrimeVue API
      if (typeof formApiRef.value.markAsTouched === 'function') {
        formApiRef.value.markAsTouched(fieldName)
      }
    } catch {
      /* ignore touch errors */
    }
  }

  /**
   * 构建验证解析器（PrimeVue 期望的错误格式：{ field: [{ message }] }）
   */
  function buildValidationResolver() {
    return async (incoming: { values: TValues } | TValues) => {
      // PrimeVue 会传入形如 { names: [...], values: {...} } 的对象，这里做兼容
      const values =
        incoming && typeof incoming === 'object' && 'values' in incoming
          ? (incoming as { values: TValues }).values
          : (incoming as TValues)
      const errors: FieldErrorsMap = {}

      // 使用 for...of 循环以支持 await
      for (const column of schema.value.columns) {
        // 跳过完全不渲染的隐藏字段的验证
        if (column.hidden === true && column.hideValue !== true) {
          continue
        }

        if (!column.rules) {
          continue
        }

        const value = values[column.field]
        // await 异步验证
        const fieldError = await validateField(column, value, values)

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
          const state = fieldState as MinimalFieldState
          if ('touched' in state) state.touched = false
          if ('dirty' in state) state.dirty = false
          if ('pristine' in state) state.pristine = true
          if ('error' in state) state.error = null
          if ('errors' in state) state.errors = []
          if ('invalid' in state) state.invalid = false
          if ('valid' in state) state.valid = true
        } catch {
          /* ignore reset errors */
        }
      }
    }

    // 🔥 关键：通过 fields 对象清除所有字段的验证状态（PrimeVue Form 的内部结构）
    const formFields = formApiRef.value.fields
    if (formFields && typeof formFields === 'object') {
      try {
        Object.values(formFields).forEach((field: unknown) => {
          const ref = field as MinimalFieldRef
          if (targetSet) {
            const fieldName = ref?.name || ref?.params?.name
            if (fieldName && !targetSet.has(fieldName)) {
              return
            }
          }
          if (ref && typeof ref === 'object' && ref.states) {
            const states = ref.states
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
