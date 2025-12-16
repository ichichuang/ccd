<script setup lang="tsx">
import type { TableSizeConfig, VxeTableColumn } from '@/components/modules/vxe-table'
import { ref } from 'vue'

interface ScrollRow {
  id: number
  name: string
  email: string
  index: number
  createdAt: string
}

// 表格列配置
const columns: VxeTableColumn<ScrollRow>[] = [
  {
    field: 'id',
    header: 'ID',
    width: 80,
    sortable: true,
  },
  {
    field: 'name',
    header: '姓名',
    minWidth: 160,
    sortable: true,
  },
  {
    field: 'email',
    header: '邮箱',
    minWidth: 220,
    sortable: false,
  },
  {
    field: 'index',
    header: '索引',
    width: 100,
    sortable: true,
    align: 'right',
  },
  {
    field: 'createdAt',
    header: '创建时间',
    minWidth: 180,
    sortable: false,
  },
]

// 尺寸配置：固定高度 400px，内部滚动
const sizeConfig: TableSizeConfig = {
  widthMode: 'auto',
  heightMode: 'fixed',
  height: '400px',
  columnWidthMode: 'auto',
}

// 触底触发次数（用于调试和 UI 反馈）
const bottomTriggerCount = ref(0)

// API 配置
const apiConfig = {
  api: '/table/list',
  type: 'get' as const,
  params: {},
  mode: 'infinite' as const,
  infinite: {
    pageSize: 20,
  },
  immediate: true,
}

// 由 VxeTable 内部触底事件驱动（仅用于统计，实际加载由组件内部处理）
const handleScrollBottom = (event: any) => {
  console.log('[example-vxe-table-scroll] scroll-bottom', event)
  bottomTriggerCount.value += 1
}
</script>

<template lang="pug">
.between-col.justify-start.gap-gapl
  // 吸顶说明区域
  .bg-bg200.p-padding.rounded-rounded.px-padding.between-col.items-start.sticky.top-0.z-2.gap-gaps.z-9999
    b.fs-appFontSizex VxeTable 无限滚动加载示例（API 模式）
    .fs-appFontSizes.color-text2
      | 固定高度 400px，使用 api 配置的无限滚动模式（mode: "infinite"），组件内部自动处理数据加载。
    .fs-appFontSizes.color-text2
      | 配置方式：api="/table/list", type="get", params={}, mode="infinite"，组件内部根据 type 调用对应的 HTTP 方法。
    .fs-appFontSizes.color-text2
      | 初始加载 20 条数据，滑动到底部自动请求下一页，直到加载完 100 条数据。
    .fs-appFontSizes.color-text2
      | 后端接口：GET /table/list?page=1&pageSize=20，返回常规分页结构（list / page / pageSize / total / hasNext）。

  // 表格容器
  .p-padding
    .c-border-accent.rounded-rounded.p-paddingl
      VxeTable(
        :columns='columns',
        :size-config='sizeConfig',
        :size='"normal"',
        :pagination='false',
        :scrollable='true',
        :show-gridlines='true',
        :striped-rows='true',
        :api='apiConfig',
        @scroll-bottom='handleScrollBottom'
      )
        template(#header-left='{ data }')
          .between-start.gap-gap
            span.fs-appFontSizes 共 100 条数据（当前已加载 {{ data?.length ?? 0 }} 条）

      // 状态提示
      .mt-paddings.between-col.items-center.gap-gap
        span.fs-appFontSizes.color-text3 触底触发次数：{{ bottomTriggerCount }}

  // 说明文档
  .c-card-accent.fs-appFontSizes.between-col.justify-start.items-start.gap-gap
    b.fs-appFontSizex 使用说明
    .between-col.gap-gap
      span 固定高度：通过 TableSizeConfig 将 heightMode 设置为 fixed，高度 400px，表格内部产生滚动条。
      span API 模式：使用 api 配置，传入 api（接口路径）、type（请求方法，默认 post）、params（请求参数）、mode（设置为 "infinite"）。
      span 请求方法：组件内部根据 type 自动调用对应的 HTTP 方法（get/post/put/patch/delete/head）。
      span 后端分页：接口返回 list / page / pageSize / total / hasNext 等常规分页字段。
      span 无限滚动：组件内部监听 scroll-bottom 事件，自动调用接口加载下一页并追加数据。
      span 结束判断：当返回的 hasNext 为 false 或 list.length < pageSize 时，停止自动加载。
</template>

<style lang="scss" scoped></style>
