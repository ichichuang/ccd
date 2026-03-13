import type { InjectionKey } from 'vue'
import type { FormContext, FormState, UseFormOptions, UseFormReturn } from '../types'
import { FormController } from '../core/FormController'
import { DraftStorage } from '../persistence/DraftStorage'

/* eslint-disable @typescript-eslint/no-explicit-any */
export const FORM_CONTROLLER_KEY: InjectionKey<FormController<any>> = Symbol(
  'ProFormFormController'
) as InjectionKey<FormController<any>>
/* eslint-enable @typescript-eslint/no-explicit-any */

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
  provide('PRO_FORM_STATE', state)

  const formContext: FormContext<TValues> = {
    state,
    setValue(field, value) {
      controller.transactionManager.begin()
      controller.store.setFieldValue(field as string, value)
      controller.transactionManager.updateField(field as string)
      controller.transactionManager.commit(orderedFields => {
        if (orderedFields.length > 0) {
          // 提交后整体刷新 values 快照
          state.values = controller.getValues()
        }
      }, controller)
    },
    async validate() {
      return controller.validateForm(options.resolver)
    },
    async submit() {
      await controller.submit()
    },
    reset: async () => {
      controller.reset(options.initialValues)
      state.values = controller.getValues()
    },
    setFieldsValue(values) {
      controller.setFieldsValue(values)
      state.values = controller.getValues()
    },
    resetFields(names) {
      controller.resetFields(
        (names as (keyof TValues)[] | undefined)?.map(name => name as keyof TValues & string)
      )
      state.values = controller.getValues()
    },
    clearValidate(names) {
      controller.clearValidate(
        (names as (keyof TValues)[] | undefined)?.map(name => name as keyof TValues & string)
      )
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

      try {
        const isValid = await controller.validateForm(options.resolver)
        if (!isValid) {
          return
        }

        const transformedValues = controller.getSubmitValues() as TValues
        await onSubmit(transformedValues)

        if (options.persistKey && options.persistKey.length > 0) {
          DraftStorage.clear(options.persistKey)
        }
      } catch (error) {
        console.error('[ProForm] Submission error:', error)
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
