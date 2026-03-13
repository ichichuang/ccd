import type { Ref } from 'vue'
import type { FieldState, FormState, UseFieldReturn } from '../types'
import { SubscriptionStore } from '../state/SubscriptionStore'
import { FORM_CONTROLLER_KEY } from './useForm'
import type { FormController } from '../core/FormController'

type ValuesRecord = Record<string, unknown>

/**
 * 字段级 Hook：使用 SubscriptionStore 进行字段级订阅
 *
 * - 不依赖全局 reactive(formValues)
 * - 每个字段仅订阅自身状态更新，保证微渲染
 */
export function useField<T = unknown>(name: string): UseFieldReturn<T> {
  const controller = inject<FormController<ValuesRecord> | null>(FORM_CONTROLLER_KEY, null)

  if (!controller) {
    throw new Error('useField must be used within a ProForm.useForm context')
  }

  const store = controller.store as SubscriptionStore<ValuesRecord>

  const globalState = inject<FormState<ValuesRecord> | null>('PRO_FORM_STATE', null)

  const initialStateFromStore = store.getFieldState(name as keyof ValuesRecord & string) as
    | FieldState<T>
    | undefined

  const value = ref(
    initialStateFromStore ? (initialStateFromStore.value as T) : (undefined as unknown as T)
  ) as Ref<T>

  const state = reactive(
    initialStateFromStore ?? {
      value: value.value,
      initialValue: value.value,
      visible: true,
      disabled: false,
      required: false,
      loadingOptions: false,
      touched: false,
      dirty: false,
      valid: true,
      validating: false,
      errors: [],
    }
  ) as unknown as FieldState<T>

  const syncFromStore = (): void => {
    const latest = store.getFieldState(name as keyof ValuesRecord & string) as
      | FieldState<T>
      | undefined
    if (!latest) return

    value.value = latest.value
    state.value = latest.value
    state.initialValue = latest.initialValue
    state.visible = latest.visible
    state.disabled = latest.disabled
    state.required = latest.required
    state.loadingOptions = latest.loadingOptions
    state.touched = latest.touched
    state.dirty = latest.dirty
    state.valid = latest.valid
    state.validating = latest.validating
    state.errors = [...latest.errors]
  }

  const subscriber = (): void => {
    syncFromStore()
  }

  onMounted(() => {
    store.subscribe(name as string, subscriber)
    // 确保挂载后与 Store 完全同步一次
    syncFromStore()
    if (typeof controller.onFieldMount === 'function') {
      controller.onFieldMount(name as string)
    }
  })

  onUnmounted(() => {
    store.unsubscribe(name as string, subscriber)
  })

  const setValue = (newValue: T): void => {
    controller.transactionManager.begin()
    store.setFieldValue(name as string, newValue as ValuesRecord[keyof ValuesRecord])
    controller.transactionManager.updateField(name)
    controller.transactionManager.commit(() => {
      // 对字段级 Hook 而言，在 flush 时同步最新的字段状态即可
      syncFromStore()
      if (globalState) {
        globalState.values = controller.getValues() as ValuesRecord
      }
      if (controller.validateOn === 'change') {
        // 变更后按需自动校验
        void validate()
      }
    }, controller)
  }

  const validate = async (): Promise<void> => {
    await controller.validateField(name)
  }

  return {
    value,
    state,
    setValue,
    validate,
  }
}
