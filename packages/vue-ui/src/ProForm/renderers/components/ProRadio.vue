<script setup lang="ts">
defineOptions({ name: 'ProRadio' })

import RadioButton from 'primevue/radiobutton'
import { computed, useAttrs } from 'vue'
import type { FieldComponentProps, SelectOption } from '../../engine/types'

type Props = FieldComponentProps<unknown> & {
  options?: SelectOption[]
}

const props = defineProps<Omit<Props, 'modelValue'>>()
const model = defineModel<unknown>()

const attrs = useAttrs()

const emptyPlaceholder = computed<string>(() => {
  const value = attrs.previewEmptyPlaceholder as string | undefined
  return value && value.length > 0 ? value : '-'
})

const displayValue = computed<string>(() => {
  const value = model.value

  if (value === null || value === undefined || value === '') {
    return emptyPlaceholder.value
  }

  const option = props.options?.find(o => o.value === value)
  if (option) return option.label

  return String(value)
})

const handleUpdate = (value: unknown): void => {
  model.value = value
}
</script>

<template>
  <span
    v-if="props.readonly"
    class="block py-xs text-foreground leading-normal break-words"
  >
    {{ displayValue }}
  </span>
  <div
    v-else
    class="flex flex-wrap gap-xs"
  >
    <label
      v-for="option in options"
      :key="String(option.value)"
      class="row-center gap-xs cursor-pointer text-foreground text-sm"
    >
      <RadioButton
        :value="option.value"
        :model-value="model"
        :disabled="props.disabled || props.readonly"
        @update:model-value="handleUpdate"
      />
      <span>{{ option.label }}</span>
    </label>
  </div>
</template>
