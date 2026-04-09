<script setup lang="ts">
import type { FieldComponentProps } from '../../engine/types'
import { PRO_FORM_COMPONENT_DEFAULTS } from '../../engine/config'

type Props = FieldComponentProps<number | number[] | null>

const props = defineProps<Omit<Props, 'modelValue'>>()
const model = defineModel<number | number[] | null>()

const attrs = useAttrs()

const emptyPlaceholder = computed<string>(() => {
  const value = attrs.previewEmptyPlaceholder as string | undefined
  return value && value.length > 0 ? value : PRO_FORM_COMPONENT_DEFAULTS.emptyTextFallback
})

const displayValue = computed<string>(() => {
  const val = model.value
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
  const val = model.value
  return Array.isArray(val) && val.length === 2
})

const sliderValue = computed<number | number[]>(() => {
  const val = model.value
  const [min, max] = PRO_FORM_COMPONENT_DEFAULTS.sliderDefaultRange
  if (val == null) return isRangeMode.value ? [min, max] : min
  if (Array.isArray(val)) return val.length === 2 ? val : [val[0] ?? min, val[1] ?? max]
  return val
})

const handleUpdate = (value: number | number[]): void => {
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
