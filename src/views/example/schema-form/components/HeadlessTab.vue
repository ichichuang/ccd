<script setup lang="ts">
import { ref } from 'vue'
import { SchemaForm, useSchemaForm } from '@/components/schema-form'
import type { Schema } from '@/components/schema-form'

// Initial Schema
const initialSchema: Schema = {
  gap: 16,
  columns: [
    {
      field: 'name',
      label: '姓名 (Name)',
      component: 'InputText',
      props: { placeholder: '请输入姓名...' },
      defaultValue: 'Guest',
    },
    {
      field: 'email',
      label: '邮箱 (Email)',
      component: 'InputText',
      props: { placeholder: 'example@domain.com' },
      rules: 'required|email',
    },
  ],
}

// Initialize Hook
const {
  schema,
  formValues,
  addField,
  removeField,
  updateField,
  moveField,
  validate,
  resetForm,
  clearForm,
} = useSchemaForm({ initialSchema })

// Actions
function handleAddField() {
  const id = Date.now().toString()
  addField({
    field: `field_${id}`,
    label: `动态字段 ${id}`,
    component: 'InputText',
    props: { placeholder: '我是新加的！' },
  })
}

function handleRemoveLast() {
  const cols = schema.value.columns
  if (cols.length > 0) {
    const last = cols[cols.length - 1]
    removeField(last.field)
  }
}

function handleUpdateFirst() {
  const cols = schema.value.columns
  if (cols.length > 0) {
    const first = cols[0]
    updateField(first.field, {
      label: `更新于 ${new Date().toLocaleTimeString()}`,
      props: { placeholder: '更新后的占位符' },
    })
  }
}

function handleSwap() {
  const cols = schema.value.columns
  if (cols.length >= 2) {
    const fieldName = cols[0].field
    const toIndex = 1
    moveField(fieldName, toIndex)
  }
}

async function handleSetValues() {
  formValues.value = {
    ...formValues.value,
    name: '张三 (John Doe)',
    email: 'zhangsan@example.com',
  }
}

async function handleValidate() {
  try {
    const res = await validate()
    console.log('Validation success:', res)
    window.$message?.success('校验通过！')
  } catch (err) {
    console.warn('Validation failed:', err)
    window.$message?.error('校验失败！')
  }
}

function handleReset() {
  resetForm()
  window.$message?.info('表单已重置')
}

function handleClear() {
  clearForm()
  window.$message?.info('表单已清空')
}
</script>

<template>
  <div class="flex flex-col gap-md h-full min-h-0">
    <!-- Toolbar -->
    <div
      class="flex flex-wrap gap-sm p-padding-sm bg-surface-ground rounded-scale-md border border-border"
    >
      <Button
        label="添加字段"
        icon="pi pi-plus"
        size="small"
        @click="handleAddField"
      />
      <Button
        label="移除最后"
        icon="pi pi-minus"
        severity="danger"
        size="small"
        outlined
        @click="handleRemoveLast"
      />
      <Button
        label="更新首项"
        icon="pi pi-file-edit"
        severity="info"
        size="small"
        outlined
        @click="handleUpdateFirst"
      />
      <Button
        label="交换前两项"
        icon="pi pi-sort-alt"
        severity="help"
        size="small"
        outlined
        @click="handleSwap"
      />
      <Button
        label="设置值"
        icon="pi pi-save"
        severity="success"
        size="small"
        outlined
        @click="handleSetValues"
      />
      <Button
        label="校验"
        icon="pi pi-check"
        severity="warn"
        size="small"
        outlined
        @click="handleValidate"
      />
      <div class="w-1px h-4 bg-border mx-sm self-center" />
      <Button
        label="重置"
        icon="pi pi-refresh"
        severity="secondary"
        size="small"
        @click="handleReset"
      />
      <Button
        label="清空"
        icon="pi pi-trash"
        severity="danger"
        size="small"
        ghost
        @click="handleClear"
      />
    </div>

    <div class="flex-1 min-h-0 flex flex-row gap-md items-stretch">
      <!-- Form Preview -->
      <div
        class="flex-1 min-w-0 bg-card border border-border rounded-scale-md p-padding-md overflow-hidden flex flex-col"
      >
        <h3 class="font-medium mb-margin-md shrink-0">表单渲染 (Rendered Form)</h3>
        <CScrollbar class="flex-1 min-h-0">
          <SchemaForm
            v-model="formValues"
            :schema="schema"
          />
        </CScrollbar>
      </div>

      <!-- JSON Debug -->
      <div
        class="flex-1 min-w-0 bg-card border border-border rounded-scale-md p-padding-md overflow-hidden flex flex-col"
      >
        <h3 class="font-medium mb-margin-md shrink-0">内部状态 (Internal State)</h3>
        <CScrollbar class="flex-1 min-h-0">
          <div class="grid grid-cols-1 gap-md">
            <div>
              <div class="text-xs text-muted mb-1">表单数据 (formValues)</div>
              <CScrollbar class="max-h-40 min-h-0 rounded">
                <pre class="m-0 bg-surface-ground p-2 text-xs">{{ formValues }}</pre>
              </CScrollbar>
            </div>
            <div>
              <div class="text-xs text-muted mb-1">Schema 配置 (schema.columns)</div>
              <CScrollbar class="max-h-[500px] min-h-0 rounded">
                <pre class="m-0 bg-surface-ground p-2 text-xs">{{ schema.columns }}</pre>
              </CScrollbar>
            </div>
          </div>
        </CScrollbar>
      </div>
    </div>
  </div>
</template>
