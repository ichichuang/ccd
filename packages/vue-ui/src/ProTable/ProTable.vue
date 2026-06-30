<script setup lang="ts" generic="T extends Record<string, unknown>">
import type { SizeMode } from '@ccd/design-tokens'
import { objectGet } from '@ccd/shared-utils'
import { useEventListener } from '@vueuse/core'
import Button from 'primevue/button'
import Column from 'primevue/column'
import ColumnGroup from 'primevue/columngroup'
import DataTable from 'primevue/datatable'
import type {
  DataTableRowClickEvent,
  DataTableRowSelectEvent,
  DataTableSortEvent,
  DataTableSortMeta,
} from 'primevue/datatable'
import DatePicker from 'primevue/datepicker'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputtext'
import Popover from 'primevue/popover'
import ProgressSpinner from 'primevue/progressspinner'
import Row from 'primevue/row'
import Select from 'primevue/select'
import Tag from 'primevue/tag'
import {
  computed,
  h,
  inject,
  nextTick,
  onMounted,
  onUnmounted,
  ref,
  useTemplateRef,
  watch,
  type VNode,
} from 'vue'
import { useI18n } from 'vue-i18n'
import { EmptyState } from '../EmptyState'
import { Icons } from '../Icons'
import ProTableCell from './components/ProTableCell'
import ProTablePagination from './components/ProTablePagination.vue'
import ProTableToolbar from './components/ProTableToolbar.vue'
import VirtualGridRenderer from './VirtualGridRenderer.vue'
import { buildDataTablePt, type DataTablePtOptions } from './presets/dataTablePt'
import type { ProTableColumn, ProTableColumnEditorType } from './engine/types/column'
import type { FilterState, ProTableSortMode, SortMeta, SortState } from './engine/types/tableState'
import type {
  PaginationConfig,
  ProTableCellEditCompletePayload,
  ProTableCellEditCompletePrimeEvent,
  ProTableApiQueryParams,
  ProTableProps,
  ProTableRowEditCancelPayload,
  ProTableRowEditCancelPrimeEvent,
  ProTableRowEditChangedField,
  ProTableRowEditSavePayload,
  ProTableRowEditSavePrimeEvent,
  ProTableSearchParams,
  RequestFn,
} from './engine/types/props'
import {
  INFINITE_SCROLL_DEFAULTS,
  PAGINATION_DEFAULTS,
  PRO_TABLE_PROPS_DEFAULTS,
  UI_DEFAULTS,
  getProTableScopedContentSizeVars,
} from './engine/config'
import {
  buildApiExecutorConfig,
  formatRequestParams,
  formatResponseData,
  resolveApiUrl,
} from './engine/config/apiAdapter'
import { TableController } from './engine/core/TableController'
import { resolveColumnGroupRows, type ResolvedColumnGroupCell } from './engine/core/columnGroups'
import { resolveColumnIdOrder } from './engine/engines/columnVisibility'
import { useProTableColumnSettingsStorage } from './engine/hooks/useProTableColumnSettingsStorage'
import { useProTableInfiniteScroll } from './engine/hooks/useProTableInfiniteScroll'
import {
  PRO_TABLE_URL_SYNC_ADAPTER_KEY,
  type ProTableUrlSyncAdapter,
} from './engine/hooks/useProTableUrlSync'

defineOptions({ name: 'ProTable' })

const props = withDefaults(defineProps<ProTableProps<T>>(), {
  data: () => [] as T[],
  loading: PRO_TABLE_PROPS_DEFAULTS.loading,
  rowKey: PRO_TABLE_PROPS_DEFAULTS.rowKey,
  showToolbar: PRO_TABLE_PROPS_DEFAULTS.showToolbar,
  showDensityControl: PRO_TABLE_PROPS_DEFAULTS.showDensityControl,
  title: PRO_TABLE_PROPS_DEFAULTS.title,
  selectable: PRO_TABLE_PROPS_DEFAULTS.selectable,
  selectionPinned: PRO_TABLE_PROPS_DEFAULTS.selectionPinned,
  pagination: PRO_TABLE_PROPS_DEFAULTS.pagination,
  total: PRO_TABLE_PROPS_DEFAULTS.total,
  serverMode: PRO_TABLE_PROPS_DEFAULTS.serverMode,
  sortMode: PRO_TABLE_PROPS_DEFAULTS.sortMode,
  globalFilter: PRO_TABLE_PROPS_DEFAULTS.globalFilter,
  globalSearchMode: PRO_TABLE_PROPS_DEFAULTS.globalSearchMode,
  heightMode: PRO_TABLE_PROPS_DEFAULTS.heightMode,
  height: PRO_TABLE_PROPS_DEFAULTS.height,
  tableLayout: PRO_TABLE_PROPS_DEFAULTS.tableLayout,
  infiniteScroll: PRO_TABLE_PROPS_DEFAULTS.infiniteScroll,
  stripedRows: PRO_TABLE_PROPS_DEFAULTS.stripedRows,
  showHorizontalLines: PRO_TABLE_PROPS_DEFAULTS.showHorizontalLines,
  showVerticalLines: PRO_TABLE_PROPS_DEFAULTS.showVerticalLines,
  rowHover: PRO_TABLE_PROPS_DEFAULTS.rowHover,
  rowClassName: PRO_TABLE_PROPS_DEFAULTS.rowClassName,
  resizableColumns: PRO_TABLE_PROPS_DEFAULTS.resizableColumns,
  columnResizeMode: PRO_TABLE_PROPS_DEFAULTS.columnResizeMode,
  reorderableColumns: PRO_TABLE_PROPS_DEFAULTS.reorderableColumns,
  stateStorage: PRO_TABLE_PROPS_DEFAULTS.stateStorage,
  stateKey: PRO_TABLE_PROPS_DEFAULTS.stateKey,
  selected: PRO_TABLE_PROPS_DEFAULTS.selected,
  maxSelection: PRO_TABLE_PROPS_DEFAULTS.maxSelection,
  virtualScroll: PRO_TABLE_PROPS_DEFAULTS.virtualScroll,
  editMode: PRO_TABLE_PROPS_DEFAULTS.editMode,
  columnGroups: undefined,
  request: undefined,
  api: undefined,
  dataKey: 'data',
  totalKey: 'total',
  requestConfig: undefined,
  apiUrl: undefined,
  apiMethod: 'GET',
  apiConfig: undefined,
  apiExecutor: undefined,
  searchPathResolver: undefined,
  searchParams: undefined,
  urlSync: false,
})

const emit = defineEmits<{
  'update:selected': [rows: T[]]
  load: [params: { page: number; pageSize: number; sort: SortState; filter: FilterState }]
  'sort-change': [sort: SortState]
  'filter-change': [filter: FilterState]
  'page-change': [page: number, pageSize: number]
  refresh: []
  'load-more': []
  'row-click': [row: T]
  'request-error': [error: Error]
  'cell-edit-complete': [payload: ProTableCellEditCompletePayload<T>]
  'row-edit-save': [payload: ProTableRowEditSavePayload<T>]
  'row-edit-cancel': [payload: ProTableRowEditCancelPayload<T>]
}>()

const { t } = useI18n()
const urlSyncAdapter = inject(
  PRO_TABLE_URL_SYNC_ADAPTER_KEY,
  null
) as ProTableUrlSyncAdapter<T> | null
const isDev = Boolean((import.meta as ImportMeta & { env?: { DEV?: boolean } }).env?.DEV)

function normalizeSearchParams(params: ProTableSearchParams | undefined): ProTableApiQueryParams {
  if (!params) return {}

  const merged: ProTableApiQueryParams = {}
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      merged[key] = value
    }
  }
  return merged
}

function createUnifiedRequest(): RequestFn<T> | undefined {
  // Priority: request > api > apiUrl
  if (props.request) return props.request

  if (props.api) {
    return async params => {
      const query: ProTableApiQueryParams = {
        ...formatRequestParams(params),
        ...normalizeSearchParams(props.searchParams),
      }
      const raw = await props.api!(query)
      return formatResponseData<T>(raw, props.dataKey, props.totalKey)
    }
  }

  if (props.apiUrl) {
    return async params => {
      const query: ProTableApiQueryParams = {
        ...formatRequestParams(params),
        ...normalizeSearchParams(props.searchParams),
      }
      const url = resolveApiUrl(props.apiUrl!, query, props.searchPathResolver)
      const method = props.apiMethod ?? 'GET'

      const httpConfig = buildApiExecutorConfig(props.apiConfig, params.signal)

      if (!props.apiExecutor) {
        throw new Error(
          '[ProTable] apiUrl mode requires `apiExecutor` prop. ' +
            'Pass the app-owned HTTP adapter instead of importing app HTTP from @ccd/vue-ui.'
        )
      }
      const raw = await props.apiExecutor({
        url,
        method,
        query,
        config: httpConfig,
      })
      return formatResponseData<T>(raw, props.dataKey, props.totalKey)
    }
  }

  return undefined
}

if (isDev && props.apiUrl && !props.apiExecutor) {
  console.error(
    '[ProTable] apiUrl mode requires `apiExecutor` prop. ' +
      'Provide a function that wraps your HTTP client.'
  )
}

const dataTableEditMode = computed<'cell' | 'row' | undefined>(() =>
  (props.editMode === 'cell' || props.editMode === 'row') && !props.virtualScroll
    ? props.editMode
    : undefined
)
const dataTableEditingEnabled = computed<boolean>(() => dataTableEditMode.value !== undefined)
const dataTableRowEditingEnabled = computed<boolean>(() => dataTableEditMode.value === 'row')
const dataTableEditingRows = ref<T[]>([])
const virtualGridEditMode = computed<'cell' | false>(() =>
  props.virtualScroll && props.editMode === 'cell' ? 'cell' : false
)
const hasWarnedVirtualRowEditing = ref(false)

watch(
  () => [props.editMode, props.virtualScroll] as const,
  ([editMode, virtualScroll]) => {
    if (!isDev || hasWarnedVirtualRowEditing.value) return
    if (editMode === 'row' && virtualScroll) {
      hasWarnedVirtualRowEditing.value = true
      console.warn(
        '[ProTable] editMode="row" is supported only on the PrimeVue DataTable path. ' +
          'VirtualGridRenderer supports editMode="cell" only; row editing remains deferred.'
      )
    }
  },
  { immediate: true }
)

watch(dataTableRowEditingEnabled, enabled => {
  if (!enabled) dataTableEditingRows.value = []
})

const pagConfig = computed<PaginationConfig>(() => {
  if (!props.pagination || props.pagination === true) return {}
  return props.pagination
})

const resolvedSortMode = computed<ProTableSortMode>(
  () => props.sortMode ?? PRO_TABLE_PROPS_DEFAULTS.sortMode
)

/** Snapshot at init — merged into pageSizeOptions so switching away (e.g. 5→10) does not drop the initial size. */
const initialPageSizeSnapshot: number = pagConfig.value.pageSize ?? PAGINATION_DEFAULTS.pageSize

const enginePaginationEnabled = computed<boolean>(() => {
  return !!props.pagination && !props.infiniteScroll && !props.virtualScroll
})

const columnSettingsPersistence = useProTableColumnSettingsStorage(() => props.stateKey)

const ctrl = new TableController<T>({
  columns: props.columns,
  data: props.data,
  rowKey: String(props.rowKey ?? PRO_TABLE_PROPS_DEFAULTS.rowKey),
  serverMode: props.serverMode ?? false,
  sortMode: resolvedSortMode.value,
  paginationEnabled: enginePaginationEnabled.value,
  initialPageSize: initialPageSizeSnapshot,
  onLoad: params => emit('load', params),
  request: createUnifiedRequest(),
  requestConfig: props.requestConfig,
  onRequestError: err => emit('request-error', err),
  maxSelection: props.maxSelection,
  globalSearchMode: props.globalSearchMode,
  initialColumnSettings: columnSettingsPersistence.getInitialColumnSettings(props.columns),
  onColumnSettingsChange: columnSettingsPersistence.onColumnSettingsChange,
})

const toolbarServerMode = computed(
  () => !!(props.api || props.request || props.apiUrl) || props.serverMode
)

/** 表格内容区局部密度（不调用全局 useSizeStore，仅在子树覆盖 CSS 变量） */
const tableDensity = ref<SizeMode>('comfortable')

const tableDensityScopedStyle = computed(() => getProTableScopedContentSizeVars(tableDensity.value))

function onTableDensityChange(mode: SizeMode): void {
  tableDensity.value = mode
}

/** PrimeVue DataTable：行/单元格 padding 由主题 dt() 控制，需用官方 size 才会随密度变化 */
const dataTableSize = computed<'small' | 'large' | undefined>(() => {
  switch (tableDensity.value) {
    case 'compact':
      return 'small'
    case 'loose':
      return 'large'
    default:
      return undefined
  }
})

/** Resolved loading: request-mode uses internal fetch state, otherwise uses prop. */
const isLoading = computed<boolean>(() =>
  ctrl.requestMode ? ctrl.state.fetch.loading : props.loading
)

// ── Infinite scroll ──────────────────────────────────────────────────────────

const proTableRootRef = useTemplateRef<HTMLDivElement>('proTableRootRef')
const tableContainerRef = useTemplateRef<HTMLDivElement>('tableContainerRef')
const proTableRootView = computed(() => proTableRootRef.value?.ownerDocument.defaultView ?? null)

const infiniteScrollCtrl = useProTableInfiniteScroll({
  get enabled() {
    return !!props.infiniteScroll
  },
  containerRef: tableContainerRef,
  scrollTargetSelectors: ['.p-datatable-table-container', '.p-datatable-wrapper'],
  isLoading,
  setupDelayMs: INFINITE_SCROLL_DEFAULTS.setupDelayMs,
  bottomDistancePx: INFINITE_SCROLL_DEFAULTS.bottomDistancePx,
  onLoadMore: () => {
    if (ctrl.requestMode) {
      ctrl.fetchMore()
    } else {
      emit('load-more')
    }
  },
})

onMounted(() => {
  // Request mode: trigger initial fetch
  ctrl.fetchInitial()

  if (props.infiniteScroll) nextTick(() => infiniteScrollCtrl.setup())
})

onUnmounted(() => {
  ctrl.destroy()
  infiniteScrollCtrl.cleanup()
  urlSyncController?.destroy()
})

// Column defs from parent (e.g. new render closures when Pinia config changes)
watch(
  () => props.columns,
  cols => ctrl.setColumns(cols),
  { deep: false }
)

// Sync request function when request/api/apiUrl/searchParams props change
watch(
  [
    () => props.request,
    () => props.api,
    () => props.apiUrl,
    () => props.searchParams,
    () => props.requestConfig,
  ],
  () => {
    const nextRequest = createUnifiedRequest()
    ctrl.setRequest(nextRequest, props.requestConfig)

    if (!nextRequest) {
      ctrl.setData(props.data)
      if (props.total !== undefined) ctrl.setTotal(props.total)
    }
  },
  { deep: false }
)

watch(enginePaginationEnabled, enabled => ctrl.setPaginationEnabled(enabled))
watch(resolvedSortMode, mode => ctrl.setSortMode(mode), { immediate: true })
watch(
  () => props.globalSearchMode,
  mode => ctrl.setGlobalSearchMode(mode),
  { immediate: true }
)

// In request mode, data/total are managed internally.
watch(
  () => props.data,
  data => {
    if (!ctrl.requestMode) ctrl.setData(data)
  },
  { deep: false }
)
watch(
  () => props.total,
  total => {
    if (!ctrl.requestMode && total !== undefined) ctrl.setTotal(total)
  },
  { immediate: true }
)

watch(
  () => props.infiniteScroll,
  enabled => {
    infiniteScrollCtrl.cleanup()
    if (enabled) nextTick(() => infiniteScrollCtrl.setup())
  },
  { flush: 'post' }
)

watch(
  () => props.maxSelection,
  max => {
    const trimmed = ctrl.setMaxSelection(max)
    if (trimmed) {
      emit('update:selected', [...ctrl.state.selection.selectedRows])
    }
  },
  { immediate: true }
)

// Sync v-model:selected from parent into controller (two-way binding support)
watch(
  () => props.selected,
  newVal => {
    if (newVal === undefined) return
    let rows: T[] = Array.isArray(newVal) ? newVal : newVal != null ? [newVal] : []
    const rawLen = rows.length
    const max = props.maxSelection
    if (max != null && max > 0 && rows.length > max) {
      rows = rows.slice(0, max)
    }
    const keyField = String(props.rowKey ?? PRO_TABLE_PROPS_DEFAULTS.rowKey)
    const keys = rows.map(r => String(r[keyField]))
    const current = ctrl.state.selection
    if (
      keys.length === current.selectedRowKeys.length &&
      keys.every((k, i) => current.selectedRowKeys[i] === k)
    ) {
      return
    }
    ctrl.setSelection(rows)
    ctrl.setSelectionAnchor(rows[rows.length - 1] ?? null)
    if (max != null && max > 0 && rawLen > max) {
      emit('update:selected', rows)
    }
  },
  { deep: true, immediate: true }
)

/**
 * VirtualGridRenderer bypasses PrimeVue's DataTable selection bridge.
 * When virtual scroll is active and rows are selectable, sync internal
 * selection changes back to the parent via the same emit path as DataTable.
 */
watch(
  () => ctrl.state.selection.selectedRowKeys.join('\0'),
  () => {
    if (!props.virtualScroll || !props.selectable) return
    const rows = [...ctrl.state.selection.selectedRows]
    const keyField = String(props.rowKey ?? PRO_TABLE_PROPS_DEFAULTS.rowKey)
    const parentVal = props.selected
    const parentRows: T[] = !parentVal ? [] : Array.isArray(parentVal) ? parentVal : [parentVal]
    const parentKeys = parentRows.map(r => String(r[keyField]))
    const currentKeys = ctrl.state.selection.selectedRowKeys
    if (
      currentKeys.length === parentKeys.length &&
      currentKeys.every((k, i) => k === parentKeys[i])
    ) {
      return
    }
    emit('update:selected', rows)
  }
)

// DataTable PT — reactive to tableLayout
const tablePt = computed<Record<string, unknown>>(() => {
  const options: DataTablePtOptions = {}
  if (props.tableLayout) options.tableLayout = props.tableLayout
  return buildDataTablePt(options)
})

const resolvedColumnGroupRows = computed<ResolvedColumnGroupCell[][]>(() => {
  if (!props.columnGroups || props.columnGroups.length === 0) return []
  return resolveColumnGroupRows(props.columnGroups, ctrl.visibleColumns.value)
})

const hasResolvedColumnGroups = computed<boolean>(() => resolvedColumnGroupRows.value.length > 0)
const groupedHeaderRowspan = computed<number>(() => resolvedColumnGroupRows.value.length + 1)

const rowClassFn = computed<((data: T) => string) | undefined>(() => {
  if (!props.rowClassName) return undefined
  const fn = props.rowClassName
  return (data: T): string => fn(data, ctrl.processedRows.value.indexOf(data))
})

const urlSyncController = urlSyncAdapter?.({ urlSync: props.urlSync, ctrl })

const pageSizeOptions = computed<number[]>(() => {
  const base: number[] = pagConfig.value.pageSizeOptions
    ? [...pagConfig.value.pageSizeOptions]
    : [...PAGINATION_DEFAULTS.pageSizeOptions]
  const merged = new Set<number>([...base, initialPageSizeSnapshot, ctrl.state.pagination.pageSize])
  return Array.from(merged).sort((a: number, b: number) => a - b)
})

// Expanded mode is measured against the nearest app-content scroll workspace so app chrome stays usable.
const isFullscreen = ref(false)
/** Mirrors whether a toolbar popover (density / column settings) is open, so a
 *  popover-dismissing Escape does not also collapse fullscreen (see PT-ESC-02). */
const toolbarPopoverOpen = ref(false)
/** Mirrors whether the per-column filter popover (PT-UI-03) is open; shares the
 *  same Escape-defer + popover-open contract as the toolbar popovers. */
const columnFilterPopoverOpen = ref(false)
const fullscreenWorkspaceStyle = ref<Record<string, string>>({})
const fullscreenRootStyle = computed<Record<string, string>>(() =>
  isFullscreen.value ? fullscreenWorkspaceStyle.value : {}
)
/** Dim overlay fills the same workspace to subordinate surrounding content in fullscreen mode. */
const fullscreenOverlayStyle = computed<Record<string, string>>(() =>
  isFullscreen.value ? fullscreenWorkspaceStyle.value : {}
)
const usesFillLayout = computed<boolean>(() => isFullscreen.value || props.heightMode === 'fill')

const scrollHeightValue = computed<string | undefined>(() => {
  if (usesFillLayout.value) return 'flex'
  if (props.heightMode === 'fixed') return props.height ?? UI_DEFAULTS.fixedHeightFallback
  return undefined
})

function hasNonNoneStyle(value: string): boolean {
  return value !== '' && value !== 'none'
}

function isScrollableWorkspace(node: HTMLElement): boolean {
  const view = node.ownerDocument.defaultView
  if (!view) return false
  const style = view.getComputedStyle(node)
  const scrollableY = style.overflowY === 'auto' || style.overflowY === 'scroll'
  return scrollableY && node.clientHeight > 0 && node.scrollHeight > node.clientHeight + 1
}

function findFullscreenWorkspaceElement(root: HTMLElement): HTMLElement {
  const rootDocument = root.ownerDocument
  let node = root.parentElement
  while (node && node !== rootDocument.body) {
    if (isScrollableWorkspace(node)) return node
    node = node.parentElement
  }
  return rootDocument.documentElement
}

function findFixedContainingBlock(root: HTMLElement): HTMLElement | null {
  const rootDocument = root.ownerDocument
  const view = rootDocument.defaultView
  if (!view) return null

  let node = root.parentElement
  while (node && node !== rootDocument.documentElement) {
    const style = view.getComputedStyle(node)
    const contain = style.contain
    const createsFixedBlock =
      hasNonNoneStyle(style.transform) ||
      hasNonNoneStyle(style.perspective) ||
      hasNonNoneStyle(style.filter) ||
      hasNonNoneStyle(style.getPropertyValue('backdrop-filter')) ||
      style.willChange.includes('transform') ||
      contain.includes('paint') ||
      contain.includes('layout') ||
      contain.includes('strict') ||
      contain.includes('content')

    if (createsFixedBlock) return node
    node = node.parentElement
  }
  return null
}

function toRoundedPx(value: number): string {
  return `${Math.round(value)}px`
}

function syncFullscreenWorkspace(): void {
  const root = proTableRootRef.value
  const rootView = root?.ownerDocument.defaultView
  if (!root || !rootView) return

  const workspace = findFullscreenWorkspaceElement(root)
  const workspaceRect = workspace.getBoundingClientRect()
  const fixedBlockRect = findFixedContainingBlock(root)?.getBoundingClientRect()

  const viewportLeft = Math.max(workspaceRect.left, 0)
  const viewportTop = Math.max(workspaceRect.top, 0)
  const viewportRight = Math.min(workspaceRect.right, rootView.innerWidth)
  const viewportBottom = Math.min(workspaceRect.bottom, rootView.innerHeight)

  const width = Math.max(0, viewportRight - viewportLeft)
  const height = Math.max(0, viewportBottom - viewportTop)

  fullscreenWorkspaceStyle.value = {
    left: toRoundedPx(viewportLeft - (fixedBlockRect?.left ?? 0)),
    top: toRoundedPx(viewportTop - (fixedBlockRect?.top ?? 0)),
    width: toRoundedPx(width),
    height: toRoundedPx(height),
    maxHeight: toRoundedPx(height),
  }
}

function syncFullscreenWorkspaceIfNeeded(): void {
  if (isFullscreen.value) syncFullscreenWorkspace()
}

useEventListener(proTableRootView, 'resize', syncFullscreenWorkspaceIfNeeded)
useEventListener(proTableRootView, 'orientationchange', syncFullscreenWorkspaceIfNeeded)

/**
 * Escape exits region fullscreen, matching the native Fullscreen affordance.
 * The listener binds to the table's own window only while fullscreen is active
 * (the target computes to `null` otherwise), so there is no permanent global
 * keydown listener — VueUse attaches it on enter and removes it on exit and on
 * unmount. A keypress already handled by a nested overlay (`defaultPrevented`)
 * is left untouched so this does not swallow other surfaces' Escape.
 */
const fullscreenKeyboardTarget = computed<Window | null>(() =>
  isFullscreen.value ? proTableRootView.value : null
)
function handleFullscreenEscape(event: KeyboardEvent): void {
  if (event.key !== 'Escape' || event.defaultPrevented) return
  // An open toolbar popover owns Escape first. PrimeVue's Popover closes on
  // Escape but does not preventDefault, so a single Escape would otherwise both
  // dismiss the popover and collapse fullscreen. We listen in the CAPTURE phase
  // so this runs before PrimeVue's bubble-phase handler flips the popover state:
  // while a popover is open we defer, letting the next Escape leave fullscreen.
  if (toolbarPopoverOpen.value) return
  // A per-column filter popover (PT-UI-03) likewise owns Escape first: PrimeVue
  // closes it on Escape without preventDefault, so we defer here while it is open
  // and let the next Escape leave fullscreen — same contract as the toolbar popover.
  if (columnFilterPopoverOpen.value) return
  exitFullscreen()
}
useEventListener(fullscreenKeyboardTarget, 'keydown', handleFullscreenEscape, { capture: true })

const toolbarColumnSettingsItems = computed(() => {
  const ids = resolveColumnIdOrder(props.columns, ctrl.state.columnSettings.orderedKeys)
  return ids.map(id => {
    const col = props.columns.find(c => c.id === id)
    let title: string = id
    if (col) {
      if (typeof col.title === 'string') {
        title = col.title
      } else if (typeof col.title === 'function') {
        const rendered = col.title()
        title = typeof rendered === 'string' ? rendered : id
      }
    }
    return { id, title }
  })
})

function enterFullscreen(): void {
  syncFullscreenWorkspace()
  isFullscreen.value = true
  nextTick(syncFullscreenWorkspace)
}

function exitFullscreen(): void {
  isFullscreen.value = false
  fullscreenWorkspaceStyle.value = {}
}

function toggleFullscreen(): void {
  if (isFullscreen.value) {
    exitFullscreen()
    return
  }
  enterFullscreen()
}

// ── Export ─────────────────────────────────────────────────────────────────────
const hasSelection = computed(() => ctrl.state.selection.selectedRows.length > 0)
function handleExport(mode: 'page' | 'selected'): void {
  ctrl.exportData(mode)
}

// Native PrimeVue selection bridge
const pendingDataTableRangeRow = ref<T | null>(null)
const lastDataTablePointerShiftKey = ref(false)

function normalizeSelectionRows(val: T | T[] | undefined | null): T[] {
  return !val ? [] : Array.isArray(val) ? val : [val]
}

function limitSelectionRows(rows: T[]): T[] {
  const max = props.maxSelection
  if (max != null && max > 0 && rows.length > max) {
    return rows.slice(0, max)
  }
  return rows
}

function isShiftSelectionEvent(event: Event): boolean {
  return event instanceof MouseEvent && event.shiftKey
}

function handleTableContainerClick(event: MouseEvent): void {
  if (!props.virtualScroll && props.selectable === 'checkbox') {
    lastDataTablePointerShiftKey.value = event.shiftKey
    void nextTick(() => {
      lastDataTablePointerShiftKey.value = false
    })
  }
}

const tableSelection = computed({
  get: (): T | T[] | undefined => {
    if (props.selectable === 'single') {
      return ctrl.state.selection.selectedRows[0]
    }
    return ctrl.state.selection.selectedRows
  },
  set: (val: T | T[] | undefined | null) => {
    const pendingRangeRow = pendingDataTableRangeRow.value
    pendingDataTableRangeRow.value = null
    if (pendingRangeRow && props.selectable === 'checkbox') {
      lastDataTablePointerShiftKey.value = false
      ctrl.selectRow(pendingRangeRow, 'checkbox', { range: true })
      emit('update:selected', [...ctrl.state.selection.selectedRows])
      return
    }

    const rows = limitSelectionRows(normalizeSelectionRows(val))
    ctrl.setSelection(rows)
    emit('update:selected', rows)
  },
})

function handleDataTableRowClick(event: DataTableRowClickEvent<T>): void {
  if (props.selectable === 'checkbox' && isShiftSelectionEvent(event.originalEvent)) {
    pendingDataTableRangeRow.value = event.data
  }
  emit('row-click', event.data)
}

function handleDataTableRowSelection(event: DataTableRowSelectEvent<T>): void {
  if (props.selectable !== 'checkbox') return

  const shiftSelection =
    isShiftSelectionEvent(event.originalEvent) || lastDataTablePointerShiftKey.value
  lastDataTablePointerShiftKey.value = false
  if (event.type === 'checkbox' && shiftSelection) {
    ctrl.selectRow(event.data, 'checkbox', { range: true })
    emit('update:selected', [...ctrl.state.selection.selectedRows])
    return
  }

  if (!shiftSelection) {
    ctrl.setSelectionAnchor(event.data)
  }
}

function handleSortClick(col: ProTableColumn<T>): void {
  if (!col.sortable) return
  ctrl.updateSort(String(col.field ?? col.id))
  emit('sort-change', { ...ctrl.state.sort })
}

function toDataTableSortOrder(direction: SortState['direction']): 1 | -1 | undefined {
  if (direction === 'asc') return 1
  if (direction === 'desc') return -1
  return undefined
}

function toSortDirection(order: DataTableSortMeta['order']): SortState['direction'] {
  if (order === 1) return 'asc'
  if (order === -1) return 'desc'
  return null
}

function normalizeDataTableSortField(
  field: DataTableSortMeta['field'] | DataTableSortEvent['sortField']
): string | null {
  return typeof field === 'string' ? field : null
}

function normalizeDataTableSortMeta(meta: DataTableSortMeta): SortMeta | null {
  const field = normalizeDataTableSortField(meta.field)
  const direction = toSortDirection(meta.order)
  if (!field || !direction) return null
  return { field, direction }
}

const dataTableSortField = computed<string | undefined>(() => ctrl.state.sort.field ?? undefined)
const dataTableSortOrder = computed<1 | -1 | undefined>(() =>
  toDataTableSortOrder(ctrl.state.sort.direction)
)
const dataTableMultiSortMeta = computed<DataTableSortMeta[] | undefined>(() => {
  if (resolvedSortMode.value !== 'multiple') return undefined
  return (ctrl.state.sort.multi ?? []).map(meta => ({
    field: meta.field,
    order: toDataTableSortOrder(meta.direction),
  }))
})

function handleDataTableSort(event: DataTableSortEvent): void {
  if (resolvedSortMode.value === 'multiple') {
    const multi = (event.multiSortMeta ?? []).flatMap(meta => {
      const normalized = normalizeDataTableSortMeta(meta)
      return normalized ? [normalized] : []
    })
    ctrl.setMultiSort(multi)
  } else {
    ctrl.setSort({
      field: normalizeDataTableSortField(event.sortField),
      direction: toSortDirection(event.sortOrder),
    })
  }
  emit('sort-change', { ...ctrl.state.sort })
}

function getColumnSortField(col: ProTableColumn<T>): string {
  return String(col.field ?? col.id)
}

function getColumnSortMeta(col: ProTableColumn<T>): SortMeta | null {
  const field = getColumnSortField(col)
  const multi = ctrl.state.sort.multi
  if (multi) return multi.find(meta => meta.field === field) ?? null
  if (ctrl.state.sort.field === field && ctrl.state.sort.direction) {
    return { field, direction: ctrl.state.sort.direction }
  }
  return null
}

function getColumnSortPriority(col: ProTableColumn<T>): number | null {
  const field = getColumnSortField(col)
  const index = ctrl.state.sort.multi?.findIndex(meta => meta.field === field) ?? -1
  return index >= 0 ? index + 1 : null
}

function sortIcon(col: ProTableColumn<T>): string {
  const meta = getColumnSortMeta(col)
  if (!meta) return 'i-lucide-chevrons-up-down'
  if (meta.direction === 'asc') return 'i-lucide-chevron-up'
  return 'i-lucide-chevron-down'
}

/**
 * aria-sort for the DataTable path, mirroring the VirtualGridRenderer contract:
 * `undefined` for non-sortable columns (never announced as sortable), otherwise
 * `none` | `ascending` | `descending` reflecting the single-column sort state.
 */
function getAriaSort(col: ProTableColumn<T>): 'ascending' | 'descending' | 'none' | undefined {
  if (!col.sortable) return undefined
  const field = getColumnSortField(col)
  if (ctrl.state.sort.field !== field) return 'none'
  if (ctrl.state.sort.direction === 'asc') return 'ascending'
  if (ctrl.state.sort.direction === 'desc') return 'descending'
  return 'none'
}

function sortAriaLabel(col: ProTableColumn<T>): string | undefined {
  if (!col.sortable) return undefined
  const title = columnTitleText(col)
  const meta = getColumnSortMeta(col)
  if (!meta) return `Sort by ${title}`
  const directionLabel = meta.direction === 'asc' ? 'ascending' : 'descending'
  const priority = getColumnSortPriority(col)
  if (resolvedSortMode.value === 'multiple' && priority !== null) {
    return `Sort by ${title}. Currently ${directionLabel}, priority ${priority}.`
  }
  return `Sort by ${title}. Currently ${directionLabel}.`
}

/** True when this column is the active sort target — drives token-based icon emphasis. */
function isColumnSorted(col: ProTableColumn<T>): boolean {
  if (!col.sortable) return false
  return getColumnSortMeta(col) !== null
}

/**
 * Passthrough that places `aria-sort` on the real PrimeVue header `<th>`
 * (which already carries role="columnheader"). The `headerCell` section is
 * merged after PrimeVue's own (null) aria-sort, so this wins. Non-sortable
 * columns contribute no passthrough, leaving their header unannounced.
 */
function columnHeaderPt(col: ProTableColumn<T>): Record<string, unknown> {
  const ariaSort = getAriaSort(col)
  return ariaSort ? { headerCell: { 'aria-sort': ariaSort } } : {}
}

function handleGlobalFilterChange(val: string): void {
  ctrl.setGlobalFilter(val)
  emit('filter-change', { ...ctrl.state.filter })
}

// ── Per-column filtering UI (PT-UI-03) ───────────────────────────────────────
// The engine already implements per-column filtering (TableController.setColumnFilter
// + engines/filtering.applyFilter, keyed by column id, local + request-mode aware).
// This is the missing UI: a header filter trigger + a single shared popover, shown
// only for columns that explicitly opt in via `filterable: true`.
const filterPopover = ref<{ toggle: (e: Event) => void; hide: () => void } | null>(null)
const activeFilterColumn = ref<ProTableColumn<T> | null>(null)

/** A column exposes per-column filter UI only when it opts in and has a bound field. */
function isColumnFilterable(col: ProTableColumn<T>): boolean {
  return col.filterable === true && !!col.field
}

/** True when this column currently has an active (non-empty) per-column filter value. */
function isColumnFiltered(col: ProTableColumn<T>): boolean {
  const value = ctrl.state.filter.columns[col.id]
  return value !== null && value !== undefined && value !== ''
}

function isFilterPopoverOpenFor(col: ProTableColumn<T>): boolean {
  return columnFilterPopoverOpen.value && activeFilterColumn.value?.id === col.id
}

/**
 * Resolve a filter i18n label, degrading to a sensible default when the host app
 * has not registered the key. ProTable's `proTable.*` strings live in the app's
 * locale bundle; this keeps the per-column filter UI usable (and accessible)
 * even before those entries are added, without inventing app-side files here.
 */
function resolveFilterLabel(
  key: string,
  fallback: string,
  named?: Record<string, unknown>
): string {
  const resolved = named ? t(key, named) : t(key)
  return resolved === key || resolved === '' ? fallback : resolved
}

function columnTitleText(col: ProTableColumn<T>): string {
  return typeof col.title === 'string' ? col.title : col.id
}

function filterAriaLabel(col: ProTableColumn<T>): string {
  const column = columnTitleText(col)
  return resolveFilterLabel('proTable.columnFilterAria', `Filter ${column}`, { column })
}

const filterPlaceholderLabel = computed<string>(() =>
  resolveFilterLabel('proTable.columnFilterPlaceholder', 'Filter…')
)
const filterClearLabel = computed<string>(() =>
  resolveFilterLabel('proTable.columnFilterClear', 'Clear')
)

/** Current value of the active column's filter (null when none). */
const activeFilterValue = computed<unknown>(() => {
  const col = activeFilterColumn.value
  return col ? (ctrl.state.filter.columns[col.id] ?? null) : null
})

function padDateFilterPart(value: number): string {
  return value < 10 ? `0${value}` : String(value)
}

function dateToFilterString(value: Date): string | null {
  const time = value.getTime()
  if (!Number.isFinite(time)) return null
  return `${value.getFullYear()}-${padDateFilterPart(value.getMonth() + 1)}-${padDateFilterPart(
    value.getDate()
  )}`
}

function dateFilterStringToDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:$|[T\s])/.exec(value.trim())
  if (!match) return null
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
}

function normalizeDateFilterInput(value: unknown): string | null {
  if (value === null || value === undefined || value === '') return null
  if (value instanceof Date) return dateToFilterString(value)
  if (typeof value === 'string') return value
  return null
}

const activeDateFilterValue = computed<Date | null>(() => {
  const value = activeFilterValue.value
  if (value instanceof Date) return value
  if (typeof value === 'string') return dateFilterStringToDate(value)
  return null
})

function handleColumnFilterChange(colId: string, value: unknown): void {
  // Normalize empty string to null so cleared filters drop out of engine state.
  ctrl.setColumnFilter(colId, value === '' ? null : value)
  emit('filter-change', { ...ctrl.state.filter })
}

function setActiveFilterValue(value: unknown): void {
  const col = activeFilterColumn.value
  if (!col) return
  handleColumnFilterChange(
    col.id,
    col.filterType === 'date' ? normalizeDateFilterInput(value) : value
  )
}

function openColumnFilter(col: ProTableColumn<T>, event: Event): void {
  activeFilterColumn.value = col
  filterPopover.value?.toggle(event)
}

function clearActiveColumnFilter(): void {
  const col = activeFilterColumn.value
  if (!col) return
  handleColumnFilterChange(col.id, null)
}

function handlePageChange(page: number): void {
  ctrl.setPage(page)
  emit('page-change', ctrl.state.pagination.page, ctrl.state.pagination.pageSize)
}

function handlePageSizeChange(pageSize: number): void {
  ctrl.setPageSize(pageSize)
  emit('page-change', ctrl.state.pagination.page, ctrl.state.pagination.pageSize)
}

function renderHeader(col: ProTableColumn<T>): VNode | string {
  if (col.headerRender) return col.headerRender()
  if (typeof col.title === 'function') return col.title()
  return col.title ?? col.id
}

function renderColumnGroupHeader(cell: ResolvedColumnGroupCell): VNode | string {
  const group = cell.group
  if (!group) return ''
  return typeof group.title === 'function' ? group.title() : group.title
}

function getColumnGroupAlignClass(cell: ResolvedColumnGroupCell): string {
  if (cell.group?.headerAlign === 'left') return 'justify-start text-left'
  if (cell.group?.headerAlign === 'right') return 'justify-end text-right'
  return 'justify-center text-center'
}

function isColumnGroupCellFrozen(cell: ResolvedColumnGroupCell): boolean {
  return cell.pinSection === 'left' || cell.pinSection === 'right'
}

function getColumnGroupCellAlignFrozen(cell: ResolvedColumnGroupCell): 'right' | undefined {
  return cell.pinSection === 'right' ? 'right' : undefined
}

function columnGroupHeaderPt(cell: ResolvedColumnGroupCell): Record<string, unknown> {
  if (!cell.group) return { headerCell: { 'aria-hidden': 'true' } }
  return { headerCell: { 'data-pro-table-column-group': cell.group.id } }
}

function renderCell(col: ProTableColumn<T>, row: T, index: number): VNode | string | number | null {
  if (col.render) {
    return col.render({ row, index, column: col })
  }
  if (!col.field) return null

  const val = col.field.includes('.') ? objectGet(row, col.field) : row[col.field]

  if (col.valueEnum) {
    const key = val != null ? String(val) : ''
    const enumItem = col.valueEnum[key]
    if (!enumItem) return key
    if (typeof enumItem === 'string') return enumItem
    if (!enumItem.severity) return enumItem.label
    return h(Tag, { value: enumItem.label, severity: enumItem.severity })
  }

  return val != null ? String(val) : ''
}

function getAlignClass(col: ProTableColumn<T>): string {
  if (col.align === 'center') return 'text-center'
  if (col.align === 'right') return 'text-right'
  return 'text-left'
}

function getHeaderAlignClass(col: ProTableColumn<T>): string {
  const headerAlign = col.headerAlign ?? col.align
  if (headerAlign === 'center') return 'justify-center text-center'
  if (headerAlign === 'right') return 'justify-end text-right'
  return 'justify-start text-left'
}

function getColumnClass(col: ProTableColumn<T>, row: T): string {
  if (!col.className) return ''
  return typeof col.className === 'function' ? col.className(row) : col.className
}

function isTableRow(value: unknown): value is T {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

/** Body slot 作用域类型（PrimeVue Column #body 不暴露泛型，在此做一次收窄） */
function getBodyCellNode(
  col: ProTableColumn<T>,
  slotProps: { data: unknown; index: number }
): VNode | string | number | null {
  if (!isTableRow(slotProps.data)) return null
  return renderCell(col, slotProps.data, slotProps.index)
}

function getBodyColumnClass(
  col: ProTableColumn<T>,
  slotProps: { data: unknown; index: number }
): string {
  if (!isTableRow(slotProps.data)) return ''
  return getColumnClass(col, slotProps.data)
}

interface DataTableCellEditorSlotProps {
  data: Record<string, unknown>
  field: string
}

function isColumnEditable(col: ProTableColumn<T>): boolean {
  return dataTableEditingEnabled.value && col.editable === true && !!col.field
}

function getColumnEditorType(col: ProTableColumn<T>): ProTableColumnEditorType {
  return col.editorType ?? 'text'
}

function getColumnEditorOptions(
  col: ProTableColumn<T>
): NonNullable<ProTableColumn<T>['filterOptions']> {
  return col.editorOptions ?? col.filterOptions ?? []
}

function getEditorSlotValue(slotProps: DataTableCellEditorSlotProps): unknown {
  return slotProps.data[slotProps.field]
}

function getEditorTextValue(slotProps: DataTableCellEditorSlotProps): string {
  const value = getEditorSlotValue(slotProps)
  return value === null || value === undefined ? '' : String(value)
}

function getEditorNumberValue(slotProps: DataTableCellEditorSlotProps): number | null {
  const value = getEditorSlotValue(slotProps)
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  if (value === null || value === undefined || value === '') return null
  const numericValue = Number(value)
  return Number.isFinite(numericValue) ? numericValue : null
}

function getEditorDateValue(slotProps: DataTableCellEditorSlotProps): Date | null {
  const value = getEditorSlotValue(slotProps)
  if (value instanceof Date) return value
  if (typeof value === 'string') return dateFilterStringToDate(value)
  return null
}

function setEditorSlotValue(slotProps: DataTableCellEditorSlotProps, value: unknown): void {
  slotProps.data[slotProps.field] = value
}

function getEditableColumnByField(field: string): ProTableColumn<T> | null {
  return (
    ctrl.visibleColumns.value.find(col => col.editable === true && col.field === field) ??
    ctrl.visibleColumns.value.find(col => col.editable === true && col.id === field) ??
    null
  )
}

function getRowKeyValue(row: T): string {
  const keyField = String(props.rowKey ?? PRO_TABLE_PROPS_DEFAULTS.rowKey)
  const keyValue = keyField.includes('.') ? objectGet(row, keyField) : row[keyField]
  return String(keyValue ?? '')
}

function handleDataTableEditingRowsUpdate(value: T[] | Record<string, boolean>): void {
  dataTableEditingRows.value = Array.isArray(value) ? value : []
}

function handleDataTableCellEditComplete(event: ProTableCellEditCompletePrimeEvent<T>): void {
  const column = getEditableColumnByField(event.field)
  if (!column?.field) return

  emit('cell-edit-complete', {
    row: event.data,
    rowKey: getRowKeyValue(event.data),
    column,
    field: event.field,
    oldValue: event.value,
    newValue: event.newValue,
    primeEvent: event,
  })
}

function getRowEditChangedFields(oldRow: T, newRow: T): ProTableRowEditChangedField<T>[] {
  return ctrl.visibleColumns.value
    .filter(col => col.editable === true && !!col.field)
    .map(column => {
      const field = String(column.field)
      return {
        field,
        column,
        oldValue: oldRow[field],
        newValue: newRow[field],
      }
    })
    .filter(change => !Object.is(change.oldValue, change.newValue))
}

function handleDataTableRowEditSave(event: ProTableRowEditSavePrimeEvent<T>): void {
  emit('row-edit-save', {
    row: event.data,
    rowKey: getRowKeyValue(event.data),
    oldRow: event.data,
    newRow: event.newData,
    changedFields: getRowEditChangedFields(event.data, event.newData),
    primeEvent: event,
  })
}

function handleDataTableRowEditCancel(event: ProTableRowEditCancelPrimeEvent<T>): void {
  emit('row-edit-cancel', {
    row: event.data,
    rowKey: getRowKeyValue(event.data),
    oldRow: event.data,
    newRow: event.newData,
    primeEvent: event,
  })
}

// --- API Exposure ---
defineExpose({
  /** Force the table to reload data. In request mode, re-executes the request. Otherwise emits refresh. */
  reload: () => {
    if (ctrl.requestMode) {
      ctrl.requestReload()
    } else {
      emit('refresh')
    }
  },
  /** Clear current selection */
  clearSelection: () => ctrl.clearSelection(),
  /** Set pagination page (1-based index) */
  setPage: (page: number) => ctrl.setPage(page),
  /** Set page size and reset to page 1 */
  setPageSize: (pageSize: number) => ctrl.setPageSize(pageSize),
  /** Toggle column visibility by column id */
  toggleColumnVisibility: (columnId: string, visible?: boolean) =>
    ctrl.toggleColumnVisibility(columnId, visible),
  /** Read-only: current selected rows */
  getSelection: () => [...ctrl.state.selection.selectedRows],
  /** Read-only: current table state (pagination, sort, filter) */
  getState: () => ({
    pagination: { ...ctrl.state.pagination },
    sort: { ...ctrl.state.sort },
    filter: { ...ctrl.state.filter },
    columnSettings: {
      orderedKeys: [...ctrl.state.columnSettings.orderedKeys],
      hiddenKeys: [...ctrl.state.columnSettings.hiddenKeys],
    },
  }),
  /** 更新列顺序与显隐（与持久化联动，当 `stateKey` 存在时写入 LocalStorage） */
  updateColumnSettings: (newOrder: string[], newHidden: string[]) =>
    ctrl.updateColumnSettings(newOrder, newHidden),
  /** Read-only: current fetch state (only meaningful in request mode) */
  getFetchState: () => ({ ...ctrl.state.fetch }),
  /** Export visible data to CSV. */
  exportData: (mode: 'page' | 'selected' = 'page', filename?: string) =>
    ctrl.exportData(mode, filename),
  /** Toggle scoped pseudo-fullscreen inside the table region. */
  toggleFullscreen,
})
</script>

<template>
  <!-- Fullscreen dim overlay — fills the measured workspace to
       visually separate the expanded table from surrounding showcase content. -->
  <div
    v-if="isFullscreen"
    data-pro-table-fullscreen-overlay
    class="pro-table-fullscreen-overlay fixed z-content pointer-events-none transition-opacity duration-md"
    :style="fullscreenOverlayStyle"
    aria-hidden="true"
  />

  <div
    ref="proTableRootRef"
    data-pro-table-root
    :data-pro-table-fullscreen="isFullscreen ? 'true' : undefined"
    :data-pro-table-popover-open="
      toolbarPopoverOpen || columnFilterPopoverOpen ? 'true' : undefined
    "
    :style="fullscreenRootStyle"
    :class="[
      isFullscreen
        ? 'fixed z-overlay w-full col-stretch gap-sm overflow-hidden shadow-md'
        : heightMode === 'fill'
          ? 'layout-full flex flex-col gap-sm overflow-hidden'
          : 'w-full flex flex-col gap-sm',
    ]"
    class="bg-card rounded-md overflow-hidden border border-solid border-border px-xs"
  >
    <div :class="usesFillLayout ? 'col-fill' : 'w-full'">
      <Transition name="pro-table-fetch-error">
        <div
          v-if="ctrl.requestMode && ctrl.state.fetch.error"
          role="alert"
          aria-live="assertive"
          class="shrink-0 row-between gap-sm px-lg py-sm bg-danger/10 mb-sm"
        >
          <div class="row-start gap-sm min-w-0">
            <Icons
              name="i-lucide-wifi-off"
              size="sm"
              class="text-danger shrink-0"
            />
            <span class="text-sm text-danger font-bold text-ellipsis-1">
              {{ ctrl.state.fetch.errorMessage || t('proTable.requestFailed') }}
            </span>
          </div>
          <Button
            size="small"
            severity="danger"
            outlined
            :label="t('proTable.retry')"
            class="shrink-0"
            @click="ctrl.requestReload()"
          />
        </div>
      </Transition>

      <ProTableToolbar
        v-if="showToolbar"
        :title="title"
        :show-density-control="showDensityControl"
        :density="tableDensity"
        :show-global-filter="globalFilter"
        :column-settings-items="toolbarColumnSettingsItems"
        :column-hidden-keys="ctrl.state.columnSettings.hiddenKeys"
        :server-mode="toolbarServerMode"
        :is-fullscreen="isFullscreen"
        :has-selection="hasSelection"
        @update:global-filter="handleGlobalFilterChange"
        @update:density="onTableDensityChange"
        @update-column-settings="
          (orderedIds, hiddenIds) => ctrl.updateColumnSettings(orderedIds, hiddenIds)
        "
        @refresh="ctrl.requestMode ? ctrl.requestReload() : emit('refresh')"
        @toggle-fullscreen="toggleFullscreen"
        @export="handleExport"
        @popover-toggle="toolbarPopoverOpen = $event"
      >
        <template #toolbar-extra>
          <slot name="toolbar-extra" />
        </template>
      </ProTableToolbar>

      <div
        :style="tableDensityScopedStyle"
        :class="usesFillLayout ? 'col-fill' : 'w-full'"
      >
        <div
          ref="tableContainerRef"
          :aria-busy="isLoading ? 'true' : 'false'"
          :class="usesFillLayout ? 'col-fill relative' : 'w-full relative'"
          @click.capture="handleTableContainerClick"
        >
          <template v-if="!virtualScroll">
            <DataTable
              :selection="selectable ? tableSelection : undefined"
              :value="ctrl.processedRows.value"
              :size="dataTableSize"
              :class="[
                showHorizontalLines ? 'pro-table-h-lines' : '',
                showVerticalLines ? 'pro-table-v-lines' : '',
              ]"
              :pt="tablePt"
              :striped-rows="stripedRows"
              :row-hover="rowHover"
              :lazy="true"
              :sort-mode="resolvedSortMode"
              :sort-field="dataTableSortField"
              :sort-order="dataTableSortOrder"
              :multi-sort-meta="dataTableMultiSortMeta"
              removable-sort
              :scroll-height="scrollHeightValue"
              :scrollable="usesFillLayout || heightMode !== 'auto'"
              :selection-mode="
                selectable === 'single'
                  ? 'single'
                  : selectable === 'checkbox'
                    ? 'multiple'
                    : undefined
              "
              :meta-key-selection="false"
              :data-key="String(rowKey)"
              :edit-mode="dataTableEditMode"
              :editing-rows="dataTableRowEditingEnabled ? dataTableEditingRows : undefined"
              :row-class="rowClassFn ?? undefined"
              :resizable-columns="resizableColumns"
              :column-resize-mode="columnResizeMode"
              :reorderable-columns="reorderableColumns"
              :state-storage="stateStorage === false ? undefined : stateStorage"
              :state-key="stateKey"
              @sort="handleDataTableSort"
              @update:selection="selectable ? (tableSelection = $event) : undefined"
              @update:editing-rows="handleDataTableEditingRowsUpdate"
              @row-click="handleDataTableRowClick"
              @row-select="handleDataTableRowSelection"
              @row-unselect="handleDataTableRowSelection"
              @cell-edit-complete="handleDataTableCellEditComplete"
              @row-edit-save="handleDataTableRowEditSave"
              @row-edit-cancel="handleDataTableRowEditCancel"
            >
              <ColumnGroup
                v-if="hasResolvedColumnGroups"
                type="header"
              >
                <Row
                  v-for="(groupRow, rowIndex) in resolvedColumnGroupRows"
                  :key="'group-row-' + rowIndex"
                >
                  <Column
                    v-if="
                      rowIndex === 0 && selectable === 'checkbox' && selectionPinned !== 'right'
                    "
                    column-key="selection-left-group"
                    selection-mode="multiple"
                    :rowspan="groupedHeaderRowspan"
                    :header-style="{ width: UI_DEFAULTS.selectionColumnWidth }"
                    :frozen="selectionPinned === 'left'"
                    :align-frozen="selectionPinned === 'left' ? 'left' : undefined"
                  />

                  <Column
                    v-for="cell in groupRow"
                    :key="cell.key"
                    :colspan="cell.colspan"
                    :frozen="isColumnGroupCellFrozen(cell)"
                    :align-frozen="getColumnGroupCellAlignFrozen(cell)"
                    :pt="columnGroupHeaderPt(cell)"
                  >
                    <template #header>
                      <div
                        :class="[
                          'flex flex-row items-center min-w-0 gap-xs w-full font-semibold text-muted-foreground',
                          getColumnGroupAlignClass(cell),
                        ]"
                      >
                        <ProTableCell :node="renderColumnGroupHeader(cell)" />
                      </div>
                    </template>
                  </Column>

                  <Column
                    v-if="rowIndex === 0 && dataTableRowEditingEnabled"
                    column-key="row-editor-group"
                    :rowspan="groupedHeaderRowspan"
                    :header-style="{ width: UI_DEFAULTS.rowEditorColumnWidth }"
                  />

                  <Column
                    v-if="
                      rowIndex === 0 && selectable === 'checkbox' && selectionPinned === 'right'
                    "
                    column-key="selection-right-group"
                    selection-mode="multiple"
                    :rowspan="groupedHeaderRowspan"
                    :header-style="{ width: UI_DEFAULTS.selectionColumnWidth }"
                    :frozen="true"
                    align-frozen="right"
                  />
                </Row>

                <Row>
                  <Column
                    v-for="col in ctrl.visibleColumns.value"
                    :key="'group-leaf-' + col.id"
                    :column-key="'group-leaf-' + col.id"
                    :style="{
                      width: col.width,
                      minWidth: col.minWidth,
                      maxWidth: col.maxWidth,
                      cursor: col.sortable ? 'pointer' : undefined,
                    }"
                    :frozen="col.pinned === 'left' || col.pinned === 'right'"
                    :align-frozen="col.pinned === 'right' ? 'right' : undefined"
                    :pt="columnHeaderPt(col)"
                  >
                    <template #header>
                      <div
                        :class="[
                          'flex flex-row items-center gap-xs select-none w-full',
                          getHeaderAlignClass(col),
                        ]"
                      >
                        <div
                          :class="[
                            'flex flex-row items-center gap-xs min-w-0',
                            col.sortable ? 'cursor-pointer rounded-sm ring-focus-focus' : '',
                          ]"
                          :role="col.sortable ? 'button' : undefined"
                          :tabindex="col.sortable ? 0 : undefined"
                          :aria-label="sortAriaLabel(col)"
                          :data-pro-table-sort="col.sortable ? 'true' : undefined"
                          @click="handleSortClick(col)"
                          @keydown.enter.prevent="handleSortClick(col)"
                          @keydown.space.prevent="handleSortClick(col)"
                        >
                          <ProTableCell :node="renderHeader(col)" />
                          <Icons
                            v-if="col.sortable"
                            :name="sortIcon(col)"
                            size="xs"
                            :class="isColumnSorted(col) ? 'text-primary' : 'text-muted-foreground'"
                          />
                        </div>
                        <Button
                          v-if="isColumnFilterable(col)"
                          text
                          rounded
                          class="shrink-0 cursor-pointer border-none outline-none ring-focus-focus p-xs center rounded-sm hover:text-primary"
                          :class="isColumnFiltered(col) ? 'text-primary' : 'text-muted-foreground'"
                          :aria-label="filterAriaLabel(col)"
                          aria-haspopup="dialog"
                          :aria-expanded="isFilterPopoverOpenFor(col) ? 'true' : 'false'"
                          :aria-pressed="isColumnFiltered(col) ? 'true' : 'false'"
                          data-pro-table-filter-toggle
                          :data-pro-table-filter-active="isColumnFiltered(col) ? 'true' : undefined"
                          @click="openColumnFilter(col, $event)"
                        >
                          <Icons
                            name="i-lucide-filter"
                            size="xs"
                          />
                        </Button>
                      </div>
                    </template>
                  </Column>
                </Row>
              </ColumnGroup>

              <!-- Selection column: left or unpinned (before data columns) -->
              <Column
                v-if="selectable === 'checkbox' && selectionPinned !== 'right'"
                column-key="selection-left"
                selection-mode="multiple"
                :header-style="{ width: UI_DEFAULTS.selectionColumnWidth }"
                :frozen="selectionPinned === 'left'"
                :align-frozen="selectionPinned === 'left' ? 'left' : undefined"
              />

              <!-- Data columns -->
              <Column
                v-for="col in ctrl.visibleColumns.value"
                :key="col.id"
                :column-key="col.id"
                :style="{
                  width: col.width,
                  minWidth: col.minWidth,
                  maxWidth: col.maxWidth,
                  cursor: col.sortable ? 'pointer' : undefined,
                }"
                :frozen="col.pinned === 'left' || col.pinned === 'right'"
                :align-frozen="col.pinned === 'right' ? 'right' : undefined"
                :pt="columnHeaderPt(col)"
              >
                <template
                  v-if="!hasResolvedColumnGroups"
                  #header
                >
                  <!-- Sortable headers are keyboard-operable button controls inside the
                       columnheader <th> (which carries aria-sort); non-sortable headers
                       stay inert and unannounced. A filterable column adds a sibling
                       filter trigger (PT-UI-03) so the two controls never nest. -->
                  <div
                    :class="[
                      'flex flex-row items-center gap-xs select-none w-full',
                      getHeaderAlignClass(col),
                    ]"
                  >
                    <div
                      :class="[
                        'flex flex-row items-center gap-xs min-w-0',
                        col.sortable ? 'cursor-pointer rounded-sm ring-focus-focus' : '',
                      ]"
                      :role="col.sortable ? 'button' : undefined"
                      :tabindex="col.sortable ? 0 : undefined"
                      :aria-label="sortAriaLabel(col)"
                      :data-pro-table-sort="col.sortable ? 'true' : undefined"
                      @click="handleSortClick(col)"
                      @keydown.enter.prevent="handleSortClick(col)"
                      @keydown.space.prevent="handleSortClick(col)"
                    >
                      <ProTableCell :node="renderHeader(col)" />
                      <Icons
                        v-if="col.sortable"
                        :name="sortIcon(col)"
                        size="xs"
                        :class="isColumnSorted(col) ? 'text-primary' : 'text-muted-foreground'"
                      />
                    </div>
                    <Button
                      v-if="isColumnFilterable(col)"
                      text
                      rounded
                      class="shrink-0 cursor-pointer border-none outline-none ring-focus-focus p-xs center rounded-sm hover:text-primary"
                      :class="isColumnFiltered(col) ? 'text-primary' : 'text-muted-foreground'"
                      :aria-label="filterAriaLabel(col)"
                      aria-haspopup="dialog"
                      :aria-expanded="isFilterPopoverOpenFor(col) ? 'true' : 'false'"
                      :aria-pressed="isColumnFiltered(col) ? 'true' : 'false'"
                      data-pro-table-filter-toggle
                      :data-pro-table-filter-active="isColumnFiltered(col) ? 'true' : undefined"
                      @click="openColumnFilter(col, $event)"
                    >
                      <Icons
                        name="i-lucide-filter"
                        size="xs"
                      />
                    </Button>
                  </div>
                </template>
                <template #body="slotProps">
                  <ProTableCell
                    :node="getBodyCellNode(col, slotProps)"
                    :align-class="getAlignClass(col)"
                    :extra-class="getBodyColumnClass(col, slotProps)"
                  />
                </template>
                <template
                  v-if="isColumnEditable(col)"
                  #editor="slotProps"
                >
                  <InputNumber
                    v-if="getColumnEditorType(col) === 'number'"
                    :model-value="getEditorNumberValue(slotProps)"
                    class="w-full"
                    data-pro-table-cell-editor
                    @update:model-value="setEditorSlotValue(slotProps, $event)"
                  />
                  <Select
                    v-else-if="getColumnEditorType(col) === 'select'"
                    :model-value="getEditorSlotValue(slotProps)"
                    :options="getColumnEditorOptions(col)"
                    option-label="label"
                    option-value="value"
                    class="w-full"
                    data-pro-table-cell-editor
                    @update:model-value="setEditorSlotValue(slotProps, $event)"
                  />
                  <DatePicker
                    v-else-if="getColumnEditorType(col) === 'date'"
                    :model-value="getEditorDateValue(slotProps)"
                    date-format="yy-mm-dd"
                    class="w-full"
                    show-icon
                    data-pro-table-cell-editor
                    @update:model-value="setEditorSlotValue(slotProps, $event)"
                  />
                  <InputText
                    v-else
                    :model-value="getEditorTextValue(slotProps)"
                    class="w-full"
                    data-pro-table-cell-editor
                    @update:model-value="setEditorSlotValue(slotProps, $event)"
                  />
                </template>
              </Column>

              <Column
                v-if="dataTableRowEditingEnabled"
                column-key="row-editor"
                :row-editor="true"
                :header-style="{ width: UI_DEFAULTS.rowEditorColumnWidth }"
                :body-style="{ textAlign: 'center' }"
              />

              <!-- Selection column: right-pinned (after data columns) -->
              <Column
                v-if="selectable === 'checkbox' && selectionPinned === 'right'"
                column-key="selection-right"
                selection-mode="multiple"
                :header-style="{ width: UI_DEFAULTS.selectionColumnWidth }"
                :frozen="true"
                align-frozen="right"
              />
            </DataTable>
          </template>

          <template v-else>
            <VirtualGridRenderer
              :controller="ctrl"
              :columns="ctrl.visibleColumns.value"
              :data="data"
              :density="tableDensity"
              :striped-rows="stripedRows"
              :show-horizontal-lines="showHorizontalLines"
              :show-vertical-lines="showVerticalLines"
              :row-hover="rowHover"
              :row-class-name="rowClassName"
              :selectable="selectable"
              :loading="isLoading"
              :column-groups="columnGroups"
              :edit-mode="virtualGridEditMode"
              class="col-fill"
              @cell-edit-complete="handleDataTableCellEditComplete"
              @sort-change="emit('sort-change', $event)"
            />
          </template>

          <!-- Loading overlay — suppressed when infinite-scroll is appending to existing data -->
          <div
            v-if="isLoading && (!infiniteScroll || ctrl.processedRows.value.length === 0)"
            role="status"
            aria-live="polite"
            aria-busy="true"
            :aria-label="t('common.loading')"
            class="pro-table-loading-overlay absolute inset-0 center z-10"
          >
            <ProgressSpinner />
          </div>

          <!-- Empty state -->
          <div
            v-if="!isLoading && ctrl.processedRows.value.length === 0"
            role="status"
            aria-live="polite"
            class="absolute inset-0 center"
          >
            <slot name="empty">
              <EmptyState
                icon="i-lucide-table-2"
                :title="t('emptyState.noData')"
              />
            </slot>
          </div>
        </div>

        <!-- Infinite scroll: bottom loading indicator while appending -->
        <div
          v-if="infiniteScroll && isLoading && ctrl.processedRows.value.length > 0"
          class="shrink-0 py-sm center"
        >
          <ProgressSpinner />
        </div>

        <!-- 架构互斥：virtualScroll 模式下必须卸载分页 UI（避免“虚拟滚动 + 翻页”造成心智与性能冲突） -->
        <ProTablePagination
          v-if="enginePaginationEnabled && !virtualScroll"
          :page="ctrl.state.pagination.page"
          :page-size="ctrl.state.pagination.pageSize"
          :total="ctrl.totalCount.value"
          :page-size-options="pageSizeOptions"
          @update:page="handlePageChange"
          @update:page-size="handlePageSizeChange"
        />
      </div>
    </div>

    <!-- Per-column filter popover (PT-UI-03): one shared overlay, re-anchored to the
         clicked header trigger. Routes value changes through TableController.setColumnFilter,
         so the existing local + request-mode filter contract drives the visible rows. -->
    <Popover
      ref="filterPopover"
      @show="columnFilterPopoverOpen = true"
      @hide="columnFilterPopoverOpen = false"
    >
      <div
        v-if="activeFilterColumn"
        class="pro-table-filter-popover flex flex-col gap-sm p-xs"
        data-pro-table-filter-popover
      >
        <Select
          v-if="activeFilterColumn.filterType === 'select'"
          :model-value="activeFilterValue"
          :options="activeFilterColumn.filterOptions ?? []"
          option-label="label"
          option-value="value"
          :placeholder="filterPlaceholderLabel"
          :aria-label="filterAriaLabel(activeFilterColumn)"
          class="w-full"
          show-clear
          data-pro-table-filter-input
          @update:model-value="setActiveFilterValue"
        />
        <DatePicker
          v-else-if="activeFilterColumn.filterType === 'date'"
          :model-value="activeDateFilterValue"
          :placeholder="filterPlaceholderLabel"
          :aria-label="filterAriaLabel(activeFilterColumn)"
          date-format="yy-mm-dd"
          class="w-full"
          show-icon
          show-clear
          data-pro-table-filter-input
          @update:model-value="setActiveFilterValue"
        />
        <InputText
          v-else
          :model-value="activeFilterValue == null ? '' : String(activeFilterValue)"
          :placeholder="filterPlaceholderLabel"
          :aria-label="filterAriaLabel(activeFilterColumn)"
          class="w-full"
          data-pro-table-filter-input
          @update:model-value="setActiveFilterValue"
          @keydown.enter="filterPopover?.hide()"
        />
        <div class="flex justify-end">
          <Button
            text
            size="small"
            :label="filterClearLabel"
            :disabled="!isColumnFiltered(activeFilterColumn)"
            class="ring-focus-focus"
            data-pro-table-filter-clear
            @click="clearActiveColumnFilter"
          />
        </div>
      </div>
    </Popover>
  </div>
</template>

<style scoped>
/* ==========================================================================
   2. Horizontal Lines Hijack (Physical Override for Independent Control)
   ========================================================================== */
:deep(.pro-table-h-lines .p-datatable-thead > tr > th),
:deep(.pro-table-h-lines .p-datatable-tbody > tr > td) {
  border-bottom: 1px solid rgb(var(--border)) !important;
}

:deep(.p-datatable:not(.pro-table-h-lines) .p-datatable-thead > tr > th),
:deep(.p-datatable:not(.pro-table-h-lines) .p-datatable-tbody > tr > td) {
  border-bottom-width: 0 !important;
}

/* ==========================================================================
   3. Vertical Lines Hijack (Physical Override for Independent Control)
   ========================================================================== */
:deep(.pro-table-v-lines .p-datatable-thead > tr > th),
:deep(.pro-table-v-lines .p-datatable-tbody > tr > td) {
  border-right: 1px solid rgb(var(--border)) !important;
}

:deep(.pro-table-v-lines .p-datatable-thead > tr > th:last-child),
:deep(.pro-table-v-lines .p-datatable-tbody > tr > td:last-child) {
  border-right-width: 0 !important;
}

.pro-table-fetch-error-enter-active,
.pro-table-fetch-error-leave-active {
  transition:
    opacity var(--transition-md) ease,
    max-height var(--transition-md) ease;
  overflow: hidden;
  max-height: var(--spacing-3xl);
}

.pro-table-fetch-error-enter-from,
.pro-table-fetch-error-leave-to {
  opacity: 0;
  max-height: 0;
}

/* Per-column filter popover width. The width previously lived in a
   `min-w-[var(--spacing-6xl)]` utility, which (a) the host UnoCSS pipeline never
   generated because vue-ui ships from /dist/ (excluded from the content scan) and
   (b) referenced `--spacing-6xl`, which does not exist in the token scale (max is
   `5xl`). Scoped CSS ships in dist/vue-ui.css and survives the Popover teleport
   because the scope attribute travels with the element. */
.pro-table-filter-popover {
  min-width: var(--spacing-5xl);
}

.pro-table-loading-overlay {
  background: rgb(var(--card) / 82%) !important;
  backdrop-filter: none !important;
}

.pro-table-fullscreen-overlay {
  background: rgb(var(--foreground) / 24%) !important;
  backdrop-filter: none !important;
}

:global(.dark .pro-table-fullscreen-overlay) {
  background: rgb(var(--background) / 72%) !important;
}

:global(html.dark .pro-table-loading-overlay),
:global(.dark .pro-table-loading-overlay) {
  background: rgb(0 0 0 / 34%) !important;
}
</style>
