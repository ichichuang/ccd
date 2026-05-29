<script setup lang="ts">
defineOptions({ name: 'ProRating' })

import Rating from 'primevue/rating'
import type { FieldComponentProps } from '../../engine/types'

type Props = FieldComponentProps<number | null>

const props = defineProps<Omit<Props, 'modelValue'>>()
const model = defineModel<number | null>()

const handleUpdate = (value: number | null): void => {
  model.value = value ?? null
}
</script>

<template>
  <span
    v-if="props.readonly"
    class="block py-xs text-foreground leading-normal"
  >
    <Rating
      :model-value="model ?? 0"
      readonly
    />
  </span>
  <Rating
    v-else
    :model-value="model ?? 0"
    :disabled="props.disabled || props.readonly"
    @update:model-value="handleUpdate"
  />
</template>
