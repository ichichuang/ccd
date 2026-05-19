/** 订单演示数据 — 状态 */

export type OrderStatus = 'completed' | 'processing' | 'cancelled'

export const ORDER_STATUS_VALUE_ENUM = {
  completed: { label: '已完成', severity: 'success' as const },
  processing: { label: '处理中', severity: 'info' as const },
  cancelled: { label: '已取消', severity: 'danger' as const },
} satisfies Record<OrderStatus, { label: string; severity: 'success' | 'info' | 'danger' }>
