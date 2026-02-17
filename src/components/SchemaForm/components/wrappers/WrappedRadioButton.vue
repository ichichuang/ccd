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
import RadioButton from 'primevue/radiobutton'
import RadioButtonGroup from 'primevue/radiobuttongroup'
import { computed } from 'vue'
import type { OptionItem } from '../../utils/types'

interface WrappedRadioButtonProps {
  modelValue?: unknown
  name?: string
  disabled?: boolean
  readonly?: boolean
  options?: OptionItem[]
  class?: string | string[]
  style?: Record<string, string>
  /** rest 透传 PrimeVue RadioButtonGroup */
  [key: string]: unknown
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

/**
 * 提取其他 props（排除已处理的属性）
 */
const restProps = computed(() => {
  const {
    modelValue: _modelValue,
    name: _name,
    disabled: _disabled,
    readonly: _readonly,
    options: _options,
    class: _class,
    style: _style,
    ...rest
  } = props
  return rest
})
</script>
