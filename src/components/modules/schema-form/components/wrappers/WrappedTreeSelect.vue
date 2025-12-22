<!-- @/components/schema-form/components/wrappers/WrappedTreeSelect.vue -->
<template>
  <TreeSelect
    v-model="internalValue"
    :name="name"
    :disabled="disabled"
    :readonly="readonly"
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
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'update:modelValue': [value: any]
}>()

/**
 * class 属性（避免使用保留字）
 */
const classProp = computed(() => props.class)

/**
 * 将 OptionItem[] 转换为 TreeNode 格式
 */
const treeNodes = computed(() => {
  return props.options.map((item: any) => ({
    key: item.value,
    label: item.label,
    data: item.value,
    children:
      item.children?.map((child: any) => ({
        key: child.value,
        label: child.label,
        data: child.value,
        children:
          child.children?.map((grandChild: any) => ({
            key: grandChild.value,
            label: grandChild.label,
            data: grandChild.value,
          })) || [],
      })) || [],
  }))
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
