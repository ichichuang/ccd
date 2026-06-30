import type { ProTreeTableColumn, ProTreeTableNode } from '@ccd/vue-ui'

export type ProTreeTableDemoStatus = 'baseline' | 'deferred' | 'planned'

export interface ProTreeTableDemoRow extends Record<string, unknown> {
  name: string
  owner: string
  status: ProTreeTableDemoStatus
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
      minWidth: '16rem',
    },
    {
      id: 'owner',
      field: 'owner',
      title: t('showcase.proTreeTable.columns.owner'),
      minWidth: '10rem',
    },
    {
      id: 'status',
      field: 'status',
      title: t('showcase.proTreeTable.columns.status'),
      minWidth: '9rem',
      valueEnum: {
        baseline: { label: t('showcase.proTreeTable.status.baseline') },
        deferred: { label: t('showcase.proTreeTable.status.deferred') },
        planned: { label: t('showcase.proTreeTable.status.planned') },
      },
    },
    {
      id: 'evidence',
      field: 'evidence',
      title: t('showcase.proTreeTable.columns.evidence'),
      minWidth: '18rem',
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
          data: createRow(t, 'primevue', 'baseline'),
          leaf: true,
        },
        {
          key: 'wrapper.types',
          data: createRow(t, 'types', 'baseline'),
          leaf: true,
        },
        {
          key: 'wrapper.state',
          data: createRow(t, 'state', 'baseline'),
          leaf: true,
        },
      ],
    },
    {
      key: 'deferred',
      data: createRow(t, 'deferred', 'deferred'),
      children: [
        {
          key: 'deferred.lazy',
          data: createRow(t, 'lazy', 'deferred'),
          leaf: true,
        },
        {
          key: 'deferred.editing',
          data: createRow(t, 'editing', 'deferred'),
          leaf: true,
        },
        {
          key: 'deferred.virtual',
          data: createRow(t, 'virtual', 'deferred'),
          leaf: true,
        },
        {
          key: 'deferred.engine',
          data: createRow(t, 'engine', 'planned'),
          leaf: true,
        },
      ],
    },
  ]
}

function createRow(t: Translate, key: string, status: ProTreeTableDemoStatus): ProTreeTableDemoRow {
  return {
    name: t(`showcase.proTreeTable.rows.${key}.name`),
    owner: t(`showcase.proTreeTable.rows.${key}.owner`),
    status,
    evidence: t(`showcase.proTreeTable.rows.${key}.evidence`),
  }
}
