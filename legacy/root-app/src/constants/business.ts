/** 业务演示 — 单号 / 任务 ID 前缀（与 Mock、上传任务生成对齐） */

export const ID_PREFIX = {
  ORDER: 'ORD-',
  SKU: 'SKU-',
  TX: 'TX-',
  /** 告警行 Mock，如 A-001 */
  ALERT: 'A-',
} as const

export const UPLOAD_TASK_PREFIX = 'upload_' as const
