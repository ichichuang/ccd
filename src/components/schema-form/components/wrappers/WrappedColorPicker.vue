<!-- @/components/schema-form/components/wrappers/WrappedColorPicker.vue -->
<template>
  <ColorPicker
    v-model="internalValue"
    :format="format"
    :name="name"
    :disabled="disabled"
    :class="classProp"
    :style="style"
    v-bind="restProps"
  />
</template>

<script setup lang="ts">
import ColorPicker from 'primevue/colorpicker'
import { computed } from 'vue'

interface WrappedColorPickerProps {
  modelValue?: string
  format?: 'hex' | 'rgb' | 'hsl'
  name?: string
  disabled?: boolean
  /** 只读语义：不透传给 ColorPicker，本组件内部可根据需要使用 */
  readonly?: boolean
  placeholder?: string
  class?: string | string[]
  style?: Record<string, string>
  [key: string]: any
}

const props = withDefaults(defineProps<WrappedColorPickerProps>(), {
  format: 'hex',
  modelValue: undefined,
  name: undefined,
  disabled: false,
  readonly: false,
  placeholder: undefined,
  class: undefined,
  style: undefined,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

/**
 * class 属性（避免使用保留字）
 */
const classProp = computed(() => props.class)

/**
 * 内部值（带 # 前缀，用于 ColorPicker 显示）
 * PrimeVue ColorPicker 需要 # 前缀
 */
const internalValue = computed({
  get: () => {
    let value: any = props.modelValue

    // 🔥 关键修复：如果 value 是对象，尝试提取字符串值
    if (value && typeof value === 'object') {
      // 如果是对象，尝试获取其字符串表示或 value 属性
      if ('value' in value && typeof (value as any).value === 'string') {
        value = (value as any).value
      } else if ('toString' in value && typeof (value as any).toString === 'function') {
        const strValue = (value as any).toString()
        // 如果 toString 返回的是 "[object Object]"，说明这不是我们想要的
        if (strValue !== '[object Object]') {
          value = strValue
        } else {
          // 无法转换为字符串，返回 undefined
          return undefined
        }
      } else {
        // 无法处理的对象，返回 undefined
        return undefined
      }
    }

    if (value === null || value === undefined || value === '') {
      return undefined
    }

    // 确保 value 是字符串
    const stringValue = String(value)

    // 如果值是字符串且没有 # 前缀，添加 # 前缀
    if (stringValue && !stringValue.startsWith('#')) {
      return `#${stringValue}`
    }
    return stringValue
  },
  set: (val: string | undefined) => {
    if (val === null || val === undefined || val === '') {
      emit('update:modelValue', '')
      return
    }
    // 移除 # 前缀并转换为小写（存储时不带 #）
    let normalizedValue = val.replace(/^#/, '').toLowerCase()

    // 如果 format 是 hex，确保值是小写的
    if (props.format === 'hex') {
      normalizedValue = normalizedValue.toLowerCase()
    }

    emit('update:modelValue', normalizedValue)
  },
})

/**
 * 提取其他 props（排除已处理的属性）
 */
const restProps = computed(() => {
  const {
    modelValue: _modelValue,
    format: _format,
    name: _name,
    disabled: _disabled,
    readonly: _readonly,
    placeholder: _placeholder,
    class: _class,
    style: _style,
    ...rest
  } = props
  return rest
})
</script>
