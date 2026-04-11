<script setup lang="tsx">
import type { V1UserListItemDTO } from '@/api/example/users'
import type { ColumnRenderParams, ProTableExposed } from '@/components/ProTable'
import { useRecordOverlay } from '@/components/ProTable'
import { del, post, put } from '@/utils/http/methods'
import Button from 'primevue/button'
import { userColumns, userFormSchema, userViewFormSchema } from '../config'

defineOptions({ name: 'FormTableComboTablePanel' })

const props = defineProps<{
  searchParams: Record<string, unknown>
}>()

const tableRef = ref<ProTableExposed | null>(null)

const { formatI18n, isInitialized } = useDateUtils()

const {
  openCreate,
  openEdit,
  openViewDrawer,
  handleDelete,
  reloadTable,
  drawerState,
  drawerSubmit,
  drawerCancel,
} = useRecordOverlay<V1UserListItemDTO>({
  tableRef,
  title: '用户',
  schemas: {
    create: userFormSchema,
    edit: userFormSchema,
    view: userViewFormSchema,
  },
  apis: {
    create: values => post('/api/v1/users', values, { enableCache: false }),
    update: (id, values) => put(`/api/v1/users/${id}`, values, { enableCache: false }),
    remove: row => del(`/api/v1/users/${row.id}`, { enableCache: false }),
  },
  mappers: {
    rowToEditValues: row => ({
      name: row.name,
      gender: row.gender,
      age: row.age,
      email: row.email,
      phone: row.phone,
    }),
    rowToViewValues: row => ({
      id: row.id,
      name: row.name,
      gender: row.gender,
      age: row.age,
      email: row.email,
      phone: row.phone,
      status: row.status,
      createdAt:
        row.createdAt && isInitialized.value
          ? formatI18n(String(row.createdAt), 'datetime')
          : row.createdAt
            ? String(row.createdAt)
            : '—',
    }),
    getRowId: row => row.id,
  },
})

const columns = computed(() =>
  userColumns.map(col => {
    if (col.id !== 'actions') return col
    return {
      ...col,
      render: ({ row }: ColumnRenderParams<V1UserListItemDTO>) => (
        <div class="row-center gap-xs w-full">
          <Button
            size="small"
            text
            rounded
            severity="secondary"
            icon="i-lucide-eye"
            aria-label="查看"
            onClick={() => openViewDrawer(row)}
          />
          <Button
            size="small"
            text
            rounded
            icon="i-lucide-edit"
            aria-label="编辑"
            onClick={() => openEdit(row)}
          />
          <Button
            size="small"
            text
            rounded
            severity="danger"
            icon="i-lucide-trash-2"
            aria-label="删除"
            onClick={() => void handleDelete(row)}
          />
        </div>
      ),
    }
  })
)

defineExpose({
  reload: reloadTable,
})
</script>

<template>
  <div class="col-fill min-h-0 material-elevated rounded-md">
    <ProTable
      ref="tableRef"
      state-key="example-pro-table-form-table-combo"
      height-mode="fill"
      :columns="columns"
      api-url="/api/v1/users"
      data-key="data.list"
      total-key="data.total"
      :search-params="props.searchParams"
      row-key="id"
      server-mode
    >
      <template #toolbar-extra>
        <Button
          type="button"
          severity="primary"
          label="新建用户"
          icon="i-lucide-user-plus"
          class="shrink-0"
          @click="openCreate()"
        />
      </template>
    </ProTable>

    <Drawer
      v-model:visible="drawerState.visible"
      position="right"
      :modal="false"
      :dismissable="true"
      style="width: min(90vw, 500px)"
    >
      <template #container>
        <template v-if="drawerState.visible && drawerState.data">
          <ProTableCrudFormModalBody
            v-if="drawerState.mode === 'create' || drawerState.mode === 'edit'"
            :schema="drawerState.mode === 'edit' ? userFormSchema : userFormSchema"
            :initial-values="drawerState.data.values"
            :on-request-submit="drawerSubmit"
            :on-cancel="drawerCancel"
          />

          <ProTableCrudViewModalBody
            v-else-if="drawerState.mode === 'view'"
            :schema="userViewFormSchema"
            :initial-values="drawerState.data.values"
            :on-close="drawerCancel"
          />
        </template>
      </template>
    </Drawer>
  </div>
</template>
