<!-- @/components/SchemaForm/components/wrappers/WrappedSlider.vue -->
<template>
  <Slider
    v-model="internalValue"
    :name="name"
    :disabled="disabled"
    :class="classProp"
    :style="style"
    v-bind="restProps"
  />
</template>

<script setup lang="ts">
import Slider from 'primevue/slider'
import { computed } from 'vue'

interface WrappedSliderProps {
  modelValue?: number | number[]
  /** 是否允许空值（null/undefined），默认 false：空值会被归一为 0 */
  allowEmpty?: boolean
  name?: string
  disabled?: boolean
  /** 只读语义：不透传给 Slider，本组件内部可根据需要使用 */
  readonly?: boolean
  class?: string | string[]
  style?: Record<string, string>
  /** rest 透传 PrimeVue Slider */
  [key: string]: unknown
}

const props = withDefaults(defineProps<WrappedSliderProps>(), {
  modelValue: undefined,
  allowEmpty: false,
  name: undefined,
  disabled: false,
  readonly: false,
  class: undefined,
  style: undefined,
})

const emit = defineEmits<{
  'update:modelValue': [value: number | number[] | undefined]
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
  set: (val: number | number[] | undefined) => {
    if (props.allowEmpty && (val === null || val === undefined)) {
      emit('update:modelValue', undefined)
      return
    }
    emit('update:modelValue', val ?? 0)
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
    class: _class,
    style: _style,

    ...rest
  } = props
  return rest
})
</script>
