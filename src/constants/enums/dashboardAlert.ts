/** Dashboard 告警表 — 级别与节点状态 */

export type AlertSeverityLevel = 'critical' | 'warning' | 'info'
export type NodeOperationalState = 'online' | 'degraded' | 'offline'

export const ALERT_LEVEL_VALUE_ENUM = {
  critical: { label: 'Critical', severity: 'danger' as const },
  warning: { label: 'Warning', severity: 'warn' as const },
  info: { label: 'Info', severity: 'info' as const },
} satisfies Record<AlertSeverityLevel, { label: string; severity: 'danger' | 'warn' | 'info' }>

export const NODE_STATE_VALUE_ENUM = {
  online: { label: 'Online', severity: 'success' as const },
  degraded: { label: 'Degraded', severity: 'warn' as const },
  offline: { label: 'Offline', severity: 'danger' as const },
} satisfies Record<NodeOperationalState, { label: string; severity: 'success' | 'warn' | 'danger' }>
