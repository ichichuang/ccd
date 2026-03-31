import type { ProTableColumn, ColumnRenderParams } from '@/components/ProTable'

export interface OrderRow extends Record<string, unknown> {
  id: number
  orderNo: string
  customer: string
  product: string
  quantity: number
  unitPrice: number
  total: number
  status: 'completed' | 'processing' | 'cancelled'
  createdAt: string
}

export const basicColumns: ProTableColumn<OrderRow>[] = [
  {
    id: 'orderNo',
    title: '订单编号',
    field: 'orderNo',
    width: '140px',
    sortable: true,
  },
  {
    id: 'customer',
    title: '客户',
    field: 'customer',
    sortable: true,
  },
  {
    id: 'product',
    title: '商品',
    field: 'product',
  },
  {
    id: 'quantity',
    title: '数量',
    field: 'quantity',
    minWidth: '120px',
    align: 'right',
    sortable: true,
  },
  {
    id: 'unitPrice',
    title: '单价',
    field: 'unitPrice',
    width: '100px',
    align: 'right',
    sortable: true,
    render: ({ row }: ColumnRenderParams<OrderRow>) => (
      <span class="font-mono">{'¥' + row.unitPrice.toFixed(2)}</span>
    ),
  },
  {
    id: 'total',
    title: '合计',
    field: 'total',
    width: '120px',
    align: 'right',
    sortable: true,
    className: 'font-semibold',
    render: ({ row }: ColumnRenderParams<OrderRow>) => (
      <span class="font-mono text-success">
        {'¥' + row.total.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
      </span>
    ),
  },
  {
    id: 'status',
    title: '状态',
    field: 'status',
    minWidth: '120px',
    valueEnum: {
      completed: { label: '已完成', severity: 'success' },
      processing: { label: '处理中', severity: 'info' },
      cancelled: { label: '已取消', severity: 'danger' },
    },
  },
  {
    id: 'createdAt',
    title: '创建时间',
    field: 'createdAt',
    width: '160px',
    sortable: true,
  },
]
