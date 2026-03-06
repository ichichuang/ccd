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

const attrs = useAttrs()

/**
 * 提取其他 props（排除已处理的属性）
 */
const restProps = computed(() => {
  return attrs as Record<string, unknown>
})
</script>
