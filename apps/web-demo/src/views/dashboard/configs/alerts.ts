import type { ProTableColumn, ProTableValueEnum } from '@/components/ProTable'
import { ID_PREFIX } from '@/constants/business'
import { formatSerialId } from '@/utils/business/idGenerator'

type DashboardTranslate = (key: string) => string

export interface AlertRow extends Record<string, unknown> {
  id: string
  nodeName: string
  level: 'critical' | 'warning' | 'info'
  state: 'online' | 'degraded' | 'offline'
  lastSeenAt: string
  message: string
}

interface CreateAlertColumnsOptions {
  t: DashboardTranslate
  isDateReady: boolean
  formatDate: (value: string) => string
  alertLevelValueEnum: ProTableValueEnum
  nodeStateValueEnum: ProTableValueEnum
}

export function createAlertLevelValueEnum(t: DashboardTranslate): ProTableValueEnum {
  return {
    critical: { label: t('dashboard.alerts.levelValues.critical'), severity: 'danger' },
    warning: { label: t('dashboard.alerts.levelValues.warning'), severity: 'warn' },
    info: { label: t('dashboard.alerts.levelValues.info'), severity: 'info' },
  }
}

export function createNodeStateValueEnum(t: DashboardTranslate): ProTableValueEnum {
  return {
    online: { label: t('dashboard.alerts.stateValues.online'), severity: 'success' },
    degraded: { label: t('dashboard.alerts.stateValues.degraded'), severity: 'warn' },
    offline: { label: t('dashboard.alerts.stateValues.offline'), severity: 'danger' },
  }
}

export function createMockAlertRows(t: DashboardTranslate): AlertRow[] {
  return [
    {
      id: formatSerialId(ID_PREFIX.ALERT, 1, 3),
      nodeName: 'RZ-Edge-01',
      level: 'critical',
      state: 'degraded',
      lastSeenAt: '2026-04-02T03:21:10Z',
      message: t('dashboard.alerts.messages.queueBacklog'),
    },
    {
      id: formatSerialId(ID_PREFIX.ALERT, 2, 3),
      nodeName: 'Core-Scheduler-03',
      level: 'warning',
      state: 'online',
      lastSeenAt: '2026-04-02T03:18:02Z',
      message: t('dashboard.alerts.messages.completionRateDrop'),
    },
    {
      id: formatSerialId(ID_PREFIX.ALERT, 3, 3),
      nodeName: 'Region-NY-02',
      level: 'info',
      state: 'online',
      lastSeenAt: '2026-04-02T03:15:44Z',
      message: t('dashboard.alerts.messages.topologyCheckPassed'),
    },
    {
      id: formatSerialId(ID_PREFIX.ALERT, 4, 3),
      nodeName: 'Tenant-Portal-07',
      level: 'warning',
      state: 'degraded',
      lastSeenAt: '2026-04-02T03:13:20Z',
      message: t('dashboard.alerts.messages.cacheHitFluctuation'),
    },
    {
      id: formatSerialId(ID_PREFIX.ALERT, 5, 3),
      nodeName: 'Edge-Gateway-09',
      level: 'critical',
      state: 'offline',
      lastSeenAt: '2026-04-02T03:09:59Z',
      message: t('dashboard.alerts.messages.heartbeatLost'),
    },
    {
      id: formatSerialId(ID_PREFIX.ALERT, 6, 3),
      nodeName: 'Core-API-01',
      level: 'info',
      state: 'online',
      lastSeenAt: '2026-04-02T03:06:41Z',
      message: t('dashboard.alerts.messages.latencyWithinThreshold'),
    },
    {
      id: formatSerialId(ID_PREFIX.ALERT, 7, 3),
      nodeName: 'Region-SG-04',
      level: 'warning',
      state: 'online',
      lastSeenAt: '2026-04-02T03:04:03Z',
      message: t('dashboard.alerts.messages.configAppliedPendingValidation'),
    },
    {
      id: formatSerialId(ID_PREFIX.ALERT, 8, 3),
      nodeName: 'Tenant-Data-11',
      level: 'info',
      state: 'degraded',
      lastSeenAt: '2026-04-02T03:01:25Z',
      message: t('dashboard.alerts.messages.writeThroughputDrop'),
    },
  ]
}

export function createAlertColumns({
  t,
  isDateReady,
  formatDate,
  alertLevelValueEnum,
  nodeStateValueEnum,
}: CreateAlertColumnsOptions): ProTableColumn<AlertRow>[] {
  return [
    {
      id: 'nodeName',
      title: t('dashboard.alerts.columns.nodeName'),
      field: 'nodeName',
      sortable: true,
      minWidth: '140px',
      headerAlign: 'left',
      align: 'left',
    },
    {
      id: 'level',
      title: t('dashboard.alerts.columns.level'),
      field: 'level',
      sortable: true,
      width: '120px',
      valueEnum: alertLevelValueEnum,
    },
    {
      id: 'state',
      title: t('dashboard.alerts.columns.state'),
      field: 'state',
      sortable: true,
      width: '140px',
      valueEnum: nodeStateValueEnum,
    },
    {
      id: 'lastSeenAt',
      title: t('dashboard.alerts.columns.lastSeenAt'),
      field: 'lastSeenAt',
      sortable: true,
      width: '260px',
      minWidth: '220px',
      render: ({ row }) => {
        if (!isDateReady) return '—'
        return formatDate(String(row.lastSeenAt)) || '—'
      },
    },
    {
      id: 'message',
      title: t('dashboard.alerts.columns.message'),
      field: 'message',
      minWidth: '180px',
      headerAlign: 'left',
      align: 'left',
      className: () => 'min-w-0',
    },
  ]
}
