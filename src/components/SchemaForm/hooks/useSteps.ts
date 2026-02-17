// @/components/SchemaForm/hooks/useSteps.ts
/**
 * 步骤管理 Hook
 * 管理分步表单的状态和逻辑
 */

import type { Ref } from 'vue'
import { nextTick, ref, watch } from 'vue'
import { isFieldRequired } from '../utils/helper'
import type { FormApiLike, FormValues, SchemaColumnsItem, SchemaConfig } from '../utils/types'

export interface UseStepsOptions<TValues extends FormValues = FormValues> {
  schema: Ref<SchemaConfig>
  valuesRef: Ref<TValues>
  formApiRef: Ref<FormApiLike<TValues> | null>
  formContainerRef: Ref<HTMLElement | null>
  columnByField: (field: string) => SchemaColumnsItem | undefined
  validateField: (
    column: SchemaColumnsItem,
    value: unknown,
    allValues: TValues
  ) => Promise<string | null>
  markFieldTouched: (fieldName: string) => void
  collectLatestValues: () => TValues
  applyExternalValues: (values: TValues) => boolean
  clearAllFieldValidationStates: (targetFields?: string[]) => void
}

export interface UseStepsReturn<TValues extends FormValues = FormValues> {
  activeStep: Ref<number>
  stepAccessibility: Ref<boolean[]>
  handleStepChange: (stepIndex: number) => void
  nextStep: (form?: FormApiLike<TValues>) => Promise<void>
  prevStep: () => void
}

/**
 * 检查值是否已填充
 */
function isValueFilled(value: unknown): boolean {
  if (value === null || value === undefined) {
    return false
  }
  if (typeof value === 'string') {
    return value.trim().length > 0
  }
  if (Array.isArray(value)) {
    return value.length > 0
  }
  if (typeof value === 'object') {
    return Object.keys(value).length > 0
  }
  return true
}

/**
 * 使用步骤管理 Hook
 */
export function useSteps<TValues extends FormValues = FormValues>(
  options: UseStepsOptions<TValues>
): UseStepsReturn {
  const {
    schema,
    valuesRef,
    formApiRef,
    formContainerRef,
    columnByField,
    validateField,
    markFieldTouched,
    collectLatestValues,
    applyExternalValues,
    clearAllFieldValidationStates,
  } = options

  // ==================== State ====================
  const activeStep = ref(0)

  // ==================== Computed ====================
  /**
   * 步骤可达性计算
   * 第一个步骤总是可达的，后续步骤需要前一步的必填字段都填写且验证通过
   */
  // 🔥 修复：改为 ref + watch 显式更新，避免 computed 自动依赖追踪导致的循环
  const stepAccessibility = ref<boolean[]>([])

  async function updateStepAccessibility() {
    const steps = schema.value.steps
    if (!steps?.length) {
      stepAccessibility.value = []
      return
    }
    const accessible: boolean[] = Array(steps.length).fill(false)
    accessible[0] = true
    const values = collectLatestValues()

    for (let index = 1; index < steps.length; index += 1) {
      if (!accessible[index - 1]) {
        accessible[index] = false
        continue
      }
      const prevFields = steps[index - 1]?.fields || []
      const requiredFields = prevFields.filter((fieldName: string) => {
        const column = columnByField(fieldName)
        return column ? isFieldRequired(column) : false
      })
      if (!requiredFields.length) {
        accessible[index] = true
        continue
      }
      // 并行验证不需要立刻返回，先收集 Promise
      const validationPromises = requiredFields.map(async (fieldName: string) => {
        const column = columnByField(fieldName)
        if (!column) return true
        const value = values[fieldName]
        if (!isValueFilled(value)) return false
        // 纯函数验证，不产生副作用
        const error = await validateField(column, value, values)
        return !error
      })

      const results = await Promise.all(validationPromises)
      const allValid = results.every(r => r)
      accessible[index] = allValid
    }

    // 仅在真的变化时更新
    if (JSON.stringify(accessible) !== JSON.stringify(stepAccessibility.value)) {
      stepAccessibility.value = accessible
    }
  }

  // 监听值变化来更新可达性 (throttled/debounce 可以在这里加，但先保持简单)
  watch(
    () => valuesRef.value,
    () => {
      updateStepAccessibility()
    },
    { deep: true, immediate: true }
  )

  // 监听 activeStep 变化以确保状态同步
  watch(activeStep, () => {
    // 步骤切换时不需要立即重新计算可达性，因为它是根据 values 来的
    // 但如果需要在切换时强制刷新，可以在这里调用
  })

  /**
   * 监听步骤变化，重新应用表单值
   * 步骤表单只渲染当前步骤字段，其他步骤字段会被卸载。
   * 当用户刷新或切换回之前的步骤时，需要把 remember / valuesRef 中保存的值
   * 再次写入 PrimeVue Form，确保这些刚挂载的字段能拿到之前的值。
   */
  watch(
    () => activeStep.value,
    () => {
      const applyForStep = () => {
        const latestValues = collectLatestValues()
        const applied = applyExternalValues(latestValues)
        if (applied) {
          nextTick(() => {
            const fields = schema.value.steps?.[activeStep.value]?.fields
            if (fields && fields.length) {
              clearAllFieldValidationStates(fields)
            } else {
              clearAllFieldValidationStates()
            }
          })
        }
        return applied
      }

      if (!applyForStep()) {
        nextTick(() => {
          applyForStep()
        })
      }
    },
    { immediate: true }
  )

  // ==================== Methods ====================
  /**
   * 步骤切换处理
   */
  function handleStepChange(stepIndex: number) {
    if (!stepAccessibility.value?.[stepIndex]) {
      return
    }
    activeStep.value = stepIndex
  }

  /**
   * 验证步骤字段
   */
  async function validateStepFields(
    fieldNames: string[],
    values: Record<string, unknown>
  ): Promise<boolean> {
    const safeValues: Record<string, unknown> =
      values && typeof values === 'object' ? (values as Record<string, unknown>) : {}

    // 并行验证当前步骤所有字段
    const validationPromises = fieldNames.map(async fieldName => {
      const column = columnByField(fieldName)
      // 跳过完全不渲染的隐藏字段的验证
      if (column?.hidden === true && column?.hideValue !== true) {
        return null // null 表示无错误
      }

      if (column?.rules) {
        const value = safeValues[fieldName]
        const error = await validateField(column, value, safeValues as TValues)
        if (error) {
          markFieldTouched(fieldName)
          return error
        }
      }
      return null
    })

    const errors = await Promise.all(validationPromises)
    // 只要有一个错误，就返回 true
    return errors.some(error => error !== null)
  }

  /**
   * 下一步处理
   */
  async function nextStep(form?: FormApiLike<TValues>) {
    if (!schema.value.steps) {
      return
    }

    const currentStepFields = schema.value.steps[activeStep.value].fields

    // 构建当前值：使用 collectLatestValues 确保获取所有步骤的值
    let currentValues: Record<string, unknown> = {}
    try {
      if (formApiRef.value) {
        currentValues = collectLatestValues()
      } else {
        const formValues =
          form && typeof form === 'object' && 'values' in form
            ? (form as FormApiLike<TValues>).values
            : undefined
        currentValues = (formValues && typeof formValues === 'object' ? formValues : {}) as Record<
          string,
          unknown
        >
      }
    } catch {
      currentValues = {}
    }

    const hasError = await validateStepFields(currentStepFields, currentValues)

    if (!hasError) {
      activeStep.value = Math.min(activeStep.value + 1, schema.value.steps.length - 1)
      return
    }

    // 若存在错误，触发一次原生提交以让 PrimeVue Form 渲染错误状态（不会真正提交成功）
    const formEl = formContainerRef.value?.querySelector('form') as HTMLFormElement | null
    formEl?.requestSubmit()
  }

  /**
   * 上一步处理
   */
  function prevStep() {
    activeStep.value = Math.max(activeStep.value - 1, 0)
  }

  return {
    activeStep,
    stepAccessibility,
    handleStepChange,
    nextStep,
    prevStep,
  }
}
