<script setup lang="ts">
defineOptions({ name: 'ProInputMask', inheritAttrs: false })

import InputMask from 'primevue/inputmask'
import { computed, normalizeClass, useAttrs } from 'vue'
import type { FieldComponentProps } from '../../engine/types'

type Props = FieldComponentProps<string | null | undefined>

const props = defineProps<Omit<Props, 'modelValue'>>()
const model = defineModel<string | null | undefined>()

const attrs = useAttrs()

const inputMaskAttrs = computed<Record<string, unknown>>(() => {
  const { class: _class, ...rest } = attrs
  return rest
})

const inputMaskClass = computed<string>(() => normalizeClass(['w-full', attrs.class]))

const emptyPlaceholder = computed<string>(() => {
  const value = attrs.previewEmptyPlaceholder as string | undefined
  return value && value.length > 0 ? value : '-'
})

const displayValue = computed<string>(() => {
  const value = model.value
  if (value == null || value === '') return emptyPlaceholder.value
  return String(value)
})

const handleUpdate = (value: string | null): void => {
  model.value = value ?? null
}
</script>

<template>
  <span
    v-if="props.readonly"
    class="block py-xs text-foreground leading-normal break-words"
  >
    {{ displayValue }}
  </span>
  <InputMask
    v-else
    v-bind="inputMaskAttrs"
    :model-value="model ?? ''"
    :disabled="props.disabled || props.readonly"
    :invalid="!!props.error && props.error.length > 0"
    :class="inputMaskClass"
    @update:model-value="handleUpdate"
  />
</template>
