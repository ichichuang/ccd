<script setup lang="tsx">
import type { VxeTableColumn } from '@/components/modules/vxe-table'
import { useVxeTableStore } from '@/stores/modules/vxetable'
import { computed, ref } from 'vue'

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

// ==================== 持久化配置 ====================
const tableId = 'example-persistence-table' // 表格唯一标识
const vxeTableStore = useVxeTableStore()

// 功能开关
const reorderableColumns = ref<boolean>(true)
const resizableColumns = ref<boolean>(true)
const columnResizeMode = ref<'fit' | 'expand'>('fit')

// 获取当前保存的偏好设置
const currentPreferences = computed(() => {
  return vxeTableStore.getTableSettings(tableId)
})

// ==================== 事件处理 ====================
const handleColumnReorder = (event: {
  originalEvent: Event
  dragIndex: number
  dropIndex: number
}) => {
  console.log('列顺序变更:', event)
  if (window.$toast) {
    window.$toast.success(
      `列顺序已保存：从位置 ${event.dragIndex + 1} 移动到位置 ${event.dropIndex + 1}`
    )
  }
  // 延迟更新显示（等待 store 更新）
  setTimeout(() => {
    // 触发响应式更新
  }, 100)
}

const handleColumnResizeEnd = (event: { element: HTMLElement; column: any; delta: number }) => {
  console.log('列宽调整完成:', event)
  if (window.$toast) {
    window.$toast.success(`列宽已保存，变化量: ${event.delta > 0 ? '+' : ''}${event.delta}px`)
  }
  // 延迟更新显示（等待 store 更新）
  setTimeout(() => {
    // 触发响应式更新
  }, 100)
}

// 重置偏好设置
const handleResetPreferences = () => {
  vxeTableStore.clearTableSettings(tableId)
  if (window.$toast) {
    window.$toast.success('偏好设置已重置，请刷新页面查看效果')
  }
  // 延迟刷新页面
  setTimeout(() => {
    window.location.reload()
  }, 1000)
}
</script>

<template lang="pug">
.between-col.justify-start.gap-gapl
  // 持久化功能示例（主容器，与 basic 保持一致结构）
  .between-col.justify-start.gap-gaps.c-border-primary.p-padding
    b VxeTable 持久化示例
    .fs-appFontSizes 展示 VxeTable 组件的用户偏好持久化功能
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
              span Table ID:
              b.ml-1 {{ tableId }}
            .mt-1
              span 列拖拽:
              b.ml-1 {{ reorderableColumns ? '启用' : '禁用' }}
            .mt-1
              span 列宽调整:
              b.ml-1 {{ resizableColumns ? '启用' : '禁用' }}
            .mt-1(v-if='resizableColumns')
              span 调整模式:
              b.ml-1 {{ columnResizeMode === 'fit' ? 'Fit (表格总宽度不变)' : 'Expand (表格总宽度变化)' }}

    // 保存的偏好设置
    .c-border-accent.p-padding.fs-appFontSizes(v-if='currentPreferences')
      div
        b 已保存的偏好设置：
      .mt-1(v-if='currentPreferences.columnOrder && currentPreferences.columnOrder.length > 0')
        div
          span 列顺序:
          code.ml-1 {{ currentPreferences.columnOrder.join(' → ') }}
      .mt-1(
        v-if='currentPreferences.columnWidths && Object.keys(currentPreferences.columnWidths).length > 0'
      )
        div
          span 列宽度:
          code.ml-1 {{ JSON.stringify(currentPreferences.columnWidths) }}
      .mt-2
        Button(size='small', severity='danger', @click='handleResetPreferences') 重置偏好设置

    // 使用说明
    .c-border-accent.p-padding.fs-appFontSizes
      div
        b 使用说明：
      ul.mt-1
        li
          strong 持久化功能：
          | 通过设置
          code table-id
          | 属性，表格会自动保存和恢复用户的列顺序和列宽偏好
        li
          strong 验证方法：
          | 调整列顺序或列宽后，刷新页面，配置会自动恢复
        li
          strong 重置方法：
          | 点击"重置偏好设置"按钮可以清除保存的配置
        li
          strong 存储位置：
          | 配置保存在 localStorage 中，通过 Pinia Store 管理

    // 表格
    .h-400
      VxeTable(
        :table-id='tableId',
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
              | 持久化: {{ tableId }}

  // 说明文档（独立说明卡片）
  .c-border-accent.p-padding.fs-appFontSizes.between-col.justify-start.items-start.gap-gap
    b.fs-appFontSizex 持久化功能说明
    .between-col.gap-gaps
      div
        b 功能概述：
        ul
          li 表格持久化功能可以自动保存和恢复用户的列顺序和列宽偏好
          li 通过
            code table-id
            | 属性为每个表格设置唯一标识
          li 配置会自动保存到 localStorage，通过 Pinia Store 管理
          li 页面刷新后，用户的偏好设置会自动恢复

      div
        b 使用方法：
        ul
          li 在 VxeTable 组件上设置
            code :table-id="'your-table-id'"
            | 属性
          li 启用列拖拽和列宽调整功能（
            code :reorderable-columns="true"
            | 和
            code :resizable-columns="true"
            | ）
          li 用户调整列顺序或列宽后，配置会自动保存（防抖 500ms）
          li 下次打开页面时，配置会自动恢复

      div
        b 存储结构：
        ul
          li
            code columnOrder:
            | 列顺序数组，包含字段名列表
          li
            code columnWidths:
            | 列宽度映射，格式为
            code { field: width }
          li
            code hiddenColumns:
            | 隐藏的列数组（未来功能）

      div
        b 技术实现：
        ul
          li 使用
            code useTablePersistence
            | Hook 封装持久化逻辑
          li 通过 Pinia Store 管理状态和持久化
          li 使用防抖机制避免频繁写入存储
          li 自动处理新列（代码更新后新增的列会追加到末尾）

      div
        b 注意事项：
        ul
          li
            code table-id
            | 必须全局唯一，否则会冲突
          li 建议使用有意义的标识，如
            code 'user-list-table'
            | 、
            code 'order-management-table'
            | 等
          li 配置保存在 localStorage 中，清除浏览器数据会丢失配置
          li 如果不需要持久化，可以不设置
            code table-id
            | 属性
</template>
