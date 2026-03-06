<!-- @/components/SchemaForm/components/wrappers/WrappedInputGroup.vue -->
<template>
  <InputGroup
    :class="classProp"
    :style="style"
    v-bind="restProps"
  >
    <InputGroupAddon v-if="addonBefore">
      <component
        :is="addonBefore"
        v-if="
          typeof addonBefore === 'function' ||
          (typeof addonBefore === 'object' && addonBefore !== null)
        "
      />
      <template v-else>
        {{ addonBefore }}
      </template>
    </InputGroupAddon>
    <InputText
      :model-value="internalValue"
      :name="name"
      :disabled="disabled"
      :readonly="readonly"
      :placeholder="placeholder"
      @update:model-value="handleUpdateModelValue"
    />
    <InputGroupAddon v-if="addonAfter">
      <component
        :is="addonAfter"
        v-if="
          typeof addonAfter === 'function' ||
          (typeof addonAfter === 'object' && addonAfter !== null)
        "
      />
      <template v-else>
        {{ addonAfter }}
      </template>
    </InputGroupAddon>
  </InputGroup>
</template>

<script setup lang="ts">
import type { Component, VNode } from 'vue'

interface WrappedInputGroupProps {
  modelValue?: string
  name?: string
  disabled?: boolean
  readonly?: boolean
  placeholder?: string
  /** 前置插槽：字符串直接展示，Component/VNode 用 <component :is=""> 渲染 */
  addonBefore?: string | Component | VNode
  /** 后置插槽：同上 */
  addonAfter?: string | Component | VNode
  class?: string | string[]
  style?: Record<string, string>
}

const props = withDefaults(defineProps<WrappedInputGroupProps>(), {
  modelValue: '',
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
  'update:modelValue': [value: string]
}>()

/**
 * class 属性（避免使用保留字）
 */
const classProp = computed(() => props.class)

/**
 * 内部值
 */
const internalValue = computed<string>({
  get: () => props.modelValue,
  set: (val: string) => {
    emit('update:modelValue', val)
  },
})

const attrs = useAttrs()

function handleUpdateModelValue(val: unknown) {
  emit('update:modelValue', typeof val === 'string' ? val : '')
}

/**
 * 提取其他 props（排除已处理的属性）
 */
const restProps = computed(() => {
  return attrs as Record<string, unknown>
})
</script>
