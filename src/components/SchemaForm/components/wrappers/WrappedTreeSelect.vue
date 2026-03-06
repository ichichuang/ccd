<!-- @/components/SchemaForm/components/wrappers/WrappedTreeSelect.vue -->
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
import type { OptionItem } from '../../utils/types'
import type { TreeNode } from 'primevue/treenode'

interface WrappedTreeSelectProps {
  modelValue?: unknown
  name?: string
  disabled?: boolean
  /** 只读语义：不透传给 TreeSelect，本组件内部可根据需要使用 */
  readonly?: boolean
  placeholder?: string
  options?: OptionItem[]
  class?: string | string[]
  style?: Record<string, string>
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
  'update:modelValue': [value: unknown]
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
const convertToTreeNode = (item: OptionItem): TreeNode => {
  const key = item.key ?? item.value ?? item.label
  return {
    key: String(key),
    label: item.label,
    data: key,
    children: item.children ? (item.children as OptionItem[]).map(convertToTreeNode) : undefined,
  }
}

const treeNodes = computed<TreeNode[]>(() => props.options.map(convertToTreeNode))

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
