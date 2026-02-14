<!-- @/components/schema-form/components/wrappers/WrappedAutoComplete.vue -->
<template>
  <AutoComplete
    v-model="internalValue"
    :name="name"
    :disabled="disabled"
    :placeholder="placeholder"
    :suggestions="suggestions"
    :option-label="optionLabel"
    :class="classProp"
    :style="style"
    v-bind="restProps"
    @complete="handleComplete"
    @focus="handleFocus"
  />
</template>

<script setup lang="ts">
import AutoComplete from 'primevue/autocomplete'
import { computed, ref, watch } from 'vue'
import type { OptionItem } from '../../utils/types'

interface WrappedAutoCompleteProps {
  modelValue?: any
  name?: string
  disabled?: boolean
  /** 只读语义：不透传给 AutoComplete，本组件内部可根据需要使用 */
  readonly?: boolean
  placeholder?: string
  options?: OptionItem[]
  completeMethod?: (event: { query?: string }) => void
  optionLabel?: string
  optionValue?: string
  class?: string | string[]
  style?: Record<string, string>
  [key: string]: any
}

const props = withDefaults(defineProps<WrappedAutoCompleteProps>(), {
  modelValue: undefined,
  name: undefined,
  disabled: false,
  readonly: false,
  placeholder: undefined,
  options: () => [],
  completeMethod: undefined,
  optionLabel: 'label',
  optionValue: 'value',
  class: undefined,
  style: undefined,
})

const emit = defineEmits<{
  'update:modelValue': [value: any]
  focus: [event: Event]
}>()

/**
 * class 属性（避免使用保留字）
 */
const classProp = computed(() => props.class)

/**
 * 基础选项列表
 */
const baseOptions = computed<OptionItem[]>(() => {
  return Array.isArray(props.options) ? [...props.options] : []
})

/**
 * 建议列表
 */
const suggestions = ref<OptionItem[]>([])

/**
 * 初始化建议列表
 */
const initSuggestions = () => {
  if (suggestions.value.length === 0 && baseOptions.value.length > 0) {
    suggestions.value = [...baseOptions.value]
  }
}

// 监听 options 变化
watch(
  () => props.options,
  () => {
    initSuggestions()
  },
  { immediate: true }
)

/**
 * 过滤建议
 */
const filterSuggestions = (query: string) => {
  if (!query) {
    suggestions.value = [...baseOptions.value]
    return
  }
  const lower = query.toLowerCase()
  suggestions.value = baseOptions.value.filter(item =>
    String(item.label ?? '')
      .toLowerCase()
      .includes(lower)
  )
}

/**
 * 处理自动完成
 */
const handleComplete = (event: { query?: string }) => {
  // 如果用户提供了自定义 completeMethod，使用它
  if (typeof props.completeMethod === 'function') {
    props.completeMethod(event)
    return
  }
  // 否则使用默认过滤逻辑
  filterSuggestions((event?.query ?? '').toString())
}

/**
 * 处理焦点事件
 */
const handleFocus = (event: Event) => {
  // 如果没有自定义 completeMethod，在获得焦点时重置建议列表
  if (typeof props.completeMethod !== 'function') {
    filterSuggestions('')
  }
  emit('focus', event)
}

/**
 * 内部值
 */
const internalValue = computed({
  get: () => props.modelValue,
  set: (val: any) => {
    emit('update:modelValue', val)
  },
})

/**
 * 提取其他 props
 */
const restProps = computed(() => {
  const {
    modelValue: _modelValue,
    name: _name,
    disabled: _disabled,
    readonly: _readonly,
    placeholder: _placeholder,
    options: _options,
    completeMethod: _completeMethod,
    optionLabel: _optionLabel,
    optionValue: _optionValue,
    class: _class,
    style: _style,
    onFocus: _onFocus,
    ...rest
  } = props
  return rest
})
</script>
