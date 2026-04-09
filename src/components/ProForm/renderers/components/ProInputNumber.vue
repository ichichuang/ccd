<script setup lang="ts">
import type { FieldComponentProps } from '../../engine/types'
import { PRO_FORM_COMPONENT_DEFAULTS } from '../../engine/config'

type Props = FieldComponentProps<number | null | undefined>

const props = defineProps<Omit<Props, 'modelValue'>>()
const model = defineModel<number | null | undefined>()

const attrs = useAttrs()

const emptyPlaceholder = computed<string>(() => {
  const value = attrs.previewEmptyPlaceholder as string | undefined
  return value && value.length > 0 ? value : PRO_FORM_COMPONENT_DEFAULTS.emptyTextFallback
})

const mode = computed<string>(() => {
  const value = attrs.mode as string | undefined
  return value ?? 'decimal'
})

const locale = computed<string | undefined>(() => {
  const value = attrs.previewLocale as string | undefined
  return value && value.length > 0 ? value : undefined
})

const currency = computed<string | undefined>(() => {
  const value = attrs.currency as string | undefined
  return value && value.length > 0 ? value : undefined
})

const displayValue = computed<string>(() => {
  const raw = model.value

  if (raw === null || raw === undefined || Number.isNaN(raw)) {
    return emptyPlaceholder.value
  }

  const value = Number(raw)
  if (!Number.isFinite(value)) {
    return String(raw)
  }

  try {
    if (mode.value === 'currency') {
      if (currency.value) {
        const formatter = new Intl.NumberFormat(locale.value, {
          style: 'currency',
          currency: currency.value,
        })
        return formatter.format(value)
      }
    }

    if (mode.value === 'percent') {
      const formatter = new Intl.NumberFormat(locale.value, {
        style: 'percent',
      })
      return formatter.format(value)
    }

    const formatter = new Intl.NumberFormat(locale.value, {
      maximumFractionDigits: PRO_FORM_COMPONENT_DEFAULTS.inputNumberMaxFractionDigits,
    })
    return formatter.format(value)
  } catch {
    return String(raw)
  }
})

const handleUpdate = (value: number | null | undefined): void => {
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
  <InputNumber
    v-else
    :model-value="model"
    :disabled="props.disabled"
    :invalid="!!props.error && props.error.length > 0"
    @update:model-value="handleUpdate"
  />
</template>
