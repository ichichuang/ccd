<script setup lang="ts">
defineOptions({ name: 'ProCheckbox' })

import type { FieldComponentProps, SelectOption } from '../../engine/types'
import { PRO_FORM_COMPONENT_DEFAULTS, PRO_FORM_TEXT_DEFAULTS } from '../../engine/config'

type CheckboxValue = boolean | unknown[] | null | undefined

type Props = FieldComponentProps<CheckboxValue> & {
  options?: SelectOption[]
  inputId?: string
}

const props = defineProps<Omit<Props, 'modelValue'>>()
const model = defineModel<CheckboxValue>()

const attrs = useAttrs()

const emptyPlaceholder = computed<string>(() => {
  const value = attrs.previewEmptyPlaceholder as string | undefined
  return value && value.length > 0 ? value : PRO_FORM_COMPONENT_DEFAULTS.emptyTextFallback
})

const optionsList = computed<SelectOption[]>(() => props.options ?? [])

const displayLabel = computed<string>(() => {
  const value = model.value

  if (value === null || value === undefined) {
    return emptyPlaceholder.value
  }

  // 单个布尔
  if (typeof value === 'boolean') {
    const trueLabel =
      (attrs.previewTrueLabel as string | undefined) ?? $t(PRO_FORM_TEXT_DEFAULTS.booleanTrueKey)
    const falseLabel =
      (attrs.previewFalseLabel as string | undefined) ?? $t(PRO_FORM_TEXT_DEFAULTS.booleanFalseKey)
    return value ? trueLabel : falseLabel
  }

  // 多选数组
  if (Array.isArray(value) && optionsList.value.length > 0) {
    const labels = value
      .map(v => optionsList.value.find(o => o.value === v))
      .filter((o): o is SelectOption => !!o)
      .map(o => o.label)

    if (labels.length === 0) {
      return emptyPlaceholder.value
    }

    return labels.join('，')
  }

  return emptyPlaceholder.value
})

const handleUpdate = (value: CheckboxValue): void => {
  model.value = value
}
</script>

<template>
  <span
    v-if="props.readonly"
    class="block py-xs text-foreground leading-normal break-words"
  >
    {{ displayLabel }}
  </span>
  <div
    v-else-if="optionsList.length > 0"
    class="flex flex-wrap gap-xs"
  >
    <div
      v-for="opt in optionsList"
      :key="String(opt.value)"
      class="row-center gap-xs"
    >
      <Checkbox
        :model-value="model"
        :input-id="`cb-${String(opt.value)}`"
        :value="opt.value"
        :disabled="props.disabled || props.readonly"
        :invalid="!!props.error && props.error.length > 0"
        @update:model-value="handleUpdate"
      />
      <label
        :for="`cb-${String(opt.value)}`"
        class="text-sm cursor-pointer text-foreground"
      >
        {{ opt.label }}
      </label>
    </div>
  </div>
  <Checkbox
    v-else
    :model-value="model"
    :input-id="props.inputId"
    binary
    :disabled="props.disabled || props.readonly"
    :invalid="!!props.error && props.error.length > 0"
    @update:model-value="handleUpdate"
  />
</template>
