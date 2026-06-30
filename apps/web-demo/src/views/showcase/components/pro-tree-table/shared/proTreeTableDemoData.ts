import type { ProTreeTableColumn, ProTreeTableNode } from '@ccd/vue-ui'

export type ProTreeTableDemoStatus = 'baseline' | 'deferred' | 'planned'

export interface ProTreeTableDemoRow extends Record<string, unknown> {
  name: string
  owner: string
  status: ProTreeTableDemoStatus
  order: number
  evidence: string
}

type Translate = (key: string) => string

export function createProTreeTableDemoColumns(
  t: Translate
): ProTreeTableColumn<ProTreeTableDemoRow>[] {
  return [
    {
      id: 'name',
      field: 'name',
      title: t('showcase.proTreeTable.columns.name'),
      width: 260,
      minWidth: 240,
      pinned: 'left',
      sortable: true,
    },
    {
      id: 'owner',
      field: 'owner',
      title: t('showcase.proTreeTable.columns.owner'),
      minWidth: 160,
      align: 'center',
    },
    {
      id: 'status',
      field: 'status',
      title: t('showcase.proTreeTable.columns.status'),
      minWidth: 150,
      align: 'center',
      sortable: true,
      valueEnum: {
        baseline: { label: t('showcase.proTreeTable.status.baseline') },
        deferred: { label: t('showcase.proTreeTable.status.deferred') },
        planned: { label: t('showcase.proTreeTable.status.planned') },
      },
    },
    {
      id: 'order',
      field: 'order',
      title: t('showcase.proTreeTable.columns.order'),
      width: 96,
      align: 'right',
      render: ({ value }) =>
        typeof value === 'number' ? `#${String(value).padStart(2, '0')}` : '',
    },
    {
      id: 'evidence',
      field: 'evidence',
      title: t('showcase.proTreeTable.columns.evidence'),
      minWidth: 320,
    },
  ]
}

export function createProTreeTableDemoNodes(t: Translate): ProTreeTableNode<ProTreeTableDemoRow>[] {
  return [
    {
      key: 'wrapper',
      data: createRow(t, 'wrapper', 'baseline'),
      children: [
        {
          key: 'wrapper.primevue',
          data: createRow(t, 'primevue', 'baseline', 2),
          leaf: true,
        },
        {
          key: 'wrapper.types',
          data: createRow(t, 'types', 'baseline', 3),
          leaf: true,
        },
        {
          key: 'wrapper.columns',
          data: createRow(t, 'columns', 'baseline', 4),
          leaf: true,
        },
        {
          key: 'wrapper.state',
          data: createRow(t, 'state', 'baseline', 5),
          leaf: true,
        },
      ],
    },
    {
      key: 'deferred',
      data: createRow(t, 'deferred', 'deferred', 6),
      children: [
        {
          key: 'deferred.lazy',
          data: createRow(t, 'lazy', 'deferred', 7),
          leaf: true,
        },
        {
          key: 'deferred.editing',
          data: createRow(t, 'editing', 'deferred', 8),
          leaf: true,
        },
        {
          key: 'deferred.virtual',
          data: createRow(t, 'virtual', 'deferred', 9),
          leaf: true,
        },
        {
          key: 'deferred.engine',
          data: createRow(t, 'engine', 'planned', 10),
          leaf: true,
        },
      ],
    },
  ]
}

function createRow(
  t: Translate,
  key: string,
  status: ProTreeTableDemoStatus,
  order = 1
): ProTreeTableDemoRow {
  return {
    name: t(`showcase.proTreeTable.rows.${key}.name`),
    owner: t(`showcase.proTreeTable.rows.${key}.owner`),
    status,
    order,
    evidence: t(`showcase.proTreeTable.rows.${key}.evidence`),
  }
}
