<script setup lang="ts">
import { SchemaForm } from '@/components/modules/schema-form'
import type { Schema } from '@/components/modules/schema-form/utils/types'
import { useSchemaForm, type SchemaFormExpose } from '@/hooks/components/useSchemaForm'
import { ref } from 'vue'

const emit = defineEmits<{
  submit: [data: Record<string, any>]
}>()

// 创建表单 schema
const createFormSchema: Schema = {
  columns: [
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
const { schema, formValues, getFormValues, resetForm } = useSchemaForm({
  initialSchema: createFormSchema,
})

// 重置表单
resetForm()

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
