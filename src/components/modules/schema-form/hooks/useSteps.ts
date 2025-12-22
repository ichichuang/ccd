// @/components/schema-form/hooks/useSteps.ts
/**
 * 步骤管理 Hook
 * 管理分步表单的状态和逻辑
 */

import type { Ref } from 'vue'
import { computed, nextTick, ref, watch } from 'vue'
import type { SchemaColumnsItem, SchemaConfig } from '../utils/types'

export interface UseStepsOptions {
  schema: Ref<SchemaConfig>
  valuesRef: Ref<Record<string, any>>
  formApiRef: Ref<any>
  formContainerRef: Ref<HTMLElement | null>
  columnByField: (field: string) => SchemaColumnsItem | undefined
  validateField: (
    column: SchemaColumnsItem,
    value: any,
    allValues: Record<string, any>
  ) => string | null
  markFieldTouched: (fieldName: string) => void
  collectLatestValues: () => Record<string, any>
  applyExternalValues: (values: Record<string, any>) => boolean
  clearAllFieldValidationStates: (targetFields?: string[]) => void
}

export interface UseStepsReturn {
  activeStep: Ref<number>
  stepAccessibility: Ref<boolean[]>
  handleStepChange: (stepIndex: number) => void
  nextStep: (form?: any) => Promise<void>
  prevStep: () => void
}

/**
 * 检查字段是否为必填
 */
function isFieldRequired(column?: SchemaColumnsItem): boolean {
  if (!column?.rules) {
    return false
  }
  if (typeof column.rules === 'string') {
    return column.rules.split('|').some(rule => rule.trim().toLowerCase().startsWith('required'))
  }
  if (Array.isArray(column.rules)) {
    return column.rules.some(rule => typeof rule === 'string' && rule.trim() === 'required')
  }
  if (typeof column.rules === 'object') {
    if ('required' in column.rules) {
      return Boolean((column.rules as Record<string, any>).required)
    }
    if ('presence' in column.rules) {
      return Boolean((column.rules as Record<string, any>).presence)
    }
  }
  return false
}

/**
 * 检查值是否已填充
 */
function isValueFilled(value: any): boolean {
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
export function useSteps(options: UseStepsOptions): UseStepsReturn {
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
  const stepAccessibility = computed<boolean[]>(() => {
    const steps = schema.value.steps
    if (!steps?.length) {
      return []
    }
    const accessible: boolean[] = Array(steps.length).fill(false)
    accessible[0] = true
    const values = valuesRef.value || {}

    for (let index = 1; index < steps.length; index += 1) {
      if (!accessible[index - 1]) {
        accessible[index] = false
        continue
      }
      const prevFields = steps[index - 1]?.fields || []
      const requiredFields = prevFields.filter((fieldName: string) =>
        isFieldRequired(columnByField(fieldName))
      )
      if (!requiredFields.length) {
        accessible[index] = true
        continue
      }
      const allValid = requiredFields.every((fieldName: string) => {
        const column = columnByField(fieldName)
        if (!column) {
          return true
        }
        const value = values[fieldName]
        if (!isValueFilled(value)) {
          return false
        }
        const error = validateField(column, value, values)
        return !error
      })
      accessible[index] = allValid
    }
    return accessible
  })

  // ==================== Watchers ====================
  /**
   * 监听步骤可达性变化，自动调整当前步骤
   * 如果当前步骤变为不可达，回退到最后一个可达的步骤
   */
  watch(
    stepAccessibility,
    accessibility => {
      if (!accessibility.length) {
        return
      }
      if (accessibility[activeStep.value]) {
        return
      }
      let fallbackIndex = 0
      for (let i = accessibility.length - 1; i >= 0; i -= 1) {
        if (accessibility[i]) {
          fallbackIndex = i
          break
        }
      }
      activeStep.value = fallbackIndex
    },
    { immediate: true }
  )

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
    values: Record<string, any>
  ): Promise<boolean> {
    const safeValues: Record<string, any> =
      values && typeof values === 'object' ? (values as Record<string, any>) : {}

    for (const fieldName of fieldNames) {
      const column = columnByField(fieldName)
      // 跳过完全不渲染的隐藏字段的验证
      if (column?.hidden === true && column?.hideValue !== true) {
        continue
      }

      if (column?.rules) {
        const value = safeValues[fieldName]
        const error = validateField(column, value, safeValues)
        if (error) {
          markFieldTouched(fieldName)
          return true
        } // 有错误
      }
    }
    return false // 无错误
  }

  /**
   * 下一步处理
   */
  async function nextStep(form?: any) {
    if (!schema.value.steps) {
      return
    }

    const currentStepFields = schema.value.steps[activeStep.value].fields

    // 构建当前值：使用 collectLatestValues 确保获取所有步骤的值
    let currentValues: Record<string, any> = {}
    try {
      if (formApiRef.value) {
        currentValues = collectLatestValues()
      } else {
        currentValues =
          (form && typeof form === 'object' && 'values' in form ? (form as any).values : {}) || {}
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
