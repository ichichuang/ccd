import type { ProTableColumn } from '@ccd/vue-ui'
import type { ProTableDemoRow } from './proTableDemoData'

type Translate = (key: string) => string

export type ProTableDemoColumnPreset =
  | 'api'
  | 'compact'
  | 'metrics'
  | 'rendering'
  | 'standard'
  | 'wide'

function statusValueEnum(t: Translate): ProTableColumn<ProTableDemoRow>['valueEnum'] {
  return {
    guarded: { label: t('showcase.proTable.status.guarded'), severity: 'success' },
    preview: { label: t('showcase.proTable.status.preview'), severity: 'info' },
    ready: { label: t('showcase.proTable.status.ready'), severity: 'success' },
    request: { label: t('showcase.proTable.status.request'), severity: 'warn' },
  }
}

function baseColumns(t: Translate): ProTableColumn<ProTableDemoRow>[] {
  return [
    {
      id: 'capability',
      field: 'capability',
      title: t('showcase.proTable.columns.capability'),
      sortable: true,
      minWidth: '220px',
      virtualFill: true,
    },
    {
      id: 'owner',
      field: 'owner',
      title: t('showcase.proTable.columns.owner'),
      sortable: true,
      minWidth: '180px',
    },
    {
      id: 'status',
      field: 'status',
      title: t('showcase.proTable.columns.status'),
      sortable: true,
      minWidth: '150px',
      valueEnum: statusValueEnum(t),
    },
    {
      id: 'priority',
      field: 'priority',
      title: t('showcase.proTable.columns.priority'),
      sortable: true,
      align: 'center',
      headerAlign: 'center',
      minWidth: '110px',
    },
    {
      id: 'records',
      field: 'records',
      title: t('showcase.proTable.columns.records'),
      sortable: true,
      align: 'right',
      headerAlign: 'right',
      minWidth: '130px',
    },
    {
      id: 'workflow',
      field: 'workflow',
      title: t('showcase.proTable.columns.workflow'),
      minWidth: '260px',
    },
  ]
}

function signalColumn(t: Translate): ProTableColumn<ProTableDemoRow> {
  return {
    id: 'signal',
    field: 'signal',
    title: t('showcase.proTable.columns.signal'),
    minWidth: '280px',
  }
}

export function createProTableDemoColumns(
  t: Translate,
  preset: ProTableDemoColumnPreset = 'standard'
): ProTableColumn<ProTableDemoRow>[] {
  const columns = baseColumns(t)

  if (preset === 'compact') {
    return columns.filter(column => column.id !== 'workflow')
  }

  if (preset === 'wide') {
    return [...columns, signalColumn(t)]
  }

  if (preset === 'metrics') {
    return columns.filter(column =>
      ['capability', 'status', 'priority', 'records'].includes(column.id)
    )
  }

  if (preset === 'rendering') {
    return [
      ...columns.filter(column =>
        ['capability', 'status', 'priority', 'records'].includes(column.id)
      ),
      signalColumn(t),
    ]
  }

  if (preset === 'api') {
    return columns.filter(column =>
      ['capability', 'owner', 'status', 'records', 'workflow'].includes(column.id)
    )
  }

  return columns
}
