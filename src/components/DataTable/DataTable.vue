<script setup lang="ts" generic="T extends object">
/**
 * DataTable - PrimeVue DataTable 二次封装
 * 支持列配置驱动、API 加载、分页/无限滚动、列持久化、全局搜索、导出
 *
 * 核心逻辑已抽取到 composables：
 * - useTableData：数据管理、API 加载、筛选、排序
 * - useTableSelection：行选择
 * - useTableExport：CSV/JSON/XLSX 导出
 * - useTableLayout：布局、尺寸、滚动、列宽与 footer 对齐
 */
import PvDataTable from 'primevue/datatable'
import Paginator from 'primevue/paginator'
import BodyCellRenderer from './BodyCellRenderer'
import RenderFn from './RenderFn'
import { DEFAULT_PAGINATOR_CONFIG, TABLE_SELECTION_COLUMN_WIDTH_PX } from './utils/constants'
import { getColumnHeader } from './utils/helper'
import type {
  ColumnWidthInfo,
  DataTableColumn,
  DataTableExpose,
  DataTableProps,
  PaginationState,
  SortMeta,
} from './utils/types'
import { useTableData } from './composables/useTableData'
import { useTableSelection } from './composables/useTableSelection'
import { useTableExport } from './composables/useTableExport'
import { useTableLayout } from './composables/useTableLayout'
import { useTablePersistence } from '@/hooks/modules/useTablePersistence'
import { useLocale } from '@/hooks/modules/useLocale'
import { useSizeStore } from '@/stores/modules/size'
import { nextTick, onMounted, onUnmounted, useSlots } from 'vue'
import { useMitt } from '@/utils/mitt'
import { FONT_SCALE_RATIOS, SPACING_SCALE_RATIOS } from '@/constants/sizeScale'

const selectionColumnStyle = { width: `${TABLE_SELECTION_COLUMN_WIDTH_PX}px` }

const slots = useSlots()
const props = withDefaults(defineProps<DataTableProps<T>>(), {
  selectable: false,
  selectionMode: 'multiple',
  rowSelectable: true,
  pagination: false,
  paginatorPosition: 'center',
  sortable: false,
  filterable: false,
  globalFilter: false,
  showHeader: false,
  showFooter: false,
  footerMode: 'custom',
  exportable: false,
  bordered: false,
  showGridlines: false,
  stripedRows: false,
  rowHover: true,
  reorderableColumns: false,
  resizableColumns: false,
  columnResizeMode: 'fit',
  componentsProps: () => ({}),
})

const emit = defineEmits<{
  (e: 'update:selectedRows', rows: T[]): void
  (e: 'page-change', event: PaginationState): void
  (e: 'sort-change', event: { sortField: string | null; sortOrder: number | null }): void
  (e: 'row-select', event: unknown): void
  (e: 'row-unselect', event: unknown): void
  (e: 'row-click', event: unknown): void
  (e: 'row-dblclick', event: unknown): void
  (e: 'cell-edit-complete', event: unknown): void
  (e: 'scroll-bottom', event: unknown): void
  (e: 'column-widths-change', widths: ColumnWidthInfo[]): void
  (e: 'column-reorder', event: unknown): void
  (e: 'column-resize-end', event: unknown): void
}>()

const { $t: _t } = useLocale()
const sizeStore = useSizeStore()

// ─── Column Persistence ───
const tableIdRef = computed(() => props.tableId)
const originalColumnsRef = computed(() => props.columns)
const {
  effectiveColumns,
  handleColumnResize: handlePersistenceColumnResize,
  handleColumnReorder: handlePersistenceColumnReorder,
  getPreferences: getTablePreferences,
  resetPreferences: resetTablePreferences,
} = useTablePersistence(tableIdRef, originalColumnsRef)

const visibleColumns = computed(() => effectiveColumns.value.filter(col => !col.hide))

// ─── Pagination State ───
const paginationState = ref<PaginationState>({
  page: 1,
  rows: props.paginatorConfig?.rows ?? DEFAULT_PAGINATOR_CONFIG.rows ?? 10,
  first: 0,
  totalRecords: (props.data ?? []).length,
})
const infinitePage = ref(1)
const infiniteHasNext = ref(true)

// ─── Composable: Data ───
const {
  apiData: _apiData,
  apiLoading: _apiLoading,
  sourceData,
  filteredData,
  dataToRender,
  loading,
  globalFilterValue,
  searchInputValue,
  columnFilters,
  sortField,
  sortOrder,
  multiSortMeta,
  loadApiData,
  refresh: dataRefresh,
  handleGlobalFilterChange,
  clearFilters,
  setColumnFilter,
  clearColumnFilter,
} = useTableData<T>({
  props,
  paginationState,
  infinitePage,
  infiniteHasNext,
  visibleColumns,
})

// ─── Composable: Selection ───
const {
  selectedRows,
  idField,
  selectionModeComputed,
  selectionComputed: _selectionComputed,
  isAllSelected,
  isRowSelected,
  handleRadioSelect,
  handleCheckboxChange,
  handleSelectAllChange,
  handleRowClick,
  handleRowSelect,
  handleRowUnselect,
  handleTableWrapperClick,
  clearSelection,
  selectAll,
  selectRow,
  unselectRow,
} = useTableSelection<T>({
  props,
  sourceData,
  filteredData,
  dataToRender,
  emit: {
    'update:selectedRows': (rows: T[]) => emit('update:selectedRows', rows),
    'row-select': (event: unknown) => emit('row-select', event),
    'row-unselect': (event: unknown) => emit('row-unselect', event),
    'row-click': (event: unknown) => emit('row-click', event),
  } as never,
})

// ─── Composable: Export ───
const { handleExport } = useTableExport<T>({
  props,
  filteredData,
  selectedRows,
  visibleColumns,
})

// ─── Composable: Layout ───
const {
  tableWrapperRef,
  tableWrapperFullRef,
  scrollbarRef,
  scrollWrapperRef: _scrollWrapperRef,
  containerStyle,
  scrollableComputed,
  calculatedHeight: _calculatedHeight,
  scrollHeightComputed,
  columnWidths,
  selectionColumnWidth: _selectionColumnWidth,
  footerMode,
  selectionAlignFrozen,
  sizeConfig: _sizeConfig,
  updateColumnWidths,
  scheduleFooterWidthUpdate,
  footerColumnsStyle,
} = useTableLayout<T>({
  props,
  visibleColumns,
  sourceData,
  filteredData,
  loading,
  infiniteHasNext,
  selectionModeComputed,
  loadApiData,
  slots: slots as Record<string, unknown>,
})

// ─── Template Refs & Computed ───
const tableRef = ref<InstanceType<typeof PvDataTable>>()
const expandedRows = ref<T[]>([])

const showHeaderComputed = computed(() => {
  if (props.showHeader === false) return false
  if (props.showHeader === true) return true
  return (
    Boolean(slots.header || slots['header-left'] || slots['header-right']) ||
    props.globalFilter ||
    props.exportable
  )
})

const showFooterComputed = computed(
  () => props.showFooter || (props.api?.mode === 'infinite' && sourceData.value.length > 0)
)
const isLazy = computed(() => props.api?.mode === 'pagination')
const showRefreshButton = computed(() => props.api?.mode === 'pagination')

const preset = computed(() => sizeStore.currentPreset)
const getRowHeight = () => {
  const scale = props.size === 'small' ? 'sm' : props.size === 'large' ? 'lg' : 'md'
  const fs = preset.value.fontSizeBase * FONT_SCALE_RATIOS[scale]
  const pad = preset.value.spacingBase * SPACING_SCALE_RATIOS.sm * 2
  return fs + pad
}

const formatWidth = (w: string | number | undefined) => {
  if (!w) return undefined
  if (typeof w === 'number') return `${w}px`
  if (typeof w === 'string' && /^\d+$/.test(w.trim())) return `${w.trim()}px`
  return w
}

const getColumnStyle = (col: DataTableColumn<T>) => {
  const style: Record<string, string> = {}
  if (col.width) style.width = formatWidth(col.width) ?? ''
  if (col.align) style.textAlign = col.align
  style.height = `${getRowHeight()}px`
  return Object.keys(style).length ? style : undefined
}

const getColumnHeaderClass = (col: DataTableColumn<T>) => {
  const align = col.align ?? props.contentAlign
  if (align === 'center') return 'c-data-table-header-center'
  if (align === 'right') return 'c-data-table-header-right'
  return ''
}

// ─── Refresh (combining data + layout) ───
const refresh = () => {
  dataRefresh()
  updateColumnWidths()
}

// ─── Pagination ───
// Watch data length changes to keep totalRecords in sync (client-side mode)
watch([() => sourceData.value.length, () => filteredData.value.length], () => {
  if (props.api?.mode !== 'pagination') {
    paginationState.value.totalRecords =
      props.globalFilter && globalFilterValue.value
        ? filteredData.value.length
        : sourceData.value.length
  }
})

const handlePageChange = (event: {
  page: number
  rows: number
  first: number
  totalRecords?: number
}) => {
  paginationState.value = {
    page: event.page + 1,
    rows: event.rows,
    first: event.first,
    totalRecords:
      props.api?.mode === 'pagination'
        ? paginationState.value.totalRecords
        : (event.totalRecords ?? filteredData.value.length),
  }
  if (props.api?.mode === 'pagination') void loadApiData(false, true)
  emit('page-change', paginationState.value)
}

// ─── Sort Event ───
const handleSortChange = (event: {
  sortField?: string | ((item: unknown) => string)
  sortOrder?: 0 | 1 | -1 | null
}) => {
  sortField.value = typeof event.sortField === 'string' ? event.sortField : undefined
  sortOrder.value = (
    event.sortOrder === 0 || event.sortOrder === 1 || event.sortOrder === -1
      ? event.sortOrder
      : undefined
  ) as 1 | -1 | 0 | undefined

  if (props.api) {
    void loadApiData(false, true)
  }

  emit('sort-change', {
    sortField: typeof event.sortField === 'string' ? event.sortField : null,
    sortOrder: event.sortOrder ?? null,
  })
}

// ─── Column Events ───
const onColumnReorder = (event: { dragIndex?: number; dropIndex?: number }) => {
  handlePersistenceColumnReorder({
    dragIndex: event.dragIndex ?? 0,
    dropIndex: event.dropIndex ?? 0,
  })
  scheduleFooterWidthUpdate()
  emit('column-reorder', event)
}

const onColumnResizeEnd = (event: {
  element?: HTMLElement
  column?: { field?: string }
  delta?: number
}) => {
  if (event.element && event.column) {
    handlePersistenceColumnResize({
      element: event.element,
      column: event.column,
      delta: event.delta ?? 0,
    })
  }
  scheduleFooterWidthUpdate()
  emit('column-resize-end', event)
}

// ─── Cell & Footer Helpers ───
const getBodyFn = (column: DataTableColumn<T>) =>
  column.body as (r: unknown, c: DataTableColumn<unknown>) => import('vue').VNode | string

const getColumnForBody = (column: DataTableColumn<T>): DataTableColumn<unknown> =>
  column as DataTableColumn<unknown>

const getCellValue = (row: unknown, field: string | number | symbol): unknown =>
  (row as Record<string, unknown>)[String(field)]

const getCustomFooterFn = (column: DataTableColumn<T>) => {
  const fn = column.customFooter!
  return (params?: unknown) =>
    fn(params as Parameters<NonNullable<DataTableColumn<T>['customFooter']>>[0])
}

const footerParams = (
  column: DataTableColumn<T>,
  columnIndex: number
): Record<string, unknown> => ({
  rows: dataToRender.value.map(row => ({
    value: (row as Record<string, unknown>)[column.field as string],
    row,
    column,
    columnIndex,
  })),
  column,
  columnIndex,
})

const getFooterParamsForRender = (
  column: DataTableColumn<T>,
  index: number
): Record<string, unknown> => footerParams(column, index)

// ─── Paginator Position ───
const paginatorJustifyContent = computed(() => {
  const p = props.paginatorPosition ?? 'center'
  return p === 'left' ? 'flex-start' : p === 'right' ? 'flex-end' : 'center'
})

// ─── Row Class ───
const rowClassComputed = computed(() => (data: T) => {
  const baseClass = typeof props.rowClass === 'function' ? props.rowClass(data) : props.rowClass
  return {
    ...(typeof baseClass === 'object' ? baseClass : { [baseClass as string]: !!baseClass }),
    'p-highlight': isRowSelected(data),
  }
})

// ─── Disable footer scrollbar interaction (Column-aligned mode) ───
const disableFooterScrollbarInteraction = () => {
  if (footerMode.value !== 'column-aligned' || !scrollbarRef.value) return

  const scrollbarInstance = (scrollbarRef.value as { getInstance?: () => unknown })?.getInstance?.()
  if (!scrollbarInstance) return

  const elements = (
    scrollbarInstance as { elements?: () => { scrollOffsetElement?: HTMLElement } }
  )?.elements?.()
  if (!elements?.scrollOffsetElement) return

  const scrollElement = elements.scrollOffsetElement

  // 阻止用户交互滚动事件（wheel、touch）
  const preventUserScroll = (e: Event) => {
    e.preventDefault()
    e.stopPropagation()
  }

  scrollElement.addEventListener('wheel', preventUserScroll, { passive: false })
  scrollElement.addEventListener('touchstart', preventUserScroll, { passive: false })
  scrollElement.addEventListener('touchmove', preventUserScroll, { passive: false })

  // 阻止键盘滚动
  scrollElement.addEventListener(
    'keydown',
    (e: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
        e.preventDefault()
        e.stopPropagation()
      }
    },
    { passive: false }
  )
}

// ─── Mount: load initial data ───
onMounted(() => {
  if (props.api?.immediate !== false) void loadApiData()

  // 延迟禁用 footer scrollbar 交互，等待 CScrollbar 初始化完成
  if (footerMode.value === 'column-aligned') {
    nextTick(() => {
      setTimeout(() => {
        disableFooterScrollbarInteraction()
      }, 200)
    })
  }
})

// ─── Mitt: 列宽变更由 useTableLayout 发出，此处订阅并转发 Vue emit ───
const mitt = useMitt()
const handleTableColumnWidthsChange = (payload: {
  tableId?: string
  widths: { field: string; width: number; minWidth?: number; maxWidth?: number }[]
}) => {
  if (payload.tableId != null && payload.tableId !== props.tableId) return
  emit('column-widths-change', payload.widths as ColumnWidthInfo[])
}
onMounted(() => {
  mitt.on('tableColumnWidthsChange', handleTableColumnWidthsChange)
})
onUnmounted(() => {
  mitt.off('tableColumnWidthsChange', handleTableColumnWidthsChange)
})

// ─── Expose ───
defineExpose<DataTableExpose<T>>({
  get data() {
    return sourceData.value as T[]
  },
  get selectedRows() {
    return selectedRows.value as T[]
  },
  get paginationState() {
    return paginationState.value
  },
  get sortState() {
    return {
      sortField: sortField.value,
      sortOrder: (sortOrder.value === 0 || sortOrder.value === 1 || sortOrder.value === -1
        ? sortOrder.value
        : undefined) as 1 | -1 | 0 | undefined,
    }
  },
  get filterState() {
    return {
      globalFilterValue: globalFilterValue.value,
      columnFilters: columnFilters.value,
    }
  },
  get columnWidths() {
    return columnWidths.value
  },
  refresh,
  exportData: (format?: 'csv' | 'xlsx' | 'json') => handleExport(format ?? 'csv'),
  clearFilters,
  clearSort: () => {
    sortField.value = undefined
    sortOrder.value = undefined
  },
  setSort: (field, order) => {
    sortField.value = field
    sortOrder.value = order
  },
  setMultiSort: (meta: SortMeta[]) => {
    multiSortMeta.value = meta
    if (props.api) void loadApiData(false, true)
  },
  setColumnFilter: (field: string, value: unknown) => {
    setColumnFilter(field, value)
  },
  clearColumnFilter: (field?: string) => {
    clearColumnFilter(field)
  },
  getColumnFilters: () => columnFilters.value,
  clearSelection,
  selectAll,
  selectRow,
  unselectRow,
  goToPage: page => {
    paginationState.value.page = page
    paginationState.value.first = (page - 1) * paginationState.value.rows
    if (props.api?.mode === 'pagination') void loadApiData(false, true)
  },
  setPageSize: size => {
    paginationState.value.rows = size
    paginationState.value.first = 0
    paginationState.value.page = 1
    if (props.api?.mode === 'pagination') void loadApiData(false, true)
  },
  setGlobalFilter: v => {
    searchInputValue.value = v
    globalFilterValue.value = v
  },
  getTableInstance: () => tableRef.value,
  getColumnWidths: () => columnWidths.value,
  updateColumnWidths,
  getTablePreferences: props.tableId ? () => getTablePreferences() : undefined,
  resetTablePreferences: props.tableId ? () => resetTablePreferences() : undefined,
})

// ─── Template Helpers ───
const resolveBodyClass = (col: DataTableColumn<T>, data: T) => {
  if (typeof col.bodyClass === 'function') {
    return col.bodyClass(data)
  }
  return col.bodyClass
}

const resolveBodyStyle = (col: DataTableColumn<T>, data: T) => {
  if (typeof col.bodyStyle === 'function') {
    return col.bodyStyle(data)
  }
  return col.bodyStyle
}
</script>
<template>
  <div class="relative w-full h-full">
    <div
      ref="tableWrapperFullRef"
      class="absolute inset-0 -z-1"
    />
    <div
      ref="tableWrapperRef"
      class="c-data-table-wrapper flex flex-col overflow-hidden"
      :class="{ 'c-data-table--bordered': props.bordered }"
      :style="containerStyle"
      @click.capture="handleTableWrapperClick"
    >
      <div
        v-if="showHeaderComputed"
        class="c-data-table-header flex justify-between items-center gap-sm px-padding-md py-padding-sm"
      >
        <!-- Full Override Header -->
        <template v-if="$slots.header">
          <slot
            name="header"
            :data="sourceData"
            :loading="loading"
            :pagination="paginationState"
          />
        </template>
        <template v-else>
          <div class="flex-1 flex items-center gap-md">
            <slot
              name="header-left"
              :data="sourceData"
              :loading="loading"
              :pagination="paginationState"
            />
          </div>
          <div class="flex gap-md items-center fs-md">
            <slot
              name="header-right"
              :data="sourceData"
              :loading="loading"
              :pagination="paginationState"
            />
            <IconField
              v-if="props.globalFilter"
              class="flex items-center"
            >
              <InputIcon>
                <Icons
                  name="i-lucide-search"
                  size="sm"
                />
              </InputIcon>
              <InputText
                :model-value="searchInputValue"
                :placeholder="$t('common.searchPlaceholder') as string"
                class="w-40 sm:w-64"
                @update:model-value="handleGlobalFilterChange"
              />
              <span
                v-if="searchInputValue"
                class="cursor-pointer inline-flex"
                @click="clearFilters"
              >
                <InputIcon>
                  <Icons
                    name="i-lucide-x"
                    size="sm"
                  />
                </InputIcon>
              </span>
            </IconField>
            <Button
              v-if="props.exportable"
              severity="secondary"
              size="small"
              class="gap-sm"
              @click="handleExport('csv')"
            >
              <Icons
                name="i-lucide-download"
                size="sm"
              />
              <span>{{ $t('common.export') }}</span>
            </Button>
            <Button
              v-if="showRefreshButton"
              severity="secondary"
              size="small"
              class="gap-sm"
              @click="refresh"
            >
              <Icons
                name="i-lucide-refresh-cw"
                size="sm"
              />
              <span>{{ $t('common.refresh') }}</span>
            </Button>
          </div>
        </template>
      </div>

      <!-- PrimeVue DataTable 期望 DataTableSortMeta[]，与 SortMeta 兼容 -->
      <PvDataTable
        ref="tableRef"
        v-model:sort-field="sortField"
        v-model:sort-order="sortOrder"
        :multi-sort-meta="multiSortMeta as SortMeta[]"
        :sort-mode="props.multiSort ? 'multiple' : 'single'"
        class="flex-1 min-h-0"
        :expanded-rows="expandedRows"
        :value="dataToRender"
        :loading="loading"
        :rows="paginationState.rows"
        :first="paginationState.first"
        :total-records="paginationState.totalRecords"
        :rows-per-page-options="
          paginatorConfig?.rowsPerPageOptions ?? DEFAULT_PAGINATOR_CONFIG.rowsPerPageOptions
        "
        :lazy="isLazy"
        :data-key="idField"
        :show-gridlines="showGridlines"
        :striped-rows="stripedRows"
        :size="props.size"
        :scrollable="scrollableComputed"
        :scroll-height="scrollHeightComputed"
        :row-hover="props.rowHover"
        :reorderable-columns="props.reorderableColumns"
        :resizable-columns="props.resizableColumns"
        :column-resize-mode="props.columnResizeMode"
        :row-class="rowClassComputed"
        :row-style="props.rowStyle"
        v-bind="componentsProps ?? {}"
        @update:multi-sort-meta="
          (v: unknown) => {
            multiSortMeta = (v as SortMeta[]) ?? []
          }
        "
        @sort="handleSortChange"
        @row-select="handleRowSelect"
        @row-unselect="handleRowUnselect"
        @row-click="handleRowClick"
        @row-dblclick="(e: unknown) => emit('row-dblclick', e)"
        @column-reorder="onColumnReorder"
        @column-resize-end="onColumnResizeEnd"
      >
        <template
          v-if="$slots.expansion"
          #expansion="slotProps"
        >
          <slot
            name="expansion"
            v-bind="slotProps"
          />
        </template>

        <Column
          v-if="props.selectable && selectionModeComputed && selectionAlignFrozen === 'left'"
          :header-style="selectionColumnStyle"
          :style="selectionColumnStyle"
          :frozen="props.selectionFrozen"
          :align-frozen="selectionAlignFrozen"
        >
          <template #header>
            <Checkbox
              v-if="selectionModeComputed === 'multiple'"
              :model-value="isAllSelected"
              :binary="true"
              @update:model-value="handleSelectAllChange"
            />
          </template>
          <template #body="{ data }">
            <div
              class="c-dt-selection-cell flex items-center justify-center w-full"
              @click.stop
            >
              <RadioButton
                v-if="selectionModeComputed === 'single'"
                :model-value="selectedRows[0]"
                :value="data"
                :name="`c-dt-sel-${tableIdRef ?? 't'}`"
                @update:model-value="handleRadioSelect(data)"
              />
              <Checkbox
                v-else
                :model-value="isRowSelected(data)"
                :binary="true"
                @update:model-value="(checked: boolean) => handleCheckboxChange(checked, data)"
              />
            </div>
          </template>
        </Column>

        <Column
          v-for="col in visibleColumns"
          :key="String(col.field)"
          :field="String(col.field)"
          :header="getColumnHeader(col)"
          :sortable="col.sortable !== false && props.sortable"
          :exportable="col.exportable !== false"
          :expander="col.expander"
          :style="getColumnStyle(col)"
          :header-class="getColumnHeaderClass(col)"
          :header-style="{
            justifyContent:
              (col.align ?? props.contentAlign) === 'center'
                ? 'center'
                : (col.align ?? props.contentAlign) === 'right'
                  ? 'flex-end'
                  : 'flex-start',
          }"
        >
          <template
            v-if="col.headerRenderer"
            #header
          >
            <component :is="col.headerRenderer" />
          </template>
          <template #body="{ data }">
            <div
              class="w-full h-full flex items-center"
              :class="resolveBodyClass(col, data)"
              :style="{
                ...resolveBodyStyle(col, data),
                justifyContent:
                  (col.align ?? props.contentAlign) === 'center'
                    ? 'center'
                    : (col.align ?? props.contentAlign) === 'right'
                      ? 'flex-end'
                      : 'flex-start',
              }"
            >
              <BodyCellRenderer
                v-if="col.body"
                :body-fn="getBodyFn(col)"
                :row-data="data"
                :column="getColumnForBody(col)"
              />
              <template v-else>
                {{ getCellValue(data, col.field) }}
              </template>
            </div>
          </template>
        </Column>

        <Column
          v-if="props.selectable && selectionModeComputed && selectionAlignFrozen === 'right'"
          :header-style="selectionColumnStyle"
          :style="selectionColumnStyle"
          :frozen="props.selectionFrozen"
          :align-frozen="selectionAlignFrozen"
        >
          <template #header>
            <Checkbox
              v-if="selectionModeComputed === 'multiple'"
              :model-value="isAllSelected"
              :binary="true"
              @update:model-value="handleSelectAllChange"
            />
          </template>
          <template #body="{ data }">
            <div
              class="c-dt-selection-cell flex items-center justify-center w-full"
              @click.stop
            >
              <RadioButton
                v-if="selectionModeComputed === 'single'"
                :model-value="selectedRows[0]"
                :value="data"
                :name="`c-dt-sel-r-${tableIdRef ?? 't'}`"
                @update:model-value="handleRadioSelect(data)"
              />
              <Checkbox
                v-else
                :model-value="isRowSelected(data)"
                :binary="true"
                @update:model-value="(checked: boolean) => handleCheckboxChange(checked, data)"
              />
            </div>
          </template>
        </Column>
      </PvDataTable>

      <div
        v-if="showFooterComputed"
        class="c-data-table-footer"
      >
        <template v-if="footerMode === 'custom'">
          <div>
            <slot
              name="footer"
              :data="sourceData"
              :loading="loading"
              :pagination="paginationState"
            />
            <div
              v-if="props.api?.mode === 'infinite' && sourceData.length"
              class="fs-sm text-muted-foreground flex items-center justify-center gap-md py-padding-sm"
            >
              <template v-if="loading">
                <Icons
                  name="i-lucide-loader-2"
                  size="sm"
                  class="animate-spin"
                />
                {{ $t('common.loading') }}
              </template>
              <template v-else-if="!infiniteHasNext">
                {{ $t('common.noMoreData') }}
              </template>
            </div>
          </div>
        </template>
        <template v-else-if="footerMode === 'column-aligned'">
          <CScrollbar
            ref="scrollbarRef"
            visibility="hidden"
            :options="{ overflow: { x: 'scroll', y: 'hidden' } }"
            class="c-data-table-footer-scrollbar"
          >
            <div
              class="c-data-table-footer-columns grid border-solid border-border border-y-none"
              :style="footerColumnsStyle"
            >
              <template
                v-if="props.selectable && selectionModeComputed && selectionAlignFrozen === 'left'"
              >
                <div class="c-data-table-footer-column border-solid border-border border-x-none" />
              </template>
              <template
                v-for="(column, index) in visibleColumns"
                :key="String(column.field)"
              >
                <div class="c-data-table-footer-column border-solid border-border border-x-none">
                  <!-- params 类型桥接：Vue 模板对 RenderFn.params 推断为 undefined -->
                  <RenderFn
                    v-if="column.customFooter"
                    :fn="getCustomFooterFn(column)"
                    :params="getFooterParamsForRender(column, index) as any"
                  />
                </div>
              </template>
              <template
                v-if="props.selectable && selectionModeComputed && selectionAlignFrozen === 'right'"
              >
                <div class="c-data-table-footer-column border-solid border-border border-x-none" />
              </template>
            </div>
          </CScrollbar>
        </template>
      </div>

      <!-- External Paginator -->
      <div
        v-if="props.pagination"
        class="border-t-default bg-card"
      >
        <Paginator
          :rows="paginationState.rows"
          :first="paginationState.first"
          :total-records="paginationState.totalRecords"
          :rows-per-page-options="
            paginatorConfig?.rowsPerPageOptions ?? DEFAULT_PAGINATOR_CONFIG.rowsPerPageOptions
          "
          :template="paginatorConfig?.template ?? DEFAULT_PAGINATOR_CONFIG.template"
          @page="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.c-data-table-wrapper:deep(.p-paginator) {
  display: flex !important;
  justify-content: v-bind(paginatorJustifyContent) !important;
}

.c-data-table-header-center:deep(.p-datatable-column-header-content),
:deep(.c-data-table-header-center .p-datatable-column-header-content) {
  display: flex;
  justify-content: center;
  align-items: center;
}

.c-data-table-header-right:deep(.p-datatable-column-header-content),
:deep(.c-data-table-header-right .p-datatable-column-header-content) {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.c-data-table-wrapper:deep(.p-datatable) {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.c-data-table-wrapper:deep(.p-datatable-wrapper) {
  flex: 1;
  overflow: auto;
  min-height: 0;
}

.c-data-table-wrapper:deep(.p-datatable-thead) {
  position: sticky !important;
  top: 0 !important;
  z-index: 100 !important;
}

.c-data-table--bordered {
  border: 1px solid rgb(var(--border));
  border-radius: var(--radius-md);
}

/* Override PrimeVue border colors to use system border variable */
.c-data-table-wrapper:deep(.p-datatable .p-datatable-thead > tr > th),
.c-data-table-wrapper:deep(.p-datatable .p-datatable-tbody > tr > td),
.c-data-table-wrapper:deep(.p-datatable .p-datatable-tfoot > tr > td),
.c-data-table-wrapper:deep(.p-paginator) {
  border-color: rgb(var(--border));
}

.c-data-table-wrapper:deep(.p-datatable-header),
.c-data-table-wrapper:deep(.p-datatable-footer) {
  border-color: rgb(var(--border));
  background: rgb(var(--card));
  color: rgb(var(--card-foreground));
}

/* Column-aligned footer scrollbar: 隐藏滚动条并禁用滚动交互 */
.c-data-table-footer-scrollbar {
  /* 隐藏滚动条 */
  :deep(.os-scrollbar) {
    display: none !important;
  }

  /* 禁用滚动条交互（滚动条已隐藏，此样式作为额外保障） */
  :deep(.os-scrollbar-handle),
  :deep(.os-scrollbar-track) {
    pointer-events: none !important;
  }
}
</style>
