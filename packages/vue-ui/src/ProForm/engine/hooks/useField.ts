import { inject, onMounted, onUnmounted, reactive, ref } from 'vue'
import type { Ref } from 'vue'
import type { FieldState, FormState, UseFieldReturn } from '../types'
import { PRO_FORM_STATE_KEY } from '../constants'
import { useFormContext } from './useFormContext'
import { castValue } from '@ccd/shared-utils'
import { syncFormState } from './syncFormState'

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
  const store = controller.store
  const globalState = inject(PRO_FORM_STATE_KEY, null) as FormState<TValues> | null

  const initialStateFromStore = store.getFieldState(name)

  const value = ref(
    initialStateFromStore ? castValue<T>(initialStateFromStore.value) : castValue<T>(undefined)
  ) as Ref<T>

  const state = castValue<FieldState<T>>(
    reactive(
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
    )
  )

  const syncFromStore = (): void => {
    const latest = store.getFieldState(name)
    if (!latest) return

    value.value = castValue<T>(latest.value)
    state.value = castValue<T>(latest.value)
    state.initialValue = castValue<T>(latest.initialValue)
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
    store.subscribe(name, subscriber)
    syncFromStore()
    controller.onFieldMount(name)
  })

  onUnmounted(() => {
    store.unsubscribe(name, subscriber)
  })

  const setValue = (newValue: T): void => {
    controller.transactionManager.begin()
    store.setFieldValue(name, castValue<TValues[keyof TValues] | undefined>(newValue))
    controller.transactionManager.updateField(name)
    controller.transactionManager.commit(() => {
      // 对字段级 Hook 而言，在 flush 时同步最新的字段状态即可
      syncFromStore()
      if (globalState) {
        syncFormState(controller, globalState)
      }
      if (controller.validateOn === 'change') {
        void validate().then(() => {
          if (globalState) {
            syncFormState(controller, globalState)
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
