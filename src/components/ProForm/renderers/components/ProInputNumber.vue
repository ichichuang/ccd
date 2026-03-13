<script setup lang="ts">
import type { FieldComponentProps } from '../../engine/types'

type Props = FieldComponentProps<number | null | undefined>

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: number | null | undefined): void
}>()

const attrs = useAttrs()

const emptyPlaceholder = computed<string>(() => {
  const value = attrs.previewEmptyPlaceholder as string | undefined
  return value && value.length > 0 ? value : '-'
})

const mode = computed<string>(() => {
  const value = attrs.mode as string | undefined
  return value ?? 'decimal'
})

const locale = computed<string>(() => {
  const value = attrs.previewLocale as string | undefined
  return value ?? 'zh-CN'
})

const currency = computed<string>(() => {
  const value = attrs.currency as string | undefined
  return value ?? 'CNY'
})

const displayValue = computed<string>(() => {
  const raw = props.modelValue

  if (raw === null || raw === undefined || Number.isNaN(raw)) {
    return emptyPlaceholder.value
  }

  const value = Number(raw)
  if (!Number.isFinite(value)) {
    return String(raw)
  }

  try {
    if (mode.value === 'currency') {
      const formatter = new Intl.NumberFormat(locale.value, {
        style: 'currency',
        currency: currency.value,
      })
      return formatter.format(value)
    }

    if (mode.value === 'percent') {
      const formatter = new Intl.NumberFormat(locale.value, {
        style: 'percent',
      })
      return formatter.format(value)
    }

    const formatter = new Intl.NumberFormat(locale.value, {
      maximumFractionDigits: 20,
    })
    return formatter.format(value)
  } catch {
    return String(raw)
  }
})

const handleUpdate = (value: number | null | undefined): void => {
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
  <InputNumber
    v-else
    :model-value="props.modelValue"
    :disabled="props.disabled"
    :invalid="!!props.error && props.error.length > 0"
    @update:model-value="handleUpdate"
  />
</template>
