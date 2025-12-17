<script setup lang="tsx">
import { Icons } from '@/components/modules/icons'
import type { VxeTableColumn } from '@/components/modules/vxe-table'
import Checkbox from 'primevue/checkbox'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import { computed, ref } from 'vue'

// ==================== 常量定义 ====================
// PrimeVue 筛选匹配模式常量（使用字符串字面量避免 ESLint 错误）
const FILTER_MATCH_MODE = {
  startsWith: 'startsWith',
  contains: 'contains',
  notContains: 'notContains',
  endsWith: 'endsWith',
  equals: 'equals',
  notEquals: 'notEquals',
  in: 'in',
  lessThan: 'lt',
  lessThanOrEqualTo: 'lte',
  greaterThan: 'gt',
  greaterThanOrEqualTo: 'gte',
  between: 'between',
  dateIs: 'dateIs',
  dateIsNot: 'dateIsNot',
  dateBefore: 'dateBefore',
  dateAfter: 'dateAfter',
} as const

// ==================== 数据类型定义 ====================
interface CustomerData {
  id: number
  name: string
  country: string
  agent: string
  status: 'qualified' | 'new' | 'negotiation' | 'unqualified' | 'renewal'
  verified: boolean
  date: string
  balance: number
}

// ==================== 示例数据 ====================
const generateMockData = (count: number): CustomerData[] => {
  const names = [
    'James Butt',
    'Josephine Darakjy',
    'Art Venere',
    'Lenna Paprocki',
    'Donette Foller',
    'Simona Morasca',
    'Mitsue Tollner',
    'Leota Dilliard',
    'Sage Wieser',
    'Kris Marrier',
  ]
  const countries = [
    'South Africa',
    'Egypt',
    'Paraguay',
    'Serbia',
    'Mexico',
    'Algeria',
    'Panama',
    'Slovenia',
  ]
  const agents = [
    'Ioni Bowcher',
    'Amy Elsner',
    'Asiya Javayant',
    'Xuxue Feng',
    'Ivan Magalhaes',
    'Onyama Limba',
    'Anna Fali',
    'Bernardo Dominic',
    'Stephen Shaw',
  ]
  const statuses: CustomerData['status'][] = [
    'qualified',
    'new',
    'negotiation',
    'unqualified',
    'renewal',
  ]
  const data: CustomerData[] = []

  for (let i = 1; i <= count; i++) {
    const name = names[Math.floor(Math.random() * names.length)]
    const country = countries[Math.floor(Math.random() * countries.length)]
    const agent = agents[Math.floor(Math.random() * agents.length)]
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    const verified = Math.random() > 0.5
    const date = new Date(
      2017 + Math.floor(Math.random() * 5),
      Math.floor(Math.random() * 12),
      Math.floor(Math.random() * 28) + 1
    )
      .toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
      .replace(/\//g, '/')
    const balance = Math.floor(Math.random() * 10000) + 10

    data.push({
      id: i,
      name: `${name} ${i}`,
      country,
      agent,
      status,
      verified,
      date,
      balance,
    })
  }

  return data
}

// 初始数据
const tableData = ref<CustomerData[]>(generateMockData(50))

// ==================== Basic 模式筛选配置 ====================
// Basic 模式（filterDisplay="row"）使用简单结构：{ field: { value, matchMode } }
const basicFilters = ref<any>({
  global: { value: null, matchMode: FILTER_MATCH_MODE.contains },
  country: { value: null, matchMode: FILTER_MATCH_MODE.contains },
  agent: { value: null, matchMode: FILTER_MATCH_MODE.equals },
  status: { value: null, matchMode: FILTER_MATCH_MODE.equals },
  verified: { value: null, matchMode: FILTER_MATCH_MODE.equals },
})

// Agent 选项（用于下拉筛选）
const agentOptions = [
  { label: 'Any', value: null },
  { label: 'Ioni Bowcher', value: 'Ioni Bowcher' },
  { label: 'Amy Elsner', value: 'Amy Elsner' },
  { label: 'Asiya Javayant', value: 'Asiya Javayant' },
  { label: 'Xuxue Feng', value: 'Xuxue Feng' },
  { label: 'Ivan Magalhaes', value: 'Ivan Magalhaes' },
  { label: 'Onyama Limba', value: 'Onyama Limba' },
  { label: 'Anna Fali', value: 'Anna Fali' },
  { label: 'Bernardo Dominic', value: 'Bernardo Dominic' },
  { label: 'Stephen Shaw', value: 'Stephen Shaw' },
]

// Status 选项（用于下拉筛选）
const statusOptions = [
  { label: 'Select One', value: null },
  { label: 'qualified', value: 'qualified' },
  { label: 'new', value: 'new' },
  { label: 'negotiation', value: 'negotiation' },
  { label: 'unqualified', value: 'unqualified' },
  { label: 'renewal', value: 'renewal' },
]

// Basic 模式列配置
const basicColumns: VxeTableColumn<CustomerData>[] = [
  {
    field: 'agent',
    header: 'Agent',
    width: 200,
    maxWidth: 200,
    minWidth: 200,
    componentsProps: {
      filter: true,
      // 固定为下拉筛选，不展示右侧筛选条件图标
      showFilterMenu: false,
    },
  },
  {
    field: 'country',
    header: 'Country',
    width: 180,
    componentsProps: {
      filter: true,
    },
  },
  {
    field: 'status',
    header: 'Status',
    width: 150,
    maxWidth: 150,
    minWidth: 150,
    componentsProps: {
      filter: true,
      // 固定为下拉筛选，不展示右侧筛选条件图标
      showFilterMenu: false,
    },
    body: (row: CustomerData) => {
      const statusColors: Record<string, string> = {
        qualified: 'bg-successColor color-successTextColor',
        new: 'bg-primaryColor color-primaryTextColor',
        negotiation: 'bg-warnColor color-warnTextColor',
        unqualified: 'bg-dangerColor color-dangerTextColor',
        renewal: 'bg-infoColor color-infoTextColor',
      }
      return (
        <span
          class={`px-paddings py-2 fs-appFontSizes rounded-rounded select-none ${statusColors[row.status] || ''}`}
        >
          {row.status}
        </span>
      )
    },
  },
  {
    field: 'verified',
    header: 'Verified',
    width: 120,
    componentsProps: {
      filter: true,
    },
    body: (row: CustomerData) => {
      return row.verified ? (
        <Icons
          name="RiCheckFill"
          class="color-successColor"
        ></Icons>
      ) : (
        <Icons
          name="RiCloseFill"
          class="color-dangerColor"
        ></Icons>
      )
    },
  },
]

// 筛选变化事件处理
// 注意：filters 已经通过 v-model:filters 自动同步
// 这里只用于日志记录，不要更新 filters，避免递归更新
const handleBasicFilterChange = (_event: any) => {}

// Basic 模式组件 Props
const basicComponentsProps = computed(() => ({
  filters: basicFilters, // 传递 ref 本身，而不是 ref.value，这样 VxeTable 可以正确更新
  filterDisplay: 'row', // Basic 模式使用 row 显示
  globalFilterFields: ['country', 'agent', 'status'],
  onFilter: handleBasicFilterChange,
}))
</script>

<template lang="pug">
.between-col.justify-start.gap-gapl
  // Basic 模式示例
  .between-col.justify-start.gap-gaps.c-border-primary.p-padding
    b.fs-appFontSizex VxeTable 基础筛选示例（Basic Filter）
    .fs-appFontSizes.color-text200
      | 使用 filters 模型实现列筛选功能。
      | 每列下方显示筛选输入框，点击筛选图标可以切换筛选模式。

    // 表格组件
    VxeTable(
      :data='tableData',
      :columns='basicColumns',
      :pagination='true',
      :show-gridlines='true',
      :striped-rows='true',
      :scrollable='true',
      :size-config='{ heightMode: "fixed", height: 500 }',
      :components-props='basicComponentsProps'
    )
      // Country 列：使用输入框筛选
      template(#filter_country='{ filterModel, filterCallback }')
        .py-paddings
          InputText.full.fs-appFontSizes(
            :model-value='filterModel?.value || ""',
            @update:model-value='(val: string | undefined) => { if (filterModel) { filterModel.value = val || null } filterCallback() }',
            placeholder='Search by country'
          )

      // Agent 列：使用下拉菜单筛选（等于匹配，修改值时必须触发 filterCallback）
      template(#filter_agent='{ filterModel, filterCallback }')
        .py-paddings
          Select.full(
            :model-value='filterModel?.value',
            :options='agentOptions',
            option-label='label',
            option-value='value',
            placeholder='Any',
            :show-clear='true',
            @update:model-value='(val: any) => { if (filterModel) { filterModel.value = val } filterCallback() }'
          )

      // Status 列：使用下拉菜单筛选（等于匹配，修改值时必须触发 filterCallback）
      template(#filter_status='{ filterModel, filterCallback }')
        .py-paddings
          Select.full(
            :model-value='filterModel?.value',
            :options='statusOptions',
            option-label='label',
            option-value='value',
            placeholder='Select One',
            :show-clear='true',
            @update:model-value='(val: any) => { if (filterModel) { filterModel.value = val } filterCallback() }'
          )

      // Verified 列：使用复选框筛选
      template(#filter_verified='{ filterModel, filterCallback }')
        .between-start.gap-gaps
          Checkbox(
            :model-value='filterModel?.value === true',
            @update:model-value='(checked: boolean) => { if (filterModel) { filterModel.value = checked ? true : null } filterCallback() }',
            :binary='true'
          )
          span Verified

      template(#header-left='{ data }')
        .between-start.gap-gap
          span.fs-appFontSizes 共 {{ data.length }} 条数据

  // 说明文档
  .c-border-accent.p-padding.fs-appFontSizes.between-col.justify-start.items-start.gap-gap
    b.fs-appFontSizex 筛选功能说明
    .between-col.gap-gaps
      div
        b 基础筛选（Basic）：
        ul
          li 使用 filters 模型定义筛选规则，每个字段使用 { operator, constraints } 结构。
          li 在列配置的 componentsProps 中设置 filter: true 启用筛选。
          li 使用 #filter_字段名 插槽可以自定义筛选 UI（可选）。
          li 支持全局筛选，通过 globalFilterFields 指定搜索字段。
          li filterDisplay="row" 模式下，每列下方自动显示筛选输入框。

      div
        b 筛选模式（Match Mode）：
        ul
          li startsWith: 以...开始
          li contains: 包含（用于文本）
          li notContains: 不包含
          li endsWith: 以...结束
          li equals: 等于（用于精确匹配）
          li notEquals: 不等于
          li dateIs: 日期等于（用于日期）
          li gte: 大于等于（用于数字）
          li lte: 小于等于（用于数字）
</template>

<style lang="scss" scoped>
::deep(.p-column-filter) {
  width: 100%;
}

// 确保高级筛选示例中列头右侧的筛选入口按钮可见
::deep(.p-datatable .p-column-header-content .p-column-filter-menu-button) {
  display: inline-flex;
}
</style>
