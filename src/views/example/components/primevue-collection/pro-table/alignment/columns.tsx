import type { ProTableColumn, ColumnRenderParams } from '@/components/ProTable'

export interface AlignmentRow extends Record<string, unknown> {
  id: number
  name: string
  status: 'active' | 'inactive' | 'pending'
  salary: number
}

export type AlignmentMode = 'left' | 'center' | 'right'

const STATUS_LABEL: Record<AlignmentRow['status'], string> = {
  active: '在职',
  inactive: '离职',
  pending: '待入职',
}

const STATUS_CLASS: Record<AlignmentRow['status'], string> = {
  active: 'text-success font-semibold',
  inactive: 'text-muted-foreground',
  pending: 'text-warn font-semibold',
}

export function buildAlignmentColumns(
  headerAlign: AlignmentMode,
  bodyAlign: AlignmentMode
): ProTableColumn<AlignmentRow>[] {
  return [
    {
      id: 'name',
      title: `姓名（${headerAlign} / ${bodyAlign}）`,
      field: 'name',
      headerAlign,
      align: bodyAlign,
      minWidth: '180px',
    },
    {
      id: 'status',
      title: `状态（${headerAlign} / ${bodyAlign}）`,
      field: 'status',
      headerAlign,
      align: bodyAlign,
      width: '240px',
      render: ({ row }: ColumnRenderParams<AlignmentRow>) => (
        <span class={STATUS_CLASS[row.status]}>{STATUS_LABEL[row.status]}</span>
      ),
    },
    {
      id: 'salary',
      title: `薪资（${headerAlign} / ${bodyAlign}）`,
      field: 'salary',
      headerAlign,
      align: bodyAlign,
      width: '240px',
      render: ({ row }: ColumnRenderParams<AlignmentRow>) =>
        `¥${row.salary.toLocaleString('zh-CN')}`,
    },
  ]
}
