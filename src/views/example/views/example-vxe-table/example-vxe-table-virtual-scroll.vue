<script setup lang="tsx">
import type {
  TableSizeConfig,
  VxeTableColumn,
  VxeVirtualScrollerOptions,
} from '@/components/modules/vxe-table'
import { ref, watch } from 'vue'

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

// 生成大量数据用于虚拟滚动演示
const tableData = ref<UserData[]>(generateMockData(10000))
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

// ==================== 尺寸配置 ====================
const sizeConfig = ref<TableSizeConfig>({
  widthMode: 'auto',
  heightMode: 'fixed',
  height: '500px',
  columnWidthMode: 'fixed',
})

// ==================== 虚拟滚动配置 ====================
const virtualScrollerOptions = ref<VxeVirtualScrollerOptions>({
  itemSize: 50, // 行高（必需）
  orientation: 'vertical',
  lazy: false,
  showLoader: false,
  numToleratedItems: 3,
})

// ==================== 功能配置状态 ====================
const enableVirtualScroll = ref<boolean>(true)
const itemSize = ref<number>(50)

// 更新虚拟滚动配置
const updateVirtualScrollOptions = () => {
  if (enableVirtualScroll.value) {
    virtualScrollerOptions.value = {
      itemSize: itemSize.value,
      orientation: 'vertical',
      lazy: false,
      showLoader: false,
      numToleratedItems: 3,
    }
  } else {
    virtualScrollerOptions.value = undefined
  }
}

// 监听配置变化
watch([enableVirtualScroll, itemSize], () => {
  updateVirtualScrollOptions()
})
</script>

<template lang="pug">
.between-col.justify-start.gap-gapl
  // 虚拟滚动示例（主容器，与 basic 保持一致结构）
  .between-col.justify-start.gap-gaps.c-border-primary.p-padding
    b VxeTable 虚拟滚动示例
    .fs-appFontSizes 展示 VxeTable 组件的虚拟滚动功能，适用于大数据量场景
    .between.items-start.gap-gap.w-full
      .flex-1.grid.grid-cols-1.gap-gap(class='sm:grid-cols-2 lg:grid-cols-3')
        .between-col
          .fs-appFontSizes.color-accent100 虚拟滚动
          .between-start.gap-gap
            Button(
              size='small',
              :severity='enableVirtualScroll ? "primary" : "secondary"',
              @click='() => (enableVirtualScroll = !enableVirtualScroll)'
            ) {{ enableVirtualScroll ? '已启用' : '已禁用' }}

        .between-col
          .fs-appFontSizes.color-accent100 行高 (itemSize)
          .between-start.gap-gap
            input(
              type='number',
              v-model.number='itemSize',
              min='30',
              max='100',
              step='5',
              :disabled='!enableVirtualScroll',
              style='width: 80px; padding: 4px 8px; border: 1px solid var(--border-color); border-radius: 4px'
            )
            span.fs-appFontSizes px

        .between-col
          .fs-appFontSizes.color-accent100 数据量
          .between-start.gap-gap
            span.fs-appFontSizes {{ tableData.length.toLocaleString() }} 条

      .flex-1
        div
          .fs-appFontSizes.color-accent100 当前配置
          .c-border-primary.p-padding.fs-appFontSizes
            div
              span 虚拟滚动:
              b.ml-1 {{ enableVirtualScroll ? '启用' : '禁用' }}
            .mt-1(v-if='enableVirtualScroll')
              span 行高:
              b.ml-1 {{ itemSize }}px
            .mt-1
              span 表格高度:
              b.ml-1 {{ sizeConfig.height }}
            .mt-1
              span 数据量:
              b.ml-1 {{ tableData.length.toLocaleString() }} 条

    // 使用说明
    .c-border-accent.p-padding.fs-appFontSizes
      div
        b 使用说明：
      ul.mt-1
        li
          strong 虚拟滚动：
          | 适用于大数据量场景（通常 1000+ 条），可以显著提升渲染性能
        li
          strong 开启条件：
          | 需要同时设置
          code scrollable=true
          | 和
          code scrollHeight
          | 为固定值
        li
          strong 核心参数：
          |
          code itemSize
          | （行高，必需）必须与实际行高匹配，否则会出现滚动位置偏移
        li
          strong 性能对比：
          | 启用虚拟滚动后，即使有 10000 条数据，也能保持流畅的滚动体验

    // 表格
    .h-500
      VxeTable(
        :data='tableData',
        :columns='columns',
        :loading='loading',
        :pagination='false',
        :sortable='true',
        :scrollable='true',
        :size-config='sizeConfig',
        :virtual-scroller-options='virtualScrollerOptions',
        :show-gridlines='true',
        :striped-rows='true'
      )
        template(#header-left='{ data }')
          .between-start.gap-gap
            span.fs-appFontSizes 共 {{ data?.length?.toLocaleString() ?? 0 }} 条数据
            span.fs-appFontSizes
              | 虚拟滚动: {{ enableVirtualScroll ? '已启用' : '已禁用' }}

  // 说明文档（独立说明卡片）
  .c-border-accent.p-padding.fs-appFontSizes.between-col.justify-start.items-start.gap-gap
    b.fs-appFontSizex 虚拟滚动功能说明
    .between-col.gap-gaps
      div
        b 功能概述：
        ul
          li 虚拟滚动（Virtual Scrolling）是一种性能优化技术
          li 只渲染可见区域的行，而不是渲染所有数据
          li 适用于大数据量场景（通常 1000+ 条数据）
          li 可以显著提升表格的渲染性能和滚动流畅度

      div
        b 开启条件：
        ul
          li 必须设置
            code scrollable=true
            | （启用滚动）
          li 必须设置
            code scrollHeight
            | 为固定值（通过
            code sizeConfig.heightMode='fixed'
            | 或
            code sizeConfig.heightMode='fill'
            | ）
          li 必须设置
            code virtualScrollerOptions.itemSize
            | （行高，必需参数）

      div
        b 核心参数（virtualScrollerOptions）：
        ul
          li
            code itemSize:
            | 每行的高度（像素），必需参数，必须与实际行高匹配
          li
            code orientation:
            | 滚动方向，可选值：
            code 'vertical'
            | （垂直）、
            code 'horizontal'
            | （水平）、
            code 'both'
            | （双向）
          li
            code lazy:
            | 是否懒加载，默认
            code false
          li
            code showLoader:
            | 是否显示加载器，默认
            code false
          li
            code numToleratedItems:
            | 容差项目数，用于优化渲染，默认
            code 3

      div
        b 使用建议：
        ul
          li 数据量小于 1000 条时，不建议使用虚拟滚动（可能影响性能）
          li 数据量大于 1000 条时，强烈建议启用虚拟滚动
          li
            code itemSize
            | 必须与实际行高匹配，否则会出现滚动位置偏移
          li 如果行高不固定，可以使用
            code autoSize
            | 选项（如果 PrimeVue 支持）

      div
        b 性能对比：
        ul
          li
            strong 不使用虚拟滚动：
            | 10000 条数据会渲染 10000 个 DOM 节点，可能导致页面卡顿
          li
            strong 使用虚拟滚动：
            | 10000 条数据只渲染可见区域的约 20-30 个 DOM 节点，性能大幅提升
          li 滚动流畅度：虚拟滚动 > 普通滚动（大数据量场景）

      div
        b 注意事项：
        ul
          li 虚拟滚动与分页功能互斥，启用虚拟滚动时应关闭分页
          li
            code itemSize
            | 必须准确，建议通过实际测量确定行高
          li 如果表格行高不固定，虚拟滚动可能不适用
          li 虚拟滚动会影响某些交互功能（如行选择、行编辑等），需要测试验证
</template>
