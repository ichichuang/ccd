<script setup lang="ts">
import type { FieldComponentProps, SelectOption } from '../../engine/types'
import { PRO_FORM_COMPONENT_DEFAULTS } from '../../engine/config'

type Props = FieldComponentProps<unknown> & {
  options?: SelectOption[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: unknown): void
}>()

const handleUpdate = (value: unknown): void => {
  emit('update:modelValue', value)
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
  if (props.modelValue == null || props.modelValue === '')
    return PRO_FORM_COMPONENT_DEFAULTS.emptyTextFallback

  const option = props.options?.find(o => o.value === props.modelValue)
  if (option) return option.label

  return String(props.modelValue)
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
    :model-value="props.modelValue"
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
