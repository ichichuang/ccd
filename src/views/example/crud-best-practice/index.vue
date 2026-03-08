<!--
  CRUD 最佳实践示例页面（A4-table-drawer）
  - 通过 SchemaForm + DataTableV2 + 抽屉式编辑组合，演示典型后台“查询 + 列表 + 抽屉编辑”的完整 CRUD 流程
  - 仅依赖本地 mock 数据，便于在任意新项目中快速复制并替换为真实接口
  - 结构 archetype 来自同目录的 page.state.ts，禁止随意修改 data-archetype 以避免与 UIDesignState 漂移
-->
<script setup lang="tsx">
import { DataTableV2 } from '@/components/DataTable'
import type { FormValues, Schema } from '@/components/SchemaForm'
import type {
  DataTableAction,
  DataTableApiParams,
  DataTableApiResult,
  DataTableColumn,
} from '@/types/data-table'
import type { UserEditFormModel, UserTableRowModel } from './page.state'
import Tag from 'primevue/tag'

defineOptions({ name: 'CrudBestPracticeIndex' })

// ─── Refs ───
const tableRef = ref<{ refresh?: () => void } | null>(null)
const isDrawerVisible = ref(false)
const selectedUser = ref<UserTableRowModel | null>(null)

// ─── Search Schema ───
const searchFormValues = ref<FormValues>({ keyword: '', role: 'All' })

const searchSchema: Schema = {
  layout: { cols: 3 },
  columns: [
    { field: 'keyword', label: '关键词', component: 'InputText', placeholder: '搜索名称或关键字' },
    {
      field: 'role',
      label: '角色',
      component: 'Select',
      options: [
        { label: '全部', value: 'All' },
        { label: '管理员', value: 'Admin' },
        { label: '普通用户', value: 'User' },
      ],
      placeholder: '选择角色',
    },
  ],
}

function handleSearch() {
  tableRef.value?.refresh?.()
}

// ─── Mock Data & API ───
const MOCK_USERS: UserTableRowModel[] = [
  { id: '1', username: 'Alice', role: 'Admin', status: 'Active' },
  { id: '2', username: 'Bob', role: 'User', status: 'Inactive' },
  { id: '3', username: 'Carol', role: 'User', status: 'Active' },
  { id: '4', username: 'David', role: 'Admin', status: 'Inactive' },
  { id: '5', username: 'Eve', role: 'User', status: 'Active' },
]

async function fetchUsers(
  params: DataTableApiParams & { keyword?: string; role?: string }
): Promise<DataTableApiResult<UserTableRowModel>> {
  await new Promise(r => setTimeout(r, 400))
  let list = [...MOCK_USERS]
  const kw = (params.keyword ?? '').trim().toLowerCase()
  if (kw) list = list.filter(u => u.username.toLowerCase().includes(kw))
  if (params.role && params.role !== 'All') list = list.filter(u => u.role === params.role)
  const start = (params.page - 1) * params.pageSize
  return { data: list.slice(start, start + params.pageSize), total: list.length }
}

const apiFn = (params: DataTableApiParams) =>
  fetchUsers({
    ...params,
    keyword: searchFormValues.value.keyword as string,
    role: searchFormValues.value.role as string,
  })

// ─── Table Schema ───
const columns: DataTableColumn<UserTableRowModel>[] = [
  { field: 'username', header: '名称', width: 140 },
  {
    field: 'role',
    header: '角色',
    width: 100,
    render: (row: UserTableRowModel) => (
      <Tag
        value={row.role}
        severity="info"
      />
    ),
  },
  {
    field: 'status',
    header: '状态',
    width: 100,
    render: (row: UserTableRowModel) => (
      <Tag
        value={row.status}
        severity={row.status === 'Active' ? 'success' : 'danger'}
      />
    ),
  },
]

const rowActions: DataTableAction<UserTableRowModel>[] = [
  {
    label: '编辑',
    icon: 'i-lucide-pencil',
    onClick: (row: UserTableRowModel) => {
      selectedUser.value = { ...row }
      editFormValues.value = {
        id: row.id,
        username: row.username,
        role: row.role,
        permissions: [],
      }
      isDrawerVisible.value = true
    },
  },
  {
    label: '切换状态',
    icon: 'i-lucide-toggle-right',
    onClick: async (row: UserTableRowModel) => {
      const next = row.status === 'Active' ? 'Inactive' : 'Active'
      await new Promise(r => setTimeout(r, 300))
      const idx = MOCK_USERS.findIndex(u => u.id === row.id)
      if (idx >= 0) MOCK_USERS[idx].status = next
      tableRef.value?.refresh?.()
    },
  },
]

// ─── Edit Form ───
const editFormValues = ref<FormValues>({
  id: '',
  username: '',
  role: 'User',
  permissions: [],
})
const editFormRef = ref<{ validate?: () => Promise<{ valid: boolean }> } | null>(null)
const saveLoading = ref(false)

function fetchPermissionsByRole(
  model: UserEditFormModel
): Promise<Array<{ label: string; value: string }>> {
  return new Promise(resolve => {
    setTimeout(() => {
      const role = (model.role as string) || ''
      if (role === 'Admin') {
        resolve([
          { label: '全部系统管理', value: 'all-admin' },
          { label: '用户管理', value: 'user-admin' },
          { label: '角色管理', value: 'role-admin' },
        ])
      } else if (role === 'User') {
        resolve([
          { label: '仅查看', value: 'view-only' },
          { label: '编辑自己的', value: 'edit-own' },
        ])
      } else resolve([])
    }, 500)
  })
}

function getEditModel(): UserEditFormModel {
  return editFormValues.value as unknown as UserEditFormModel
}

const editSchema: Schema = {
  layout: { cols: 1 },
  columns: [
    {
      field: 'username',
      label: '名称',
      component: 'InputText',
      rules: 'required',
      placeholder: '请输入',
    },
    {
      field: 'role',
      label: '角色',
      component: 'Select',
      options: [
        { label: '管理员', value: 'Admin' },
        { label: '普通用户', value: 'User' },
      ],
      placeholder: '请选择',
    },
    {
      field: 'permissions',
      label: '权限',
      component: 'MultiSelect',
      vIf: (model: FormValues) => (model as unknown as UserEditFormModel).role === 'Admin',
      options: (model: FormValues) => fetchPermissionsByRole(model as unknown as UserEditFormModel),
      placeholder: '请选择',
      dependsOn: ['role'],
      componentProps: { display: 'chip' },
    },
  ],
}

watch(selectedUser, u => {
  if (u) {
    editFormValues.value = { id: u.id, username: u.username, role: u.role, permissions: [] }
  }
})

async function handleSave() {
  const valid = (await editFormRef.value?.validate?.().then(r => r.valid)) ?? true
  if (!valid) return
  saveLoading.value = true
  try {
    await new Promise(r => setTimeout(r, 500))
    const m = getEditModel()
    const idx = MOCK_USERS.findIndex(u => u.id === m.id)
    if (idx >= 0) {
      MOCK_USERS[idx].username = m.username
      MOCK_USERS[idx].role = m.role
    }
    isDrawerVisible.value = false
    selectedUser.value = null
    tableRef.value?.refresh?.()
    window.$message?.success('保存成功')
  } finally {
    saveLoading.value = false
  }
}

function handleCancel() {
  isDrawerVisible.value = false
  selectedUser.value = null
}

function handleDrawerVisibleChange(v: boolean) {
  if (!v) selectedUser.value = null
}
</script>

<template>
  <div
    data-archetype="A4-table-drawer"
    class="h-full flex flex-col overflow-hidden"
  >
    <div
      data-region="toolbar"
      class="shrink-0 flex flex-wrap items-end gap-lg px-padding-lg py-padding-md border-b-default"
    >
      <SchemaForm
        v-model="searchFormValues"
        :schema="searchSchema"
        class="flex-1 min-w-0"
      />
      <Button
        label="搜索"
        icon="i-lucide-search"
        size="small"
        @click="handleSearch"
      />
    </div>

    <div
      data-region="datatable"
      class="flex-1 min-h-0"
    >
      <DataTableV2
        ref="tableRef"
        :columns="columns"
        :row-actions="rowActions"
        :api="apiFn"
        :page-size="10"
      />
    </div>

    <div
      data-region="drawer"
      class="contents"
    >
      <Drawer
        v-model:visible="isDrawerVisible"
        position="right"
        header="编辑记录"
        class="w-full max-w-[min(24rem,90vw)] glass-surface shadow-float"
        @update:visible="handleDrawerVisibleChange"
      >
        <SchemaForm
          ref="editFormRef"
          v-model="editFormValues"
          :schema="editSchema"
          @submit="handleSave"
        />
        <template #footer>
          <div class="flex justify-end gap-sm">
            <Button
              label="取消"
              severity="secondary"
              @click="handleCancel"
            />
            <Button
              label="保存"
              :loading="saveLoading"
              @click="handleSave"
            />
          </div>
        </template>
      </Drawer>
    </div>
  </div>
</template>
