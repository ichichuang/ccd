<!-- @/components/schema-form/components/wrappers/WrappedInputGroup.vue -->
<template>
  <InputGroup
    :class="classProp"
    :style="style"
    v-bind="restProps"
  >
    <InputGroupAddon v-if="addonBefore">{{ addonBefore }}</InputGroupAddon>
    <InputText
      v-model="internalValue"
      :name="name"
      :disabled="disabled"
      :readonly="readonly"
      :placeholder="placeholder"
    />
    <InputGroupAddon v-if="addonAfter">{{ addonAfter }}</InputGroupAddon>
  </InputGroup>
</template>

<script setup lang="ts">
import InputGroup from 'primevue/inputgroup'
import InputGroupAddon from 'primevue/inputgroupaddon'
import InputText from 'primevue/inputtext'
import { computed } from 'vue'

interface WrappedInputGroupProps {
  modelValue?: string
  name?: string
  disabled?: boolean
  readonly?: boolean
  placeholder?: string
  addonBefore?: string | any
  addonAfter?: string | any
  class?: string | string[]
  style?: Record<string, string>
  [key: string]: any
}

const props = withDefaults(defineProps<WrappedInputGroupProps>(), {
  modelValue: undefined,
  name: undefined,
  disabled: false,
  readonly: false,
  placeholder: undefined,
  addonBefore: undefined,
  addonAfter: undefined,
  class: undefined,
  style: undefined,
})

const emit = defineEmits<{
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'update:modelValue': [value: string]
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
  set: (val: string | undefined) => {
    emit('update:modelValue', val ?? '')
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
    placeholder: _placeholder,
    addonBefore: _addonBefore,
    addonAfter: _addonAfter,
    class: _class,
    style: _style,
    ...rest
  } = props
  return rest
})
</script>
