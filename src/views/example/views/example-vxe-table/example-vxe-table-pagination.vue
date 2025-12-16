<script setup lang="tsx">
import type { TableSizeConfig, VxeTableColumn } from '@/components/modules/vxe-table'

interface PaginationRow {
  id: number
  name: string
  email: string
  index: number
  createdAt: string
}

// 表格列配置
const columns: VxeTableColumn<PaginationRow>[] = [
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

// 尺寸配置：自动高度
const sizeConfig: TableSizeConfig = {
  widthMode: 'auto',
  heightMode: 'auto',
  columnWidthMode: 'auto',
}

// API 配置：分页模式
const apiConfig = {
  api: '/table/list',
  type: 'get' as const,
  params: {},
  mode: 'pagination' as const,
  pagination: {
    pageSize: 10,
  },
  immediate: true,
}
</script>

<template lang="pug">
.between-col.justify-start.gap-gapl
  // 分页加载示例（主容器，与 basic 保持一致结构）
  .between-col.justify-start.gap-gaps.c-border-primary.p-padding
    b.fs-appFontSizex VxeTable 分页加载示例（API 模式）
    .fs-appFontSizes.color-text2
      | 使用 api 配置的分页模式（mode: "pagination"），组件内部自动处理分页切换和数据加载。
    .fs-appFontSizes.color-text2
      | 配置方式：api="/table/list", type="get", params={}, mode="pagination"，组件内部根据 type 调用对应的 HTTP 方法。
    .fs-appFontSizes.color-text2
      | 用户切换分页或修改每页数量时，组件自动调用接口加载对应页数据。
    .fs-appFontSizes.color-text2
      | 后端接口：GET /table/list?page=1&pageSize=20，返回常规分页结构（list / page / pageSize / total / hasNext）。

    VxeTable(
      :columns='columns',
      :size-config='sizeConfig',
      :size='"normal"',
      :pagination='true',
      :scrollable='false',
      :show-gridlines='true',
      :striped-rows='true',
      :api='apiConfig'
    )
      template(#header-left='{ data, pagination }')
        .between-start.gap-gap
          span.fs-appFontSizes 当前页数据：{{ data?.length ?? 0 }} 条
          // 使用 pagination 对象获取 API 相关信息
          span.fs-appFontSizes(v-if='pagination')
            | 第 {{ pagination.page }} 页 |
            | 每页 {{ pagination.rows }} 条 |
            | 共 {{ pagination.totalRecords }} 条

  // 说明文档（独立说明卡片）
  .c-border-accent.p-padding.fs-appFontSizes.between-col.justify-start.items-start.gap-gap
    b.fs-appFontSizex 使用说明
    .between-col.gap-gaps
      div
        b 分页模式与请求方式：
        ul
          li
            strong 分页模式：
            | 使用 api 配置，传入 api（接口路径）、type（请求方法，默认 post）、params（请求参数）、mode（设置为 "pagination"）。
          li
            strong 请求方法：
            | 组件内部根据 type 自动调用对应的 HTTP 方法（get/post/put/patch/delete/head）。

      div
        b 分页行为：
        ul
          li
            strong 自动分页：
            | 用户切换分页或修改每页数量时，组件自动调用接口加载对应页数据。
          li
            strong 后端分页：
            | 接口返回 list / page / pageSize / total / hasNext 等常规分页字段。
          li
            strong 分页配置：
            | 通过 pagination.pageSize 设置每页数量，通过 pagination.pageParam 和 pagination.pageSizeParam 自定义参数名。
</template>

<style lang="scss" scoped></style>
