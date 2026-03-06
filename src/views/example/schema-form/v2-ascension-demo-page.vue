<!-- V2 升维 Demo：vIf + 异步 options（级联 MultiSelect） -->
<script setup lang="ts">
import type { FormValues } from '@/components/SchemaForm'
import type { SchemaColumnsItem } from '@/components/SchemaForm'

const formValues = ref<FormValues>({ role: '', permissions: [] })

/** 模拟 1 秒延迟的权限 API：根据 role 返回不同权限列表 */
function fetchPermissionsByRole(
  model: FormValues
): Promise<Array<{ label: string; value: string }>> {
  return new Promise(resolve => {
    setTimeout(() => {
      const role = (model.role as string) || ''
      if (role === 'Admin') {
        resolve([
          { label: '全部系统管理', value: 'all-admin' },
          { label: '用户管理', value: 'user-admin' },
          { label: '角色管理', value: 'role-admin' },
          { label: '审计日志', value: 'audit-log' },
          { label: '配置管理', value: 'config-admin' },
        ])
      } else if (role === 'User') {
        resolve([
          { label: '仅查看', value: 'view-only' },
          { label: '编辑自己的', value: 'edit-own' },
        ])
      } else {
        resolve([])
      }
    }, 1000)
  })
}

/** V2 Schema：纯配置驱动，vIf + 异步 options，符合 FormSchemaItem 语义 */
const v2Schema: {
  columns: SchemaColumnsItem[]
  layout?: { cols: number; labelWidth: number }
  gap?: number
} = {
  gap: 24,
  layout: { cols: 1, labelWidth: 140 },
  columns: [
    {
      field: 'role',
      label: '角色',
      component: 'Select',
      options: [
        { label: '管理员', value: 'Admin' },
        { label: '普通用户', value: 'User' },
      ],
      placeholder: '请选择角色',
      dependsOn: [],
    },
    {
      field: 'permissions',
      label: '权限',
      component: 'MultiSelect',
      vIf: (model: FormValues) => (model.role as string) === 'Admin',
      options: (model: FormValues) => fetchPermissionsByRole(model),
      placeholder: '请选择权限',
      dependsOn: ['role'],
      componentProps: { display: 'chip' },
    },
  ],
}

function handleSubmit(values: FormValues) {
  console.log('V2 Demo Submitted:', values)
  window.$message?.success('表单已提交！')
}
</script>

<template>
  <div
    data-archetype="A1-toolbar-content"
    class="flex flex-col h-full overflow-hidden"
  >
    <div
      data-region="toolbar"
      class="shrink-0 flex flex-col gap-sm px-padding-lg py-padding-md border-b-default bg-card"
    >
      <h2 class="fs-xl font-semibold text-primary m-0">SchemaForm v2 升维 Demo</h2>
      <p class="fs-sm text-muted-foreground m-0">
        选择「管理员」后，权限 MultiSelect 显示并异步加载（约 1 秒）；选择「普通用户」时隐藏。
      </p>
    </div>

    <div
      data-region="content"
      class="flex-1 min-h-0"
    >
      <CScrollbar class="h-full">
        <div class="p-padding-lg max-w-lg">
          <SchemaForm
            v-model="formValues"
            :schema="v2Schema"
            @submit="handleSubmit"
          />
          <div class="mt-margin-lg p-padding-md bg-muted rounded-scale-md">
            <p class="fs-sm font-medium text-foreground mb-margin-xs">当前值</p>
            <pre class="fs-xs font-mono text-muted-foreground m-0 whitespace-pre-wrap">{{
              JSON.stringify(formValues, null, 2)
            }}</pre>
          </div>
        </div>
      </CScrollbar>
    </div>
  </div>
</template>
