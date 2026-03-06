<!-- @/components/SchemaForm/components/wrappers/WrappedRadioButton.vue -->
<template>
  <RadioButtonGroup
    v-model="internalValue"
    :name="name"
    :class="classProp"
    :style="style"
    v-bind="restProps"
  >
    <div
      v-for="(option, index) in options"
      :key="String(option.value)"
      class="row-center gap-sm"
    >
      <RadioButton
        :input-id="`${name}_${index}`"
        :value="option.value"
        :disabled="disabled || readonly"
      />
      <label
        :for="`${name}_${index}`"
        :class="{ 'opacity-60 cursor-default': readonly }"
      >
        {{ option.label }}
      </label>
    </div>
  </RadioButtonGroup>
</template>

<script setup lang="ts">
import type { OptionItem } from '../../utils/types'

interface WrappedRadioButtonProps {
  modelValue?: unknown
  name?: string
  disabled?: boolean
  readonly?: boolean
  options?: OptionItem[]
  class?: string | string[]
  style?: Record<string, string>
}

const props = withDefaults(defineProps<WrappedRadioButtonProps>(), {
  modelValue: undefined,
  name: undefined,
  disabled: false,
  readonly: false,
  options: () => [],
  class: undefined,
  style: undefined,
})

const emit = defineEmits<{
  'update:modelValue': [value: unknown]
}>()

/**
 * class 属性（避免使用保留字）
 */
const classProp = computed(() => props.class)

/**
 * 内部值
 */
const internalValue = computed({
  get: () => props.modelValue,
  set: (val: unknown) => {
    emit('update:modelValue', val)
  },
})

const attrs = useAttrs()

/**
 * 提取其他 props（排除已处理的属性）
 */
const restProps = computed(() => {
  return attrs as Record<string, unknown>
})
</script>
