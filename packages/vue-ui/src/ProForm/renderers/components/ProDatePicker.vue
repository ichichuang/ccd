<script setup lang="ts">
defineOptions({ name: 'ProDatePicker' })

import DatePicker from 'primevue/datepicker'
import { computed, inject, useAttrs } from 'vue'
import type { FieldComponentProps } from '../../engine/types'
import { PRO_FORM_COMPONENT_DEFAULTS } from '../../engine/config'
import { PRO_FORM_DATE_FORMATTER_KEY } from '../../engine/constants'

type SingleDateValue = Date | string | number | null | undefined
type RangeDateValue = [SingleDateValue, SingleDateValue] | null | undefined
type ModelValue = SingleDateValue | RangeDateValue
type FormattableDateInput = Date | string | number

type Props = FieldComponentProps<ModelValue>

const props = defineProps<Omit<Props, 'modelValue'>>()
const model = defineModel<ModelValue>()
const formatDateValue = inject(PRO_FORM_DATE_FORMATTER_KEY, null)

const attrs = useAttrs()

const emptyPlaceholder = computed<string>(() => {
  const value = attrs.previewEmptyPlaceholder as string | undefined
  return value && value.length > 0 ? value : PRO_FORM_COMPONENT_DEFAULTS.emptyTextFallback
})

const hasDateValue = (value: SingleDateValue): boolean => {
  if (value == null) return false
  if (typeof value === 'string') return value.trim().length > 0
  return true
}

const isDateInputValue = (value: SingleDateValue): value is FormattableDateInput => {
  if (value == null) return false
  if (typeof value === 'string') return value.trim().length > 0
  return typeof value === 'number' || value instanceof Date
}

const formatSingleDate = (value: SingleDateValue): string | null => {
  if (!hasDateValue(value) || !isDateInputValue(value)) return null
  if (!formatDateValue) return String(value)

  const formatted = formatDateValue(value, 'YYYY-MM-DD')
  return formatted.length > 0 ? formatted : null
}

const displayValue = computed<string>(() => {
  const value = model.value

  // 区间值
  if (Array.isArray(value)) {
    const [startRaw, endRaw] = value as [SingleDateValue, SingleDateValue]
    const start = formatSingleDate(startRaw)
    const end = formatSingleDate(endRaw)

    if (!start && !end) {
      return emptyPlaceholder.value
    }

    if (!start && end) return `~ ${end}`
    if (start && !end) return `${start} ~`
    return `${start} ~ ${end}`
  }

  // 单值
  const formatted = formatSingleDate(value as SingleDateValue)
  if (!formatted) return emptyPlaceholder.value
  return formatted
})

const handleUpdate = (value: unknown): void => {
  model.value = value as ModelValue
}

type DatePickerModel = Date | Date[] | (Date | null)[] | null | undefined
const datePickerModelValue = computed<DatePickerModel>(() => model.value as DatePickerModel)
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
