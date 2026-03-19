<script setup lang="ts">
import type { FieldComponentProps, SelectOption } from '../../engine/types'

type Props = FieldComponentProps<unknown> & {
  options?: SelectOption[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: unknown): void
}>()

const attrs = useAttrs()

const emptyPlaceholder = computed<string>(() => {
  const value = attrs.previewEmptyPlaceholder as string | undefined
  return value && value.length > 0 ? value : '-'
})

const displayValue = computed<string>(() => {
  const value = props.modelValue

  if (value === null || value === undefined || value === '') {
    return emptyPlaceholder.value
  }

  const option = props.options?.find(o => o.value === value)
  if (option) return option.label

  return String(value)
})

const handleUpdate = (value: unknown): void => {
  emit('update:modelValue', value)
}
</script>

<template>
  <span
    v-if="props.readonly"
    class="block py-padding-xs text-foreground leading-normal break-words"
  >
    {{ displayValue }}
  </span>
  <div
    v-else
    class="layout-wrap gap-scale-xs"
  >
    <label
      v-for="option in options"
      :key="String(option.value)"
      class="inline-flex items-center gap-scale-xs cursor-pointer text-foreground fs-sm"
    >
      <RadioButton
        :value="option.value"
        :model-value="props.modelValue"
        :disabled="props.disabled || props.readonly"
        @update:model-value="handleUpdate"
      />
      <span>{{ option.label }}</span>
    </label>
  </div>
</template>
