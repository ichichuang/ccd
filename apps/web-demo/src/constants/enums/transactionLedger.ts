/** 交易流水演示 — 状态 */

export type TransactionLedgerStatus = 'pending' | 'success' | 'failed'

export const TRANSACTION_LEDGER_STATUS_LABEL: Record<TransactionLedgerStatus, string> = {
  success: '成功',
  failed: '失败',
  pending: '处理中',
}

export const TRANSACTION_LEDGER_STATUS_CLASS: Record<TransactionLedgerStatus, string> = {
  success: 'bg-success/10 text-success',
  failed: 'bg-danger/10 text-danger',
  pending: 'bg-warn/10 text-warn',
}
