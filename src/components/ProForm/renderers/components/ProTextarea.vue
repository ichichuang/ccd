<script setup lang="ts">
import type { FieldComponentProps } from '../../engine/types'

type Props = FieldComponentProps<string | null | undefined>

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | null | undefined): void
}>()

const attrs = useAttrs()

const emptyPlaceholder = computed<string>(() => {
  const value = attrs.previewEmptyPlaceholder as string | undefined
  return value && value.length > 0 ? value : '-'
})

const displayValue = computed<string>(() => {
  const value = props.modelValue
  if (value == null || value === '') {
    return emptyPlaceholder.value
  }
  return String(value)
})

const handleUpdate = (value: string | null | undefined): void => {
  emit('update:modelValue', value)
}
</script>

<template>
  <span
    v-if="props.readonly"
    class="block py-padding-xs text-foreground leading-normal break-words whitespace-pre-wrap"
  >
    {{ displayValue }}
  </span>
  <Textarea
    v-else
    :model-value="props.modelValue"
    :disabled="props.disabled"
    :invalid="!!props.error && props.error.length > 0"
    auto-resize
    @update:model-value="handleUpdate"
  />
</template>
