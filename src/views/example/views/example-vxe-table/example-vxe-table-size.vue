<script setup lang="tsx">
import type { TableSizeConfig, VxeTableColumn } from '@/components/modules/vxe-table'
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
const tableData = ref<UserData[]>(generateMockData(30))
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

// ==================== 尺寸配置状态 ====================
const currentSizeConfig = ref<TableSizeConfig>({
  widthMode: 'auto',
  heightMode: 'fill',
  columnWidthMode: 'auto',
})

const currentSize = ref<'small' | 'normal' | 'large'>('normal')

// ==================== 处理函数 ====================
const setWidthMode = (mode: 'auto' | 'fixed') => {
  currentSizeConfig.value = {
    ...currentSizeConfig.value,
    widthMode: mode,
    // 当切换到 fixed 模式时，如果没有设置 width，设置默认值
    ...(mode === 'fixed' && !currentSizeConfig.value.width ? { width: '800px' } : {}),
    // 当切换到非 fixed 模式时，清除 width
    ...(mode !== 'fixed' ? { width: undefined } : {}),
  }
}

const setHeightMode = (mode: 'fill' | 'auto' | 'fixed') => {
  currentSizeConfig.value = {
    ...currentSizeConfig.value,
    heightMode: mode,
    // 当切换到 fixed 模式时，如果没有设置 height，设置默认值
    ...(mode === 'fixed' && !currentSizeConfig.value.height ? { height: '400px' } : {}),
    // 当切换到非 fixed 模式时，清除 height
    ...(mode !== 'fixed' ? { height: undefined } : {}),
  }
}

const setColumnWidthMode = (mode: 'auto' | 'fixed' | 'equal') => {
  currentSizeConfig.value = {
    ...currentSizeConfig.value,
    columnWidthMode: mode,
  }
}

const setSize = (size: 'small' | 'normal' | 'large') => {
  currentSize.value = size
}
</script>

<template lang="pug">
.between-col.justify-start.gap-gapl
  // 尺寸控制示例（主容器，与 basic 保持一致结构）
  .between-col.justify-start.gap-gaps.c-border-primary.p-padding
    b VxeTable 尺寸控制示例
    .fs-appFontSizes 展示 VxeTable 组件的各种尺寸控制配置
    .between.items-start.gap-gap.w-full
      .full.grid.grid-cols-1.gap-gap(class='sm:grid-cols-2 lg:grid-cols-4')
        .between-col
          .fs-appFontSizes.color-accent100 宽度模式
          .between-start.gap-gap
            Button(
              size='small',
              :severity='currentSizeConfig.widthMode === "auto" ? "primary" : "secondary"',
              @click='() => setWidthMode("auto")'
            ) 自适应
            Button(
              size='small',
              :severity='currentSizeConfig.widthMode === "fixed" ? "primary" : "secondary"',
              @click='() => setWidthMode("fixed")'
            ) 固定

        .between-col
          .fs-appFontSizes.color-accent100 高度模式
          .between-start.gap-gap
            Button(
              size='small',
              :severity='currentSizeConfig.heightMode === "fill" ? "primary" : "secondary"',
              @click='() => setHeightMode("fill")'
            ) 撑满
            Button(
              size='small',
              :severity='currentSizeConfig.heightMode === "auto" ? "primary" : "secondary"',
              @click='() => setHeightMode("auto")'
            ) 自适应
            Button(
              size='small',
              :severity='currentSizeConfig.heightMode === "fixed" ? "primary" : "secondary"',
              @click='() => setHeightMode("fixed")'
            ) 固定

        .between-col
          .fs-appFontSizes.color-accent100 列宽模式
          .between-start.gap-gap
            Button(
              size='small',
              :severity='currentSizeConfig.columnWidthMode === "auto" ? "primary" : "secondary"',
              @click='() => setColumnWidthMode("auto")'
            ) 自适应
            Button(
              size='small',
              :severity='currentSizeConfig.columnWidthMode === "fixed" ? "primary" : "secondary"',
              @click='() => setColumnWidthMode("fixed")'
            ) 固定
            Button(
              size='small',
              :severity='currentSizeConfig.columnWidthMode === "equal" ? "primary" : "secondary"',
              @click='() => setColumnWidthMode("equal")'
            ) 等宽

        .between-col
          .fs-appFontSizes.color-accent100 表格尺寸
          .between-start.gap-gap
            Button(
              size='small',
              :severity='currentSize === "small" ? "primary" : "secondary"',
              @click='() => setSize("small")'
            ) Small
            Button(
              size='small',
              :severity='currentSize === "normal" ? "primary" : "secondary"',
              @click='() => setSize("normal")'
            ) Normal
            Button(
              size='small',
              :severity='currentSize === "large" ? "primary" : "secondary"',
              @click='() => setSize("large")'
            ) Large
      .flex-1
        div
          .fs-appFontSizes.color-accent100 当前配置
          .c-border-primary.p-padding.fs-appFontSizes
            pre {{ JSON.stringify(currentSizeConfig, null, 2) }}
            .mt-2
              span 表格尺寸:
              b {{ currentSize }}

    // 表格
    .h-400
      VxeTable(
        :data='tableData',
        :columns='columns',
        :loading='loading',
        :pagination='true',
        :sortable='true',
        :scrollable='true',
        :size-config='currentSizeConfig',
        :size='currentSize',
        :show-gridlines='true',
        :striped-rows='true'
      )
        template(#header-left='{ data }')
          .between-start.gap-gap
            span.fs-appFontSizes 共 {{ data?.length ?? 0 }} 条数据
            span.fs-appFontSizes
              | 配置: {{ currentSizeConfig.widthMode }}/{{ currentSizeConfig.heightMode }}/{{ currentSizeConfig.columnWidthMode }}

  // 说明文档（独立说明卡片）
  .c-border-accent.p-padding.fs-appFontSizes.between-col.justify-start.items-start.gap-gap
    b.fs-appFontSizex 尺寸控制说明
    .between-col.gap-gaps
      div
        b 容器尺寸模式：
        ul
          li
            strong fill:
            | 撑满父容器（宽度/高度设置为 100%）
          li
            strong auto:
            | 自适应内容，可根据 minWidth/maxWidth 或 minHeight/maxHeight 设置范围
          li
            strong fixed:
            | 固定尺寸，需要设置 width 或 height 属性

      div
        b 列宽模式：
        ul
          li
            strong auto:
            | 自适应内容宽度，可设置 minWidth 和 maxWidth 作为约束
          li
            strong fixed:
            | 使用列配置中指定的 width 值作为固定宽度
          li
            strong fit:
            | 平均分配列宽以适应容器，不出现横向滚动条
          li
            strong equal:
            | 所有列等宽分配

      div
        b 表格尺寸（size）：
        ul
          li
            strong small:
            | 小尺寸，自动应用 fs-appFontSizes 类名
          li
            strong normal:
            | 正常尺寸，不应用额外类名
          li
            strong large:
            | 大尺寸，自动应用 fs-appFontSizex 类名

      div
        b 默认配置：
        ul
          li 宽度模式: auto（自适应，默认 100%）
          li 高度模式: fill（撑满父容器）
          li 列宽模式: auto（自适应内容）
</template>
