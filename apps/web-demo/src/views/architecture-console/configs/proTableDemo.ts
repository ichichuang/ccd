import type { ProTableColumn } from '@ccd/vue-ui'

type Translate = (key: string) => string

export type ConsoleTableStatus = 'guarded' | 'app' | 'blocked'

export interface ConsoleTableRow extends Record<string, unknown> {
  id: string
  layer: string
  owner: string
  status: ConsoleTableStatus
  validation: string
  evidencePath: string
  detail: string
}

export function createConsoleTableColumns(t: Translate): ProTableColumn<ConsoleTableRow>[] {
  const key = (field: string): string => `console.demos.proTable.${field}`

  return [
    {
      id: 'layer',
      field: 'layer',
      title: t(key('columns.layer')),
      sortable: true,
      minWidth: '190px',
      virtualFill: true,
      className: 'architecture-safe-code',
    },
    {
      id: 'owner',
      field: 'owner',
      title: t(key('columns.owner')),
      minWidth: '210px',
    },
    {
      id: 'status',
      field: 'status',
      title: t(key('columns.status')),
      minWidth: '160px',
      filterable: false,
      valueEnum: {
        guarded: { label: t(key('status.guarded')), severity: 'success' },
        app: { label: t(key('status.app')), severity: 'info' },
        blocked: { label: t(key('status.blocked')), severity: 'warn' },
      },
    },
    {
      id: 'validation',
      field: 'validation',
      title: t(key('columns.validation')),
      minWidth: '240px',
      className: 'architecture-safe-code',
    },
    {
      id: 'evidencePath',
      field: 'evidencePath',
      title: t(key('columns.evidence')),
      minWidth: '280px',
      className: 'architecture-safe-code',
    },
  ]
}

export function createConsoleTableRows(t: Translate): ConsoleTableRow[] {
  const key = (field: string): string => `console.demos.proTable.${field}`

  return [
    {
      id: 'contracts',
      layer: '@ccd/contracts',
      owner: t(key('rows.contractsOwner')),
      status: 'guarded',
      validation: 'pnpm arch:boundaries',
      evidencePath: 'packages/contracts/**',
      detail: t(key('details.contracts')),
    },
    {
      id: 'core',
      layer: '@ccd/core',
      owner: t(key('rows.coreOwner')),
      status: 'guarded',
      validation: 'pnpm arch:runtime',
      evidencePath: 'packages/core/**',
      detail: t(key('details.core')),
    },
    {
      id: 'web-http',
      layer: 'apps/web-demo/src/utils/http',
      owner: t(key('rows.httpOwner')),
      status: 'app',
      validation: 'pnpm ai:guard',
      evidencePath: 'apps/web-demo/src/utils/http/**',
      detail: t(key('details.http')),
    },
    {
      id: 'web-safe-storage',
      layer: 'apps/web-demo/src/utils/safeStorage',
      owner: t(key('rows.safeStorageOwner')),
      status: 'app',
      validation: 'pnpm ai:guard',
      evidencePath: 'apps/web-demo/src/utils/safeStorage/**',
      detail: t(key('details.safeStorage')),
    },
    {
      id: 'blocked-safe-storage',
      layer: '@ccd/shared-utils safeStorage',
      owner: t(key('rows.blockedOwner')),
      status: 'blocked',
      validation: 'P4-SafeStorageShared-Blocked',
      evidencePath: '.ai/runtime/repair_list.md',
      detail: t(key('details.blocked')),
    },
  ]
}
