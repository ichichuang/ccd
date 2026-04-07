import type { FormContext, FormState, UseFormOptions, UseFormReturn } from '../types'
import { FormController } from '../core/FormController'
import { DraftStorage } from '../persistence/DraftStorage'
import { FORM_CONTROLLER_KEY, PRO_FORM_STATE_KEY } from '../constants'
import { PRO_FORM_LOGGER } from '../utils/logger'

/**
 * ProForm 表单入口 Hook
 *
 * - 负责创建 FormController（聚合 Store / Graph / Scheduler / TransactionManager）
 * - 通过 provide 暴露给子组件与 useField
 * - 返回类型安全的 FormContext 与 handleSubmit
 */
export function useForm<TValues extends Record<string, unknown> = Record<string, unknown>>(
  options: UseFormOptions<TValues>
): UseFormReturn<TValues> {
  const controller = new FormController<TValues>(options)

  // 提供 Controller 上下文，供 useField 使用
  provide(FORM_CONTROLLER_KEY, controller)

  // 基础表单状态（后续可接入验证与提交中的状态）
  const baseState: FormState<TValues> = controller.getFormState()
  const state = reactive(baseState) as unknown as FormState<TValues>

  // 向渲染层暴露实时表单状态，支持 visibleIf 等逻辑读取
  provide(PRO_FORM_STATE_KEY, state)

  /**
   * 从 FormController 聚合最新的字段状态并同步到 reactive state
   */
  const syncFormState = (): void => {
    const latest: FormState<TValues> = controller.getFormState()
    state.values = latest.values
    state.errors = latest.errors
    state.touched = latest.touched
    state.dirty = latest.dirty
    state.valid = latest.valid
  }

  const formContext: FormContext<TValues> = {
    state,
    setValue(field, value) {
      controller.transactionManager.begin()
      controller.store.setFieldValue(field as string, value)
      controller.transactionManager.updateField(field as string)
      controller.transactionManager.commit(() => {
        syncFormState()
      }, controller)
    },
    setValidateOn(validateOn) {
      controller.setValidateOn(validateOn)
    },
    async validate() {
      const result: boolean = await controller.validateForm(options.resolver)
      syncFormState()
      return result
    },
    async submit() {
      await controller.submit()
    },
    reset: async () => {
      controller.reset(options.initialValues)
      syncFormState()
    },
    setFieldsValue(values) {
      controller.setFieldsValue(values)
      syncFormState()
    },
    resetFields(names) {
      controller.resetFields(
        (names as (keyof TValues)[] | undefined)?.map(name => name as keyof TValues & string)
      )
      syncFormState()
    },
    clearValidate(names) {
      controller.clearValidate(
        (names as (keyof TValues)[] | undefined)?.map(name => name as keyof TValues & string)
      )
      syncFormState()
    },
    setFieldProps(name, props) {
      controller.setFieldProps(name as string, props as Record<string, unknown>)
    },
  }

  const getValues: UseFormReturn<TValues>['getValues'] = () => controller.getValues()

  const getFormState: UseFormReturn<TValues>['getFormState'] = () => state

  const handleSubmit: UseFormReturn<TValues>['handleSubmit'] =
    onSubmit =>
    async (e?: Event): Promise<void> => {
      e?.preventDefault()

      state.submitting = true
      state.submitError = null

      try {
        const isValid = await controller.validateForm(options.resolver)
        syncFormState()
        if (!isValid) {
          return
        }

        const transformedValues = controller.getSubmitValues() as TValues
        await onSubmit(transformedValues)

        if (options.persistKey && options.persistKey.length > 0) {
          DraftStorage.clear(options.persistKey)
        }
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error))
        state.submitError = err
        PRO_FORM_LOGGER.error('Submission error', error)
        throw error
      } finally {
        state.submitting = false
      }
    }

  onBeforeUnmount(() => {
    controller.teardown()
  })

  return {
    form: formContext,
    handleSubmit,
    getValues,
    getFormState,
    teardown: () => controller.teardown(),
  }
}
