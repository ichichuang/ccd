<script setup lang="tsx">
import {
  createExample,
  deleteExample,
  updateExample,
  type CreateExampleParams,
  type ExampleItem,
  type ExampleListParams,
  type UpdateExampleParams,
} from '@/api/modules/example'
import { SchemaForm } from '@/components/modules/schema-form'
import type { Schema } from '@/components/modules/schema-form/utils/types'
import type { TableSizeConfig, VxeTableColumn } from '@/components/modules/vxe-table'
import { VxeTable } from '@/components/modules/vxe-table'
import { useDialog } from '@/hooks/components/useDialog'
import { Button } from 'primevue'
import { computed, h, nextTick, ref } from 'vue'
import CreateForm from './CreateForm.vue'
import EditForm from './EditForm.vue'

// ==================== 类型定义 ====================
interface TableRow extends ExampleItem {
  id: number
  name: string
  description?: string
  createdAt: string
}

// ==================== Props & Emits ====================
const emit = defineEmits<{
  refresh: []
}>()

// ==================== 表格列配置 ====================
const columns: VxeTableColumn<TableRow>[] = [
  {
    field: 'id',
    header: 'ID',
    width: 80,
    sortable: true,
  },
  {
    field: 'name',
    header: '名称',
    minWidth: 160,
    sortable: true,
  },
  {
    field: 'description',
    header: '描述',
    minWidth: 220,
    sortable: false,
  },
  {
    field: 'createdAt',
    header: '创建时间',
    minWidth: 180,
    sortable: false,
  },
  {
    field: 'actions',
    header: '操作',
    width: 200,
    sortable: false,
    body: (rowData: TableRow) => {
      return (
        <div class="flex gap-gap">
          <Button
            severity="secondary"
            size="small"
            text
            onClick={() => {
              handleView(rowData)
            }}
          >
            查看
          </Button>
          <Button
            severity="info"
            size="small"
            text
            onClick={() => {
              handleEdit(rowData)
            }}
          >
            编辑
          </Button>
          <Button
            severity="danger"
            size="small"
            text
            onClick={() => {
              handleDelete(rowData)
            }}
          >
            删除
          </Button>
        </div>
      )
    },
  },
]

// ==================== 尺寸配置 ====================
const sizeConfig: TableSizeConfig = {
  widthMode: 'auto',
  heightMode: 'auto',
  columnWidthMode: 'auto',
}

// ==================== API 配置 ====================
const apiParams = ref<ExampleListParams>({})
const apiConfig = computed(() => ({
  api: '/api/example/list',
  type: 'get' as const,
  params: apiParams.value,
  mode: 'pagination' as const,
  pagination: {
    pageSize: 10,
  },
  immediate: true,
}))

// ==================== 表格引用 ====================
const tableRef = ref<any>(null)

// ==================== 选中行 ====================
const selectedRows = ref<TableRow[]>([])

// ==================== Dialog Hook ====================
const { openDialog, confirmDelete, closeDialog } = useDialog()

// ==================== 表单操作 ====================
const handleCreate = () => {
  const formRef = ref<InstanceType<typeof CreateForm> | null>(null)

  const dialogIndex = openDialog({
    header: '新增示例',
    contentRenderer: () => {
      return h('div', { class: 'p-padding' }, [
        h(CreateForm, {
          ref: formRef,
        }),
      ])
    },
    footerButtons: [
      {
        label: '取消',
        severity: 'secondary',
        text: true,
        btnClick: () => {
          closeDialog(dialogIndex)
        },
      },
      {
        label: '确定',
        severity: 'primary',
        btnClick: async () => {
          const formData = await formRef.value?.getFormData()
          if (formData) {
            try {
              await createExample(formData as CreateExampleParams)
              window.$toast.success('创建成功')
              closeDialog(dialogIndex)
              // 刷新表格
              tableRef.value?.refresh()
              emit('refresh')
            } catch (error) {
              window.$toast.error(error instanceof Error ? error.message : '创建失败')
            }
          } else {
            window.$toast.error('表单校验未通过')
          }
        },
      },
    ],
  })
}

const handleView = (row: TableRow) => {
  // 🔥 关键修复：直接使用 vxe-table 传入的 row 数据，不需要调用 API
  // row 参数就是当前行的数据，直接从表格获取，确保数据是最新的

  // 查看表单 schema（与编辑表单相同，但使用预览模式）
  const viewSchema: Schema = {
    columns: [
      {
        field: 'id',
        label: 'ID',
        component: 'InputNumber',
      },
      {
        field: 'name',
        label: '名称',
        component: 'InputText',
      },
      {
        field: 'description',
        label: '描述',
        component: 'InputText',
      },
      {
        field: 'createdAt',
        label: '创建时间',
        component: 'InputText',
      },
    ],
    style: {
      contentClass: 'w-100%!',
    },
  }

  // 🔥 关键修复：使用展开运算符创建新对象，确保数据是最新的
  const viewFormData = {
    id: row.id,
    name: row.name,
    description: row.description || '',
    createdAt: row.createdAt,
  }

  // 打开查看对话框，使用表单预览模式
  openDialog({
    header: '查看详情',
    contentRenderer: () => {
      return h('div', { class: 'p-padding' }, [
        h(SchemaForm, {
          schema: viewSchema,
          // 🔥 关键修复：对于预览模式，直接使用 modelValue 即可
          // 使用 :modelValue (在 h() 函数中就是 modelValue) 而不是 v-model
          // 这能更清晰地表达"只读"意图，并避免了 update:modelValue 事件的监听和处理
          modelValue: viewFormData,
          preview: true,
        }),
      ])
    },
    footerButtons: [
      {
        label: '关闭',
        severity: 'secondary',
        text: true,
        btnClick: ({ dialog }) => {
          closeDialog(dialog.index)
        },
      },
    ],
  })
}

const handleEdit = (row: TableRow) => {
  // 🔥 关键修复：直接使用 vxe-table 传入的 row 数据，不需要调用 API
  // row 参数就是当前行的数据，直接从表格获取，确保数据是最新的

  // 🔥 关键修复：在对话框外部创建 formRef，确保 ref 能够正确绑定
  const formRef = ref<InstanceType<typeof EditForm> | null>(null)

  // 🔥 关键修复：使用展开运算符创建新对象，确保数据是最新的，并避免对象引用相同导致 watch 不触发
  const initialData: ExampleItem = {
    id: row.id,
    name: row.name,
    description: row.description || '',
    createdAt: row.createdAt,
  }

  const dialogIndex = openDialog({
    header: '编辑示例',
    contentRenderer: () => {
      return h('div', { class: 'p-padding' }, [
        h(EditForm, {
          ref: formRef,
          initialData: initialData,
        }),
      ])
    },
    footerButtons: [
      {
        label: '取消',
        severity: 'secondary',
        text: true,
        btnClick: () => {
          closeDialog(dialogIndex)
        },
      },
      {
        label: '确定',
        severity: 'primary',
        btnClick: async () => {
          const formData = await formRef.value?.getFormData()
          if (formData) {
            // 确保 id 字段存在且有效
            if (!formData.id || typeof formData.id !== 'number') {
              window.$toast.error('ID 字段无效，请刷新页面重试')
              return
            }
            try {
              await updateExample(formData as UpdateExampleParams)
              window.$toast.success('更新成功')
              closeDialog(dialogIndex)
              // 刷新表格
              tableRef.value?.refresh()
              emit('refresh')
            } catch (error) {
              window.$toast.error(error instanceof Error ? error.message : '更新失败')
            }
          } else {
            window.$toast.error('表单校验未通过')
          }
        },
      },
    ],
  })
}

const handleDelete = (row: TableRow) => {
  confirmDelete(`确定要删除 "${row.name}" 吗？删除后无法恢复。`, '删除确认', {
    onConfirm: async () => {
      try {
        await deleteExample(row.id)
        window.$toast.success('删除成功')
        // 刷新表格
        tableRef.value?.refresh()
        emit('refresh')
      } catch (error) {
        window.$toast.error(error instanceof Error ? error.message : '删除失败')
      }
    },
  })
}

const handleBatchDelete = () => {
  if (selectedRows.value.length === 0) {
    window.$toast.warn('请先选择要删除的数据')
    return
  }

  confirmDelete(
    `确定要删除选中的 ${selectedRows.value.length} 条数据吗？删除后无法恢复。`,
    '批量删除确认',
    {
      onConfirm: async () => {
        try {
          // 批量删除
          const deletePromises = selectedRows.value.map(row => deleteExample(row.id))
          await Promise.all(deletePromises)
          window.$toast.success('批量删除成功')
          // 清空选中
          selectedRows.value = []
          // 刷新表格
          tableRef.value?.refresh()
          emit('refresh')
        } catch (error) {
          window.$toast.error(error instanceof Error ? error.message : '批量删除失败')
        }
      },
    }
  )
}

// ==================== 暴露方法 ====================
defineExpose({
  refresh: () => {
    tableRef.value?.refresh()
  },
  setSearchParams: async (params: ExampleListParams) => {
    apiParams.value = params
    // 等待响应式更新完成，确保 apiConfig 已更新
    await nextTick()
    tableRef.value?.refresh()
  },
})
</script>

<template lang="pug">
VxeTable(
  ref='tableRef',
  :columns='columns',
  :size-config='sizeConfig',
  :size='"normal"',
  :pagination='true',
  :scrollable='false',
  :show-gridlines='true',
  :striped-rows='true',
  :api='apiConfig',
  :selectable='true',
  :selection-mode='"multiple"',
  v-model:selected-rows='selectedRows'
)
  template(#header-left)
    .between-start.gap-gap
      Button.gap-0(severity='success', @click='handleCreate')
        Icons(name='ri-add-line')
        span 新增
      Button.gap-0(
        severity='danger',
        :disabled='selectedRows.length === 0',
        @click='handleBatchDelete'
      )
        Icons(name='ri-delete-bin-line')
        span 批量删除
        span(v-if='selectedRows.length > 0') ({{ selectedRows.length }})
</template>

<style lang="scss" scoped></style>
