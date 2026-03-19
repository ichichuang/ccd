<script setup lang="ts">
import type { FieldComponentProps, SelectOption } from '../../engine/types'
import { PRO_FORM_COMPONENT_DEFAULTS } from '../../engine/config'

type Props = FieldComponentProps<unknown[] | null> & {
  options?: SelectOption[] | Record<string, unknown>[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: unknown[] | null): void
}>()

const attrs = useAttrs()

const emptyPlaceholder = computed<string>(() => {
  const value = attrs.previewEmptyPlaceholder as string | undefined
  return value && value.length > 0 ? value : PRO_FORM_COMPONENT_DEFAULTS.emptyTextFallback
})

const optionLabel = computed<string>(() => {
  const value = attrs.optionLabel as string | undefined
  return value ?? PRO_FORM_COMPONENT_DEFAULTS.defaultLabelField
})

const optionValue = computed<string>(() => {
  const value = attrs.optionValue as string | undefined
  return value ?? PRO_FORM_COMPONENT_DEFAULTS.defaultValueField
})

const safeModelValue = computed<unknown[]>(() => (props.modelValue as unknown[]) ?? [])

const displayLabel = computed<string>(() => {
  const val = props.modelValue
  if (val == null || !Array.isArray(val) || val.length === 0) return emptyPlaceholder.value

  const opts = props.options
  if (!opts?.length) return val.map(v => String(v)).join(', ')

  const labelKey = optionLabel.value
  const valueKey = optionValue.value
  const labels = val.map(v => {
    const option = opts.find(
      (o: Record<string, unknown> | SelectOption) => (o as Record<string, unknown>)[valueKey] === v
    ) as Record<string, unknown> | undefined
    return option ? String(option[labelKey] ?? v) : String(v)
  })
  return labels.join(', ')
})

const handleUpdate = (value: unknown): void => {
  emit('update:modelValue', (value as unknown[] | null) ?? null)
}
</script>

<template>
  <span
    v-if="props.readonly"
    class="block py-padding-xs text-foreground leading-normal break-words"
  >
    {{ displayLabel }}
  </span>
  <MultiSelect
    v-else
    :model-value="safeModelValue"
    :options="props.options"
    :option-label="optionLabel"
    :option-value="optionValue"
    :disabled="props.disabled || props.readonly"
    :invalid="!!props.error && props.error.length > 0"
    :loading="props.loading"
    class="w-full"
    v-bind="attrs"
    @update:model-value="handleUpdate"
  />
</template>
