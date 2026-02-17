/**
 * 复杂表格配置 - 行展开、行分组
 */
import type { DataTableColumn } from '@/components/DataTable'

export interface ComplexOrder {
  id: number
  customer: string
  date: string
  amount: number
  status: 'pending' | 'shipped' | 'delivered'
  items: Array<{ name: string; price: number; quantity: number }>
}

const statusColors = { pending: 'text-warn', shipped: 'text-primary', delivered: 'text-success' }

export const complexColumns: DataTableColumn<ComplexOrder>[] = [
  { field: 'id', header: '', expander: true, width: 'var(--spacing-2xl)' },
  { field: 'id', header: 'Order ID', width: 100 },
  { field: 'customer', header: 'Customer', sortable: true },
  { field: 'date', header: 'Date', sortable: true },
  { field: 'amount', header: 'Total Amount', sortable: true, body: row => `¥${row.amount}` },
  {
    field: 'status',
    header: 'Status',
    body: row => (
      <span class={`font-medium ${statusColors[row.status]}`}>{row.status.toUpperCase()}</span>
    ),
  },
]

export const complexData: ComplexOrder[] = [
  {
    id: 1001,
    customer: 'Alice Smith',
    date: '2023-01-15',
    amount: 1500,
    status: 'delivered',
    items: [
      { name: 'Product A', price: 500, quantity: 2 },
      { name: 'Product B', price: 500, quantity: 1 },
    ],
  },
  {
    id: 1002,
    customer: 'Bob Jones',
    date: '2023-01-16',
    amount: 300,
    status: 'shipped',
    items: [{ name: 'Product C', price: 100, quantity: 3 }],
  },
  {
    id: 1003,
    customer: 'Charlie Brown',
    date: '2023-01-17',
    amount: 1200,
    status: 'pending',
    items: [
      { name: 'Product A', price: 500, quantity: 1 },
      { name: 'Product D', price: 700, quantity: 1 },
    ],
  },
  {
    id: 1004,
    customer: 'David Lee',
    date: '2023-01-18',
    amount: 800,
    status: 'delivered',
    items: [{ name: 'Product E', price: 800, quantity: 1 }],
  },
]
