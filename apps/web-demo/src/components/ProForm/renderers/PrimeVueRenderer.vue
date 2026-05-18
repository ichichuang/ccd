<script setup lang="ts">
defineOptions({ name: 'PrimeVueRenderer' })

import type {
  FieldComponentProps,
  FieldRegistryItem,
  FieldState,
  FieldSchema,
} from '../engine/types'
import type { ProFormPrimeVueRendererProps } from '../engine/types/props'
import { useField } from '../engine/hooks/useField'
import { fieldRegistry } from '../engine/registry/FieldRegistry'
import { PRO_FORM_DEFAULTS } from '../engine/config'
import {
  PRO_FORM_GLOBAL_STATE_KEY,
  PRO_FORM_LAYOUT_KEY,
  PRO_FORM_SLOTS_KEY,
} from '../engine/constants'
import { castValue } from '@/utils/typeCasters'

const props = defineProps<ProFormPrimeVueRendererProps>()

const { value, state, setValue } = useField<unknown>(props.field.name)

type ExtendedFieldSchema = FieldSchema<unknown> & {
  layout?: {
    labelWidth?: string
    labelAlign?: 'left' | 'center' | 'right'
  }
  options?: unknown
}

type FieldStateWithOptions = FieldState<unknown> & {
  loadedOptions?: unknown[]
  optionsError?: string
}

const fieldExt = computed<ExtendedFieldSchema>(() => props.field as ExtendedFieldSchema)
const stateExt = computed<FieldStateWithOptions>(() => castValue<FieldStateWithOptions>(state))

const globalState = inject(PRO_FORM_GLOBAL_STATE_KEY, null)

const layoutState = inject(PRO_FORM_LAYOUT_KEY, null)

const formSlots = inject(PRO_FORM_SLOTS_KEY, null)

const layoutMode = computed(() => layoutState?.layout.value ?? PRO_FORM_DEFAULTS.layout)

const labelWidth = computed<string | undefined>(() => {
  const fieldLayout = fieldExt.value.layout
  const fieldLabelWidth = fieldLayout?.labelWidth
  return fieldLabelWidth ?? layoutState?.labelWidth.value
})

const labelAlign = computed<'left' | 'center' | 'right'>(() => {
  const fieldLayout = fieldExt.value.layout
  const fieldAlign = fieldLayout?.labelAlign
  return fieldAlign ?? layoutState?.labelAlign?.value ?? PRO_FORM_DEFAULTS.labelAlign
})

const labelClass = 'block font-medium text-secondary-foreground mb-xs text-sm'

const customSlotName = computed<string>(() => `field-${props.field.name}`)
const hasCustomSlot = computed<boolean>(() => {
  if (!formSlots) return false
  return typeof formSlots[customSlotName.value] === 'function'
})

// 通过 Registry 解析具体渲染组件与元数据
const registryItem = computed<FieldRegistryItem | null>(() => {
  const item = fieldRegistry.get(props.field.component)
  return item ?? null
})

const missingComponentMessage = computed<string | null>(() => {
  const item = registryItem.value
  if (item) return null

  const message = `[ProForm] Component "${props.field.component}" is not registered.`
  if (import.meta.env.DEV) {
    throw new Error(`${message} Register a PrimeVue renderer or provide a custom field slot.`)
  }
  return message
})

const resolvedComponent = computed<unknown>(() => registryItem.value?.component ?? null)

const isVisible = computed(() => state.visible)
const isDisabled = computed(() => (globalState?.disabled.value ?? false) || state.disabled)
const isRequired = computed(() => state.required)

const componentProps = computed<FieldComponentProps<unknown>>(() => ({
  modelValue: value.value,
  error: state.errors,
  disabled: isDisabled.value,
  readonly: globalState?.readonly.value ?? false,
  loading: state.loadingOptions ?? false,
  inputId: props.field.name,
  'onUpdate:modelValue': (v: unknown) => {
    setValue(v)
  },
}))

const mergedProps = computed<FieldComponentProps<unknown> & Record<string, unknown>>(() => {
  const baseComponentProps = componentProps.value
  const item = registryItem.value

  const defaultProps = (item?.defaultProps ?? {}) as Record<string, unknown>
  const fieldProps = (props.field.props ?? {}) as Record<string, unknown>
  const dynamicProps = (stateExt.value.dynamicProps ?? {}) as Record<string, unknown>

  const merged: FieldComponentProps<unknown> & Record<string, unknown> = {
    ...defaultProps,
    ...fieldProps,
    ...dynamicProps,
    ...baseComponentProps,
  }

  if (item?.propsMapper) {
    const mapped = item.propsMapper({
      field: props.field,
      componentProps: baseComponentProps,
    })
    Object.assign(merged, mapped)
  }

  // Async options MUST come from store state (no Schema mutation).
  // Priority: state.loadedOptions -> dynamicProps.options -> field.props.options -> field.options (static array only)
  const stateLoadedOptions = stateExt.value.loadedOptions
  const dynamicOptions = (dynamicProps as { options?: unknown }).options
  const propsOptions = (fieldProps as { options?: unknown }).options
  const schemaOptions = Array.isArray(fieldExt.value.options)
    ? (fieldExt.value.options as unknown[] | undefined)
    : undefined

  const finalOptions = stateLoadedOptions ?? dynamicOptions ?? propsOptions ?? schemaOptions
  if (Array.isArray(finalOptions)) {
    merged.options = finalOptions
  }

  // 归一化 modelValue，避免 PrimeVue 组件收到 undefined 触发类型告警
  if (merged.modelValue === undefined) {
    merged.modelValue = null
  }

  return merged
})

const slotBindProps = computed<Record<string, unknown>>(() => ({
  field: props.field,
  state,
  onUpdate: (v: unknown) => setValue(v),
}))

const componentBindProps = computed<Record<string, unknown>>(
  () => mergedProps.value as Record<string, unknown>
)

const resolvedIs = computed<unknown>(() => {
  if (hasCustomSlot.value && formSlots) return formSlots[customSlotName.value]
  return resolvedComponent.value
})

const resolvedBindProps = computed<Record<string, unknown>>(() => {
  if (hasCustomSlot.value && formSlots) return slotBindProps.value
  return componentBindProps.value
})

const ariaDescribedBy = computed<string | undefined>(() => {
  const ids: string[] = []
  if (state.errors.length > 0 || stateExt.value.optionsError) ids.push(`${props.field.name}-error`)
  else if (props.field.description) ids.push(`${props.field.name}-desc`)
  return ids.length > 0 ? ids.join(' ') : undefined
})
</script>

<template>
  <div
    v-if="isVisible"
    class="w-full"
  >
    <div :class="['w-full', layoutMode === 'horizontal' ? 'row-start gap-sm' : 'col-stretch']">
      <label
        v-if="field.label && field.component !== 'checkbox'"
        :class="labelClass"
        :style="
          layoutMode === 'horizontal' && labelWidth
            ? { width: labelWidth, textAlign: labelAlign, flexShrink: 0 }
            : {}
        "
        :for="field.name"
      >
        <span
          v-if="isRequired"
          class="text-danger mr-xs"
        >
          *
        </span>
        {{ field.label }}
      </label>

      <div class="col-stretch flex-1 min-w-0 w-full">
        <div
          v-if="missingComponentMessage"
          :id="`${field.name}-error`"
          role="alert"
          class="w-full rounded-md border border-solid border-danger/40 bg-danger/10 p-sm text-sm text-danger"
        >
          {{ missingComponentMessage }}
        </div>
        <component
          :is="resolvedIs"
          v-else
          v-bind="resolvedBindProps"
          :aria-describedby="ariaDescribedBy"
          :aria-invalid="state.errors.length > 0 || undefined"
          :aria-required="isRequired || undefined"
          class="w-full"
        />

        <div
          class="text-xs flex items-end"
          :style="{ height: 'var(--font-size-xl)' }"
        >
          <transition
            name="fade"
            mode="out-in"
          >
            <span
              v-if="state.errors.length > 0"
              :id="`${field.name}-error`"
              role="alert"
              class="text-danger block"
            >
              {{ state.errors[0] }}
            </span>
            <span
              v-else-if="stateExt.optionsError"
              :id="`${field.name}-error`"
              role="alert"
              class="text-danger block"
            >
              {{ stateExt.optionsError }}
            </span>
            <span
              v-else-if="field.description"
              :id="`${field.name}-desc`"
              class="text-muted-foreground block"
            >
              {{ field.description }}
            </span>
            <span
              v-else
              class="block"
            />
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>
