<script setup lang="ts">
import type { FieldComponentProps, SelectOption } from '../../engine/types'
import { PRO_FORM_COMPONENT_DEFAULTS } from '../../engine/config'

type Props = FieldComponentProps<unknown[] | null> & {
  options?: SelectOption[] | Record<string, unknown>[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: unknown[] | null): void
}>()

const attrs = useAttrs()

const emptyPlaceholder = computed<string>(() => {
  const value = attrs.previewEmptyPlaceholder as string | undefined
  return value && value.length > 0 ? value : PRO_FORM_COMPONENT_DEFAULTS.emptyTextFallback
})

const optionLabel = computed<string>(() => {
  const value = attrs.optionLabel as string | undefined
  return value ?? PRO_FORM_COMPONENT_DEFAULTS.defaultLabelField
})

const optionValue = computed<string>(() => {
  const value = attrs.optionValue as string | undefined
  return value ?? PRO_FORM_COMPONENT_DEFAULTS.defaultValueField
})

const safeModelValue = computed<unknown[]>(() => (props.modelValue as unknown[]) ?? [])

const displayMode = computed<'comma' | 'chip'>(() => (attrs.display === 'chip' ? 'chip' : 'comma'))

/** Async options 未到达时避免 PrimeVue 在 label 区回显原始 value（如 null, null） */
const showAsyncValueFallback = computed(
  () => props.loading === true && (!props.options || props.options.length === 0)
)

function resolveLabelForItem(item: unknown): string {
  const opts = props.options
  const vk = optionValue.value
  const lk = optionLabel.value
  if (!opts?.length) return String(item)
  const found = opts.find(
    (o: Record<string, unknown> | SelectOption) => (o as Record<string, unknown>)[vk] === item
  ) as Record<string, unknown> | undefined
  return found ? String(found[lk] ?? item) : String(item)
}

function commaLabels(selected: unknown[] | null | undefined): string {
  if (!selected?.length) return ''
  return selected.map(resolveLabelForItem).join(', ')
}

const displayLabel = computed<string>(() => {
  const val = props.modelValue
  if (val == null || !Array.isArray(val) || val.length === 0) return emptyPlaceholder.value

  const opts = props.options
  if (!opts?.length) return val.map(v => String(v)).join(', ')

  const labelKey = optionLabel.value
  const valueKey = optionValue.value
  const labels = val.map(v => {
    const option = opts.find(
      (o: Record<string, unknown> | SelectOption) => (o as Record<string, unknown>)[valueKey] === v
    ) as Record<string, unknown> | undefined
    return option ? String(option[labelKey] ?? v) : String(v)
  })
  return labels.join(', ')
})

const handleUpdate = (value: unknown): void => {
  emit('update:modelValue', (value as unknown[] | null) ?? null)
}
</script>

<template>
  <span
    v-if="props.readonly"
    class="block py-xs text-foreground leading-normal break-words"
  >
    {{ displayLabel }}
  </span>
  <MultiSelect
    v-else
    :model-value="safeModelValue"
    :options="props.options"
    :option-label="optionLabel"
    :option-value="optionValue"
    :disabled="props.disabled || props.readonly"
    :invalid="!!props.error && props.error.length > 0"
    :loading="props.loading"
    class="w-full"
    v-bind="attrs"
    @update:model-value="handleUpdate"
  >
    <template #value="{ value: selectedValues, placeholder: valuePlaceholder }">
      <template v-if="showAsyncValueFallback">
        <span class="row-start gap-xs items-center min-w-0 text-muted-foreground text-sm">
          <ProgressSpinner
            stroke-width="8"
            class="shrink-0"
            style="width: 14px; height: 14px"
          />
          <span>{{ $t('common.loading') }}</span>
        </span>
      </template>
      <template v-else-if="displayMode === 'chip'">
        <span
          v-if="!selectedValues || selectedValues.length === 0"
          class="text-muted-foreground"
        >
          {{ valuePlaceholder }}
        </span>
        <span
          v-else
          class="row-start gap-xs flex-wrap"
        >
          <Chip
            v-for="(item, idx) in selectedValues"
            :key="`ms-chip-${idx}-${String(item)}`"
            :label="resolveLabelForItem(item)"
            class="text-sm"
          />
        </span>
      </template>
      <template v-else>
        <span
          v-if="!selectedValues || selectedValues.length === 0"
          class="text-muted-foreground"
        >
          {{ valuePlaceholder }}
        </span>
        <span v-else>{{ commaLabels(selectedValues) }}</span>
      </template>
    </template>
  </MultiSelect>
</template>
