<script setup lang="ts">
import type { FieldComponentProps } from '../../engine/types'

type Props = FieldComponentProps<number | number[] | null>

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: number | number[] | null): void
}>()

const attrs = useAttrs()

const emptyPlaceholder = computed<string>(() => {
  const value = attrs.previewEmptyPlaceholder as string | undefined
  return value && value.length > 0 ? value : '-'
})

const displayValue = computed<string>(() => {
  const val = props.modelValue
  if (val == null) return emptyPlaceholder.value

  if (Array.isArray(val)) {
    if (val.length === 0) return emptyPlaceholder.value
    if (val.length === 1) return String(val[0])
    return `${val[0]} ~ ${val[1]}`
  }

  return String(val)
})

const isRangeMode = computed<boolean>(() => {
  const rangeProp = attrs.range as boolean | undefined
  if (rangeProp === true) return true
  const val = props.modelValue
  return Array.isArray(val) && val.length === 2
})

const sliderValue = computed<number | number[]>(() => {
  const val = props.modelValue
  if (val == null) return isRangeMode.value ? [0, 100] : 0
  if (Array.isArray(val)) return val.length === 2 ? val : [val[0] ?? 0, val[1] ?? 100]
  return val
})

const handleUpdate = (value: number | number[]): void => {
  emit('update:modelValue', value ?? null)
}
</script>

<template>
  <span
    v-if="props.readonly"
    class="block py-padding-xs text-foreground leading-normal break-words"
  >
    {{ displayValue }}
  </span>
  <Slider
    v-else
    :model-value="sliderValue"
    :range="isRangeMode"
    :disabled="props.disabled || props.readonly"
    class="w-full"
    v-bind="attrs"
    @update:model-value="handleUpdate"
  />
</template>
