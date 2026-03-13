<script setup lang="ts">
import type { ComputedRef } from 'vue'
import type { FieldSchema, FieldComponentProps, FieldRegistryItem } from '../engine/types'
import { useField } from '../engine/hooks/useField'
import { fieldRegistry } from '../engine/registry/FieldRegistry'

const props = defineProps<{
  field: FieldSchema<unknown>
}>()

const { value, state, setValue } = useField<unknown>(props.field.name)

const globalState = inject<{
  disabled: ComputedRef<boolean>
  readonly: ComputedRef<boolean>
} | null>('PRO_FORM_GLOBAL_STATE', null)

const layoutState = inject<{
  layout: ComputedRef<'vertical' | 'horizontal'>
  labelWidth: ComputedRef<string | undefined>
  gap: ComputedRef<string>
  activeBreakpoint?: ComputedRef<unknown>
  labelAlign?: ComputedRef<'left' | 'center' | 'right'>
} | null>('PRO_FORM_LAYOUT', null)

const formSlots = inject<Record<string, unknown> | null>('PRO_FORM_SLOTS', null)

const layoutMode = computed(() => layoutState?.layout.value ?? 'vertical')

const labelWidth = computed<string | undefined>(() => {
  const fieldLayout = (props.field as unknown as { layout?: { labelWidth?: string } }).layout
  const fieldLabelWidth = fieldLayout?.labelWidth
  return fieldLabelWidth ?? layoutState?.labelWidth.value
})

const labelAlign = computed<'left' | 'center' | 'right'>(() => {
  const fieldLayout = (
    props.field as unknown as { layout?: { labelAlign?: 'left' | 'center' | 'right' } }
  ).layout
  const fieldAlign = fieldLayout?.labelAlign
  return fieldAlign ?? layoutState?.labelAlign?.value ?? 'left'
})

const labelClass = 'block font-medium text-secondary-foreground mb-margin-xs fs-sm'

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

const resolvedComponent = computed(() => {
  const item = registryItem.value
  return item?.component ?? 'input'
})

const isVisible = computed(() => state.visible)
const isDisabled = computed(() => (globalState?.disabled.value ?? false) || state.disabled)
const isRequired = computed(() => state.required)

const componentProps = computed<FieldComponentProps<unknown>>(() => ({
  modelValue: value.value,
  error: state.errors,
  disabled: isDisabled.value,
  readonly: globalState?.readonly.value ?? false,
  loading: state.loadingOptions ?? false,
  'onUpdate:modelValue': (v: unknown) => {
    setValue(v)
  },
}))

const mergedProps = computed<FieldComponentProps<unknown> & Record<string, unknown>>(() => {
  const baseComponentProps = componentProps.value
  const item = registryItem.value

  const defaultProps = (item?.defaultProps ?? {}) as Record<string, unknown>
  const fieldProps = (props.field.props ?? {}) as Record<string, unknown>

  const merged: FieldComponentProps<unknown> & Record<string, unknown> = {
    ...defaultProps,
    ...fieldProps,
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
  // Priority: state.loadedOptions -> field.props.options -> field.options (static array only)
  const stateLoadedOptions = (state as unknown as { loadedOptions?: unknown[] }).loadedOptions
  const propsOptions = (fieldProps as { options?: unknown }).options
  const schemaOptions = Array.isArray((props.field as unknown as { options?: unknown }).options)
    ? ((props.field as unknown as { options?: unknown[] }).options ?? undefined)
    : undefined

  const finalOptions = stateLoadedOptions ?? propsOptions ?? schemaOptions
  if (Array.isArray(finalOptions)) {
    merged.options = finalOptions
  }

  // 归一化 modelValue，避免 PrimeVue 组件收到 undefined 触发类型告警
  if (merged.modelValue === undefined) {
    merged.modelValue = null
  }

  return merged
})
</script>

<template>
  <div
    v-if="isVisible"
    class="w-full"
  >
    <div
      :class="['w-full', layoutMode === 'horizontal' ? 'row-start gap-scale-sm' : 'flex flex-col']"
    >
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
          class="text-danger mr-margin-xs"
        >
          *
        </span>
        {{ field.label }}
      </label>

      <div class="flex-1 min-w-0 flex flex-col w-full">
        <component
          :is="hasCustomSlot && formSlots ? formSlots[customSlotName] : resolvedComponent"
          v-bind="
            hasCustomSlot && formSlots
              ? { field, state, onUpdate: (v: unknown) => setValue(v) }
              : mergedProps
          "
          class="w-full"
        />

        <small
          v-if="field.description && state.errors.length === 0"
          class="text-muted-foreground mt-margin-xs fs-xs"
        >
          {{ field.description }}
        </small>
        <small
          v-else-if="state.errors.length > 0"
          class="text-danger mt-margin-xs fs-xs"
        >
          {{ state.errors[0] }}
        </small>
      </div>
    </div>
  </div>
</template>
