<!-- DataTable V2 升维 Demo -->
<script setup lang="tsx">
import type {
  DataTableAction,
  DataTableApiParams,
  DataTableApiResult,
  DataTableColumn,
} from '@/types/data-table'
import { useDialog } from '@/hooks/modules/useDialog'
import Tag from 'primevue/tag'

interface UserRow {
  id: number
  name: string
  status: 'Active' | 'Inactive'
  role: string
}

const tableRef = ref<{ refresh?: () => void } | null>(null)
const { info, danger } = useDialog()

/** Mock API: 1 秒延迟返回用户列表 */
async function fetchUsers(params: DataTableApiParams): Promise<DataTableApiResult<UserRow>> {
  await new Promise(resolve => setTimeout(resolve, 1000))
  const all: UserRow[] = [
    { id: 1, name: 'Alice', status: 'Active', role: 'Admin' },
    { id: 2, name: 'Bob', status: 'Inactive', role: 'User' },
    { id: 3, name: 'Carol', status: 'Active', role: 'User' },
    { id: 4, name: 'David', status: 'Inactive', role: 'Admin' },
    { id: 5, name: 'Eve', status: 'Active', role: 'User' },
  ]
  const start = (params.page - 1) * params.pageSize
  const data = all.slice(start, start + params.pageSize)
  return { data, total: all.length }
}

const columns: DataTableColumn<UserRow>[] = [
  { field: 'name', header: '姓名', width: 120 },
  {
    field: 'status',
    header: '状态',
    width: 120,
    render: (row: UserRow) => (
      <Tag
        value={row.status}
        severity={row.status === 'Active' ? 'success' : 'secondary'}
      />
    ),
  },
  { field: 'role', header: '角色', width: 100 },
]

const rowActions: DataTableAction<UserRow>[] = [
  {
    label: '编辑',
    icon: 'i-lucide-pencil',
    onClick: (row: UserRow) => {
      info(`编辑：${row.name}`)
    },
  },
  {
    label: '删除',
    icon: 'i-lucide-trash-2',
    severity: 'danger',
    vIf: (row: UserRow) => row.role !== 'Admin',
    onClick: (row: UserRow) => {
      danger(`删除：${row.name}`)
    },
  },
]
</script>

<template>
  <div
    data-archetype="A4-table-drawer"
    class="h-full flex flex-col overflow-hidden"
  >
    <div
      data-region="toolbar"
      class="shrink-0 flex items-center justify-between gap-lg px-padding-lg py-padding-md border-b-default bg-card"
    >
      <h2 class="fs-lg font-semibold text-primary m-0">DataTable V2 升维 Demo</h2>
      <Button
        label="刷新"
        icon="i-lucide-refresh-cw"
        size="small"
        @click="tableRef?.refresh?.()"
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
        :api="fetchUsers"
        :page-size="10"
      />
    </div>
  </div>
</template>
