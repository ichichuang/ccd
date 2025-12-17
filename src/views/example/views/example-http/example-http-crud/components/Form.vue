<script setup lang="tsx">
import type { Schema } from '@/components/modules/schema-form/utils/types'
// import { useDialog } from '@/hooks/components/useDialog'
import { useSchemaForm } from '@/hooks/components/useSchemaForm'
import { Button } from 'primevue'
import { ref } from 'vue'
// const { openDialog } = useDialog()
// ==================== 表单 Schema 定义 ====================
const initialSchema: Schema = {
  columns: [
    // 基础输入组件
    {
      field: 'inputText',
      label: '文本输入',
      component: 'InputText',
      placeholder: '请输入文本',
      rules: 'required|min:3|max:20',
      help: '文本长度为3-20个字符',
      defaultValue: '默认初始文本',
    },
    {
      field: 'inputNumber',
      label: '数字输入',
      component: 'InputNumber',
      placeholder: '请输入数字',
      rules: 'required|min:1|max:1000',
      help: '数字范围为1-100',
      props: {
        min: 1,
        max: 1000,
        step: 1,
      },
    },
    // Button
    {
      field: 'customButton',
      component: 'Custom',
      props: {
        renderer: () => {
          return (
            <Button
              severity="primary"
              size="size"
            >
              提交
            </Button>
          )
        },
      },
    },
  ],
  style: {
    contentClass: 'w-100%!',
  },
}

// ==================== 表单 Ref 管理 ====================
const schemaFormRef = ref<any>(null)

// ==================== 表单数据响应式状态 ====================
// 由 useSchemaForm 提供稳定的响应式表单值

// ==================== 使用 useSchemaForm Hook ====================
// const { formValues, schema, getFormData } = useSchemaForm({
//   formRef: schemaFormRef,
//   initialSchema,
//   remember: true,
// })
const { formValues, schema } = useSchemaForm({
  formRef: schemaFormRef,
  initialSchema,
  remember: true,
})
// 从 hook 解构实时表单值（重置/清空后仍会持续更新）

// ==================== 表单操作函数 ====================

const handleSubmit = (values: Record<string, any>) => {
  console.log('表单提交:', values)
}

// ==================== 演示操作函数 ====================

// 获取表单数据
// const handleGetFormData = async () => {
//   const formData = await getFormData()
//   if (formData) {
//     console.log('表单值:', formData)
//     openDialog({
//       header: '表单数据',
//       contentRenderer: () => {
//         return <pre>{JSON.stringify(formData, null, 2)}</pre>
//       },
//       hideClose: true,
//       hideFooter: true,
//     })
//   } else {
//     window.$toast.error('表单校验未通过')
//   }
// }
</script>

<template lang="pug">
div
  SchemaForm(:schema='schema', @submit='handleSubmit', ref='schemaFormRef')
  pre.c-border-primary.p-paddings.full {{ JSON.stringify(formValues, null, 2) }}
</template>
