<script setup lang="ts">
import type { FieldComponentProps } from '../../engine/types'
import { PRO_FORM_COMPONENT_DEFAULTS } from '../../engine/config'

type SingleDateValue = Date | string | number | null | undefined
type RangeDateValue = [SingleDateValue, SingleDateValue] | null | undefined
type ModelValue = SingleDateValue | RangeDateValue

type Props = FieldComponentProps<ModelValue>

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: ModelValue): void
}>()

const attrs = useAttrs()

const emptyPlaceholder = computed<string>(() => {
  const value = attrs.previewEmptyPlaceholder as string | undefined
  return value && value.length > 0 ? value : PRO_FORM_COMPONENT_DEFAULTS.emptyTextFallback
})

const locale = computed<string | undefined>(() => {
  const value = attrs.previewLocale as string | undefined
  return value && value.length > 0 ? value : undefined
})

const dateStyle = computed<Intl.DateTimeFormatOptions['dateStyle']>(() => {
  const value = attrs.previewDateStyle as Intl.DateTimeFormatOptions['dateStyle'] | undefined
  return value ?? 'medium'
})

const coerceToDate = (value: SingleDateValue): Date | null => {
  if (value == null) return null
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value

  if (typeof value === 'number') {
    const d = new Date(value)
    return Number.isNaN(d.getTime()) ? null : d
  }

  if (typeof value === 'string') {
    const d = new Date(value)
    return Number.isNaN(d.getTime()) ? null : d
  }

  return null
}

const formatDate = (value: SingleDateValue): string | null => {
  const d = coerceToDate(value)
  if (!d) return null

  try {
    const formatter = new Intl.DateTimeFormat(locale.value, {
      dateStyle: dateStyle.value,
    })
    return formatter.format(d)
  } catch {
    return d.toISOString()
  }
}

const displayValue = computed<string>(() => {
  const value = props.modelValue

  // 区间值
  if (Array.isArray(value)) {
    const [startRaw, endRaw] = value as [SingleDateValue, SingleDateValue]
    const start = formatDate(startRaw)
    const end = formatDate(endRaw)

    if (!start && !end) {
      return emptyPlaceholder.value
    }

    if (!start && end) return `~ ${end}`
    if (start && !end) return `${start} ~`
    return `${start} ~ ${end}`
  }

  // 单值
  const formatted = formatDate(value as SingleDateValue)
  if (!formatted) return emptyPlaceholder.value
  return formatted
})

const handleUpdate = (value: unknown): void => {
  emit('update:modelValue', value as ModelValue)
}

type DatePickerModel = Date | Date[] | (Date | null)[] | null | undefined
const datePickerModelValue = computed<DatePickerModel>(() => props.modelValue as DatePickerModel)
</script>

<template>
  <span
    v-if="props.readonly"
    class="block py-xs text-foreground leading-normal break-words"
  >
    {{ displayValue }}
  </span>
  <DatePicker
    v-else
    :model-value="datePickerModelValue"
    :disabled="props.disabled || props.readonly"
    :invalid="!!props.error && props.error.length > 0"
    class="w-full"
    v-bind="attrs"
    @update:model-value="handleUpdate"
  />
</template>
