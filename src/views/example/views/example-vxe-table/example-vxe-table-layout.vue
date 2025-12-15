<script setup lang="tsx">
import type { VxeTableColumn } from '@/components/modules/vxe-table'
import { useVxeTable } from '@/hooks'
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
  avatar?: string
}

// ==================== 示例数据 ====================
const generateMockData = (count: number): UserData[] => {
  const roles = ['管理员', '编辑', '查看者', '访客']
  const statuses: UserData['status'][] = ['active', 'inactive', 'pending']
  const data: UserData[] = []

  for (let i = 1; i <= count; i++) {
    data.push({
      id: i,
      name: `用户 ${i}`,
      email: `user${i}@example.com`,
      age: 20 + Math.floor(Math.random() * 40),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      role: roles[Math.floor(Math.random() * roles.length)],
      createdAt: new Date(
        Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000
      ).toLocaleDateString(),
    })
  }

  return data
}

// 初始数据
const tableData = ref<UserData[]>(generateMockData(50))
const loading = ref<boolean>(false)

// ==================== 列配置 ====================
const columns: VxeTableColumn<UserData>[] = [
  {
    field: 'id',
    header: 'ID',
    width: 80,
    sortable: true,
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
    width: 200,
    sortable: false,
  },
  {
    field: 'age',
    header: '年龄',
    width: 100,
    sortable: true,
  },
  {
    field: 'role',
    header: '角色',
    width: 120,
    sortable: true,
  },
  {
    field: 'status',
    header: '状态',
    width: 120,
    sortable: true,
    body: (rowData: UserData) => {
      const statusMap: Record<UserData['status'], { label: string; class: string }> = {
        active: { label: '活跃', class: 'color-successColor' },
        inactive: { label: '禁用', class: 'color-dangerColor' },
        pending: { label: '待审核', class: 'color-warnColor' },
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

// ==================== 表格 Ref 管理 ====================
const tableRef = ref<any>(null)

// ==================== 使用 useVxeTable Hook ====================
const { selectedRows: _selectedRows, getTotalRecords } = useVxeTable<UserData>({
  tableRef,
  idField: 'id',
})

// ==================== 布局控制状态 ====================
// 头部控制
const showHeader = ref<boolean>(true)
const globalFilter = ref<boolean>(true)
const exportable = ref<boolean>(true)

// 底部控制
const showFooter = ref<boolean>(true)
const footerMode = ref<'custom' | 'column-aligned'>('custom')

// 分页控制
const pagination = ref<boolean>(true)
const paginatorPosition = ref<'left' | 'center' | 'right'>('right')

// ==================== 底部列对齐模式配置 ====================
// 为列对齐模式添加 customFooter
const columnsWithFooter = ref<VxeTableColumn<UserData>[]>([
  {
    field: 'id',
    header: 'ID',
    width: 80,
    sortable: true,
    customFooter: params => {
      return <div class="full center">ID列底部 (共{params.rows.length}行)</div>
    },
  },
  {
    field: 'name',
    header: '姓名',
    minWidth: 200,
    sortable: true,
    customFooter: _params => {
      return <div class="full center">姓名列底部</div>
    },
  },
  {
    field: 'email',
    header: '邮箱',
    minWidth: 250,
    sortable: false,
    customFooter: _params => {
      return <div class="full center">邮箱列底部</div>
    },
  },
  {
    field: 'age',
    header: '年龄',
    minWidth: 100,
    sortable: true,
    customFooter: params => {
      const avgAge =
        params.rows.length > 0
          ? Math.round(params.rows.reduce((sum, r) => sum + r.row.age, 0) / params.rows.length)
          : 0
      return <div class="full center">平均年龄: {avgAge}</div>
    },
  },
  {
    field: 'role',
    header: '角色',
    minWidth: 180,
    sortable: true,
    customFooter: _params => {
      return <div class="full center">角色列底部</div>
    },
  },
  {
    field: 'status',
    header: '状态',
    minWidth: 180,
    sortable: true,
    customFooter: params => {
      const activeCount = params.rows.filter(r => r.row.status === 'active').length
      return <div class="full center">活跃: {activeCount}</div>
    },
  },
  {
    field: 'createdAt',
    header: '创建时间',
    minWidth: 200,
    sortable: true,
    customFooter: _params => {
      return <div class="full center">创建时间列底部</div>
    },
  },
])

// 根据 footerMode 选择使用的列配置
const currentColumns = computed(() => {
  return footerMode.value === 'column-aligned' ? columnsWithFooter.value : columns
})

// ==================== 处理函数 ====================
const handleShowAlert = (message: string) => {
  alert(message)
}

// ==================== 计算属性 ====================
const totalCount = computed(() => getTotalRecords())
</script>

<template lang="pug">
.between-col.justify-start.gap-gapl
  // 控制面板（吸顶区域）
  .bg-bg200.p-padding.rounded-rounded.px-padding.between-col.items-start.sticky.top-0.z-2.gap-gaps.z-9999
    b VxeTable 布局控制示例
    .fs-appFontSizes 展示表格头部、底部、分页器等组件的使用和显示控制
    .between.items-start.gap-gap.w-full
      .full.grid.grid-cols-1.gap-gap(class='sm:grid-cols-2 lg:grid-cols-3')
        // 头部设置
        .between-col.c-border-primary.p-paddings.rounded-rounded
          .fs-appFontSizes.color-accent100 头部设置 (HeaderSetting)
          .between-col.gap-gap
            .between-start.gap-gap
              Checkbox(v-model='showHeader', :binary='true', input-id='showHeader')
              label.fs-appFontSizes.cursor-pointer(for='showHeader') 显示头部
            .between-start.gap-gap
              Checkbox(v-model='globalFilter', :binary='true', input-id='globalFilter')
              label.fs-appFontSizes.cursor-pointer(for='globalFilter') 全局搜索
            .between-start.gap-gap
              Checkbox(v-model='exportable', :binary='true', input-id='exportable')
              label.fs-appFontSizes.cursor-pointer(for='exportable') 导出按钮

        // 底部设置
        .between-col.c-border-primary.p-paddings.rounded-rounded
          .fs-appFontSizes.color-accent100 底部设置 (FooterSetting)
          .between-col.gap-gap
            .between-start.gap-gap
              Checkbox(v-model='showFooter', :binary='true', input-id='showFooter')
              label.fs-appFontSizes.cursor-pointer(for='showFooter') 显示底部
            .between-start.gap-gap.items-center
              label.fs-appFontSizes.mr-2 底部模式:
              select.c-border-primary.p-paddings.rounded-rounded.fs-appFontSizes(
                v-model='footerMode'
              )
                option(value='custom') 完全自定义
                option(value='column-aligned') 列对齐模式

        // 分页设置
        .between-col.c-border-primary.p-paddings.rounded-rounded
          .fs-appFontSizes.color-accent100 分页设置 (PaginationSetting)
          .between-col.gap-gap
            .between-start.gap-gap
              Checkbox(v-model='pagination', :binary='true', input-id='pagination')
              label.fs-appFontSizes.cursor-pointer(for='pagination') 显示分页
            .between-start.gap-gap.items-center
              label.fs-appFontSizes.mr-2 分页器位置:
              select.c-border-primary.p-paddings.rounded-rounded.fs-appFontSizes(
                v-model='paginatorPosition'
              )
                option(value='left') 左侧
                option(value='center') 居中
                option(value='right') 右侧

  // 表格容器
  .c-border-accent.p-paddingl
    VxeTable(
      ref='tableRef',
      :data='tableData',
      :columns='currentColumns',
      :loading='loading',
      :show-header='showHeader',
      :show-footer='showFooter',
      :footer-mode='footerMode',
      :pagination='pagination',
      :paginator-position='paginatorPosition',
      :global-filter='globalFilter',
      :exportable='exportable',
      :selectable='true',
      selection-mode='multiple',
      :row-selectable='true',
      :show-gridlines='true',
      :striped-rows='true'
    )
      template(#header-left='{ selectedRows }')
        .between-start.gap-gap
          span.fs-appFontSizes 共 {{ totalCount }} 条数据
          span.fs-appFontSizes(v-if='selectedRows && selectedRows.length > 0') 已选择 {{ selectedRows.length }} 条
          Button(
            label='批量操作',
            severity='secondary',
            size='small',
            :disabled='!selectedRows || selectedRows.length === 0',
            @click='() => handleShowAlert(`已选择 ${selectedRows?.length || 0} 条数据`)'
          )

      template(v-if='footerMode === "custom"', #footer='{ data, selectedRows }')
        .between.bg-bg200.gap-gaps.fs-appFontSizes
          Button(
            label='批量操作',
            severity='secondary',
            size='small',
            :disabled='!selectedRows || selectedRows.length === 0',
            @click='() => handleShowAlert(`已选择 ${selectedRows?.length || 0} 条数据`)'
          )
          b.color-primary100 {{ data?.length ?? 0 }} 条数据

  // 说明文档
  .c-card-accent.fs-appFontSizes.between-col.justify-start.items-start.gap-gap
    b.fs-appFontSizex 使用说明
    .between-col.gap-gap
      div
        b 头部组件 (HeaderSetting):
        .fs-appFontSizes
          | showHeader: 控制头部显示/隐藏
        .fs-appFontSizes
          | globalFilter: 控制全局搜索功能
        .fs-appFontSizes
          | exportable: 控制导出按钮显示
        .fs-appFontSizes
          | #header-left: 头部左侧自定义插槽，可接收 data、selectedRows、columnWidths 参数

      div
        b 底部组件 (FooterSetting):
        .fs-appFontSizes
          | showFooter: 控制底部显示/隐藏
        .fs-appFontSizes
          | footerMode: 底部模式，支持 'custom'（完全自定义）和 'column-aligned'（列对齐）
        .fs-appFontSizes
          | #footer: 完全自定义模式下的插槽，可接收 data、selectedRows、columnWidths 参数
        .fs-appFontSizes
          | column.customFooter: 列对齐模式下，每列可配置 customFooter 函数来渲染底部内容

      div
        b 分页器 (PaginationSetting):
        .fs-appFontSizes
          | pagination: 控制分页器显示/隐藏
        .fs-appFontSizes
          | paginatorPosition: 控制分页器位置，支持 'left'、'center'、'right'

      div
        b 内容部分:
        .fs-appFontSizes 表格主体使用 PrimeVue DataTable 组件
        .fs-appFontSizes 支持选择、排序、筛选等功能
        .fs-appFontSizes 数据通过 :data 和 :columns 属性传入
</template>
