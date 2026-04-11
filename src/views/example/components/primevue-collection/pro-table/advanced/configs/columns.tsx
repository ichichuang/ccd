import Button from 'primevue/button'
import type { ProTableColumn, ColumnRenderParams } from '@/components/ProTable'
import {
  EMPLOYEE_DEPARTMENTS,
  EMPLOYEE_STATUS_LABELS,
  EMPLOYEE_WORK_STATUSES,
} from '@/constants/enums'

export interface AdvancedRow extends Record<string, unknown> {
  id: number
  name: string
  department: string
  status: string
  salary: number
  joinedAt: string
}

export function createAdvancedColumns(
  onEdit: (event: MouseEvent, row: AdvancedRow) => void,
  onDelete: (event: MouseEvent, row: AdvancedRow) => void,
  hasAuth: (auths: string | string[]) => boolean
): ProTableColumn<AdvancedRow>[] {
  return [
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
      filterOptions: EMPLOYEE_DEPARTMENTS.map(d => ({ label: d, value: d })),
    },
    {
      id: 'status',
      title: '状态',
      field: 'status',
      minWidth: '90px',
      filterable: true,
      filterType: 'select',
      filterOptions: EMPLOYEE_WORK_STATUSES.map(s => ({
        label: EMPLOYEE_STATUS_LABELS[s] ?? s,
        value: s,
      })),
      render: ({ row }) => (
        <span
          class={row.status === 'active' ? 'text-success font-medium' : 'text-muted-foreground'}
        >
          {EMPLOYEE_STATUS_LABELS[row.status as keyof typeof EMPLOYEE_STATUS_LABELS] ?? row.status}
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
      render: ({ row }: ColumnRenderParams<AdvancedRow>) =>
        `¥${row.salary.toLocaleString('zh-CN')}`,
    },
    {
      id: 'joinedAt',
      title: '入职日期',
      field: 'joinedAt',
      width: '120px',
      minWidth: '100px',
      sortable: true,
    },
    {
      id: 'actions',
      title: '操作',
      align: 'center',
      pinned: 'right',
      width: '160px',
      headerRender: () => <span class="w-full center">操作</span>,
      render: ({ row }) => (
        <div class="center gap-sm w-full ">
          <Button
            disabled={!hasAuth(['example:advanced:edit'])}
            size="small"
            label="编辑"
            onClick={(e: MouseEvent) => onEdit(e, row)}
          />
          <Button
            disabled={!hasAuth(['example:advanced:delete'])}
            size="small"
            severity="danger"
            label="删除"
            onClick={(e: MouseEvent) => onDelete(e, row)}
          />
        </div>
      ),
    },
  ]
}

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
    department: EMPLOYEE_DEPARTMENTS[i % EMPLOYEE_DEPARTMENTS.length],
    status: EMPLOYEE_WORK_STATUSES[i % EMPLOYEE_WORK_STATUSES.length],
    salary: 8000 + (i % 5) * 3000 + Math.floor((i * 17) % 2000),
    joinedAt: `202${Math.floor(i / 12)}-${String((i % 12) + 1).padStart(2, '0')}-01`,
  }))
}
