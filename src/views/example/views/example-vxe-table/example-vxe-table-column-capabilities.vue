<script setup lang="tsx">
import type { VxeTableColumn } from '@/components/modules/vxe-table'
import { ref } from 'vue'

// ==================== 数据类型定义 ====================
interface UserData {
  id: number
  name: string
  email: string
  age: number
  status: 'active' | 'inactive' | 'pending'
  role: string
  createdAt: string
  department: string
  salary: number
}

// ==================== 示例数据 ====================
const generateMockData = (count: number): UserData[] => {
  const roles = ['管理员', '编辑', '查看者', '访客']
  const statuses: UserData['status'][] = ['active', 'inactive', 'pending']
  const departments = ['技术部', '产品部', '运营部', '市场部', '财务部']
  const data: UserData[] = []

  for (let i = 1; i <= count; i++) {
    data.push({
      id: i,
      name: `用户 ${i}`,
      email: `user${i}@example.com`,
      age: 20 + Math.floor(Math.random() * 40),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      role: roles[Math.floor(Math.random() * roles.length)],
      department: departments[Math.floor(Math.random() * departments.length)],
      salary: 5000 + Math.floor(Math.random() * 20000),
      createdAt: new Date(
        Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000
      ).toLocaleDateString(),
    })
  }

  return data
}

// 初始数据
const tableData = ref<UserData[]>(generateMockData(30))
const loading = ref<boolean>(false)

// ==================== 列配置 ====================
const columns: VxeTableColumn<UserData>[] = [
  {
    field: 'id',
    header: 'ID',
    width: 80,
    sortable: true,
    align: 'center',
  },
  {
    field: 'name',
    header: '姓名',
    width: 150,
    sortable: true,
  },
  {
    field: 'email',
    header: '邮箱',
    width: 220,
    sortable: false,
  },
  {
    field: 'department',
    header: '部门',
    width: 120,
    sortable: true,
  },
  {
    field: 'role',
    header: '角色',
    width: 120,
    sortable: true,
  },
  {
    field: 'age',
    header: '年龄',
    width: 100,
    sortable: true,
    align: 'center',
  },
  {
    field: 'salary',
    header: '薪资',
    width: 120,
    sortable: true,
    align: 'right',
    body: (rowData: UserData) => {
      return <span>¥{rowData.salary.toLocaleString()}</span>
    },
  },
  {
    field: 'status',
    header: '状态',
    width: 120,
    sortable: true,
    body: (rowData: UserData) => {
      const statusMap: Record<UserData['status'], { label: string; class: string }> = {
        active: { label: '活跃', class: 'text-green-500' },
        inactive: { label: '禁用', class: 'text-red-500' },
        pending: { label: '待审核', class: 'text-yellow-500' },
      }
      const status = statusMap[rowData.status]
      return <span class={status.class}>{status.label}</span>
    },
  },
  {
    field: 'createdAt',
    header: '创建时间',
    width: 150,
    sortable: true,
  },
]

// ==================== 功能配置状态 ====================
const reorderableColumns = ref<boolean>(false)
const resizableColumns = ref<boolean>(false)
const columnResizeMode = ref<'fit' | 'expand'>('fit')

// ==================== 事件处理 ====================
const handleColumnReorder = (event: {
  originalEvent: Event
  dragIndex: number
  dropIndex: number
}) => {
  console.log('列顺序变更:', event)
  // 可以在这里更新列配置的顺序
  if (window.$toast) {
    window.$toast.info(`列已从位置 ${event.dragIndex + 1} 移动到位置 ${event.dropIndex + 1}`)
  }
}

const handleColumnResizeEnd = (event: { element: HTMLElement; column: any; delta: number }) => {
  console.log('列宽调整完成:', event)
  if (window.$toast) {
    window.$toast.info(`列宽已调整，变化量: ${event.delta > 0 ? '+' : ''}${event.delta}px`)
  }
}
</script>

<template lang="pug">
.between-col.justify-start.gap-gapl
  // 列功能控制示例（主容器，与 basic 保持一致结构）
  .between-col.justify-start.gap-gaps.c-border-primary.p-padding
    b VxeTable 列功能示例
    .fs-appFontSizes 展示 VxeTable 组件的列拖拽和列宽调整功能
    .between.items-start.gap-gap.w-full
      .flex-1.grid.grid-cols-1.gap-gap(class='sm:grid-cols-2 lg:grid-cols-3')
        .between-col
          .fs-appFontSizes.color-accent100 列拖拽
          .between-start.gap-gap
            Button(
              size='small',
              :severity='reorderableColumns ? "primary" : "secondary"',
              @click='() => (reorderableColumns = !reorderableColumns)'
            ) {{ reorderableColumns ? '已启用' : '已禁用' }}

        .between-col
          .fs-appFontSizes.color-accent100 列宽调整
          .between-start.gap-gap
            Button(
              size='small',
              :severity='resizableColumns ? "primary" : "secondary"',
              @click='() => (resizableColumns = !resizableColumns)'
            ) {{ resizableColumns ? '已启用' : '已禁用' }}

        .between-col
          .fs-appFontSizes.color-accent100 调整模式
          .between-start.gap-gap
            Button(
              size='small',
              :severity='columnResizeMode === "fit" ? "primary" : "secondary"',
              @click='() => (columnResizeMode = "fit")',
              :disabled='!resizableColumns'
            ) Fit
            Button(
              size='small',
              :severity='columnResizeMode === "expand" ? "primary" : "secondary"',
              @click='() => (columnResizeMode = "expand")',
              :disabled='!resizableColumns'
            ) Expand

      .flex-1
        div
          .fs-appFontSizes.color-accent100 当前配置
          .c-border-primary.p-padding.fs-appFontSizes
            div
              span 列拖拽:
              b {{ reorderableColumns ? '启用' : '禁用' }}
            .mt-1
              span 列宽调整:
              b {{ resizableColumns ? '启用' : '禁用' }}
            .mt-1(v-if='resizableColumns')
              span 调整模式:
              b {{ columnResizeMode === 'fit' ? 'Fit (表格总宽度不变)' : 'Expand (表格总宽度变化)' }}

    // 使用说明
    .c-border-accent.p-padding.fs-appFontSizes
      div
        b 使用说明：
      ul.mt-1
        li
          strong 列拖拽：
          | 启用后，可以通过拖拽表头来调整列的顺序
        li
          strong 列宽调整：
          | 启用后，可以通过拖拽列边界来调整列宽
        li
          strong Fit 模式：
          | 调整列宽时，表格总宽度不变，其他列会自动伸缩（推荐）
        li
          strong Expand 模式：
          | 调整列宽时，表格总宽度会变化

    // 表格
    .h-400
      VxeTable(
        :data='tableData',
        :columns='columns',
        :loading='loading',
        :pagination='true',
        :sortable='true',
        :scrollable='true',
        :reorderable-columns='reorderableColumns',
        :resizable-columns='resizableColumns',
        :column-resize-mode='columnResizeMode',
        :show-gridlines='true',
        :striped-rows='true',
        @column-reorder='handleColumnReorder',
        @column-resize-end='handleColumnResizeEnd'
      )
        template(#header-left='{ data }')
          .between-start.gap-gap
            span.fs-appFontSizes 共 {{ data?.length ?? 0 }} 条数据
            span.fs-appFontSizes
              | 功能: {{ reorderableColumns ? '拖拽' : '' }} {{ resizableColumns ? '调整列宽' : '' }}

  // 说明文档（独立说明卡片）
  .c-border-accent.p-padding.fs-appFontSizes.between-col.justify-start.items-start.gap-gap
    b.fs-appFontSizex 列功能说明
    .between-col.gap-gaps
      div
        b 列拖拽（Reorder）：
        ul
          li 启用
            code reorderableColumns
            | 属性后，可以通过拖拽表头来调整列的顺序
          li 拖拽完成后会触发
            code column-reorder
            | 事件，事件参数包含拖拽的起始位置和目标位置
          li 默认关闭，需要手动启用

      div
        b 列宽调整（Resize）：
        ul
          li 启用
            code resizableColumns
            | 属性后，可以通过拖拽列边界来调整列宽
          li 调整完成后会触发
            code column-resize-end
            | 事件，事件参数包含调整的列信息和变化量
          li 默认关闭，需要手动启用

      div
        b 列宽调整模式（columnResizeMode）：
        ul
          li
            strong fit:
            | 调整列宽时，表格总宽度不变，其他列会自动伸缩以适应变化（推荐模式）
          li
            strong expand:
            | 调整列宽时，表格总宽度会变化，整体表格会扩展或收缩

      div
        b 事件说明：
        ul
          li
            code column-reorder:
            | 列顺序变更事件，参数包含
            code dragIndex
            | （拖拽起始位置）和
            code dropIndex
            | （放置目标位置）
          li
            code column-resize-end:
            | 列宽调整完成事件，参数包含
            code element
            | （列元素）、
            code column
            | （列配置）和
            code delta
            | （宽度变化量，单位：px）

      div
        b 注意事项：
        ul
          li 列拖拽和列宽调整功能可以同时启用
          li 列宽调整模式仅在启用列宽调整时生效
          li 建议在需要用户自定义列布局的场景下使用这些功能
          li 调整后的列宽和顺序不会自动保存，需要自行实现持久化逻辑
</template>
