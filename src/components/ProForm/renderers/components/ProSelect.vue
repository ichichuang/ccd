<script setup lang="ts">
import type { FieldComponentProps, SelectOption } from '../../engine/types'
import { PRO_FORM_COMPONENT_DEFAULTS } from '../../engine/config'

type Props = FieldComponentProps<unknown> & {
  options?: SelectOption[]
}

const props = defineProps<Omit<Props, 'modelValue'>>()
const model = defineModel<unknown>()

const handleUpdate = (value: unknown): void => {
  model.value = value
}

const showAsyncValueFallback = computed(
  () => props.loading === true && (!props.options || props.options.length === 0)
)

function resolveLabel(modelValue: unknown): string {
  if (modelValue == null || modelValue === '') return ''
  const option = props.options?.find(o => o.value === modelValue)
  if (option) return option.label
  return String(modelValue)
}

const displayLabel = computed(() => {
  if (model.value == null || model.value === '')
    return PRO_FORM_COMPONENT_DEFAULTS.emptyTextFallback

  const option = props.options?.find(o => o.value === model.value)
  if (option) return option.label

  return String(model.value)
})
</script>

<template>
  <span
    v-if="props.readonly"
    class="block py-xs text-foreground leading-normal break-words"
  >
    {{ displayLabel }}
  </span>
  <Select
    v-else
    :model-value="model"
    :options="props.options"
    :option-label="PRO_FORM_COMPONENT_DEFAULTS.defaultLabelField"
    :option-value="PRO_FORM_COMPONENT_DEFAULTS.defaultValueField"
    :disabled="props.disabled || props.readonly"
    :invalid="!!props.error && props.error.length > 0"
    :loading="props.loading"
    class="w-full"
    @update:model-value="handleUpdate"
  >
    <template #value="{ value: selectedValue, placeholder: valuePlaceholder }">
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
      <template v-else>
        <span
          v-if="selectedValue == null || selectedValue === ''"
          class="text-muted-foreground"
        >
          {{ valuePlaceholder }}
        </span>
        <span v-else>{{ resolveLabel(selectedValue) }}</span>
      </template>
    </template>
  </Select>
</template>
