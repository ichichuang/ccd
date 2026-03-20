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

const passwordMaskChar = computed<string>(() => {
  const value = attrs.previewMaskChar as string | undefined
  return value && value.length > 0 ? value : '•'
})

const isPassword = computed<boolean>(() => {
  const type = attrs.type as string | undefined
  return type != null && type.toLowerCase() === 'password'
})

const displayValue = computed<string>(() => {
  const value = props.modelValue

  if (value == null || value === '') {
    return emptyPlaceholder.value
  }

  if (isPassword.value) {
    const text = String(value)
    return passwordMaskChar.value.repeat(text.length)
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
    class="block py-xs text-foreground leading-normal break-words"
  >
    {{ displayValue }}
  </span>
  <InputText
    v-else
    :model-value="props.modelValue"
    :disabled="props.disabled"
    :invalid="!!props.error && props.error.length > 0"
    @update:model-value="handleUpdate"
  />
</template>
