<script setup lang="tsx">
import type { VxeTableColumn } from '@/components/modules/vxe-table'
import { computed, ref } from 'vue'

interface DemoRow {
  id: number
  name: string
  email: string
  city: string
  role: string
  status: 'active' | 'inactive'
  joinDate: string
}

const roles = ['管理员', '编辑', '访客', '审计员']
const statuses: DemoRow['status'][] = ['active', 'inactive']

const generateRows = (count: number): DemoRow[] =>
  Array.from({ length: count }).map((_, idx) => ({
    id: idx + 1,
    name: `用户 ${idx + 1}`,
    email: `user${idx + 1}@demo.com`,
    city: ['北京', '上海', '深圳', '杭州'][idx % 4],
    role: roles[idx % roles.length],
    status: statuses[idx % statuses.length],
    joinDate: new Date(Date.now() - Math.random() * 360 * 24 * 60 * 60 * 1000).toLocaleDateString(),
  }))

const data = ref<DemoRow[]>(generateRows(30))

// 控制项
const bordered = ref(true)
const showGridlines = ref(true) // 横纵分割线
const stripedRows = ref(true) // 斑马纹
const customColor = ref(true) // 自定义颜色方案
const freezeLeft = ref(true)
const freezeRight = ref(true)
const freezeSelectionLeft = ref(false)
const freezeSelectionRight = ref(false)

const tableRef = ref<any>(null)

// 列定义（根据冻结开关动态调整）
const baseColumns: VxeTableColumn<DemoRow>[] = [
  { field: 'id', header: 'ID', width: 80 },
  { field: 'name', header: '姓名', minWidth: 140, sortable: true },
  { field: 'email', header: '邮箱', minWidth: 220 },
  { field: 'city', header: '城市', width: 100, minWidth: 100 },
  { field: 'role', header: '角色', width: 100, minWidth: 100 },
  {
    field: 'status',
    header: '状态',
    width: 120,
    minWidth: 120,
    body: row => {
      const map: Record<DemoRow['status'], { label: string; cls: string }> = {
        active: { label: '活跃', cls: 'color-successColor' },
        inactive: { label: '禁用', cls: 'color-dangerColor' },
      }
      const info = map[row.status]
      return <span class={info.cls}>{info.label}</span>
    },
  },
  { field: 'joinDate', header: '加入时间', width: 160 },
]

const columns = computed<VxeTableColumn<DemoRow>[]>(() => {
  const cols: VxeTableColumn<DemoRow>[] = baseColumns.map(col => ({ ...col }))

  // 固定首列
  const first = cols[0]
  first.frozen = freezeLeft.value
  first.alignFrozen = 'left'

  // 固定右侧操作列
  cols.push({
    field: 'actions',
    header: '操作',
    width: 180,
    minWidth: 160,
    frozen: freezeRight.value,
    alignFrozen: 'right',
    body: row => (
      <div class="between gap-2">
        <button
          class="c-card-primary py-paddings c-border"
          onClick={() => alert(`查看 ${row.name}`)}
        >
          查看
        </button>
        <button
          class="c-card-primary py-paddings c-border"
          onClick={() => alert(`编辑 ${row.name}`)}
        >
          编辑
        </button>
      </div>
    ),
  })

  return cols
})

const tableClass = computed(() => {
  const cls: string[] = []
  if (bordered.value) {
    cls.push('c-border-accent')
  }
  if (customColor.value) {
    cls.push('bg-accent100 color-primary100')
  }
  return cls.join(' ')
})

const selectionFrozen = computed(() => freezeSelectionLeft.value || freezeSelectionRight.value)
const selectionAlignFrozen = computed(() => (freezeSelectionRight.value ? 'right' : 'left'))
</script>

<template lang="pug">
.between-col.gap-gapl
  // 控制面板
  .bg-bg200.p-padding.rounded-rounded.between-col.gap-gap
    b.fs-appFontSizex 表格样式控制示例
    .fs-appFontSizes 展示边框、分割线、自定义颜色以及冻结列
    .grid.gap-gap.grid-cols-1(class='md:grid-cols-2 lg:grid-cols-3')
      .between-start.gap-gap
        Checkbox(v-model='bordered', :binary='true', input-id='bordered')
        label.fs-appFontSizes.cursor-pointer(for='bordered') 显示外边框
      .between-start.gap-gap
        Checkbox(v-model='showGridlines', :binary='true', input-id='gridlines')
        label.fs-appFontSizes.cursor-pointer(for='gridlines') 显示纵向分割线
      .between-start.gap-gap
        Checkbox(v-model='stripedRows', :binary='true', input-id='striped')
        label.fs-appFontSizes.cursor-pointer(for='striped') 显示斑马纹
      .between-start.gap-gap
        Checkbox(v-model='customColor', :binary='true', input-id='customColor')
        label.fs-appFontSizes.cursor-pointer(for='customColor') 自定义背景/边框色
      .between-start.gap-gap
        Checkbox(v-model='freezeLeft', :binary='true', input-id='freezeLeft')
        label.fs-appFontSizes.cursor-pointer(for='freezeLeft') 固定首列在最左侧
      .between-start.gap-gap
        Checkbox(v-model='freezeRight', :binary='true', input-id='freezeRight')
        label.fs-appFontSizes.cursor-pointer(for='freezeRight') 固定操作列在最右侧
      .between-start.gap-gap
        Checkbox(v-model='freezeSelectionLeft', :binary='true', input-id='freezeSelLeft')
        label.fs-appFontSizes.cursor-pointer(for='freezeSelLeft') 固定复选列在左侧
      .between-start.gap-gap
        Checkbox(v-model='freezeSelectionRight', :binary='true', input-id='freezeSelRight')
        label.fs-appFontSizes.cursor-pointer(for='freezeSelRight') 固定复选列在右侧

  // 表格展示
  .p-padding.c-border.rounded-rounded
    VxeTable(
      ref='tableRef',
      :data='data',
      :columns='columns',
      :show-gridlines='showGridlines',
      :striped-rows='stripedRows',
      :selectable='true',
      selection-mode='multiple',
      :selection-frozen='selectionFrozen',
      :selection-align-frozen='selectionAlignFrozen',
      :show-header='true',
      :class='tableClass',
      :pagination='false'
    )
      template(#header-left='{ selectedRows }')
        .between-start.gap-gap
          span.fs-appFontSizes 总行数: {{ data.length }}
          span.fs-appFontSizes(v-if='selectedRows?.length') 已选 {{ selectedRows.length }} 行

  // 说明
  .c-card-accent.between-col.gap-gap.fs-appFontSizes
    b.fs-appFontSizex 使用说明
    .between-col.gap-gap
      span 边框: 通过 toggles 控制容器是否应用 UnoCSS 边框类
      span 分割线: 对应 PrimeVue DataTable 的 showGridlines
      span 斑马纹: 对应 stripedRows
      span 自定义颜色: 应用自定义背景/边框色类
      span 冻结列: 利用 Column 的 frozen 和 alignFrozen 支持左右固定
</template>
