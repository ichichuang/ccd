<script setup lang="tsx">
import type { VxeTableColumn } from '@/components/modules/vxe-table'
import { ref } from 'vue'

interface AdvancedRow {
  id: number
  name: string
  email: string
  dept: string
  status: 'active' | 'inactive'
  remark: string
}

const departments = ['研发', '产品', '市场', '运营']
const statuses: AdvancedRow['status'][] = ['active', 'inactive']

const makeRow = (idx: number): AdvancedRow => ({
  id: idx + 1,
  name: `用户 ${idx + 1}`,
  email: `adv${idx + 1}@demo.com`,
  dept: departments[idx % departments.length],
  status: statuses[idx % statuses.length],
  remark: `备注信息 ${idx + 1}`,
})

// 数据集：单元格编辑（基于列可编辑配置）
const editableData = ref<AdvancedRow[]>(Array.from({ length: 30 }).map((_, i) => makeRow(i)))
const editableColumns: VxeTableColumn<AdvancedRow>[] = [
  {
    field: 'name',
    header: '姓名',
    width: 160,
    minWidth: 160,
    maxWidth: 160,
    sortable: true,
    editable: true,
    editorRenderer: ({ data }) => (
      <div class="full py-paddings">
        <input
          v-model={(data as any).name}
          class="full c-border rounded-rounded"
          placeholder="请输入姓名"
        />
      </div>
    ),
  },
  { field: 'email', header: '邮箱', minWidth: 220, sortable: true },
  { field: 'dept', header: '部门', width: 140, sortable: true },
  {
    field: 'status',
    header: '状态',
    width: 120,
    sortable: true,
    editable: true,
    body: row => (
      <span class={row.status === 'active' ? 'color-successColor' : 'color-dangerColor'}>
        {row.status === 'active' ? '在岗' : '离岗'}
      </span>
    ),
    editorRenderer: ({ data }) => (
      <select
        v-model={(data as any).status}
        class="c-border rounded-rounded p-paddings"
      >
        <option value="active">在岗</option>
        <option value="inactive">离岗</option>
      </select>
    ),
  },
  {
    field: 'remark',
    header: '备注',
    minWidth: 200,
    editable: true,
    editorRenderer: ({ data }) => (
      <input
        v-model={(data as any).remark}
        class="c-border rounded-rounded p-paddings"
        placeholder="请输入备注"
      />
    ),
  },
]
</script>

<template lang="pug">
.between-col.justify-start.gap-gapl
  // 单元格编辑示例（主容器，与 basic 保持一致结构）
  .between-col.justify-start.gap-gaps.c-border-primary.p-padding
    b.fs-appFontSizex VxeTable 高级编辑示例（列级单元格编辑）
    .fs-appFontSizes.color-text2
      | 通过列上的 editable 与 editorRenderer 配置，实现基于列的单元格编辑能力。
    .fs-appFontSizes.color-text2
      | 表格设置 editMode="cell"，在 editorRenderer 中可自由使用任意表单控件（input/select 等）。
    VxeTable(
      :data='editableData',
      :columns='editableColumns',
      :editable='true',
      edit-mode='cell',
      :show-gridlines='true',
      :striped-rows='true'
    )

  // 说明文档（独立说明卡片）
  .c-border-accent.p-padding.fs-appFontSizes.between-col.justify-start.items-start.gap-gap
    b.fs-appFontSizex 使用说明
    .between-col.gap-gaps
      div
        b 基本概念：
        ul
          li
            strong 列可编辑：
            | 在列配置中开启 editable，并通过 editorRenderer 渲染自定义编辑器内容。
          li
            strong 编辑模式：
            | 表格层面设置 editMode="cell"，即可启用单元格级编辑交互。
          li
            strong 交互行为：
            | 点击单元格进入编辑态，失焦或确认后提交到当前行数据（示例中直接使用 v-model 绑定到 data）。
</template>
