import type { ProTableColumn } from '@/components/ProTable'
import Button from 'primevue/button'

export interface EmployeeRow extends Record<string, unknown> {
  id: number
  name: string
  department: string
  status: 'active' | 'inactive' | 'pending'
  salary: number
  joinedAt: string
}

const STATUS_BADGE: Record<string, { cls: string; label: string }> = {
  active: { cls: 'text-success font-medium', label: '在职' },
  inactive: { cls: 'text-muted-foreground', label: '离职' },
  pending: { cls: 'text-warn font-medium', label: '待入职' },
}

export const employeeColumns: ProTableColumn<EmployeeRow>[] = [
  {
    id: 'id',
    title: 'ID',
    field: 'id',
    sortable: true,
    pinned: 'left',
    align: 'right',
    width: '72px',
  },
  {
    id: 'name',
    title: '姓名',
    field: 'name',
    sortable: true,
    filterable: true,
    filterType: 'text',
  },
  {
    id: 'department',
    title: '部门',
    field: 'department',
    filterable: true,
    filterType: 'select',
    filterOptions: [
      { label: '工程', value: '工程' },
      { label: '设计', value: '设计' },
      { label: '产品', value: '产品' },
      { label: '运营', value: '运营' },
    ],
  },
  {
    id: 'status',
    title: '状态',
    field: 'status',
    filterable: true,
    filterType: 'select',
    filterOptions: [
      { label: '在职', value: 'active' },
      { label: '离职', value: 'inactive' },
      { label: '待入职', value: 'pending' },
    ],
    render: ({ row }) => {
      const badge = STATUS_BADGE[row.status] ?? STATUS_BADGE.pending
      return <span class={badge.cls}>{badge.label}</span>
    },
  },
  {
    id: 'salary',
    title: '薪资 (¥)',
    field: 'salary',
    sortable: true,
    align: 'right',
    className: 'text-success font-semibold',
    render: ({ row }) => `¥${row.salary.toLocaleString()}`,
  },
  {
    id: 'joinedAt',
    title: '入职日期',
    field: 'joinedAt',
    sortable: true,
    width: '240px',
  },
  {
    id: 'actions',
    title: '操作',
    pinned: 'right',
    width: '220px',
    headerRender: () => <span class="w-full center">操作</span>,
    render: () => (
      <div class="center gap-sm w-full ">
        <Button size="small">编辑</Button>
        <Button
          size="small"
          severity="danger"
        >
          删除
        </Button>
      </div>
    ),
  },
]
