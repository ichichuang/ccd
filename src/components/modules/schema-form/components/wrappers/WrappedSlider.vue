<!-- @/components/schema-form/components/wrappers/WrappedSlider.vue -->
<template>
  <Slider
    v-model="internalValue"
    :name="name"
    :disabled="disabled"
    :readonly="readonly"
    :class="classProp"
    :style="style"
    @change="handleChange"
    @slideend="handleSlideend"
    v-bind="restProps"
  />
</template>

<script setup lang="ts">
import Slider from 'primevue/slider'
import { computed } from 'vue'

interface WrappedSliderProps {
  modelValue?: number | number[]
  name?: string
  disabled?: boolean
  readonly?: boolean
  class?: string | string[]
  style?: Record<string, string>
  [key: string]: any
}

const props = withDefaults(defineProps<WrappedSliderProps>(), {
  modelValue: undefined,
  name: undefined,
  disabled: false,
  readonly: false,
  class: undefined,
  style: undefined,
})

const emit = defineEmits<{
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'update:modelValue': [value: number | number[]]
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
    emit('update:modelValue', val ?? 0)
  },
})

/**
 * 处理 change 事件（拖动过程中实时触发）
 */
const handleChange = (event: any) => {
  const value = event?.value ?? event
  emit('update:modelValue', value)
}

/**
 * 处理 slideend 事件（拖动结束时触发）
 */
const handleSlideend = (event: any) => {
  // slideend 事件携带 { originalEvent, value }
  const value = event && typeof event === 'object' && 'value' in event ? event.value : event
  emit('update:modelValue', value)
}

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
    onChange: _onChange,
    onSlideend: _onSlideend,
    ...rest
  } = props
  return rest
})
</script>
