import type { ColumnRenderParams, ProTableColumn } from '@ccd/vue-ui'
import { DateFormatEnum } from '@/utils/date/types'
import { DateUtils } from '@/utils/date/dateUtils'

export interface ApiEventsRow extends Record<string, unknown> {
  id: number
  name: string
  salary: number
  description: string
  createdAt: string
}

export const apiEventsColumns: ProTableColumn<ApiEventsRow>[] = [
  {
    id: 'id',
    title: 'ID',
    field: 'id',
    width: '80px',
    align: 'right',
    sortable: true,
  },
  {
    id: 'name',
    title: '姓名',
    field: 'name',
    minWidth: '120px',
    sortable: true,
    filterable: true,
  },
  {
    id: 'salary',
    title: '薪资 (¥)',
    field: 'salary',
    width: '120px',
    align: 'right',
    sortable: 'custom',
    filterable: true,
    filterType: 'number',
    className: (row: ApiEventsRow) => (row.salary > 15000 ? 'text-danger font-bold' : ''),
    render: ({ row }: ColumnRenderParams<ApiEventsRow>) => `¥${row.salary.toLocaleString('zh-CN')}`,
  },
  {
    id: 'description',
    title: '描述',
    field: 'description',
    minWidth: '160px',
    maxWidth: '200px',
    meta: { tooltip: 'This is a custom meta field' },
    render: ({ row, column }: ColumnRenderParams<ApiEventsRow>) => {
      const tooltip = typeof column.meta?.tooltip === 'string' ? column.meta.tooltip : ''
      return (
        <span
          class="text-ellipsis-1 block"
          title={tooltip}
        >
          {row.description || '—'}
        </span>
      )
    },
  },
  {
    id: 'createdAt',
    title: '创建日期',
    field: 'createdAt',
    width: '120px',
    sortable: true,
    hidden: true,
    render: ({ row }: ColumnRenderParams<ApiEventsRow>) => {
      const raw = typeof row.createdAt === 'string' ? row.createdAt.trim() : ''
      if (!raw) return <span class="text-muted-foreground">—</span>
      return (
        <span class="text-sm text-muted-foreground">
          {DateUtils.format(raw, DateFormatEnum.Date)}
        </span>
      )
    },
  },
]

const NAMES = ['张伟', '王芳', '李娜', '刘洋', '陈静', '杨帆', '赵磊', '黄梅', '周明', '吴丹']
const DESCRIPTIONS = [
  '项目 A 需求说明',
  '项目 B 技术方案',
  '项目 C 排期规划',
  '项目 D 验收标准',
  '项目 E 风险说明',
  '项目 F 资源评估',
  '项目 G 里程碑',
  '项目 H 交付物',
  '项目 I 复盘总结',
  '项目 J 待办事项',
]

export function makeApiMockData(): ApiEventsRow[] {
  return NAMES.map((name, i) => ({
    id: i + 1,
    name,
    salary: 8000 + (i % 4) * 4000 + Math.floor((i * 13) % 3000),
    description: DESCRIPTIONS[i % DESCRIPTIONS.length] ?? '',
    createdAt: `2026-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
  }))
}
