import type { Ref } from 'vue'
import type { FieldState, FormState, UseFieldReturn } from '../types'
import { SubscriptionStore } from '../state/SubscriptionStore'
import { PRO_FORM_STATE_KEY } from '../constants'
import { useFormContext } from './useFormContext'

/**
 * 字段级 Hook：使用 SubscriptionStore 进行字段级订阅
 *
 * - 不依赖全局 reactive(formValues)
 * - 每个字段仅订阅自身状态更新，保证微渲染
 */
export function useField<
  T = unknown,
  TValues extends Record<string, unknown> = Record<string, unknown>,
>(name: string): UseFieldReturn<T> {
  const controller = useFormContext<TValues>()
  const store = controller.store as SubscriptionStore<TValues>
  const globalState = inject(PRO_FORM_STATE_KEY, null) as FormState<TValues> | null

  const initialStateFromStore = store.getFieldState(name as keyof TValues & string) as
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
      loadedOptions: undefined,
      touched: false,
      dirty: false,
      valid: true,
      validating: false,
      errors: [],
    }
  ) as unknown as FieldState<T>

  const syncFromStore = (): void => {
    const latest = store.getFieldState(name as keyof TValues & string) as FieldState<T> | undefined
    if (!latest) return

    value.value = latest.value
    state.value = latest.value
    state.initialValue = latest.initialValue
    state.visible = latest.visible
    state.disabled = latest.disabled
    state.required = latest.required
    state.loadingOptions = latest.loadingOptions
    state.loadedOptions = latest.loadedOptions
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
    store.setFieldValue(name as string, newValue as TValues[keyof TValues])
    controller.transactionManager.updateField(name)
    controller.transactionManager.commit(() => {
      // 对字段级 Hook 而言，在 flush 时同步最新的字段状态即可
      syncFromStore()
      if (globalState) {
        const latest = controller.getFormState()
        globalState.values = latest.values
        globalState.errors = latest.errors
        globalState.touched = latest.touched
        globalState.dirty = latest.dirty
        globalState.valid = latest.valid
      }
      if (controller.validateOn === 'change') {
        // 变更后按需自动校验
        void validate().then(() => {
          // 校验完成后再次同步 globalState，确保 errors/valid 等状态反映到全局
          if (globalState) {
            const postValidation = controller.getFormState()
            globalState.values = postValidation.values
            globalState.errors = postValidation.errors
            globalState.touched = postValidation.touched
            globalState.dirty = postValidation.dirty
            globalState.valid = postValidation.valid
          }
        })
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
