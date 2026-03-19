import type { ProTableColumn, ColumnRenderParams } from '@/components/ProTable'

export interface AdvancedRow extends Record<string, unknown> {
  id: number
  name: string
  department: string
  status: string
  salary: number
  joinedAt: string
}

const DEPARTMENTS = ['工程', '设计', '产品', '运营', '市场'] as const
const STATUSES = ['active', 'inactive', 'pending'] as const
const STATUS_LABELS: Record<string, string> = {
  active: '在职',
  inactive: '离职',
  pending: '待入职',
}

export const advancedColumns: ProTableColumn<AdvancedRow>[] = [
  {
    id: 'id',
    title: 'ID',
    field: 'id',
    width: '80px',
    minWidth: '60px',
    align: 'right',
    sortable: true,
  },
  {
    id: 'name',
    title: '姓名',
    field: 'name',
    minWidth: '120px',
    sortable: true,
  },
  {
    id: 'department',
    title: '部门',
    field: 'department',
    minWidth: '100px',
    filterable: true,
    filterType: 'select',
    filterOptions: DEPARTMENTS.map(d => ({ label: d, value: d })),
  },
  {
    id: 'status',
    title: '状态',
    field: 'status',
    minWidth: '90px',
    filterable: true,
    filterType: 'select',
    filterOptions: STATUSES.map(s => ({ label: STATUS_LABELS[s] ?? s, value: s })),
    render: ({ row }) => (
      <span class={row.status === 'active' ? 'text-success font-medium' : 'text-muted-foreground'}>
        {STATUS_LABELS[row.status] ?? row.status}
      </span>
    ),
  },
  {
    id: 'salary',
    title: '薪资 (¥)',
    field: 'salary',
    minWidth: '120px',
    align: 'right',
    sortable: true,
    render: ({ row }: ColumnRenderParams<AdvancedRow>) => `¥${row.salary.toLocaleString('zh-CN')}`,
  },
  {
    id: 'joinedAt',
    title: '入职日期',
    field: 'joinedAt',
    width: '120px',
    minWidth: '100px',
    sortable: true,
  },
]

const NAMES = [
  '张伟',
  '王芳',
  '李娜',
  '刘洋',
  '陈静',
  '杨帆',
  '赵磊',
  '黄梅',
  '周明',
  '吴丹',
  '徐刚',
  '孙悦',
  '马超',
  '朱琳',
  '胡浩',
  '林雪',
  '何欣',
  '郭峰',
  '高敏',
  '谢涛',
]

export function makeAdvancedMockData(): AdvancedRow[] {
  return NAMES.map((name, i) => ({
    id: i + 1,
    name,
    department: DEPARTMENTS[i % DEPARTMENTS.length],
    status: STATUSES[i % STATUSES.length],
    salary: 8000 + (i % 5) * 3000 + Math.floor((i * 17) % 2000),
    joinedAt: `202${Math.floor(i / 12)}-${String((i % 12) + 1).padStart(2, '0')}-01`,
  }))
}
