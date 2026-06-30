<script setup lang="ts">
import type {
  FilterState,
  HeightMode,
  PaginationConfig,
  ProTableApiExecutor,
  ProTableCellEditCompletePayload,
  ProTableColumn,
  ProTableColumnGroupRow,
  ProTableExposed,
  ProTableRowEditSavePayload,
  ProTableSortMode,
  RequestConfig,
  RequestFn,
  SortState,
} from '@ccd/vue-ui'
import { useI18n } from 'vue-i18n'
import { showcaseCatalog } from '../../../data/showcaseCatalog'
import type { ShowcaseCatalogItem } from '../../../data/types'
import ShowcaseCard from '../../../shared/ShowcaseCard.vue'
import ShowcaseDemoPanel from '../../../shared/ShowcaseDemoPanel.vue'
import ShowcaseEmptyState from '../../../shared/ShowcaseEmptyState.vue'
import ShowcaseEvidencePanel from '../../../shared/ShowcaseEvidencePanel.vue'
import ShowcaseFeatureCard from '../../../shared/ShowcaseFeatureCard.vue'
import ShowcaseHero from '../../../shared/ShowcaseHero.vue'
import ShowcaseRelatedLinks from '../../../shared/ShowcaseRelatedLinks.vue'
import ShowcaseSection from '../../../shared/ShowcaseSection.vue'
import ShowcaseSourceLinks from '../../../shared/ShowcaseSourceLinks.vue'
import ShowcaseToolbar from '../../../shared/ShowcaseToolbar.vue'
import { createProTableDemoColumnGroups, createProTableDemoColumns } from './proTableColumns'
import type { ProTableDemoColumnPreset } from './proTableColumns'
import {
  createProTableApiExecutor,
  createProTableDemoRequest,
  createProTableDemoRows,
  createVirtualProTableDemoRows,
  type ProTableDemoOwner,
  type ProTableDemoRow,
  type ProTableDemoStatus,
} from './proTableDemoData'

type ProTableDemoMode =
  | 'api-events'
  | 'basic'
  | 'cell-rendering'
  | 'column-groups'
  | 'columns'
  | 'export-refresh'
  | 'form-composition'
  | 'inline-editing'
  | 'overview'
  | 'pagination'
  | 'row-editing'
  | 'selection'
  | 'server-request'
  | 'sorting-filtering'
  | 'states'
  | 'toolbar-density'
  | 'virtual-infinite'

type ProTableRequestMode = 'apiExecutor' | 'localRequest'
type VirtualPresentationMode = 'infinite' | 'virtual'
type StatusFilter = ProTableDemoStatus | 'all'
type OwnerFilter = ProTableDemoOwner | 'all'

type ProTableFeatureKey =
  | 'apiExecutor'
  | 'apiEvents'
  | 'catalogSource'
  | 'cellValueEnum'
  | 'columnGroups'
  | 'columns'
  | 'exportRefresh'
  | 'filters'
  | 'formComposition'
  | 'inlineEditing'
  | 'pagination'
  | 'request'
  | 'selection'
  | 'states'
  | 'stateEvidence'
  | 'toolbar'
  | 'typedRows'
  | 'virtualInfinite'

type ProTableTechnicalKey =
  | 'apiBoundary'
  | 'catalogSource'
  | 'i18nCopy'
  | 'noRenderers'
  | 'callerPersistence'
  | 'proTableOnly'
  | 'stateEvidence'

interface SelectOption<T extends string> {
  label: string
  value: T
}

interface ProTableModeConfig {
  columnPreset: ProTableDemoColumnPreset
  pageSize: number
  pagination?: boolean | PaginationConfig
  selectable?: false | 'checkbox'
  requestMode?: ProTableRequestMode
  sortMode?: ProTableSortMode
  statusFilter?: boolean
  ownerFilter?: boolean
  stateControls?: boolean
  columnControls?: boolean
  columnGroups?: boolean
  columnFilters?: boolean
  dateColumnFilter?: boolean
  inlineEditing?: boolean
  inlineEditMode?: 'cell' | 'row'
  semanticStatusSort?: boolean
  fuzzySearch?: boolean
  eventLog?: boolean
  virtualModeSwitch?: boolean
  showDensityControl?: boolean
  heightMode?: HeightMode
  height?: string
  features: readonly ProTableFeatureKey[]
  explanations: readonly ProTableFeatureKey[]
  technical: readonly ProTableTechnicalKey[]
  relatedIds: readonly string[]
}

interface SummaryMessage {
  key: string
  params?: Record<string, string | number>
}

defineOptions({ name: 'ProTableDemoShell' })

const props = defineProps<{
  id: string
  mode: ProTableDemoMode
}>()

const { t } = useI18n()

const SHARED_SOURCE_PATHS = [
  'apps/web-demo/src/views/showcase/components/pro-table/shared/ProTableDemoShell.vue',
  'apps/web-demo/src/views/showcase/components/pro-table/shared/proTableDemoData.ts',
  'apps/web-demo/src/views/showcase/components/pro-table/shared/proTableColumns.ts',
] as const

const PRO_TABLE_API_EVIDENCE_PATHS = [
  'packages/vue-ui/src/ProTable/ProTable.vue',
  'packages/vue-ui/src/ProTable/engine/types/props.ts',
  'packages/vue-ui/src/ProTable/components/ProTableToolbar.vue',
] as const

const MODE_CONFIGS: Record<ProTableDemoMode, ProTableModeConfig> = {
  overview: {
    columnPreset: 'wide',
    pageSize: 5,
    selectable: 'checkbox',
    features: ['typedRows', 'toolbar'],
    explanations: ['stateEvidence', 'catalogSource'],
    technical: ['proTableOnly', 'i18nCopy'],
    relatedIds: ['components-pro-table-basic', 'components-pro-table-server-request'],
  },
  basic: {
    columnPreset: 'standard',
    pageSize: 5,
    columnFilters: true,
    features: ['typedRows', 'pagination'],
    explanations: ['toolbar', 'states'],
    technical: ['proTableOnly', 'catalogSource'],
    relatedIds: ['components-pro-table-columns', 'components-pro-table-pagination'],
  },
  columns: {
    columnPreset: 'wide',
    pageSize: 5,
    columnControls: true,
    features: ['columns', 'cellValueEnum'],
    explanations: ['toolbar', 'stateEvidence'],
    technical: ['noRenderers', 'stateEvidence'],
    relatedIds: ['components-pro-table-basic', 'components-pro-table-cell-rendering'],
  },
  'column-groups': {
    columnPreset: 'wide',
    pageSize: 5,
    columnGroups: true,
    columnFilters: true,
    virtualModeSwitch: true,
    sortMode: 'multiple',
    features: ['columnGroups', 'columns'],
    explanations: ['filters', 'stateEvidence'],
    technical: ['proTableOnly', 'i18nCopy'],
    relatedIds: ['components-pro-table-columns', 'components-pro-table-sorting-filtering'],
  },
  'sorting-filtering': {
    columnPreset: 'standard',
    pageSize: 5,
    statusFilter: true,
    columnFilters: true,
    dateColumnFilter: true,
    semanticStatusSort: true,
    fuzzySearch: true,
    sortMode: 'multiple',
    features: ['filters', 'typedRows'],
    explanations: ['toolbar', 'pagination'],
    technical: ['stateEvidence', 'i18nCopy'],
    relatedIds: ['components-pro-table-pagination', 'components-pro-table-server-request'],
  },
  pagination: {
    columnPreset: 'metrics',
    pageSize: 4,
    pagination: { pageSize: 4, pageSizeOptions: [4, 8, 12] },
    features: ['pagination', 'typedRows'],
    explanations: ['stateEvidence', 'toolbar'],
    technical: ['proTableOnly', 'stateEvidence'],
    relatedIds: ['components-pro-table-sorting-filtering', 'components-pro-table-server-request'],
  },
  'server-request': {
    columnPreset: 'api',
    pageSize: 5,
    requestMode: 'localRequest',
    features: ['request', 'pagination'],
    explanations: ['filters', 'apiEvents'],
    technical: ['apiBoundary', 'stateEvidence'],
    relatedIds: ['components-pro-table-api-events', 'components-pro-table-virtual-infinite'],
  },
  states: {
    columnPreset: 'compact',
    pageSize: 5,
    stateControls: true,
    features: ['states', 'typedRows'],
    explanations: ['toolbar', 'stateEvidence'],
    technical: ['proTableOnly', 'i18nCopy'],
    relatedIds: ['components-pro-table-basic', 'components-pro-table-selection'],
  },
  selection: {
    columnPreset: 'standard',
    pageSize: 5,
    selectable: 'checkbox',
    features: ['selection', 'stateEvidence'],
    explanations: ['toolbar', 'exportRefresh'],
    technical: ['stateEvidence', 'proTableOnly'],
    relatedIds: ['components-pro-table-export-refresh', 'components-pro-table-api-events'],
  },
  'toolbar-density': {
    columnPreset: 'wide',
    pageSize: 5,
    showDensityControl: true,
    features: ['toolbar', 'columns'],
    explanations: ['states', 'typedRows'],
    technical: ['proTableOnly', 'i18nCopy'],
    relatedIds: ['components-pro-table-columns', 'components-pro-table-states'],
  },
  'virtual-infinite': {
    columnPreset: 'compact',
    pageSize: 18,
    virtualModeSwitch: true,
    heightMode: 'fixed',
    height: '440px',
    features: ['virtualInfinite', 'request'],
    explanations: ['states', 'pagination'],
    technical: ['apiBoundary', 'proTableOnly'],
    relatedIds: ['components-pro-table-server-request', 'components-pro-table-pagination'],
  },
  'export-refresh': {
    columnPreset: 'standard',
    pageSize: 5,
    selectable: 'checkbox',
    features: ['exportRefresh', 'selection'],
    explanations: ['stateEvidence', 'toolbar'],
    technical: ['stateEvidence', 'proTableOnly'],
    relatedIds: ['components-pro-table-selection', 'components-pro-table-api-events'],
  },
  'cell-rendering': {
    columnPreset: 'rendering',
    pageSize: 5,
    features: ['cellValueEnum', 'columns'],
    explanations: ['typedRows', 'toolbar'],
    technical: ['noRenderers', 'i18nCopy'],
    relatedIds: ['components-pro-table-columns', 'components-pro-table-basic'],
  },
  'form-composition': {
    columnPreset: 'wide',
    pageSize: 5,
    ownerFilter: true,
    features: ['formComposition', 'filters'],
    explanations: ['typedRows', 'states'],
    technical: ['proTableOnly', 'i18nCopy'],
    relatedIds: ['components-pro-table-sorting-filtering', 'components-pro-form-basic-schema'],
  },
  'inline-editing': {
    columnPreset: 'standard',
    pageSize: 5,
    columnFilters: true,
    dateColumnFilter: true,
    inlineEditing: true,
    inlineEditMode: 'cell',
    eventLog: true,
    features: ['inlineEditing', 'typedRows'],
    explanations: ['stateEvidence', 'filters'],
    technical: ['callerPersistence', 'proTableOnly'],
    relatedIds: ['components-pro-table-cell-rendering', 'components-pro-table-api-events'],
  },
  'row-editing': {
    columnPreset: 'standard',
    pageSize: 5,
    columnFilters: true,
    dateColumnFilter: true,
    inlineEditing: true,
    inlineEditMode: 'row',
    eventLog: true,
    features: ['inlineEditing', 'typedRows'],
    explanations: ['stateEvidence', 'filters'],
    technical: ['callerPersistence', 'proTableOnly'],
    relatedIds: ['components-pro-table-inline-editing', 'components-pro-table-api-events'],
  },
  'api-events': {
    columnPreset: 'api',
    pageSize: 5,
    requestMode: 'apiExecutor',
    eventLog: true,
    selectable: 'checkbox',
    features: ['apiExecutor', 'apiEvents'],
    explanations: ['request', 'stateEvidence'],
    technical: ['apiBoundary', 'catalogSource'],
    relatedIds: ['components-pro-table-server-request', 'components-pro-table-export-refresh'],
  },
}

const FEATURE_ICONS: Record<ProTableFeatureKey, `i-${string}`> = {
  apiExecutor: 'i-lucide-plug-zap',
  apiEvents: 'i-lucide-radio',
  catalogSource: 'i-lucide-folder-code',
  cellValueEnum: 'i-lucide-tags',
  columnGroups: 'i-lucide-panels-top-left',
  columns: 'i-lucide-columns-3',
  exportRefresh: 'i-lucide-download',
  filters: 'i-lucide-filter',
  formComposition: 'i-lucide-list-filter',
  inlineEditing: 'i-lucide-pencil-line',
  pagination: 'i-lucide-list-end',
  request: 'i-lucide-webhook',
  selection: 'i-lucide-check-square',
  states: 'i-lucide-list-checks',
  stateEvidence: 'i-lucide-activity',
  toolbar: 'i-lucide-settings-2',
  typedRows: 'i-lucide-braces',
  virtualInfinite: 'i-lucide-rows-3',
}

const TECHNICAL_ICONS: Record<ProTableTechnicalKey, `i-${string}`> = {
  apiBoundary: 'i-lucide-shield-check',
  catalogSource: 'i-lucide-folder-code',
  i18nCopy: 'i-lucide-languages',
  callerPersistence: 'i-lucide-send',
  noRenderers: 'i-lucide-code-2',
  proTableOnly: 'i-lucide-table',
  stateEvidence: 'i-lucide-activity',
}

const tableRef = ref<ProTableExposed | null>(null)
const selectedRows = ref<ProTableDemoRow[]>([])
const statusFilter = ref<StatusFilter>('all')
const ownerFilter = ref<OwnerFilter>('all')
const localLoading = ref(false)
const localEmpty = ref(false)
const ownerColumnVisible = ref(true)
const virtualPresentation = ref<VirtualPresentationMode>('virtual')
const activeRow = ref<ProTableDemoRow | null>(null)
const editableRows = ref<ProTableDemoRow[]>([])
const eventMessages = ref<string[]>([])
const actionMessage = ref<SummaryMessage>({ key: 'showcase.proTable.actions.ready' })
const stateMessage = ref<SummaryMessage | null>(null)
const fetchMessage = ref<SummaryMessage | null>(null)

const modeConfig = computed(() => MODE_CONFIGS[props.mode])
const item = computed(() => requireCatalogItem(props.id))
const baseRows = computed(() => createProTableDemoRows(t))
const virtualRows = computed(() => createVirtualProTableDemoRows(t))

function cloneDemoRows(rows: readonly ProTableDemoRow[]): ProTableDemoRow[] {
  return rows.map(row => ({ ...row }))
}

const sourcePaths = computed(() => [...item.value.sourcePaths, ...SHARED_SOURCE_PATHS])
const relatedIds = computed(() => modeConfig.value.relatedIds)
const featureKeys = computed(() => modeConfig.value.features)
const explanationKeys = computed(() => modeConfig.value.explanations)
const technicalKeys = computed(() => modeConfig.value.technical)

const statusOptions = computed<SelectOption<StatusFilter>[]>(() => [
  { label: t('showcase.proTable.filters.allStatuses'), value: 'all' },
  { label: t('showcase.proTable.status.guarded'), value: 'guarded' },
  { label: t('showcase.proTable.status.preview'), value: 'preview' },
  { label: t('showcase.proTable.status.ready'), value: 'ready' },
  { label: t('showcase.proTable.status.request'), value: 'request' },
])

const ownerOptions = computed<SelectOption<OwnerFilter>[]>(() => [
  { label: t('showcase.proTable.filters.allOwners'), value: 'all' },
  { label: t('showcase.proTable.owners.adapter'), value: 'adapter' },
  { label: t('showcase.proTable.owners.catalog'), value: 'catalog' },
  { label: t('showcase.proTable.owners.core'), value: 'core' },
  { label: t('showcase.proTable.owners.vueUi'), value: 'vueUi' },
  { label: t('showcase.proTable.owners.webDemo'), value: 'webDemo' },
])

const virtualModeOptions = computed<SelectOption<VirtualPresentationMode>[]>(() => [
  { label: t('showcase.proTable.virtualModes.virtual'), value: 'virtual' },
  { label: t('showcase.proTable.virtualModes.infinite'), value: 'infinite' },
])

const requestSourceRows = computed(() =>
  modeConfig.value.virtualModeSwitch ? virtualRows.value : baseRows.value
)

const filteredRows = computed(() => {
  if (localEmpty.value && modeConfig.value.stateControls) return []

  let rows = modeConfig.value.virtualModeSwitch ? virtualRows.value : baseRows.value

  if (modeConfig.value.statusFilter && statusFilter.value !== 'all') {
    rows = rows.filter(row => row.status === statusFilter.value)
  }

  if (modeConfig.value.ownerFilter && ownerFilter.value !== 'all') {
    rows = rows.filter(row => row.ownerKey === ownerFilter.value)
  }

  return rows
})

// Per-column filtering showcase (PT-UI-03): the ProTable engine already implements
// `setColumnFilter` + `applyFilter`, but no showcase column opted in, so the header
// filter UI never rendered in a real route. Modes flagged `columnFilters` surface it
// on a text column (`capability`) and a select column (`status`) while leaving the
// remaining columns non-filterable, proving the opt-in contract end to end.
function withColumnFilters(
  column: ProTableColumn<ProTableDemoRow>
): ProTableColumn<ProTableDemoRow> {
  if (column.id === 'capability') {
    return { ...column, filterable: true, filterType: 'text' }
  }
  if (column.id === 'status') {
    return {
      ...column,
      filterable: true,
      filterType: 'select',
      filterOptions: [
        { label: t('showcase.proTable.status.guarded'), value: 'guarded' },
        { label: t('showcase.proTable.status.preview'), value: 'preview' },
        { label: t('showcase.proTable.status.ready'), value: 'ready' },
        { label: t('showcase.proTable.status.request'), value: 'request' },
      ],
    }
  }
  return column
}

const statusSortOrder: readonly ProTableDemoStatus[] = ['guarded', 'request', 'preview', 'ready']

function getStatusSortRank(value: unknown): number {
  if (typeof value !== 'string') return statusSortOrder.length
  const index = statusSortOrder.findIndex(item => item === value)
  return index >= 0 ? index : statusSortOrder.length
}

function withSemanticStatusSort(
  column: ProTableColumn<ProTableDemoRow>
): ProTableColumn<ProTableDemoRow> {
  if (column.id !== 'status') return column
  return {
    ...column,
    sortable: 'custom',
    sortCompare: (left, right) => getStatusSortRank(left) - getStatusSortRank(right),
  }
}

function createUpdatedAtFilterColumn(): ProTableColumn<ProTableDemoRow> {
  return {
    id: 'updatedAt',
    field: 'updatedAt',
    title: t('showcase.proTable.columns.updatedAt'),
    sortable: true,
    filterable: true,
    filterType: 'date',
    minWidth: '160px',
  }
}

function withInlineEditing(
  column: ProTableColumn<ProTableDemoRow>
): ProTableColumn<ProTableDemoRow> {
  if (column.id === 'capability') {
    return { ...column, editable: true, editorType: 'text' }
  }
  if (column.id === 'status') {
    return {
      ...column,
      editable: true,
      editorType: 'select',
      editorOptions: [
        { label: t('showcase.proTable.status.guarded'), value: 'guarded' },
        { label: t('showcase.proTable.status.preview'), value: 'preview' },
        { label: t('showcase.proTable.status.ready'), value: 'ready' },
        { label: t('showcase.proTable.status.request'), value: 'request' },
      ],
    }
  }
  if (column.id === 'records') {
    return { ...column, editable: true, editorType: 'number' }
  }
  if (column.id === 'updatedAt') {
    return { ...column, editable: true, editorType: 'date' }
  }
  return column
}

const tableColumns = computed<ProTableColumn<ProTableDemoRow>[]>(() => {
  const columns = createProTableDemoColumns(t, modeConfig.value.columnPreset)
  const filteredColumns = modeConfig.value.columnFilters ? columns.map(withColumnFilters) : columns
  const sortedColumns = modeConfig.value.semanticStatusSort
    ? filteredColumns.map(withSemanticStatusSort)
    : filteredColumns
  const datedColumns = modeConfig.value.dateColumnFilter
    ? [...sortedColumns, createUpdatedAtFilterColumn()]
    : sortedColumns
  return modeConfig.value.inlineEditing ? datedColumns.map(withInlineEditing) : datedColumns
})

const tableColumnGroups = computed<ProTableColumnGroupRow[] | undefined>(() =>
  modeConfig.value.columnGroups ? createProTableDemoColumnGroups(t) : undefined
)

const isInfiniteMode = computed(
  () => modeConfig.value.virtualModeSwitch && virtualPresentation.value === 'infinite'
)
const isVirtualMode = computed(
  () => modeConfig.value.virtualModeSwitch && virtualPresentation.value === 'virtual'
)
const usesLocalRequest = computed(
  () => modeConfig.value.requestMode === 'localRequest' || isInfiniteMode.value
)
const usesApiExecutor = computed(() => modeConfig.value.requestMode === 'apiExecutor')

const tableRequest = computed<RequestFn<ProTableDemoRow> | undefined>(() => {
  if (!usesLocalRequest.value) return undefined
  return createProTableDemoRequest(requestSourceRows.value)
})

const tableApiExecutor = computed<ProTableApiExecutor | undefined>(() => {
  if (!usesApiExecutor.value) return undefined
  return createProTableApiExecutor(requestSourceRows.value)
})

const tableData = computed(() => {
  if (usesLocalRequest.value || usesApiExecutor.value) return []
  if (modeConfig.value.inlineEditing) return editableRows.value
  return filteredRows.value
})

const tablePagination = computed<boolean | PaginationConfig>(() => {
  if (isVirtualMode.value || isInfiniteMode.value) return false
  return (
    modeConfig.value.pagination ?? {
      pageSize: modeConfig.value.pageSize,
      pageSizeOptions: [modeConfig.value.pageSize, modeConfig.value.pageSize * 2],
    }
  )
})

const tableRequestConfig = computed<RequestConfig | undefined>(() => {
  if (isInfiniteMode.value) return { immediate: true, accumulate: true }
  if (usesLocalRequest.value || usesApiExecutor.value) return { immediate: true }
  return undefined
})

const tableHeightMode = computed<HeightMode>(() => {
  if (isVirtualMode.value || isInfiniteMode.value) return 'fixed'
  return modeConfig.value.heightMode ?? 'auto'
})

const tableHeight = computed(() => {
  if (isVirtualMode.value || isInfiniteMode.value) return '440px'
  return modeConfig.value.height
})

const tableSelectable = computed(() => modeConfig.value.selectable ?? false)
const tableSortMode = computed<ProTableSortMode>(() => modeConfig.value.sortMode ?? 'single')
const tableLoading = computed(() => Boolean(modeConfig.value.stateControls && localLoading.value))
const demoTitle = computed(() => t(`${item.value.localeBaseKey}.try`))
const demoDescription = computed(() => t(`showcase.proTable.modes.${props.mode}.demo`))
const tableRegionLabel = computed(() =>
  t('showcase.proTable.table.regionLabel', {
    title: t(`showcase.proTable.modes.${props.mode}.tableTitle`),
  })
)
const actionSummary = computed(() => t(actionMessage.value.key, actionMessage.value.params ?? {}))
const stateSummary = computed(() => {
  if (!stateMessage.value) return t('showcase.proTable.state.empty')
  return t(stateMessage.value.key, stateMessage.value.params ?? {})
})
const fetchSummary = computed(() => {
  if (!fetchMessage.value) return t('showcase.proTable.fetch.empty')
  return t(fetchMessage.value.key, fetchMessage.value.params ?? {})
})
const selectedCount = computed(() => selectedRows.value.length)
const activeRowTitle = computed(
  () => activeRow.value?.capability ?? t('showcase.proTable.rows.none')
)
const hasTableControls = computed(() =>
  Boolean(
    modeConfig.value.statusFilter ||
    modeConfig.value.ownerFilter ||
    modeConfig.value.stateControls ||
    modeConfig.value.virtualModeSwitch ||
    modeConfig.value.columnControls
  )
)

watch(
  () => props.mode,
  () => {
    selectedRows.value = []
    statusFilter.value = 'all'
    ownerFilter.value = 'all'
    localLoading.value = false
    localEmpty.value = false
    ownerColumnVisible.value = true
    virtualPresentation.value = 'virtual'
    activeRow.value = null
    editableRows.value = cloneDemoRows(baseRows.value)
    eventMessages.value = []
    actionMessage.value = { key: 'showcase.proTable.actions.ready' }
    stateMessage.value = null
    fetchMessage.value = null
  }
)

watch(
  baseRows,
  rows => {
    if (modeConfig.value.inlineEditing) editableRows.value = cloneDemoRows(rows)
  },
  { immediate: true }
)

function requireCatalogItem(id: string): ShowcaseCatalogItem {
  const catalogItem = showcaseCatalog.find(candidate => candidate.id === id)
  if (!catalogItem) throw new Error(`[ProTableDemoShell] Missing showcase catalog item: ${id}`)
  return catalogItem
}

function getFeatureIcon(key: ProTableFeatureKey): `i-${string}` {
  return FEATURE_ICONS[key]
}

function getTechnicalIcon(key: ProTableTechnicalKey): `i-${string}` {
  return TECHNICAL_ICONS[key]
}

function boolLabel(value: boolean): string {
  return t(value ? 'showcase.proTable.booleans.yes' : 'showcase.proTable.booleans.no')
}

function pushEvent(key: string, detail: string): void {
  eventMessages.value = [t(key, { detail }), ...eventMessages.value].slice(0, 5)
}

function formatSortState(sort: SortState): string {
  if (sort.multi && sort.multi.length > 0) {
    return sort.multi.map(meta => `${meta.field}:${meta.direction}`).join(' > ')
  }
  return sort.field
    ? `${sort.field}:${sort.direction ?? t('showcase.proTable.state.none')}`
    : t('showcase.proTable.state.none')
}

function handleReload(): void {
  tableRef.value?.reload()
  actionMessage.value = { key: 'showcase.proTable.actions.reloaded' }
}

function handleRefreshEvent(): void {
  pushEvent('showcase.proTable.events.refresh', t('showcase.proTable.events.manual'))
}

function handleClearSelection(): void {
  tableRef.value?.clearSelection()
  selectedRows.value = []
  actionMessage.value = { key: 'showcase.proTable.actions.selectionCleared' }
}

function handleReadState(): void {
  const state = tableRef.value?.getState()
  if (!state) return

  stateMessage.value = {
    key: 'showcase.proTable.state.summary',
    params: {
      page: state.pagination.page,
      pageSize: state.pagination.pageSize,
      total: state.pagination.total,
      sort: formatSortState(state.sort),
      hidden: state.columnSettings.hiddenKeys.length,
      filter: state.filter.global || t('showcase.proTable.state.none'),
    },
  }
  actionMessage.value = { key: 'showcase.proTable.actions.stateRead' }
}

function handleReadFetchState(): void {
  const fetchState = tableRef.value?.getFetchState()
  if (!fetchState) return

  fetchMessage.value = {
    key: 'showcase.proTable.fetch.summary',
    params: {
      loading: boolLabel(fetchState.loading),
      error: boolLabel(fetchState.error),
      hasMore: boolLabel(fetchState.hasMore),
      message: fetchState.errorMessage || t('showcase.proTable.fetch.noError'),
    },
  }
  actionMessage.value = { key: 'showcase.proTable.actions.fetchRead' }
}

function handleExportPage(): void {
  tableRef.value?.exportData('page', `${props.mode}-pro-table-page.csv`)
  actionMessage.value = { key: 'showcase.proTable.actions.exportedPage' }
}

function handleExportSelected(): void {
  tableRef.value?.exportData('selected', `${props.mode}-pro-table-selected.csv`)
  actionMessage.value = {
    key: 'showcase.proTable.actions.exportedSelected',
    params: { count: selectedCount.value },
  }
}

function handleToggleOwnerColumn(): void {
  const nextVisible = !ownerColumnVisible.value
  ownerColumnVisible.value = nextVisible
  tableRef.value?.toggleColumnVisibility('owner', nextVisible)
  actionMessage.value = {
    key: nextVisible
      ? 'showcase.proTable.actions.ownerColumnShown'
      : 'showcase.proTable.actions.ownerColumnHidden',
  }
}

function handleRowClick(row: ProTableDemoRow): void {
  activeRow.value = row
  pushEvent('showcase.proTable.events.rowClick', row.capability)
}

function handleSortChange(sort: SortState): void {
  pushEvent('showcase.proTable.events.sort', formatSortState(sort))
}

function handleFilterChange(filter: FilterState): void {
  pushEvent('showcase.proTable.events.filter', filter.global || t('showcase.proTable.state.none'))
}

function handlePageChange(page: number, pageSize: number): void {
  pushEvent('showcase.proTable.events.page', `${page}/${pageSize}`)
}

function handleRequestError(error: Error): void {
  pushEvent('showcase.proTable.events.requestError', error.message)
}

function applyInlineCellValue(
  row: ProTableDemoRow,
  field: string,
  value: unknown
): ProTableDemoRow {
  return { ...row, [field]: value }
}

function handleCellEditComplete(payload: ProTableCellEditCompletePayload<ProTableDemoRow>): void {
  if (!modeConfig.value.inlineEditing || modeConfig.value.inlineEditMode === 'row') return
  editableRows.value = editableRows.value.map(row =>
    row.id === payload.rowKey ? applyInlineCellValue(row, payload.field, payload.newValue) : row
  )
  actionMessage.value = {
    key: 'showcase.proTable.actions.cellEdited',
    params: { field: payload.field, row: payload.rowKey },
  }
  pushEvent('showcase.proTable.events.cellEdit', `${payload.field}: ${String(payload.newValue)}`)
}

function handleRowEditSave(payload: ProTableRowEditSavePayload<ProTableDemoRow>): void {
  if (!modeConfig.value.inlineEditing || modeConfig.value.inlineEditMode !== 'row') return
  editableRows.value = editableRows.value.map(row =>
    row.id === payload.rowKey ? { ...row, ...payload.newRow } : row
  )
  actionMessage.value = {
    key: 'showcase.proTable.actions.rowEdited',
    params: {
      row: payload.rowKey,
      count: payload.changedFields.length,
    },
  }
  pushEvent(
    'showcase.proTable.events.rowEdit',
    `${payload.rowKey}: ${payload.changedFields.map(item => item.field).join(', ') || 'no changes'}`
  )
}
</script>

<template>
  <article
    class="col-stretch min-w-0 gap-lg"
    data-testid="showcase-pro-table-shell"
  >
    <ShowcaseHero
      :eyebrow="$t(`${item.localeBaseKey}.eyebrow`)"
      :title="$t(`${item.localeBaseKey}.title`)"
      :description="$t(`${item.localeBaseKey}.description`)"
      :icon="item.icon"
    />

    <ShowcaseDemoPanel
      :title="demoTitle"
      :description="demoDescription"
    >
      <div class="col-stretch min-w-0 gap-md">
        <ShowcaseCard
          icon="i-lucide-goal"
          :title="$t('showcase.proTable.intent.title')"
          :description="$t('showcase.proTable.intent.description')"
          :tag="$t(`showcase.proTable.modes.${props.mode}.label`)"
        >
          <div class="row-start min-w-0 gap-sm flex-wrap">
            <Tag
              :value="$t(`showcase.shell.demoLevels.${item.demoLevel}`)"
              :severity="item.demoLevel === 'complete' ? 'success' : 'info'"
            />
            <Tag
              :value="$t('showcase.proTable.badges.proTableOnly')"
              severity="contrast"
            />
          </div>
        </ShowcaseCard>

        <ShowcaseSection
          :title="$t('showcase.proTable.table.title')"
          :description="$t('showcase.proTable.table.description')"
          icon="i-lucide-table-2"
          data-testid="showcase-pro-table-workspace"
        >
          <div class="col-stretch min-w-0 gap-md">
            <div
              v-if="hasTableControls"
              class="grid min-w-0 grid-cols-1 gap-md lg:grid-cols-3"
            >
              <section
                v-if="modeConfig.statusFilter"
                class="demo-well col-stretch min-w-0 gap-sm"
              >
                <span class="text-xs font-semibold text-muted-foreground">
                  {{ $t('showcase.proTable.filters.status') }}
                </span>
                <Select
                  v-model="statusFilter"
                  :options="statusOptions"
                  option-label="label"
                  option-value="value"
                />
              </section>

              <section
                v-if="modeConfig.ownerFilter"
                class="demo-well col-stretch min-w-0 gap-sm"
              >
                <span class="text-xs font-semibold text-muted-foreground">
                  {{ $t('showcase.proTable.filters.owner') }}
                </span>
                <Select
                  v-model="ownerFilter"
                  :options="ownerOptions"
                  option-label="label"
                  option-value="value"
                />
              </section>

              <section
                v-if="modeConfig.virtualModeSwitch"
                class="demo-well col-stretch min-w-0 gap-sm"
              >
                <span class="text-xs font-semibold text-muted-foreground">
                  {{ $t('showcase.proTable.filters.scrollMode') }}
                </span>
                <Select
                  v-model="virtualPresentation"
                  :options="virtualModeOptions"
                  option-label="label"
                  option-value="value"
                />
              </section>

              <section
                v-if="modeConfig.stateControls"
                class="demo-well col-stretch min-w-0 gap-sm"
              >
                <div class="row-between min-w-0 gap-sm">
                  <span class="text-sm text-foreground">
                    {{ $t('showcase.proTable.controls.loading') }}
                  </span>
                  <ToggleSwitch v-model="localLoading" />
                </div>
                <div class="row-between min-w-0 gap-sm">
                  <span class="text-sm text-foreground">
                    {{ $t('showcase.proTable.controls.empty') }}
                  </span>
                  <ToggleSwitch v-model="localEmpty" />
                </div>
              </section>

              <section
                v-if="modeConfig.columnControls"
                class="demo-well col-stretch min-w-0 gap-sm"
              >
                <span class="text-xs font-semibold text-muted-foreground">
                  {{ $t('showcase.proTable.controls.columns') }}
                </span>
                <Button
                  size="small"
                  icon="i-lucide-columns-3"
                  :label="
                    ownerColumnVisible
                      ? $t('showcase.proTable.controls.hideOwner')
                      : $t('showcase.proTable.controls.showOwner')
                  "
                  @click="handleToggleOwnerColumn"
                />
              </section>
            </div>

            <ShowcaseToolbar
              :title="$t('showcase.proTable.toolbar.title')"
              :description="$t('showcase.proTable.toolbar.description')"
              :summary="actionSummary"
              data-testid="showcase-pro-table-action-toolbar"
            >
              <template #actions>
                <Button
                  size="small"
                  icon="i-lucide-refresh-cw"
                  :label="$t('showcase.proTable.controls.reload')"
                  @click="handleReload"
                />
                <Button
                  size="small"
                  icon="i-lucide-eraser"
                  :label="$t('showcase.proTable.controls.clearSelection')"
                  severity="secondary"
                  outlined
                  @click="handleClearSelection"
                />
                <Button
                  size="small"
                  icon="i-lucide-activity"
                  :label="$t('showcase.proTable.controls.getState')"
                  severity="secondary"
                  outlined
                  @click="handleReadState"
                />
                <Button
                  size="small"
                  icon="i-lucide-wifi"
                  :label="$t('showcase.proTable.controls.getFetchState')"
                  severity="secondary"
                  outlined
                  @click="handleReadFetchState"
                />
                <Button
                  size="small"
                  icon="i-lucide-download"
                  :label="$t('showcase.proTable.controls.exportPage')"
                  severity="secondary"
                  outlined
                  @click="handleExportPage"
                />
                <Button
                  size="small"
                  icon="i-lucide-check-square"
                  :label="$t('showcase.proTable.controls.exportSelected')"
                  severity="secondary"
                  outlined
                  @click="handleExportSelected"
                />
              </template>
            </ShowcaseToolbar>

            <section
              class="material-solid col-stretch min-w-0 gap-sm p-sm"
              :aria-label="tableRegionLabel"
              data-testid="showcase-pro-table-demo-region"
            >
              <ProTable
                ref="tableRef"
                v-model:selected="selectedRows"
                :columns="tableColumns"
                :column-groups="tableColumnGroups"
                :data="tableData"
                :request="tableRequest"
                :request-config="tableRequestConfig"
                :api-url="usesApiExecutor ? '/showcase/pro-table/local' : undefined"
                api-method="GET"
                :api-executor="tableApiExecutor"
                data-key="data.records"
                total-key="data.total"
                row-key="id"
                :title="$t(`showcase.proTable.modes.${props.mode}.tableTitle`)"
                :loading="tableLoading"
                :pagination="tablePagination"
                :selectable="tableSelectable"
                :sort-mode="tableSortMode"
                :virtual-scroll="isVirtualMode"
                :infinite-scroll="isInfiniteMode"
                :height-mode="tableHeightMode"
                :height="tableHeight"
                :edit-mode="
                  modeConfig.inlineEditing ? (modeConfig.inlineEditMode ?? 'cell') : false
                "
                :show-density-control="modeConfig.showDensityControl ?? true"
                :global-search-mode="modeConfig.fuzzySearch ? 'fuzzy' : 'substring'"
                show-toolbar
                global-filter
                row-hover
                striped-rows
                show-horizontal-lines
                @refresh="handleRefreshEvent"
                @row-click="handleRowClick"
                @sort-change="handleSortChange"
                @filter-change="handleFilterChange"
                @page-change="handlePageChange"
                @request-error="handleRequestError"
                @cell-edit-complete="handleCellEditComplete"
                @row-edit-save="handleRowEditSave"
              >
                <template #empty>
                  <ShowcaseEmptyState
                    icon="i-lucide-table-2"
                    :title="$t('showcase.proTable.empty.title')"
                    :description="$t('showcase.proTable.empty.description')"
                  />
                </template>
              </ProTable>
            </section>
          </div>
        </ShowcaseSection>
      </div>
    </ShowcaseDemoPanel>

    <ShowcaseSection
      :title="$t('showcase.proTable.stateArea.title')"
      :description="$t('showcase.proTable.stateArea.description')"
      icon="i-lucide-activity"
      data-testid="showcase-pro-table-state-area"
    >
      <div class="grid min-w-0 grid-cols-1 gap-md lg:grid-cols-3">
        <ShowcaseCard
          icon="i-lucide-list-checks"
          :title="$t('showcase.proTable.state.title')"
          :description="stateSummary"
        />

        <ShowcaseCard
          icon="i-lucide-wifi"
          :title="$t('showcase.proTable.fetch.title')"
          :description="fetchSummary"
        />

        <ShowcaseCard
          icon="i-lucide-check-square"
          :title="$t('showcase.proTable.selection.title')"
          :description="
            $t('showcase.proTable.selection.summary', {
              count: selectedCount,
              row: activeRowTitle,
            })
          "
        />
      </div>

      <ShowcaseCard
        v-if="modeConfig.eventLog"
        icon="i-lucide-radio"
        :title="$t('showcase.proTable.events.title')"
        :description="$t('showcase.proTable.events.description')"
      >
        <ul
          v-if="eventMessages.length"
          class="col-stretch gap-xs m-0 p-0 list-none"
        >
          <li
            v-for="message in eventMessages"
            :key="message"
            class="code-inline break-all"
          >
            {{ message }}
          </li>
        </ul>
        <ShowcaseEmptyState
          v-else
          icon="i-lucide-radio"
          :title="$t('showcase.proTable.events.emptyTitle')"
          :description="$t('showcase.proTable.events.empty')"
        />
      </ShowcaseCard>
    </ShowcaseSection>

    <ShowcaseSection
      :title="$t('showcase.proTable.capabilities.title')"
      :description="$t('showcase.proTable.capabilities.description')"
      icon="i-lucide-panels-top-left"
      data-testid="showcase-pro-table-capabilities"
    >
      <div class="grid min-w-0 grid-cols-1 gap-md xl:grid-cols-2">
        <div class="col-stretch min-w-0 gap-md">
          <ShowcaseFeatureCard
            v-for="featureKey in featureKeys"
            :key="featureKey"
            :icon="getFeatureIcon(featureKey)"
            :title="$t(`showcase.proTable.features.${featureKey}.title`)"
            :description="$t(`showcase.proTable.features.${featureKey}.description`)"
            :tag="$t(`showcase.proTable.features.${featureKey}.tag`)"
          />
        </div>

        <div class="col-stretch min-w-0 gap-md">
          <ShowcaseFeatureCard
            v-for="featureKey in explanationKeys"
            :key="featureKey"
            :icon="getFeatureIcon(featureKey)"
            :title="$t(`showcase.proTable.features.${featureKey}.title`)"
            :description="$t(`showcase.proTable.features.${featureKey}.description`)"
            :tag="$t(`showcase.proTable.features.${featureKey}.tag`)"
          />
        </div>
      </div>
    </ShowcaseSection>

    <ShowcaseSection
      :title="$t('showcase.proTable.source.title')"
      :description="$t('showcase.proTable.source.description')"
      icon="i-lucide-folder-code"
      data-testid="showcase-pro-table-source-area"
    >
      <div class="grid min-w-0 grid-cols-1 gap-md xl:grid-cols-2">
        <ShowcaseSourceLinks :source-paths="sourcePaths" />

        <ShowcaseEvidencePanel
          :title="$t('showcase.proTable.evidence.apiTitle')"
          :description="$t('showcase.proTable.evidence.apiDescription')"
          :empty-text="$t('showcase.shell.source.empty')"
          :source-paths="PRO_TABLE_API_EVIDENCE_PATHS"
        />
      </div>

      <div class="grid min-w-0 grid-cols-1 gap-md xl:grid-cols-2">
        <ShowcaseFeatureCard
          v-for="technicalKey in technicalKeys"
          :key="technicalKey"
          :icon="getTechnicalIcon(technicalKey)"
          :title="$t(`showcase.proTable.technical.${technicalKey}.title`)"
          :description="$t(`showcase.proTable.technical.${technicalKey}.description`)"
          :tag="$t('showcase.shell.technical.title')"
        />
      </div>
    </ShowcaseSection>

    <ShowcaseRelatedLinks
      :item="item"
      :related-ids="relatedIds"
    />
  </article>
</template>
