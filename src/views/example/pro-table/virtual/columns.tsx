import type { ProTableColumn } from '@/components/ProTable'

export interface TransactionLedgerRow extends Record<string, unknown> {
  id: string
  date: string
  account: string
  amount: number
  status: 'pending' | 'success' | 'failed'
  description: string
}

function formatAmount(val: number): string {
  const sign = val < 0 ? '-' : ''
  const abs = Math.abs(val)
  return `${sign}${abs.toFixed(2)}`
}

function statusLabel(status: TransactionLedgerRow['status']): string {
  if (status === 'success') return '成功'
  if (status === 'failed') return '失败'
  return '处理中'
}

function statusClass(status: TransactionLedgerRow['status']): string {
  if (status === 'success') return 'text-success bg-success/10'
  if (status === 'failed') return 'text-danger bg-danger/10'
  return 'text-warning bg-warning/10'
}

export const transactionLedgerColumns: ProTableColumn<TransactionLedgerRow>[] = [
  {
    id: 'id',
    title: 'ID',
    field: 'id',
    width: 'var(--spacing-5xl)',
  },
  {
    id: 'date',
    title: '日期',
    field: 'date',
    width: 'var(--spacing-5xl)',
  },
  {
    id: 'account',
    title: '账户',
    field: 'account',
    minWidth: 'var(--spacing-5xl)',
  },
  {
    id: 'amount',
    title: '金额',
    field: 'amount',
    align: 'right',
    width: 'var(--spacing-5xl)',
    render: ({ row }) => formatAmount(row.amount),
  },
  {
    id: 'status',
    title: '状态',
    field: 'status',
    width: 'var(--spacing-5xl)',
    render: ({ row }) => (
      <span
        class={[
          'flex flex-row items-center',
          'px-xs py-xs rounded-xs text-xs font-medium',
          statusClass(row.status),
        ].join(' ')}
      >
        {statusLabel(row.status)}
      </span>
    ),
  },
  {
    id: 'description',
    title: '描述',
    field: 'description',
    minWidth: 'var(--spacing-5xl)',
  },
]
