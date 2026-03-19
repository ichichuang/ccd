<script setup lang="ts" generic="T extends Record<string, unknown>">
import type { VNode } from 'vue'
import ProTableCell from './components/ProTableCell'
import { buildDataTablePt, buildColumnPt, type DataTablePtOptions } from './presets/dataTablePt'
import type { ProTableColumn } from './engine/types/column'
import type { SortState, FilterState } from './engine/types/tableState'
import type { PaginationConfig, ProTableProps } from './engine/types/props'
import {
  INFINITE_SCROLL_DEFAULTS,
  PAGINATION_DEFAULTS,
  PRO_TABLE_PROPS_DEFAULTS,
  UI_DEFAULTS,
} from './engine/config'
import { TableController } from './engine/core/TableController'

const props = withDefaults(defineProps<ProTableProps<T>>(), {
  loading: PRO_TABLE_PROPS_DEFAULTS.loading,
  rowKey: PRO_TABLE_PROPS_DEFAULTS.rowKey,
  showToolbar: PRO_TABLE_PROPS_DEFAULTS.showToolbar,
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
  virtualScroll: PRO_TABLE_PROPS_DEFAULTS.virtualScroll,
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
}>()

const pagConfig = computed<PaginationConfig>(() => {
  if (!props.pagination || props.pagination === true) return {}
  return props.pagination as PaginationConfig
})

const enginePaginationEnabled = computed<boolean>(() => {
  return !!props.pagination && !props.infiniteScroll && !props.virtualScroll
})

const ctrl = new TableController<T>({
  columns: props.columns,
  data: props.data,
  rowKey: String(props.rowKey ?? PRO_TABLE_PROPS_DEFAULTS.rowKey),
  serverMode: props.serverMode,
  paginationEnabled: enginePaginationEnabled.value,
  initialPageSize: pagConfig.value.pageSize ?? PAGINATION_DEFAULTS.pageSize,
  onLoad: params => emit('load', params),
})

// ── Infinite scroll ──────────────────────────────────────────────────────────

const tableContainerRef = ref<HTMLDivElement | null>(null)
let _scrollTarget: HTMLElement | null = null
let _scrollHandler: (() => void) | null = null
let _scrollTimeoutId: ReturnType<typeof setTimeout> | null = null

function _setupInfiniteScroll(): void {
  if (!props.infiniteScroll || !tableContainerRef.value) return
  const wrapper =
    tableContainerRef.value.querySelector<HTMLElement>('.p-datatable-table-container') ||
    tableContainerRef.value.querySelector<HTMLElement>('.p-datatable-wrapper')
  if (!wrapper) return
  _scrollTarget = wrapper
  _scrollHandler = () => {
    if (!_scrollTarget || props.loading) return
    const { scrollTop, scrollHeight, clientHeight } = _scrollTarget
    if (scrollHeight - scrollTop - clientHeight < INFINITE_SCROLL_DEFAULTS.bottomDistancePx) {
      emit('load-more')
    }
  }
  wrapper.addEventListener('scroll', _scrollHandler, { passive: true })
}

onMounted(() => {
  if (props.infiniteScroll)
    nextTick(() => {
      _scrollTimeoutId = setTimeout(_setupInfiniteScroll, INFINITE_SCROLL_DEFAULTS.setupDelayMs)
    })
})

onUnmounted(() => {
  ctrl.destroy()
  if (_scrollTimeoutId) {
    clearTimeout(_scrollTimeoutId)
    _scrollTimeoutId = null
  }
  if (_scrollTarget && _scrollHandler) {
    _scrollTarget.removeEventListener('scroll', _scrollHandler)
  }
})

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

// Sync v-model:selected from parent into controller (two-way binding support)
watch(
  () => props.selected,
  newVal => {
    if (newVal === undefined) return
    const rows: T[] = Array.isArray(newVal) ? newVal : newVal != null ? [newVal] : []
    const keyField = String(props.rowKey ?? PRO_TABLE_PROPS_DEFAULTS.rowKey)
    const keys = rows.map(r => String(r[keyField as keyof T]))
    const current = ctrl.state.selection
    if (
      keys.length === current.selectedRowKeys.length &&
      keys.every((k, i) => current.selectedRowKeys[i] === k)
    ) {
      return
    }
    ctrl.state.selection = { selectedRows: rows, selectedRowKeys: keys }
  },
  { deep: true, immediate: true }
)

// DataTable PT — reactive to tableLayout
const tablePt = computed<Record<string, unknown>>(() => {
  const options: DataTablePtOptions = {}
  if (props.tableLayout) options.tableLayout = props.tableLayout
  return buildDataTablePt(options)
})

// Column PT is static (spacing only) — gridlines handled by scoped CSS
const columnPt: Record<string, unknown> = buildColumnPt()

const rowClassFn = computed<((data: T) => string) | undefined>(() => {
  if (!props.rowClassName) return undefined
  const fn = props.rowClassName
  return (data: T): string => fn(data, ctrl.processedRows.value.indexOf(data))
})
const paginationEnabled = computed(
  () => !!props.pagination && !props.infiniteScroll && !props.virtualScroll
)
const pageSizeOptions = computed<number[]>(() => {
  if (pagConfig.value.pageSizeOptions) return pagConfig.value.pageSizeOptions
  return [...PAGINATION_DEFAULTS.pageSizeOptions]
})

const scrollHeightValue = computed<string | undefined>(() => {
  if (props.heightMode === 'fill') return 'flex'
  if (props.heightMode === 'fixed') return props.height ?? UI_DEFAULTS.fixedHeightFallback
  return undefined
})

const visibleColumnIds = computed(() => new Set(ctrl.visibleColumns.value.map(c => c.id)))

// Native PrimeVue selection bridge
const tableSelection = computed({
  get: (): T | T[] | undefined => {
    if (props.selectable === 'single') {
      return ctrl.state.selection.selectedRows[0] as T | undefined
    }
    return ctrl.state.selection.selectedRows as T[]
  },
  set: (val: T | T[] | undefined | null) => {
    const rows: T[] = !val ? [] : Array.isArray(val) ? val : [val]
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
  const val = row[col.field]
  return val !== null && val !== undefined ? String(val) : ''
}

function getAlignClass(col: ProTableColumn<T>): string {
  if (col.align === 'center') return 'text-center'
  if (col.align === 'right') return 'text-right'
  return 'text-left'
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
  return renderCell(col, slotProps.data as T, slotProps.index)
}

function getBodyColumnClass(
  col: ProTableColumn<T>,
  slotProps: { data: unknown; index: number }
): string {
  return getColumnClass(col, slotProps.data as T)
}

// --- API Exposure ---
defineExpose({
  /** Force the table to reload data (emits refresh; parent should refetch in serverMode) */
  reload: () => emit('refresh'),
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
  }),
})
</script>

<template>
  <div :class="heightMode === 'fill' ? 'col-fill gap-sm' : 'w-full col-stack-sm'">
    <div
      :class="
        heightMode === 'fill'
          ? 'surface-elevated rounded-scale-xl col-fill px-padding-md py-padding-sm'
          : 'surface-elevated rounded-scale-xl w-full px-padding-md py-padding-sm'
      "
    >
      <ProTableToolbar
        v-if="showToolbar"
        :title="title"
        :show-global-filter="globalFilter"
        :columns="columns"
        :visible-column-ids="visibleColumnIds"
        :server-mode="serverMode"
        @update:global-filter="handleGlobalFilterChange"
        @toggle-column="ctrl.toggleColumnVisibility($event)"
        @refresh="emit('refresh')"
      >
        <template #toolbar-extra>
          <slot name="toolbar-extra" />
        </template>
      </ProTableToolbar>

      <div
        ref="tableContainerRef"
        :class="heightMode === 'fill' ? 'col-fill relative' : 'w-full relative'"
      >
        <template v-if="!virtualScroll">
          <DataTable
            v-model:selection="tableSelection"
            :value="ctrl.processedRows.value"
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
            :data-key="String(rowKey)"
            :row-class="rowClassFn ?? undefined"
            :resizable-columns="resizableColumns"
            :column-resize-mode="columnResizeMode"
            :reorderable-columns="reorderableColumns"
            :state-storage="stateStorage === false ? undefined : stateStorage"
            :state-key="stateKey"
            @row-click="emit('row-click', $event.data)"
          >
            <!-- Selection column: left or unpinned (before data columns) -->
            <Column
              v-if="selectable === 'checkbox' && selectionPinned !== 'right'"
              column-key="selection-left"
              selection-mode="multiple"
              :header-style="{ width: UI_DEFAULTS.selectionColumnWidth }"
              :pt="columnPt"
              :frozen="selectionPinned === 'left'"
              :align-frozen="selectionPinned === 'left' ? 'left' : undefined"
            />

            <!-- Data columns -->
            <Column
              v-for="col in ctrl.visibleColumns.value"
              :key="col.id"
              :column-key="col.id"
              :pt="columnPt"
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
                  class="row-y-center gap-xs select-none"
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
              :pt="columnPt"
              :frozen="true"
              align-frozen="right"
            />
          </DataTable>
        </template>

        <template v-else>
          <VirtualGridRenderer
            :controller="ctrl"
            :columns="columns"
            :data="data"
            class="col-fill"
          />
        </template>

        <!-- Loading overlay — suppressed when infinite-scroll is appending to existing data -->
        <div
          v-if="loading && (!infiniteScroll || ctrl.processedRows.value.length === 0)"
          class="absolute inset-0 center glass-surface z-10"
        >
          <ProgressSpinner />
        </div>

        <!-- Empty state -->
        <div
          v-if="!loading && ctrl.processedRows.value.length === 0"
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
        v-if="infiniteScroll && loading && ctrl.processedRows.value.length > 0"
        class="shrink-0 py-padding-sm center"
      >
        <ProgressSpinner />
      </div>

      <!-- 架构互斥：virtualScroll 模式下必须卸载分页 UI（避免“虚拟滚动 + 翻页”造成心智与性能冲突） -->
      <ProTablePagination
        v-if="paginationEnabled && !virtualScroll"
        :page="ctrl.state.pagination.page"
        :page-size="ctrl.state.pagination.pageSize"
        :total="ctrl.totalCount.value"
        :page-size-options="pageSizeOptions"
        @update:page="handlePageChange"
        @update:page-size="handlePageSizeChange"
      />
    </div>
  </div>
</template>

<style scoped>
/* ==========================================================================
   1. Backgrounds (Zebra & Hover) via PrimeVue Tokens
   Using color-mix with var(--card) creates an OPAQUE color.
   This guarantees that sticky frozen columns inherit the exact color from <tr>
   without letting scrolling columns bleed through them.
   ========================================================================== */
:deep(.p-datatable) {
  --p-datatable-row-hover-background: color-mix(in srgb, rgb(var(--primary)) 16%, rgb(var(--card)));
}

:deep(.p-datatable-striped) {
  --p-datatable-row-striped-background: color-mix(in srgb, rgb(var(--muted)) 60%, rgb(var(--card)));
}

:deep(.dark .p-datatable-striped),
:deep(html.dark .p-datatable-striped) {
  --p-datatable-row-striped-background: color-mix(in srgb, rgb(var(--muted)) 12%, rgb(var(--card)));
}

/* ==========================================================================
   2. Horizontal Lines Hijack (Physical Override for Independent Control)
   ========================================================================== */
:deep(.pro-table-h-lines .p-datatable-thead > tr > th),
:deep(.pro-table-h-lines .p-datatable-tbody > tr > td) {
  border-bottom: 1.5px solid rgb(var(--border)) !important;
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
  border-right: 1.5px solid rgb(var(--border)) !important;
}

:deep(.pro-table-v-lines .p-datatable-thead > tr > th:last-child),
:deep(.pro-table-v-lines .p-datatable-tbody > tr > td:last-child) {
  border-right-width: 0 !important;
}

/* ==========================================================================
   5. Selected Row Hijack (Bulletproof Opacity via color-mix)
   ========================================================================== */
/* Base selected state */
:deep(.p-datatable-tbody > tr.p-highlight > td),
:deep(.p-datatable-tbody > tr[data-p-selected='true'] > td) {
  background-color: color-mix(in srgb, rgb(var(--accent)) 16%, rgb(var(--card))) !important;
}

:deep(.dark .p-datatable-tbody > tr.p-highlight > td),
:deep(.dark .p-datatable-tbody > tr[data-p-selected='true'] > td) {
  background-color: color-mix(in srgb, rgb(var(--accent)) 100%, rgb(var(--card))) !important;
}

/* Hover state FOR selected rows (slightly darker) */
:deep(.p-datatable-hoverable-rows .p-datatable-tbody > tr.p-highlight:hover > td),
:deep(.p-datatable-hoverable-rows .p-datatable-tbody > tr[data-p-selected='true']:hover > td) {
  background-color: color-mix(in srgb, rgb(var(--accent)) 18%, rgb(var(--card))) !important;
}

:deep(.dark .p-datatable-hoverable-rows .p-datatable-tbody > tr.p-highlight:hover > td),
:deep(
  .dark .p-datatable-hoverable-rows .p-datatable-tbody > tr[data-p-selected='true']:hover > td
) {
  background-color: color-mix(in srgb, rgb(var(--accent)) 100%, rgb(var(--card))) !important;
}

/* ==========================================================================
   6. Frozen Columns Z-Index Fortification (Anti Bleed-Through)
   ========================================================================== */
/* Elevate body frozen columns to suppress rogue z-indexes in scrolling cells */
:deep(.p-datatable-tbody > tr > td.p-datatable-frozen-column) {
  z-index: 10 !important;
}

/* Elevate header frozen columns even higher so they stay above both scrolling content AND scrolling headers */
:deep(.p-datatable-thead > tr > th.p-datatable-frozen-column) {
  z-index: 11 !important;
}
</style>
