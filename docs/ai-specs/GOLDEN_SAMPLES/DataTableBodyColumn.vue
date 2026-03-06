<!--
  黄金样本：DataTable 列 body 自定义渲染（必须 lang="tsx" + JSX 返回 VNode）
  参考自 src/views/example/data-table/configs/customColumnConfig.tsx
  AI 生成 DataTable 列 body / filterRenderer / editorRenderer / customFooter 时请严格模仿。
  关键点：
  1. 必须 <script setup lang="tsx">，不能 lang="ts"
  2. body 必须用 JSX 返回 VNode：return <span class={cls}>{text}</span>
  3. 禁止 return `<span class="${cls}">${text}</span>`（模板字符串返回 string，非 VNode）
  详见 .cursor/rules/27-ai-tsx-decision.mdc、docs/ai-specs/AI_CODING_PROTOCOL.md
-->
<script setup lang="tsx">
import { DataTable } from '@/components/DataTable'
import type { DataTableColumn } from '@/components/DataTable'

interface RecordType {
  id: number
  name: string
  status: 'active' | 'inactive' | 'pending'
}

const statusMap: Record<RecordType['status'], string> = {
  active: '活跃',
  inactive: '已停用',
  pending: '待审核',
}

const columns: DataTableColumn<RecordType>[] = [
  { field: 'id', header: 'ID', width: 80 },
  { field: 'name', header: '名称' },
  {
    field: 'status',
    header: '状态',
    body: row => {
      const cls =
        row.status === 'active'
          ? 'bg-success/20 text-success'
          : row.status === 'inactive'
            ? 'bg-muted text-muted-foreground'
            : 'bg-warn/20 text-warn'
      return (
        <span class={`inline-flex px-padding-sm py-padding-xs rounded-full fs-xs ${cls}`}>
          {statusMap[row.status]}
        </span>
      )
    },
  },
]

const data: RecordType[] = [
  { id: 1, name: '示例 A', status: 'active' },
  { id: 2, name: '示例 B', status: 'inactive' },
  { id: 3, name: '示例 C', status: 'pending' },
]
</script>

<template>
  <DataTable
    :columns="columns"
    :data="data"
  />
</template>
