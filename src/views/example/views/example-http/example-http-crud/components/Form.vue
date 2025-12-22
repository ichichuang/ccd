<script setup lang="tsx">
import type { Schema } from '@/components/modules/schema-form/utils/types'
import { useSchemaForm, type SchemaFormExpose } from '@/hooks/components/useSchemaForm'
import { Button } from 'primevue'
import { nextTick, onMounted, ref } from 'vue'

// ==================== 表单 Schema 定义 ====================
const initialSchema: Schema = {
  columns: [
    {
      field: 'keyword',
      label: '搜索关键词',
      component: 'InputText',
      placeholder: '请输入搜索关键词',
      defaultValue: '',
      props: {
        clearable: true,
      },
    },
    {
      field: 'searchButton',
      component: 'Custom',
      props: {
        render: () => {
          return (
            <div class="w-100%! px-paddingl">
              <Button
                severity="primary"
                onClick={() => {
                  handleSearch()
                }}
              >
                查询
              </Button>
            </div>
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
const schemaFormRef = ref<SchemaFormExpose | null>(null)

// ==================== 使用 useSchemaForm Hook (P2 重构后) ====================
const { schema, formValues, getFormValues, setFieldValue } = useSchemaForm({
  initialSchema,
})

// ==================== 组件挂载时修复错误值 ====================
onMounted(async () => {
  // 等待表单初始化完成
  await nextTick()
  // 检查 keyword 字段，如果是对象则修复为空字符串
  const formValues = getFormValues()
  if (formValues.keyword && typeof formValues.keyword === 'object' && formValues.keyword !== null) {
    console.warn('[Form] 检测到 keyword 字段包含对象值，已修复为空字符串:', formValues.keyword)
    setFieldValue('keyword', '')
  }
})

// ==================== 事件定义 ====================
const emit = defineEmits<{
  search: [params: { keyword?: string }]
}>()

// ==================== 表单操作函数 ====================
const handleSearch = async () => {
  // 等待表单值更新完成，确保获取到最新的输入值
  await nextTick()
  const formValues = getFormValues()
  // 确保 keyword 是字符串类型，过滤掉对象类型
  let keyword: string | undefined
  if (formValues.keyword) {
    if (typeof formValues.keyword === 'string') {
      keyword = formValues.keyword.trim() || undefined
    } else if (typeof formValues.keyword === 'object' && formValues.keyword !== null) {
      // 如果是对象，修复为空字符串并返回 undefined
      console.warn('[Form] keyword 字段包含对象值，已修复:', formValues.keyword)
      setFieldValue('keyword', '')
      keyword = undefined
    }
  }
  emit('search', {
    keyword,
  })
}

// ==================== 暴露方法 ====================
defineExpose({
  getFormValues,
})
</script>

<template lang="pug">
SchemaForm(:schema='schema', v-model='formValues', ref='schemaFormRef')
</template>
