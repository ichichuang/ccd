/**
 * 自定义列配置 - body 渲染、customFooter、filterType 全类型（text/select/multiselect）
 * 筛选回调必须用事件参数显式传值，避免 PrimeVue 无参调用时 filterModel.value 未同步导致 columnFilters 收不到值。
 */
import { nextTick } from 'vue'

/** 失焦时触发 PrimeVue BodyCell 的「外部点击」完成逻辑（BodyCell 只监听 document mousedown） */
function triggerCellEditCompleteOnBlur() {
  nextTick(() => {
    document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }))
  })
}
import type { DataTableColumn } from '@/components/DataTable'
import Select from 'primevue/select'
import InputNumber from 'primevue/inputnumber'
import MultiSelect from 'primevue/multiselect'

/** 从 PrimeVue 事件中取出筛选值（可能为 value 或事件本身即值） */
function getFilterValueFromEvent(e: unknown): unknown {
  if (e !== null && typeof e === 'object' && 'value' in e) return (e as { value: unknown }).value
  return e
}

export interface SubscriptionRecord {
  id: string
  customer: string
  plan: 'Basic' | 'Pro' | 'Enterprise'
  monthlyFee: number
  monthsActive: number
  totalBilled: number
  startDate: string
  status: 'active' | 'past_due' | 'canceled'
  autoRenew: boolean
}

const STATUS_OPTIONS = [
  { label: '全部', value: null },
  { label: '活跃 (Active)', value: 'active' },
  { label: '逾期 (Past Due)', value: 'past_due' },
  { label: '已取消 (Canceled)', value: 'canceled' },
] as const

const statusMap = { active: '活跃', past_due: '逾期', canceled: '已取消' }
const planMap = { Basic: '基础版 (Basic)', Pro: '专业版 (Pro)', Enterprise: '企业版 (Enterprise)' }

const PLAN_OPTIONS = [
  { label: '基础版 (Basic)', value: 'Basic' },
  { label: '专业版 (Pro)', value: 'Pro' },
  { label: '企业版 (Enterprise)', value: 'Enterprise' },
] as const

export const customColumns: DataTableColumn<SubscriptionRecord>[] = [
  { field: 'id', header: '订单编号', minWidth: '150px', headerClass: 'whitespace-nowrap' },
  {
    field: 'customer',
    header: '客户名称',
    sortable: true,
    filterable: true,
    minWidth: '200px',
    headerClass: 'whitespace-nowrap',
    body: row => <span class="font-medium text-foreground">{row.customer}</span>,
  },
  {
    field: 'plan',
    header: '订阅方案',
    sortable: true,
    filterable: true,
    filterType: 'multiselect',
    filterOptions: PLAN_OPTIONS.map(o => ({ label: o.label, value: o.value })),
    minWidth: '220px',
    headerClass: 'whitespace-nowrap',
    filterRenderer: ({ filterModel, filterCallback }) => {
      const handleUpdate = (val: unknown) => {
        filterModel.value = val
        nextTick(() => filterCallback(val))
      }
      const onChange = (e: unknown) => nextTick(() => filterCallback(getFilterValueFromEvent(e)))
      const multiSelectProps = {
        class: 'w-full',
        options: [...PLAN_OPTIONS],
        optionLabel: 'label',
        optionValue: 'value',
        modelValue: filterModel.value as string[],
        onUpdateModelValue: handleUpdate,
        onChange: onChange,
        placeholder: '筛选方案',
      }
      return <MultiSelect {...(multiSelectProps as unknown as Record<string, unknown>)} />
    },
    body: row => {
      const cls =
        row.plan === 'Enterprise'
          ? 'bg-primary/10 text-primary border-primary/20'
          : row.plan === 'Pro'
            ? 'bg-success/10 text-success border-success/20'
            : 'bg-muted/50 text-muted-foreground border-border'
      return (
        <span
          class={`inline-flex items-center px-1.5 py-0.5 rounded-md border text-xs font-medium ${cls}`}
        >
          {planMap[row.plan]}
        </span>
      )
    },
  },
  {
    field: 'monthlyFee',
    header: '月费',
    sortable: true,
    align: 'right',
    editable: true,
    minWidth: '150px',
    headerClass: 'whitespace-nowrap',
    onEditUpdate: (row: SubscriptionRecord) => {
      row.totalBilled = row.monthlyFee * row.monthsActive
    },
    editorRenderer: (options: { data: SubscriptionRecord; value: unknown; field: string }) => {
      const handleUpdate = (val: unknown) => {
        options.data.monthlyFee = Number(val ?? 0)
      }
      const keyUpdateModel = 'onUpdate:modelValue' as const
      const inputNumberProps: Record<string, unknown> = {
        class: 'full w-full h-full box-border',
        min: 0,
        minFractionDigits: 0,
        maxFractionDigits: 2,
        modelValue: options.value as number,
        [keyUpdateModel]: handleUpdate,
        onBlur: triggerCellEditCompleteOnBlur,
      }
      return <InputNumber {...inputNumberProps} />
    },
    body: row => <span class="text-foreground">¥{row.monthlyFee}</span>,
  },
  {
    field: 'monthsActive',
    header: '在网月数',
    sortable: true,
    align: 'right',
    editable: true,
    minWidth: '150px',
    headerClass: 'whitespace-nowrap',
    onEditUpdate: (row: SubscriptionRecord) => {
      row.totalBilled = row.monthlyFee * row.monthsActive
    },
    editorRenderer: (options: { data: SubscriptionRecord; value: unknown; field: string }) => {
      const handleUpdate = (val: unknown) => {
        options.data.monthsActive = Number(val ?? 0)
      }
      const keyUpdateModel = 'onUpdate:modelValue' as const
      const inputNumberProps: Record<string, unknown> = {
        class: 'full w-full h-full box-border',
        min: 0,
        maxFractionDigits: 0,
        modelValue: options.value as number,
        [keyUpdateModel]: handleUpdate,
        onBlur: triggerCellEditCompleteOnBlur,
      }
      return <InputNumber {...inputNumberProps} />
    },
    body: row => <span class="text-foreground">{row.monthsActive} 个月</span>,
  },
  {
    field: 'totalBilled',
    header: '总收益',
    sortable: true,
    align: 'right',
    minWidth: '150px',
    headerClass: 'whitespace-nowrap',
    body: row => <span class="text-success font-medium">¥{row.totalBilled}</span>,
    customFooter: params => {
      const sum = params.rows.reduce((s, r) => s + (Number(r.row.totalBilled) || 0), 0)
      return <span class="font-semibold text-primary">总计: ¥{sum}</span>
    },
  },
  {
    field: 'startDate',
    header: '开通时间',
    sortable: true,
    minWidth: '140px',
    headerClass: 'whitespace-nowrap',
  },
  {
    field: 'status',
    header: '状态',
    filterable: true,
    sortable: true,
    filterType: 'select',
    minWidth: '180px',
    headerClass: 'whitespace-nowrap',
    filterOptions: STATUS_OPTIONS.map(option => ({
      label: option.label,
      value: option.value,
    })),
    filterRenderer: ({ filterModel, filterCallback }) => {
      const handleUpdate = (val: unknown) => {
        filterModel.value = val
        nextTick(() => filterCallback(val))
      }
      const onChange = (e: unknown) => nextTick(() => filterCallback(getFilterValueFromEvent(e)))
      const selectProps = {
        class: 'w-full',
        options: [...STATUS_OPTIONS] as Array<{ label: string; value: string | null }>,
        optionLabel: 'label',
        optionValue: 'value',
        modelValue: filterModel.value,
        onUpdateModelValue: handleUpdate,
        onChange: onChange,
        placeholder: '全部',
        showClear: true,
      }
      return <Select {...(selectProps as unknown as Record<string, unknown>)} />
    },
    body: row => {
      const cls =
        row.status === 'active'
          ? 'bg-success/20 text-success'
          : row.status === 'canceled'
            ? 'bg-muted text-muted-foreground'
            : 'bg-danger/20 text-danger'
      return (
        <span class={`inline-flex px-padding-sm py-padding-xs rounded-full fs-xs ${cls}`}>
          {statusMap[row.status]}
        </span>
      )
    },
  },
]

export const customData: SubscriptionRecord[] = [
  {
    id: 'SUB-001',
    customer: 'Acme Corp',
    plan: 'Enterprise',
    monthlyFee: 999,
    monthsActive: 12,
    totalBilled: 11988,
    startDate: '2025-01-15',
    status: 'active',
    autoRenew: true,
  },
  {
    id: 'SUB-002',
    customer: 'TechFlow Solutions',
    plan: 'Pro',
    monthlyFee: 299,
    monthsActive: 6,
    totalBilled: 1794,
    startDate: '2025-06-20',
    status: 'active',
    autoRenew: true,
  },
  {
    id: 'SUB-003',
    customer: 'Nexus Innovations',
    plan: 'Basic',
    monthlyFee: 59,
    monthsActive: 2,
    totalBilled: 118,
    startDate: '2025-10-05',
    status: 'past_due',
    autoRenew: true,
  },
  {
    id: 'SUB-004',
    customer: 'Global Dynamics',
    plan: 'Enterprise',
    monthlyFee: 1299,
    monthsActive: 36,
    totalBilled: 46764,
    startDate: '2023-11-12',
    status: 'active',
    autoRenew: true,
  },
  {
    id: 'SUB-005',
    customer: 'Stark Industries',
    plan: 'Pro',
    monthlyFee: 399,
    monthsActive: 1,
    totalBilled: 399,
    startDate: '2025-12-01',
    status: 'canceled',
    autoRenew: false,
  },
  {
    id: 'SUB-006',
    customer: 'Wayne Enterprises',
    plan: 'Enterprise',
    monthlyFee: 1599,
    monthsActive: 24,
    totalBilled: 38376,
    startDate: '2024-02-28',
    status: 'active',
    autoRenew: true,
  },
  {
    id: 'SUB-007',
    customer: 'Cyberdyne Systems',
    plan: 'Pro',
    monthlyFee: 299,
    monthsActive: 8,
    totalBilled: 2392,
    startDate: '2025-04-10',
    status: 'past_due',
    autoRenew: true,
  },
  {
    id: 'SUB-008',
    customer: 'Massive Dynamic',
    plan: 'Basic',
    monthlyFee: 99,
    monthsActive: 18,
    totalBilled: 1782,
    startDate: '2024-07-22',
    status: 'active',
    autoRenew: false,
  },
  {
    id: 'SUB-009',
    customer: 'Initech',
    plan: 'Basic',
    monthlyFee: 59,
    monthsActive: 4,
    totalBilled: 236,
    startDate: '2025-08-15',
    status: 'canceled',
    autoRenew: false,
  },
  {
    id: 'SUB-010',
    customer: 'Umbrella Corporation',
    plan: 'Enterprise',
    monthlyFee: 1999,
    monthsActive: 60,
    totalBilled: 119940,
    startDate: '2021-01-01',
    status: 'active',
    autoRenew: true,
  },
  {
    id: 'SUB-011',
    customer: 'Pied Piper',
    plan: 'Pro',
    monthlyFee: 199,
    monthsActive: 14,
    totalBilled: 2786,
    startDate: '2024-10-18',
    status: 'active',
    autoRenew: true,
  },
  {
    id: 'SUB-012',
    customer: 'Hooli',
    plan: 'Enterprise',
    monthlyFee: 899,
    monthsActive: 5,
    totalBilled: 4495,
    startDate: '2025-07-09',
    status: 'canceled',
    autoRenew: false,
  },
  {
    id: 'SUB-013',
    customer: 'Aviato',
    plan: 'Basic',
    monthlyFee: 29,
    monthsActive: 24,
    totalBilled: 696,
    startDate: '2024-01-14',
    status: 'active',
    autoRenew: true,
  },
  {
    id: 'SUB-014',
    customer: 'Raviga Capital',
    plan: 'Enterprise',
    monthlyFee: 2599,
    monthsActive: 3,
    totalBilled: 7797,
    startDate: '2025-09-30',
    status: 'past_due',
    autoRenew: true,
  },
  {
    id: 'SUB-015',
    customer: 'EndFrame',
    plan: 'Pro',
    monthlyFee: 499,
    monthsActive: 11,
    totalBilled: 5489,
    startDate: '2025-01-08',
    status: 'active',
    autoRenew: false,
  },
]
