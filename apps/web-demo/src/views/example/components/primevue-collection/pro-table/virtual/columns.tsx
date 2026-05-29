import type { ProTableColumn } from '@ccd/vue-ui'
import {
  TRANSACTION_LEDGER_STATUS_CLASS,
  TRANSACTION_LEDGER_STATUS_LABEL,
  type TransactionLedgerStatus,
} from '@/constants/enums'

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
  return TRANSACTION_LEDGER_STATUS_LABEL[status as TransactionLedgerStatus]
}

function statusClass(status: TransactionLedgerRow['status']): string {
  return TRANSACTION_LEDGER_STATUS_CLASS[status as TransactionLedgerStatus]
}

export const transactionLedgerColumns: ProTableColumn<TransactionLedgerRow>[] = [
  {
    id: 'id',
    title: 'ID',
    field: 'id',
    width: '200px',
    sortable: true,
    pinned: 'left',
  },
  {
    id: 'date',
    title: '日期001',
    field: 'date',
    minWidth: '220px',
    headerAlign: 'center',
    align: 'center',
    sortable: true,
  },
  // {
  //   id: 'date',
  //   title: '日期002',
  //   field: 'date',
  //   minWidth: '220px',
  //   headerAlign: 'center',
  //   align: 'center',
  //   sortable: true,
  // },
  // {
  //   id: 'date',
  //   title: '日期003',
  //   field: 'date',
  //   minWidth: '220px',
  //   headerAlign: 'center',
  //   align: 'center',
  //   sortable: true,
  // },
  // {
  //   id: 'date',
  //   title: '日期004',
  //   field: 'date',
  //   minWidth: '220px',
  //   headerAlign: 'center',
  //   align: 'center',
  //   sortable: true,
  // },
  // {
  //   id: 'date',
  //   title: '日期005',
  //   field: 'date',
  //   minWidth: '220px',
  //   headerAlign: 'center',
  //   align: 'center',
  //   sortable: true,
  // },
  // {
  //   id: 'date',
  //   title: '日期006',
  //   field: 'date',
  //   minWidth: '220px',
  //   headerAlign: 'center',
  //   align: 'center',
  //   sortable: true,
  // },
  // {
  //   id: 'date',
  //   title: '日期007',
  //   field: 'date',
  //   minWidth: '220px',
  //   headerAlign: 'center',
  //   align: 'center',
  //   sortable: true,
  // },
  {
    id: 'account',
    title: '账户',
    field: 'account',
    minWidth: '220px',
    sortable: true,
  },
  {
    id: 'amount',
    title: '金额',
    field: 'amount',
    headerAlign: 'right',
    align: 'right',
    minWidth: '220px',
    sortable: true,
    render: ({ row }) => formatAmount(row.amount),
  },
  {
    id: 'status',
    title: '状态',
    field: 'status',
    headerAlign: 'center',
    align: 'center',
    width: '200px',
    sortable: true,
    render: ({ row }) => (
      <div class={`px-xs py-xs rounded-lg center text-xs font-medium ${statusClass(row.status)}`}>
        {statusLabel(row.status)}
      </div>
    ),
  },
  {
    id: 'description',
    title: '描述',
    field: 'description',
    minWidth: '200px',
    sortable: true,
    pinned: 'right',
  },
]
