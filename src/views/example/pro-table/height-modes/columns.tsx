import Icons from '@/components/Icons/Icons.vue'
import type { ProTableColumn, ColumnRenderParams } from '@/components/ProTable'

export interface HeightModeRow extends Record<string, unknown> {
  id: number
  title: string
  category: string
  status: 'active' | 'inactive' | 'pending'
  updatedAt: string
}

const STATUS_CFG: Record<HeightModeRow['status'], { label: string; cls: string }> = {
  active: { label: '运行中', cls: 'bg-success/15 text-success' },
  inactive: { label: '已停止', cls: 'bg-danger/15 text-danger' },
  pending: { label: '待处理', cls: 'bg-warn/15 text-warn' },
}

const BADGE = 'rounded-scale-sm px-padding-sm py-padding-xs fs-xs font-semibold'

export const heightModeColumns: ProTableColumn<HeightModeRow>[] = [
  {
    id: 'id',
    title: 'ID',
    field: 'id',
    width: '70px',
    align: 'right',
  },
  {
    id: 'title',
    title: '任务名称',
    field: 'title',
    minWidth: '200px',
    render: ({ row }: ColumnRenderParams<HeightModeRow>) => (
      <div class="row-y-center gap-sm">
        <Icons
          name="i-lucide-activity"
          class="text-primary fs-sm"
        />
        <span class="fs-sm font-medium text-foreground text-single-line-ellipsis">{row.title}</span>
      </div>
    ),
  },

  {
    id: 'category',
    title: '类型',
    field: 'category',
    width: '120px',
  },
  {
    id: 'status',
    title: '状态',
    field: 'status',
    width: '100px',
    render: ({ row }: ColumnRenderParams<HeightModeRow>) => {
      const cfg = STATUS_CFG[row.status]
      return <span class={`${cfg.cls} ${BADGE}`}>{cfg.label}</span>
    },
  },
  {
    id: 'updatedAt',
    title: '更新时间',
    field: 'updatedAt',
    width: '160px',
  },
]

export function makeHeightMockData(count: number): HeightModeRow[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    title: `探测器数据流 #${i + 1001}`,
    category: i % 2 === 0 ? '系统' : '网络',
    status: i % 3 === 0 ? 'active' : i % 3 === 1 ? 'inactive' : 'pending',
    updatedAt: new Date().toISOString().split('T')[0],
  }))
}
