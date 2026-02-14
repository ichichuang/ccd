<!-- @/components/schema-form/components/wrappers/WrappedTreeSelect.vue -->
<template>
  <TreeSelect
    v-model="internalValue"
    :name="name"
    :disabled="disabled"
    :placeholder="placeholder"
    :options="treeNodes"
    :class="classProp"
    :style="style"
    v-bind="restProps"
  />
</template>

<script setup lang="ts">
import TreeSelect from 'primevue/treeselect'
import { computed } from 'vue'
import type { OptionItem } from '../../utils/types'

interface WrappedTreeSelectProps {
  modelValue?: any
  name?: string
  disabled?: boolean
  /** 只读语义：不透传给 TreeSelect，本组件内部可根据需要使用 */
  readonly?: boolean
  placeholder?: string
  options?: OptionItem[]
  class?: string | string[]
  style?: Record<string, string>
  [key: string]: any
}

const props = withDefaults(defineProps<WrappedTreeSelectProps>(), {
  modelValue: undefined,
  name: undefined,
  disabled: false,
  readonly: false,
  placeholder: undefined,
  options: () => [],
  class: undefined,
  style: undefined,
})

const emit = defineEmits<{
  'update:modelValue': [value: any]
}>()

/**
 * class 属性（避免使用保留字）
 */
const classProp = computed(() => props.class)

/**
 * 递归转换函数：将 OptionItem[] 转换为 TreeNode 格式
 * 支持任意深度的树结构
 *
 * 修复：优先使用 item.key（schema 中定义的），兼容 item.value
 */
const convertToTreeNode = (item: any): any => {
  // ✅ 优先使用 item.key，兼容旧的 item.value
  const key = item.key !== undefined ? item.key : item.value

  return {
    key: key,
    label: item.label,
    data: key, // data 应该与 key 保持一致
    children: item.children ? item.children.map(convertToTreeNode) : undefined,
  }
}

const treeNodes = computed(() => {
  return props.options.map(convertToTreeNode)
})

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
 * 提取其他 props（排除已处理的属性）
 */
const restProps = computed(() => {
  const {
    modelValue: _modelValue,
    name: _name,
    disabled: _disabled,
    readonly: _readonly,
    placeholder: _placeholder,
    options: _options,
    class: _class,
    style: _style,
    ...rest
  } = props
  return rest
})
</script>
