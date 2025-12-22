<script setup lang="ts">
import type { ExampleItem } from '@/api/modules/example'
import { SchemaForm } from '@/components/modules/schema-form'
import type { Schema } from '@/components/modules/schema-form/utils/types'
import { useSchemaForm, type SchemaFormExpose } from '@/hooks/components/useSchemaForm'
import { nextTick, ref, watch } from 'vue'

interface Props {
  initialData?: ExampleItem | null
}

const props = withDefaults(defineProps<Props>(), {
  initialData: null,
})

const emit = defineEmits<{
  submit: [data: Record<string, any>]
}>()

// 编辑表单 schema
const editSchema: Schema = {
  columns: [
    {
      field: 'id',
      label: 'ID',
      component: 'InputNumber',
      props: {
        disabled: true,
        useGrouping: false, // 禁用千位分隔符，显示纯数字
      },
    },
    {
      field: 'name',
      label: '名称',
      component: 'InputText',
      placeholder: '请输入名称',
      rules: 'required|min:1|max:100',
      help: '名称为必填项，长度1-100个字符',
    },
    {
      field: 'description',
      label: '描述',
      component: 'InputText',
      placeholder: '请输入描述（可选）',
      rules: 'max:500',
      help: '描述为可选项，最大长度500个字符',
    },
  ],
  style: {
    contentClass: 'w-100%!',
  },
}

// 表单引用
const formRef = ref<SchemaFormExpose | null>(null)
const { schema, formValues, getFormValues, setValues } = useSchemaForm({
  initialSchema: editSchema,
})

// 🔥 P2 重构：监听初始数据，设置表单值
// 🔥 关键修复：监听 initialData 的具体属性值，确保每次数据变化都能触发更新
watch(
  () =>
    props.initialData
      ? {
          id: props.initialData.id,
          name: props.initialData.name,
          description: props.initialData.description || '',
        }
      : null,
  initialValues => {
    if (initialValues) {
      // 🔥 关键修复：使用 nextTick 确保在 DOM 更新后设置值，避免与表单初始化冲突
      nextTick(() => {
        // 先更新 hook 的 formValues（用于 v-model 绑定）
        setValues(initialValues)
        // 🔥 关键修复：同时通过 SchemaForm 的 setValues 方法设置值，确保表单内部状态同步
        // 这样可以确保表单组件内部（formApiRef）的值也被更新
        if (formRef.value && typeof (formRef.value as any).setValues === 'function') {
          ;(formRef.value as any).setValues(initialValues)
        }
      })
    }
  },
  { immediate: true, deep: true, flush: 'post' }
)

// 暴露方法给父组件
defineExpose({
  // 🔥 关键修复：从 SchemaForm 组件获取实际表单值，而不是从 hook 获取
  // SchemaForm 组件暴露了 values getter，它会调用 collectLatestValues，从 formApiRef 获取最新值
  getFormData: async () => {
    if (!formRef.value) {
      return undefined
    }
    const { valid } = await formRef.value.validate()
    if (valid) {
      // 🔥 关键修复：使用 SchemaForm 组件暴露的 values getter，而不是 hook 的 getFormValues
      // SchemaForm 的 values getter 会调用 getFormValues()，它使用 collectLatestValues()
      // collectLatestValues 会从 formApiRef.value.values 和各个字段的 value 中获取最新值
      // 而 hook 的 getFormValues 只返回 formValues.value，可能没有同步到最新值
      const formValues = (formRef.value as any).values
      return formValues || getFormValues()
    }
    return undefined
  },
  validate: async () => {
    return await formRef.value?.validate()
  },
})
</script>

<template lang="pug">
SchemaForm(
  :schema='schema',
  v-model='formValues',
  ref='formRef',
  @submit='values => emit("submit", values)'
)
</template>

<style lang="scss" scoped></style>
