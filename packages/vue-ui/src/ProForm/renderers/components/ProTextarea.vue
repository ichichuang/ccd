<script setup lang="ts">
defineOptions({ name: 'ProTextarea' })

import Textarea from 'primevue/textarea'
import { computed, useAttrs } from 'vue'
import type { FieldComponentProps } from '../../engine/types'

type Props = FieldComponentProps<string | null | undefined>

const props = defineProps<Omit<Props, 'modelValue'>>()
const model = defineModel<string | null | undefined>()

const attrs = useAttrs()

const emptyPlaceholder = computed<string>(() => {
  const value = attrs.previewEmptyPlaceholder as string | undefined
  return value && value.length > 0 ? value : '-'
})

const displayValue = computed<string>(() => {
  const value = model.value
  if (value == null || value === '') {
    return emptyPlaceholder.value
  }
  return String(value)
})

const handleUpdate = (value: string | null | undefined): void => {
  model.value = value
}
</script>

<template>
  <span
    v-if="props.readonly"
    class="block py-xs text-foreground leading-normal break-words whitespace-pre-wrap"
  >
    {{ displayValue }}
  </span>
  <Textarea
    v-else
    :model-value="model"
    :disabled="props.disabled"
    :invalid="!!props.error && props.error.length > 0"
    auto-resize
    @update:model-value="handleUpdate"
  />
</template>
