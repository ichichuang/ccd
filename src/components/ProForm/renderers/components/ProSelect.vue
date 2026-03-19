<script setup lang="ts">
import type { FieldComponentProps, SelectOption } from '../../engine/types'
import { PRO_FORM_COMPONENT_DEFAULTS } from '../../engine/config'

type Props = FieldComponentProps<unknown> & {
  options?: SelectOption[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: unknown): void
}>()

const handleUpdate = (value: unknown): void => {
  emit('update:modelValue', value)
}

const displayLabel = computed(() => {
  if (props.modelValue == null || props.modelValue === '')
    return PRO_FORM_COMPONENT_DEFAULTS.emptyTextFallback

  const option = props.options?.find(o => o.value === props.modelValue)
  if (option) return option.label

  return String(props.modelValue)
})
</script>

<template>
  <span
    v-if="props.readonly"
    class="block py-padding-xs text-foreground leading-normal break-words"
  >
    {{ displayLabel }}
  </span>
  <Select
    v-else
    :model-value="props.modelValue"
    :options="props.options"
    :option-label="PRO_FORM_COMPONENT_DEFAULTS.defaultLabelField"
    :option-value="PRO_FORM_COMPONENT_DEFAULTS.defaultValueField"
    :disabled="props.disabled || props.readonly"
    :invalid="!!props.error && props.error.length > 0"
    :loading="props.loading"
    class="w-full"
    @update:model-value="handleUpdate"
  />
</template>
