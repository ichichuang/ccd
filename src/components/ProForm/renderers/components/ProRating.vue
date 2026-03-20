<script setup lang="ts">
import type { FieldComponentProps } from '../../engine/types'

type Props = FieldComponentProps<number | null>

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: number | null): void
}>()

const handleUpdate = (value: number | null): void => {
  emit('update:modelValue', value ?? null)
}
</script>

<template>
  <span
    v-if="props.readonly"
    class="block py-xs text-foreground leading-normal"
  >
    <Rating
      :model-value="props.modelValue ?? 0"
      readonly
    />
  </span>
  <Rating
    v-else
    :model-value="props.modelValue ?? 0"
    :disabled="props.disabled || props.readonly"
    @update:model-value="handleUpdate"
  />
</template>
