/**
 * 基础表格配置 - 静态数据 + 简单列
 */
import DateUtils, { DATE_FORMATS } from '@/utils/date'
import type { DataTableColumn } from '@/components/DataTable'

export interface Product {
  id: number
  code: string
  name: string
  category: string
  quantity: number
  createdAt: number
}

const oneYearMs = 365 * 24 * 60 * 60 * 1000
const randomTimestamp = () => Date.now() - Math.floor(Math.random() * oneYearMs)

export const basicColumns: DataTableColumn<Product>[] = [
  { field: 'id', header: 'ID', width: 80 },
  {
    field: 'code',
    header: 'Code',
    sortable: true,
    customFooter: () => (
      <div class="py-padding-xs px-padding-md border-border border-solid border-y-none border-l-none">
        Total:
      </div>
    ),
  },
  { field: 'name', header: 'Name', sortable: true },
  { field: 'category', header: 'Category' },
  {
    field: 'createdAt',
    header: '创建时间',
    sortable: true,
    body: row => DateUtils.formatTimestamp(row.createdAt, DATE_FORMATS.datetime),
  },
  {
    field: 'quantity',
    header: 'Quantity',
    sortable: true,
    customFooter: ({ rows }) => {
      const total = rows.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0)
      return (
        <div class="py-padding-xs px-padding-md border-border border-solid border-y-none border-r-none">
          <span class="font-bold text-primary">{total}</span>
        </div>
      )
    },
  },
]

export const basicData: Product[] = Array.from({ length: 120 }, (_, index) => {
  const id = index + 1
  const categories = ['Electronics', 'Clothing', 'Home', 'Books', 'Sports']
  const category = categories[index % categories.length]
  return {
    id,
    code: `P${String(id).padStart(3, '0')}`,
    name: `Product ${String.fromCharCode(65 + (index % 26))} - ${id}`,
    category,
    quantity: Math.floor(Math.random() * 100) + 1,
    createdAt: randomTimestamp(),
  }
})
