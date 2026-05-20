<script setup lang="ts" generic="T extends Record<string, unknown>">
import { h, resolveComponent, type VNode } from 'vue'
import { objectGet } from '@ccd/shared-utils'
import ProTableCell from './components/ProTableCell'
import { buildDataTablePt, type DataTablePtOptions } from './presets/dataTablePt'
import type { ProTableColumn } from './engine/types/column'
import type { SortState, FilterState } from './engine/types/tableState'
import type {
  PaginationConfig,
  ProTableApiQueryParams,
  ProTableProps,
  ProTableSearchParams,
  RequestFn,
} from './engine/types/props'
import {
  INFINITE_SCROLL_DEFAULTS,
  PAGINATION_DEFAULTS,
  PRO_TABLE_PROPS_DEFAULTS,
  UI_DEFAULTS,
} from './engine/config'
import {
  buildApiExecutorConfig,
  formatRequestParams,
  formatResponseData,
  resolveApiUrl,
} from './engine/config/apiAdapter'
import { getScopedContentSizeVars } from '@/utils/theme/sizeEngine'
import { TableController } from './engine/core/TableController'
import { resolveColumnIdOrder } from './engine/engines/columnVisibility'
import { useProTableColumnSettingsStorage } from './engine/hooks/useProTableColumnSettingsStorage'
import { useProTableInfiniteScroll } from './engine/hooks/useProTableInfiniteScroll'
import { useProTableUrlSync } from './engine/hooks/useProTableUrlSync'

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
  globalFilter: PRO_TABLE_PROPS_DEFAULTS.globalFilter,
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
          '[ProTable] apiUrl mode requires `apiExecutor` to decouple component from concrete HTTP client.'
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
}>()

if (import.meta.env.DEV && props.apiUrl && !props.apiExecutor) {
  console.error(
    '[ProTable] apiUrl mode requires `apiExecutor` prop. ' +
      'Provide a function that wraps your HTTP client.'
  )
}

const pagConfig = computed<PaginationConfig>(() => {
  if (!props.pagination || props.pagination === true) return {}
  return props.pagination as unknown as PaginationConfig
})

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
  paginationEnabled: enginePaginationEnabled.value,
  initialPageSize: initialPageSizeSnapshot,
  onLoad: params => emit('load', params),
  request: createUnifiedRequest(),
  requestConfig: props.requestConfig,
  onRequestError: err => emit('request-error', err),
  maxSelection: props.maxSelection,
  initialColumnSettings: columnSettingsPersistence.getInitialColumnSettings(props.columns),
  onColumnSettingsChange: columnSettingsPersistence.onColumnSettingsChange,
})

const toolbarServerMode = computed(
  () => !!(props.api || props.request || props.apiUrl) || props.serverMode
)

/** 表格内容区局部密度（不调用全局 useSizeStore，仅在子树覆盖 CSS 变量） */
const tableDensity = ref<SizeMode>('comfortable')

const tableDensityScopedStyle = computed(() => getScopedContentSizeVars(tableDensity.value))

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

const tableContainerRef = useTemplateRef<HTMLDivElement>('tableContainerRef')

const infiniteScrollCtrl = useProTableInfiniteScroll({
  enabled: !!props.infiniteScroll,
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
})

// Column defs from parent (e.g. new render closures when Pinia config changes)
watch(
  () => props.columns,
  cols => ctrl.setColumns(cols),
  { deep: false }
)

// Sync request function when request/api/apiUrl/searchParams props change
watch(
  [() => props.request, () => props.api, () => props.apiUrl, () => props.searchParams],
  () => ctrl.setRequest(createUnifiedRequest()),
  { deep: false }
)

// In request mode, data/total are managed internally — skip prop watchers
if (!ctrl.requestMode) {
  watch(
    () => props.data,
    data => ctrl.setData(data),
    { deep: false }
  )
  watch(
    () => props.total,
    total => {
      if (total !== undefined) ctrl.setTotal(total)
    },
    { immediate: true }
  )
}

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
    const keys = rows.map(r => String((r as Record<string, unknown>)[keyField]))
    const current = ctrl.state.selection
    if (
      keys.length === current.selectedRowKeys.length &&
      keys.every((k, i) => current.selectedRowKeys[i] === k)
    ) {
      return
    }
    ctrl.state.selection = { selectedRows: rows, selectedRowKeys: keys }
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
    const parentKeys = parentRows.map(r => String((r as Record<string, unknown>)[keyField]))
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

const rowClassFn = computed<((data: T) => string) | undefined>(() => {
  if (!props.rowClassName) return undefined
  const fn = props.rowClassName
  return (data: T): string => fn(data, ctrl.processedRows.value.indexOf(data))
})

useProTableUrlSync({ urlSync: props.urlSync, ctrl })

const pageSizeOptions = computed<number[]>(() => {
  const base: number[] = pagConfig.value.pageSizeOptions
    ? [...pagConfig.value.pageSizeOptions]
    : [...PAGINATION_DEFAULTS.pageSizeOptions]
  const merged = new Set<number>([...base, initialPageSizeSnapshot, ctrl.state.pagination.pageSize])
  return Array.from(merged).sort((a: number, b: number) => a - b)
})

const scrollHeightValue = computed<string | undefined>(() => {
  if (props.heightMode === 'fill') return 'flex'
  if (props.heightMode === 'fixed') return props.height ?? UI_DEFAULTS.fixedHeightFallback
  return undefined
})

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

// ── Pseudo-fullscreen：fixed + z-overlay；全屏时 Teleport 到 body，避免 Layout 内 overflow-hidden 裁切盖不住 footer
const isFullscreen = ref(false)

function toggleFullscreen(): void {
  isFullscreen.value = !isFullscreen.value
  if (typeof document !== 'undefined') {
    document.body.style.overflow = isFullscreen.value ? 'hidden' : ''
  }
}

onBeforeUnmount(() => {
  if (typeof document !== 'undefined') {
    document.body.style.overflow = ''
  }
})

// ── Export ─────────────────────────────────────────────────────────────────────
const hasSelection = computed(() => ctrl.state.selection.selectedRows.length > 0)
function handleExport(mode: 'page' | 'selected'): void {
  ctrl.exportData(mode)
}

// Native PrimeVue selection bridge
const tableSelection = computed({
  get: (): T | T[] | undefined => {
    if (props.selectable === 'single') {
      return ctrl.state.selection.selectedRows[0] as T | undefined
    }
    return ctrl.state.selection.selectedRows as T[]
  },
  set: (val: T | T[] | undefined | null) => {
    let rows: T[] = !val ? [] : Array.isArray(val) ? val : [val]
    const max = props.maxSelection
    if (max != null && max > 0 && rows.length > max) {
      rows = rows.slice(0, max)
    }
    ctrl.state.selection = {
      selectedRows: rows,
      selectedRowKeys: rows.map(r =>
        String(r[String(props.rowKey ?? PRO_TABLE_PROPS_DEFAULTS.rowKey)])
      ),
    }
    emit('update:selected', rows)
  },
})

function handleSortClick(col: ProTableColumn<T>): void {
  if (!col.sortable) return
  ctrl.updateSort(String(col.field ?? col.id))
  emit('sort-change', { ...ctrl.state.sort })
}

function sortIcon(col: ProTableColumn<T>): string {
  const field = String(col.field ?? col.id)
  if (ctrl.state.sort.field !== field) return 'i-lucide-chevrons-up-down'
  if (ctrl.state.sort.direction === 'asc') return 'i-lucide-chevron-up'
  return 'i-lucide-chevron-down'
}

function handleGlobalFilterChange(val: string): void {
  ctrl.setGlobalFilter(val)
  emit('filter-change', { ...ctrl.state.filter })
}

function handlePageChange(page: number): void {
  ctrl.setPage(page)
  emit('page-change', ctrl.state.pagination.page, ctrl.state.pagination.pageSize)
}

function handlePageSizeChange(pageSize: number): void {
  ctrl.setPageSize(pageSize)
  emit('page-change', ctrl.state.pagination.page, ctrl.state.pagination.pageSize)
}

const ResolvedTag = resolveComponent('Tag')

function renderHeader(col: ProTableColumn<T>): VNode | string {
  if (col.headerRender) return col.headerRender()
  if (typeof col.title === 'function') return col.title()
  return col.title ?? col.id
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
    return h(ResolvedTag, { value: enumItem.label, severity: enumItem.severity })
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

/** Body slot 作用域类型（PrimeVue Column #body 不暴露泛型，在此做一次收窄） */
function getBodyCellNode(
  col: ProTableColumn<T>,
  slotProps: { data: unknown; index: number }
): VNode | string | number | null {
  return renderCell(col, slotProps.data as unknown as T, slotProps.index)
}

function getBodyColumnClass(
  col: ProTableColumn<T>,
  slotProps: { data: unknown; index: number }
): string {
  return getColumnClass(col, slotProps.data as unknown as T)
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
  /** Toggle pseudo-fullscreen (CSS fixed + body scroll lock). */
  toggleFullscreen,
})
</script>

<template>
  <Teleport
    to="body"
    :disabled="!isFullscreen"
  >
    <div
      ref="proTableRootRef"
      :class="[
        isFullscreen
          ? 'fixed inset-0 z-overlay h-screen w-screen m-0 flex flex-col gap-sm overflow-hidden rounded-none! bg-card p-md shadow-none'
          : heightMode === 'fill'
            ? 'layout-full flex flex-col gap-sm overflow-hidden'
            : 'w-full flex flex-col gap-sm',
      ]"
      class="bg-card rounded-md overflow-hidden border border-solid border-border px-xs"
    >
      <div :class="heightMode === 'fill' ? 'col-fill' : 'w-full'">
        <Transition name="pro-table-fetch-error">
          <div
            v-if="ctrl.requestMode && ctrl.state.fetch.error"
            class="shrink-0 row-between gap-sm px-lg py-sm bg-danger/10 mb-sm"
          >
            <div class="row-start gap-sm min-w-0">
              <Icons
                name="i-lucide-wifi-off"
                size="sm"
                class="text-danger shrink-0"
              />
              <span class="text-sm text-danger font-bold text-ellipsis-1">
                {{ ctrl.state.fetch.errorMessage || $t('proTable.requestFailed') }}
              </span>
            </div>
            <Button
              size="small"
              severity="danger"
              outlined
              :label="$t('proTable.retry')"
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
        >
          <template #toolbar-extra>
            <slot name="toolbar-extra" />
          </template>
        </ProTableToolbar>

        <div
          :style="tableDensityScopedStyle"
          :class="heightMode === 'fill' ? 'col-fill' : 'w-full'"
        >
          <div
            ref="tableContainerRef"
            :class="heightMode === 'fill' ? 'col-fill relative' : 'w-full relative'"
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
                :scroll-height="scrollHeightValue"
                :scrollable="heightMode !== 'auto'"
                :selection-mode="
                  selectable === 'single'
                    ? 'single'
                    : selectable === 'checkbox'
                      ? 'multiple'
                      : undefined
                "
                :meta-key-selection="false"
                :data-key="String(rowKey)"
                :row-class="rowClassFn ?? undefined"
                :resizable-columns="resizableColumns"
                :column-resize-mode="columnResizeMode"
                :reorderable-columns="reorderableColumns"
                :state-storage="stateStorage === false ? undefined : stateStorage"
                :state-key="stateKey"
                @update:selection="selectable ? (tableSelection = $event) : undefined"
                @row-click="emit('row-click', $event.data)"
              >
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
                >
                  <template #header>
                    <div
                      :class="[
                        'flex flex-row items-center gap-xs select-none w-full',
                        getHeaderAlignClass(col),
                      ]"
                      @click="handleSortClick(col)"
                    >
                      <ProTableCell :node="renderHeader(col)" />
                      <Icons
                        v-if="col.sortable"
                        :name="sortIcon(col)"
                        size="xs"
                        class="text-muted-foreground"
                      />
                    </div>
                  </template>
                  <template #body="slotProps">
                    <ProTableCell
                      :node="getBodyCellNode(col, slotProps)"
                      :align-class="getAlignClass(col)"
                      :extra-class="getBodyColumnClass(col, slotProps)"
                    />
                  </template>
                </Column>

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
                class="col-fill"
                @sort-change="emit('sort-change', $event)"
              />
            </template>

            <!-- Loading overlay — suppressed when infinite-scroll is appending to existing data -->
            <div
              v-if="isLoading && (!infiniteScroll || ctrl.processedRows.value.length === 0)"
              class="absolute inset-0 center bg-background/70 backdrop-blur-md z-10"
            >
              <ProgressSpinner />
            </div>

            <!-- Empty state -->
            <div
              v-if="!isLoading && ctrl.processedRows.value.length === 0"
              class="absolute inset-0 center"
            >
              <slot name="empty">
                <EmptyState
                  icon="i-lucide-table-2"
                  :title="$t('emptyState.noData')"
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
    </div>
  </Teleport>
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
</style>
