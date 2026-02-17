/**
 * DataTable 类型定义
 */

import type { ColumnProps } from 'primevue/column'
import type { DataTableProps as PvDataTableProps } from 'primevue/datatable'
import type { CSSProperties, VNode } from 'vue'

export type FieldKey<T> = keyof T | (string & {})

export interface SortMeta {
  field: string
  order: 1 | -1 | 0
}

export interface PageState {
  first: number
  rows: number
  page: number
  pageCount: number
}

export interface SortEvent {
  sortField: string | null
  sortOrder: 1 | -1 | 0 | null
  multiSortMeta: SortMeta[] | null
}

export interface FilterEvent {
  filters: Record<string, unknown>
  globalFilterValue: string | null
}

export interface RowSelectEvent<T = unknown> {
  originalEvent: Event
  data: T | T[]
  type: 'row' | 'checkbox' | 'radio'
  index?: number
}

export interface RowUnselectEvent<T = unknown> {
  originalEvent: Event
  data: T
  type: 'row' | 'checkbox' | 'radio'
  index?: number
}

export interface SelectAllEvent<T = unknown> {
  originalEvent: Event
  checked: boolean
  data: T[]
}

export interface CellEditCompleteEvent<T = unknown> {
  originalEvent: Event
  data: T
  newValue: unknown
  field: string
  index: number
}

export interface RowClickEvent<T = unknown> {
  originalEvent: Event
  data: T
  index: number
}

export interface RowDblClickEvent<T = unknown> {
  originalEvent: Event
  data: T
  index: number
}

export interface ContextMenuEvent<T = unknown> {
  originalEvent: Event
  data: T
  index: number
}

export interface ScrollBottomEvent {
  originalEvent: Event
  distanceToBottom: number
  scrollTop: number
  scrollHeight: number
  clientHeight: number
}

export type FooterMode = 'custom' | 'column-aligned'
export type ContainerSizeMode = 'fill' | 'auto' | 'fixed'
export type ColumnWidthMode = 'auto' | 'fixed' | 'equal'

export interface VirtualScrollerOptions {
  itemSize?: number
  orientation?: 'vertical' | 'horizontal' | 'both'
  delay?: number
  lazy?: boolean
  showLoader?: boolean
  loading?: boolean
  numToleratedItems?: number
  onLazyLoad?: (event: { first: number; last: number }) => void
  [key: string]: unknown
}

export interface TableSizeConfig {
  widthMode?: 'auto' | 'fixed'
  heightMode?: ContainerSizeMode
  width?: string | number
  height?: string | number
  columnWidthMode?: ColumnWidthMode
  minWidth?: string | number
  minHeight?: string | number
  maxWidth?: string | number
  maxHeight?: string | number
}

export interface ColumnWidthInfo {
  field: string
  width: number
  minWidth?: number
  maxWidth?: number
}

export interface PaginationState {
  page: number
  rows: number
  first: number
  totalRecords?: number
}

export interface SortState {
  sortField?: string
  sortOrder?: 1 | -1 | 0
  multiSortMeta?: SortMeta[]
}

export interface FilterState {
  filters?: Record<string, unknown>
  globalFilterValue?: string
  columnFilters?: ColumnFilterValues
}

/** 列级筛选类型 */
export type ColumnFilterType = 'text' | 'select' | 'multiselect' | 'date-range'

/** 列级筛选选项 */
export interface ColumnFilterOption {
  label: string
  value: unknown
}

/** 列级筛选值集合 */
export type ColumnFilterValues = Record<string, unknown>

/**
 * 列配置接口，在 PrimeVue ColumnProps 基础上扩展。
 * 支持 body / headerRenderer / customFooter、align、filterable、exportable 等。
 * 列级筛选：配置 filterable + filterType / filterOptions / filterPlaceholder，
 * 筛选值由 setColumnFilter(field, value) / getColumnFilters() 控制；列头筛选 UI 可由 slot 或后续扩展。
 */
export interface DataTableColumn<T = unknown> extends Omit<
  Partial<ColumnProps>,
  'field' | 'header'
> {
  field: FieldKey<T>
  header: string | (() => string)
  bodyClass?: string | ((data: T) => string | string[] | Record<string, boolean>)
  bodyStyle?: CSSProperties | ((data: T) => CSSProperties)
  hide?: boolean
  width?: string | number
  minWidth?: string | number
  maxWidth?: string | number
  sortable?: boolean
  filterable?: boolean
  filterType?: ColumnFilterType
  filterOptions?: ColumnFilterOption[]
  filterPlaceholder?: string
  exportable?: boolean
  expander?: boolean
  align?: 'left' | 'center' | 'right'
  body?: (rowData: T, column: DataTableColumn<T>) => VNode | string
  headerRenderer?: () => VNode
  customFooter?: (params: {
    rows: Array<{ value: unknown; row: T; column: DataTableColumn<T>; columnIndex: number }>
    column: DataTableColumn<T>
    columnIndex: number
  }) => VNode | VNode[]
  editable?: boolean
  editorRenderer?: (params: { data: T; value: unknown; field: string }) => VNode | string
  componentsProps?: Record<string, unknown>
  [key: string]: unknown
}

/**
 * 分页器配置，与 PrimeVue Paginator 对齐。
 * currentPageReportTemplate 占位符 {first}/{last}/{totalRecords} 可与 i18n 配合。
 * 默认值见 constants.DEFAULT_PAGINATOR_CONFIG。
 */
export interface PaginatorConfig {
  rows?: number
  rowsPerPageOptions?: number[]
  showTotalRecords?: boolean
  showCurrentPageReport?: boolean
  currentPageReportTemplate?: string
  template?: string
}

export interface ExportConfig {
  formats?: ('csv' | 'xlsx' | 'json')[]
  filename?: string
  includeHeader?: boolean
}

/**
 * DataTable API 配置。请求由 executeTableApi 执行，统一返回 { list, total?, hasNext? }。
 * 参数名可通过 pagination / sort / filter 子配置覆盖。
 *
 * - mode: 'pagination' 服务端分页；'infinite' 无限滚动（触底加载，阈值见 constants.INFINITE_SCROLL_THRESHOLD_PX）。
 * - infinite 模式：首次加载第一页，滚动到底部自动加载下一页，直到 hasNext 为 false；footer 显示「加载中/没有更多」。
 */
export interface DataTableApiConfig<_T = unknown> {
  api: string
  params?: Record<string, unknown>
  type?: 'get' | 'post' | 'put' | 'patch' | 'delete' | 'head'
  immediate?: boolean
  mode?: 'infinite' | 'pagination'
  /** 无限滚动配置：pageSize、请求参数字段名、响应 hasNext 字段名 */
  infinite?: {
    pageSize?: number
    pageParam?: string
    pageSizeParam?: string
    hasNextField?: string
  }
  pagination?: {
    pageSize?: number
    pageParam?: string
    pageSizeParam?: string
  }
  sort?: {
    sortFieldParam?: string
    sortOrderParam?: string
    multiSortParam?: string
  }
  filter?: {
    filterParam?: string
    columnFilterParam?: string
    filterMode?: 'combined' | 'individual'
  }
}

/**
 * DataTable 组件 Props。
 *
 * 分页：pagination=true 且无 api 时为客户端分页；api.mode === 'pagination' 时为服务端分页。
 * 行选择：selectable 总开关，selectionMode 为 single/multiple，rowSelectable 控制是否允许行点击选中；
 * 选择列宽度见 constants.TABLE_SELECTION_COLUMN_WIDTH_PX。
 */
export interface DataTableProps<T = unknown> extends Omit<
  Partial<PvDataTableProps>,
  'selectionMode'
> {
  data?: T[]
  api?: DataTableApiConfig<T>
  columns: DataTableColumn<T>[]
  loading?: boolean
  /** 表格唯一标识；提供时与 useTablePersistence 配合，持久化列顺序、列宽、隐藏列到 dataTable store；不同 tableId 对应不同偏好 */
  tableId?: string
  showHeader?: boolean
  globalFilter?: boolean
  exportable?: boolean
  exportConfig?: ExportConfig
  showFooter?: boolean
  footerMode?: FooterMode
  pagination?: boolean
  paginatorConfig?: PaginatorConfig
  paginatorPosition?: 'left' | 'center' | 'right'
  sortable?: boolean
  multiSort?: boolean
  filterable?: boolean
  selectable?: boolean
  selectionMode?: 'single' | 'multiple' | null | undefined
  metaKeySelection?: boolean
  rowSelectable?: boolean
  selectedRows?: T[]
  selectionFrozen?: boolean
  selectionAlignFrozen?: 'left' | 'right'
  scrollable?: boolean
  editable?: boolean
  editMode?: 'cell' | 'row'
  virtualScrollerOptions?: VirtualScrollerOptions
  reorderableColumns?: boolean
  resizableColumns?: boolean
  columnResizeMode?: 'fit' | 'expand'
  contentAlign?: 'left' | 'center' | 'right'
  sizeConfig?: TableSizeConfig
  size?: 'small' | 'normal' | 'large'
  bordered?: boolean
  showGridlines?: boolean
  stripedRows?: boolean
  rowHover?: boolean
  responsiveLayout?: 'scroll' | 'stack'
  rowClass?: (data: T) => string | string[]
  rowStyle?: (data: T) => CSSProperties
  emptyMessage?: string
  rowGroupMode?: 'rowspan' | 'subheader'
  groupRowsBy?: string | string[]
  expandableRowGroups?: boolean
  expandedRowGroups?: unknown[]
  expandedRows?: unknown[] | Record<string, boolean>
  componentsProps?: Record<string, unknown>
}

export interface DataTableUserPreferences {
  columnOrder?: string[]
  columnWidths?: Record<string, number | string>
  hiddenColumns?: string[]
}

/**
 * DataTable 通过 ref 暴露的 API。
 * 选择相关：clearSelection、selectAll、selectRow、unselectRow、selectedRows；与 row-select / row-unselect / row-click 事件配合。
 */
export interface DataTableExpose<T = unknown> {
  data: T[]
  selectedRows?: T[]
  paginationState?: PaginationState
  sortState?: SortState
  filterState?: FilterState
  columnWidths: ColumnWidthInfo[]
  refresh: () => void
  exportData: (format?: 'csv' | 'xlsx' | 'json') => void
  clearFilters: () => void
  clearSort: () => void
  setSort: (field: string, order: 1 | -1 | 0) => void
  setMultiSort: (meta: SortMeta[]) => void
  setColumnFilter: (field: string, value: unknown) => void
  clearColumnFilter: (field?: string) => void
  getColumnFilters: () => ColumnFilterValues
  clearSelection: () => void
  selectAll: () => void
  selectRow: (row: T) => boolean
  unselectRow: (row: T) => boolean
  goToPage: (page: number) => void
  setPageSize: (size: number) => void
  setGlobalFilter: (value: string) => void
  getTableInstance: () => unknown
  getColumnWidths: () => ColumnWidthInfo[]
  updateColumnWidths: () => void
  /** 当提供 tableId 时可用：返回当前表格持久化的列顺序/列宽/隐藏列偏好 */
  getTablePreferences?: () => DataTableUserPreferences | null
  /** 当提供 tableId 时可用：清除当前表格的持久化偏好并恢复默认列 */
  resetTablePreferences?: () => void
}
