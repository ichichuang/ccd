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
.between-col.gap-gapl
  // 单元格编辑（列级控制）
  .p-paddings.rounded-rounded.between-col.gap-gap
    b.fs-appFontSizex 单元格编辑（列可编辑）
    .fs-appFontSizes.color-text2 设置 editMode="cell" 并在列上用 editable + editorRenderer 定义编辑器
    VxeTable(
      :data='editableData',
      :columns='editableColumns',
      :editable='true',
      edit-mode='cell',
      :show-gridlines='true',
      :striped-rows='true'
    )
</template>
