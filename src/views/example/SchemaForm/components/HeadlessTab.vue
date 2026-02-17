<script setup lang="ts">
import { ref } from 'vue'
import { SchemaForm, useSchemaForm } from '@/components/SchemaForm'
import type { Schema } from '@/components/SchemaForm'

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

// Initialize Hook（校验通过 SchemaForm ref，useSchemaForm 不提供 validate）
const {
  schema,
  formValues,
  addField,
  removeField,
  updateField,
  moveField,
  setFieldValue,
  setValues,
  resetForm,
  clearForm,
} = useSchemaForm({ initialSchema })

const formRef = ref<InstanceType<typeof SchemaForm>>()

// ─── 值操作 ───
function handleSetSingleName() {
  setFieldValue('name', '张三 (单字段设值)')
  window.$message?.info('已设置姓名字段')
}

function handleSetSingleEmail() {
  setFieldValue('email', 'zhangsan@example.com')
  window.$message?.info('已设置邮箱字段')
}

function handleSetValuesBatch() {
  setValues({
    name: '张三 (John Doe)',
    email: 'zhangsan@example.com',
  })
  window.$message?.info('已批量设置')
}

// ─── Schema 操作：增删改移 ───
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

function handleFirstItemLayoutTop() {
  const cols = schema.value.columns
  if (cols.length > 0) {
    updateField(cols[0].field, {
      layout: { labelAlign: 'top', labelWidth: 100 },
    })
    window.$message?.info('首项改为顶部标签')
  }
}

function handleFirstItemLabelCenter() {
  const cols = schema.value.columns
  if (cols.length > 0) {
    updateField(cols[0].field, {
      style: { labelStyle: { textAlign: 'center' } },
    })
    window.$message?.info('首项标签居中')
  }
}

function handleRestoreFirstItem() {
  const cols = schema.value.columns
  if (cols.length > 0) {
    updateField(cols[0].field, {
      label: '姓名 (Name)',
      props: { placeholder: '请输入姓名...' },
      layout: undefined,
      style: undefined,
    })
    window.$message?.info('已恢复首项')
  }
}

function handleSwap() {
  const cols = schema.value.columns
  if (cols.length >= 2) {
    const fieldName = cols[0].field
    moveField(fieldName, 1)
  }
}

async function handleValidate() {
  try {
    const res = await formRef.value?.validate()
    if (res?.valid) {
      window.$message?.success('校验通过！')
    } else {
      window.$message?.danger(res?.errors ? Object.values(res.errors).join('；') : '校验失败')
    }
  } catch (err) {
    console.warn('Validation failed:', err)
    window.$message?.danger('校验失败！')
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
    <!-- Toolbar: 值操作 | Schema 操作 | 校验与重置 -->
    <div class="flex flex-col gap-sm">
      <div
        class="flex flex-wrap gap-sm p-padding-sm bg-surface-ground rounded-scale-md component-border"
      >
        <span class="text-muted-foreground fs-xs self-center mr-sm">值操作：</span>
        <Button
          label="设姓名"
          icon="pi pi-user"
          size="small"
          severity="secondary"
          outlined
          @click="handleSetSingleName"
        />
        <Button
          label="设邮箱"
          icon="pi pi-envelope"
          size="small"
          severity="secondary"
          outlined
          @click="handleSetSingleEmail"
        />
        <Button
          label="批量设值"
          icon="pi pi-save"
          severity="success"
          size="small"
          outlined
          @click="handleSetValuesBatch"
        />
      </div>
      <div
        class="flex flex-wrap gap-sm p-padding-sm bg-surface-ground rounded-scale-md component-border"
      >
        <span class="text-muted-foreground fs-xs self-center mr-sm">Schema：</span>
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
          label="首项顶部标签"
          icon="pi pi-arrow-down"
          size="small"
          outlined
          @click="handleFirstItemLayoutTop"
        />
        <Button
          label="首项标签居中"
          icon="pi pi-align-center"
          size="small"
          outlined
          @click="handleFirstItemLabelCenter"
        />
        <Button
          label="恢复首项"
          icon="pi pi-undo"
          size="small"
          outlined
          @click="handleRestoreFirstItem"
        />
        <Button
          label="交换前两项"
          icon="pi pi-sort-alt"
          severity="help"
          size="small"
          outlined
          @click="handleSwap"
        />
      </div>
      <div
        class="flex flex-wrap gap-sm p-padding-sm bg-surface-ground rounded-scale-md component-border"
      >
        <Button
          label="校验"
          icon="pi pi-check"
          severity="warn"
          size="small"
          outlined
          @click="handleValidate"
        />
        <div class="w-px h-[var(--spacing-md)] bg-border mx-margin-sm self-center" />
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
          variant="outlined"
          @click="handleClear"
        />
      </div>
    </div>

    <div class="flex-1 min-h-0 flex flex-row gap-md items-stretch">
      <!-- Form Preview -->
      <div
        class="flex-1 min-w-0 bg-card component-border rounded-scale-md p-padding-md overflow-hidden flex flex-col"
      >
        <h3 class="font-medium mb-margin-md shrink-0">表单渲染 (Rendered Form)</h3>
        <CScrollbar class="flex-1 min-h-0">
          <SchemaForm
            ref="formRef"
            v-model="formValues"
            :schema="schema"
          />
        </CScrollbar>
      </div>

      <!-- JSON Debug -->
      <div
        class="flex-1 min-w-0 bg-card component-border rounded-scale-md p-padding-md overflow-hidden flex flex-col"
      >
        <h3 class="font-medium mb-margin-md shrink-0">内部状态 (Internal State)</h3>
        <CScrollbar class="flex-1 min-h-0">
          <div class="grid grid-cols-1 gap-md">
            <div>
              <div class="fs-xs text-muted mb-margin-xs">表单数据 (formValues)</div>
              <CScrollbar class="max-h-40 min-h-0 rounded">
                <pre class="m-0 bg-surface-ground p-padding-sm fs-xs">{{ formValues }}</pre>
              </CScrollbar>
            </div>
            <div>
              <div class="fs-xs text-muted mb-margin-xs">Schema 配置 (schema.columns)</div>
              <CScrollbar class="max-h-[50vh] min-h-0 rounded-scale-md">
                <pre class="m-0 bg-surface-ground p-padding-sm fs-xs">{{ schema.columns }}</pre>
              </CScrollbar>
            </div>
          </div>
        </CScrollbar>
      </div>
    </div>
  </div>
</template>
