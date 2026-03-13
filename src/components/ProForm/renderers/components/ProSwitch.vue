<script setup lang="ts">
import type { FieldComponentProps } from '../../engine/types'

type Props = FieldComponentProps<boolean | null | undefined>

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean | null | undefined): void
}>()

const attrs = useAttrs()

const trueLabel = computed<string>(() => {
  const value = attrs.previewTrueLabel as string | undefined
  return value && value.length > 0 ? value : '是'
})

const falseLabel = computed<string>(() => {
  const value = attrs.previewFalseLabel as string | undefined
  return value && value.length > 0 ? value : '否'
})

const emptyPlaceholder = computed<string>(() => {
  const value = attrs.previewEmptyPlaceholder as string | undefined
  return value && value.length > 0 ? value : '-'
})

const displayValue = computed<string>(() => {
  if (props.modelValue === true) return trueLabel.value
  if (props.modelValue === false) return falseLabel.value
  return emptyPlaceholder.value
})

const handleUpdate = (value: boolean): void => {
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
  <ToggleSwitch
    v-else
    :model-value="props.modelValue ?? false"
    :disabled="props.disabled || props.readonly"
    @update:model-value="handleUpdate"
  />
</template>
