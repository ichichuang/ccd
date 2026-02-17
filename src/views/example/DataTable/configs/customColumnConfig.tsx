/**
 * 自定义列配置 - body 渲染、customFooter
 */
import type { DataTableColumn } from '@/components/DataTable'

export interface SaleRecord {
  id: number
  product: string
  amount: number
  status: 'pending' | 'done' | 'cancelled'
}

const statusMap = { pending: '待处理', done: '已完成', cancelled: '已取消' }

export const customColumns: DataTableColumn<SaleRecord>[] = [
  { field: 'id', header: 'ID', width: 70 },
  {
    field: 'product',
    header: '产品',
    body: row => <span class="text-primary font-medium">{row.product}</span>,
  },
  {
    field: 'amount',
    header: '金额',
    sortable: true,
    align: 'right',
    body: row => <span class="text-success">¥{row.amount}</span>,
    customFooter: params => {
      const sum = params.rows.reduce((s, r) => s + (Number(r.value) || 0), 0)
      return <span class="font-semibold text-primary">合计: ¥{sum}</span>
    },
  },
  {
    field: 'status',
    header: '状态',
    body: row => {
      const cls =
        row.status === 'done'
          ? 'bg-success/20 text-success'
          : row.status === 'cancelled'
            ? 'bg-danger/20 text-danger'
            : 'bg-warn/20 text-warn'
      return (
        <span class={`inline-flex px-2 py-0.5 rounded-full fs-xs ${cls}`}>
          {statusMap[row.status]}
        </span>
      )
    },
  },
]

export const customData: SaleRecord[] = [
  { id: 1, product: '商品 A', amount: 100, status: 'done' },
  { id: 2, product: '商品 B', amount: 200, status: 'pending' },
  { id: 3, product: '商品 C', amount: 150, status: 'cancelled' },
  { id: 4, product: '商品 D', amount: 80, status: 'done' },
]
