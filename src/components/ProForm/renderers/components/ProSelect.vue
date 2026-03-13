<script setup lang="ts">
import type { FieldComponentProps, SelectOption } from '../../engine/types'

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
  if (props.modelValue == null || props.modelValue === '') return '-'

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
    option-label="label"
    option-value="value"
    :disabled="props.disabled || props.readonly"
    :invalid="!!props.error && props.error.length > 0"
    :loading="props.loading"
    class="w-full"
    @update:model-value="handleUpdate"
  />
</template>
