import type { ColumnRenderParams, ProTableColumn } from '@ccd/vue-ui'
import { ORDER_STATUS_VALUE_ENUM } from '@/constants/enums'

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
    valueEnum: ORDER_STATUS_VALUE_ENUM,
  },
  {
    id: 'createdAt',
    title: '创建时间',
    field: 'createdAt',
    width: '160px',
    sortable: true,
  },
]
