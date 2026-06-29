import type {
  ProTableApiExecutor,
  ProTableApiExecutorContext,
  ProTableLoadParams,
  RequestFn,
  SortMeta,
} from '@ccd/vue-ui'
import { isRecord } from '@ccd/shared-utils'

type Translate = (key: string) => string
const scheduleDemoRequestDelay = globalThis.setTimeout.bind(globalThis)
const cancelDemoRequestDelay = globalThis.clearTimeout.bind(globalThis)

export type ProTableDemoOwner = 'adapter' | 'catalog' | 'core' | 'vueUi' | 'webDemo'
export type ProTableDemoPriority = 'P0' | 'P1' | 'P2' | 'P3'
export type ProTableDemoStatus = 'guarded' | 'preview' | 'ready' | 'request'

export interface ProTableDemoRow extends Record<string, unknown> {
  id: string
  capability: string
  owner: string
  ownerKey: ProTableDemoOwner
  status: ProTableDemoStatus
  priority: ProTableDemoPriority
  records: number
  updatedAt: string
  workflow: string
  signal: string
}

interface ProTableDemoRowDefinition {
  id: string
  ownerKey: ProTableDemoOwner
  status: ProTableDemoStatus
  priority: ProTableDemoPriority
  records: number
}

const DEMO_ROW_DEFINITIONS: readonly ProTableDemoRowDefinition[] = [
  {
    id: 'typed-columns',
    ownerKey: 'vueUi',
    status: 'ready',
    priority: 'P0',
    records: 18,
  },
  {
    id: 'local-data',
    ownerKey: 'webDemo',
    status: 'ready',
    priority: 'P1',
    records: 42,
  },
  {
    id: 'toolbar',
    ownerKey: 'vueUi',
    status: 'guarded',
    priority: 'P1',
    records: 9,
  },
  {
    id: 'pagination',
    ownerKey: 'vueUi',
    status: 'ready',
    priority: 'P1',
    records: 56,
  },
  {
    id: 'server-request',
    ownerKey: 'adapter',
    status: 'request',
    priority: 'P0',
    records: 128,
  },
  {
    id: 'state-slots',
    ownerKey: 'webDemo',
    status: 'ready',
    priority: 'P2',
    records: 7,
  },
  {
    id: 'selection',
    ownerKey: 'vueUi',
    status: 'ready',
    priority: 'P1',
    records: 24,
  },
  {
    id: 'density',
    ownerKey: 'vueUi',
    status: 'preview',
    priority: 'P2',
    records: 14,
  },
  {
    id: 'virtual-scroll',
    ownerKey: 'vueUi',
    status: 'preview',
    priority: 'P2',
    records: 300,
  },
  {
    id: 'infinite-scroll',
    ownerKey: 'adapter',
    status: 'preview',
    priority: 'P2',
    records: 240,
  },
  {
    id: 'export-refresh',
    ownerKey: 'vueUi',
    status: 'guarded',
    priority: 'P1',
    records: 33,
  },
  {
    id: 'value-enum',
    ownerKey: 'vueUi',
    status: 'ready',
    priority: 'P1',
    records: 16,
  },
  {
    id: 'form-filters',
    ownerKey: 'webDemo',
    status: 'preview',
    priority: 'P3',
    records: 11,
  },
  {
    id: 'api-events',
    ownerKey: 'adapter',
    status: 'request',
    priority: 'P1',
    records: 88,
  },
  {
    id: 'source-links',
    ownerKey: 'catalog',
    status: 'guarded',
    priority: 'P2',
    records: 14,
  },
  {
    id: 'governance',
    ownerKey: 'catalog',
    status: 'guarded',
    priority: 'P0',
    records: 6,
  },
]

const DEMO_UPDATED_DATES = [
  '2026-01-08',
  '2026-01-16',
  '2026-02-03',
  '2026-02-14',
  '2026-03-02',
  '2026-03-17',
  '2026-04-05',
  '2026-04-19',
] as const

function rowMessageKey(rowId: string, field: 'capability' | 'signal' | 'workflow'): string {
  return `showcase.proTable.rows.${rowId}.${field}`
}

function createDemoRow(
  t: Translate,
  definition: ProTableDemoRowDefinition,
  index: number
): ProTableDemoRow {
  return {
    id: definition.id,
    capability: t(rowMessageKey(definition.id, 'capability')),
    owner: t(`showcase.proTable.owners.${definition.ownerKey}`),
    ownerKey: definition.ownerKey,
    status: definition.status,
    priority: definition.priority,
    records: definition.records,
    updatedAt: DEMO_UPDATED_DATES[index % DEMO_UPDATED_DATES.length],
    workflow: t(rowMessageKey(definition.id, 'workflow')),
    signal: t(rowMessageKey(definition.id, 'signal')),
  }
}

export function createProTableDemoRows(t: Translate): ProTableDemoRow[] {
  return DEMO_ROW_DEFINITIONS.map((definition, index) => createDemoRow(t, definition, index))
}

export function createVirtualProTableDemoRows(t: Translate): ProTableDemoRow[] {
  const baseRows = createProTableDemoRows(t)

  return Array.from({ length: 96 }, (_entry, index) => {
    const baseRow = baseRows[index % baseRows.length]
    const sequence = index + 1

    return {
      ...baseRow,
      id: `${baseRow.id}-${sequence}`,
      capability: `${baseRow.capability} ${sequence}`,
      records: baseRow.records + sequence,
    }
  })
}

function getSearchText(row: ProTableDemoRow): string {
  return [
    row.capability,
    row.owner,
    row.status,
    row.priority,
    row.workflow,
    row.signal,
    String(row.records),
  ]
    .join(' ')
    .toLowerCase()
}

function applyGlobalFilter(rows: readonly ProTableDemoRow[], query: string): ProTableDemoRow[] {
  const normalizedQuery = query.trim().toLowerCase()
  if (!normalizedQuery) return [...rows]

  return rows.filter(row => getSearchText(row).includes(normalizedQuery))
}

function getSortValue(row: ProTableDemoRow, field: string): string | number {
  if (field === 'capability') return row.capability
  if (field === 'owner') return row.owner
  if (field === 'status') return row.status
  if (field === 'priority') return row.priority
  if (field === 'records') return row.records
  if (field === 'workflow') return row.workflow
  if (field === 'signal') return row.signal
  return row.id
}

function getSortMeta(params: ProTableLoadParams): SortMeta[] {
  const { field, direction } = params.sort
  if (params.sort.multi && params.sort.multi.length > 0) return params.sort.multi
  if (!field || !direction) return []
  return [{ field, direction }]
}

function compareServerSortValue(
  left: ProTableDemoRow,
  right: ProTableDemoRow,
  meta: SortMeta
): number {
  const leftValue = getSortValue(left, meta.field)
  const rightValue = getSortValue(right, meta.field)
  const result =
    typeof leftValue === 'number' && typeof rightValue === 'number'
      ? leftValue - rightValue
      : String(leftValue).localeCompare(String(rightValue))

  return meta.direction === 'asc' ? result : -result
}

function applyServerSort(rows: ProTableDemoRow[], params: ProTableLoadParams): ProTableDemoRow[] {
  const sortMeta = getSortMeta(params)
  if (sortMeta.length === 0) return rows

  return rows
    .map((row, index) => ({ row, index }))
    .sort((left, right) => {
      for (const meta of sortMeta) {
        const result = compareServerSortValue(left.row, right.row, meta)
        if (result !== 0) return result
      }
      return left.index - right.index
    })
    .map(item => item.row)
}

function parseMultiSortQuery(value: string): SortMeta[] {
  if (!value) return []

  try {
    const parsed: unknown = JSON.parse(value)
    if (!Array.isArray(parsed)) return []

    return parsed.flatMap(item => {
      if (!isRecord(item)) return []
      const field = typeof item.field === 'string' ? item.field : ''
      const direction =
        item.direction === 'asc' || item.direction === 'desc' ? item.direction : null
      return field && direction ? [{ field, direction }] : []
    })
  } catch {
    return []
  }
}

function paginateRows(
  rows: readonly ProTableDemoRow[],
  page: number,
  pageSize: number
): ProTableDemoRow[] {
  const safePage = Math.max(1, page)
  const safePageSize = Math.max(1, pageSize)
  const start = (safePage - 1) * safePageSize

  return rows.slice(start, start + safePageSize)
}

function toAbortError(): DOMException {
  return new DOMException('The ProTable demo request was aborted.', 'AbortError')
}

function waitForDemoRequest(signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(toAbortError())
      return
    }

    let timeoutId: ReturnType<typeof scheduleDemoRequestDelay> | undefined

    function cleanup(): void {
      if (timeoutId !== undefined) {
        cancelDemoRequestDelay(timeoutId)
        timeoutId = undefined
      }
      signal?.removeEventListener('abort', abortHandler)
    }

    function abortHandler(): void {
      cleanup()
      reject(toAbortError())
    }

    signal?.addEventListener('abort', abortHandler, { once: true })
    timeoutId = scheduleDemoRequestDelay(() => {
      cleanup()
      resolve()
    }, 140)
  })
}

export function createProTableDemoRequest(
  rows: readonly ProTableDemoRow[]
): RequestFn<ProTableDemoRow> {
  return async params => {
    await waitForDemoRequest(params.signal)

    const filteredRows = applyGlobalFilter(rows, params.filter.global)
    const sortedRows = applyServerSort(filteredRows, params)

    return {
      data: paginateRows(sortedRows, params.page, params.pageSize),
      total: sortedRows.length,
    }
  }
}

function toPositiveInteger(value: string | number | boolean | undefined, fallback: number): number {
  const numericValue =
    typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : Number.NaN

  if (!Number.isFinite(numericValue) || numericValue < 1) return fallback
  return Math.floor(numericValue)
}

function toQueryString(value: string | number | boolean | undefined): string {
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  return ''
}

function createLoadParamsFromApiContext(ctx: ProTableApiExecutorContext): ProTableLoadParams {
  const sortField = toQueryString(ctx.query.sortBy)
  const sortDirection = toQueryString(ctx.query.order)
  const multiSort = parseMultiSortQuery(toQueryString(ctx.query.multiSort))

  return {
    page: toPositiveInteger(ctx.query.page, 1),
    pageSize: toPositiveInteger(ctx.query.limit, 5),
    sort: {
      field: sortField || null,
      direction: sortDirection === 'asc' || sortDirection === 'desc' ? sortDirection : null,
      ...(multiSort.length > 0 ? { multi: multiSort } : {}),
    },
    filter: {
      global: toQueryString(ctx.query.search),
      columns: {},
    },
    signal: ctx.config?.signal,
  }
}

export function createProTableApiExecutor(rows: readonly ProTableDemoRow[]): ProTableApiExecutor {
  return async ctx => {
    const params = createLoadParamsFromApiContext(ctx)
    await waitForDemoRequest(params.signal)

    const filteredRows = applyGlobalFilter(rows, params.filter.global)
    const sortedRows = applyServerSort(filteredRows, params)

    return {
      data: {
        records: paginateRows(sortedRows, params.page, params.pageSize),
        total: sortedRows.length,
        endpoint: ctx.url,
        method: ctx.method,
      },
    }
  }
}
