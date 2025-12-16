/**
 * VxeTable 类型定义
 */

import type { ColumnProps } from 'primevue/column'
import type { DataTableProps } from 'primevue/datatable'
import type { Component, CSSProperties, VNode } from 'vue'

/**
 * 字段 Key 类型
 * - 使用 keyof T 提供智能提示
 * - 同时保留 string 兼容 'user.name' 等路径写法
 */
export type FieldKey<T> = keyof T | (string & {})

/**
 * 排序元数据
 */
export interface SortMeta {
  field: string
  order: 1 | -1 | 0
}

/**
 * 分页状态
 */
export interface PageState {
  first: number
  rows: number
  page: number
  pageCount: number
}

/**
 * 排序事件
 */
export interface SortEvent {
  sortField: string | null
  sortOrder: 1 | -1 | 0 | null
  multiSortMeta: SortMeta[] | null
}

/**
 * 筛选事件
 */
export interface FilterEvent {
  filters: Record<string, any>
  globalFilterValue: string | null
}

/**
 * 行选择事件
 */
export interface RowSelectEvent<T = any> {
  originalEvent: Event
  data: T | T[]
  type: 'row' | 'checkbox' | 'radio'
  index?: number
}

/**
 * 行取消选择事件
 */
export interface RowUnselectEvent<T = any> {
  originalEvent: Event
  data: T
  type: 'row' | 'checkbox' | 'radio'
  index?: number
}

/**
 * 全选事件
 */
export interface SelectAllEvent<T = any> {
  originalEvent: Event
  checked: boolean
  data: T[]
}

/**
 * 行展开事件
 */
export interface RowExpandEvent<T = any> {
  originalEvent: Event
  data: T
}

/**
 * 行收起事件
 */
export interface RowCollapseEvent<T = any> {
  originalEvent: Event
  data: T
}

/**
 * 单元格编辑完成事件
 */
export interface CellEditCompleteEvent<T = any> {
  originalEvent: Event
  data: T
  newValue: any
  field: string
  index: number
}

/**
 * 行编辑保存事件
 */
export interface RowEditSaveEvent<T = any> {
  originalEvent: Event
  data: T
  index: number
}

/**
 * 行编辑取消事件
 */
export interface RowEditCancelEvent<T = any> {
  originalEvent: Event
  data: T
  index: number
}

/**
 * 行点击事件
 */
export interface RowClickEvent<T = any> {
  originalEvent: Event
  data: T
  index: number
}

/**
 * 行双击事件
 */
export interface RowDblClickEvent<T = any> {
  originalEvent: Event
  data: T
  index: number
}

/**
 * 右键菜单事件
 */
export interface ContextMenuEvent<T = any> {
  originalEvent: Event
  data: T
  index: number
}

/**
 * 滚动触底事件
 */
export interface ScrollBottomEvent {
  /** 原始滚动事件 */
  originalEvent: Event
  /** 距离底部的距离（像素） */
  distanceToBottom: number
  /** 当前滚动条位置 */
  scrollTop: number
  /** 可滚动区域总高度 */
  scrollHeight: number
  /** 可视区域高度 */
  clientHeight: number
}

/**
 * TSX 渲染函数类型（用于 customFooter）
 */
export type TSXRenderFunction = (params?: any) => VNode | VNode[]

/**
 * 底部模式
 */
export type FooterMode = 'custom' | 'column-aligned'

/**
 * 容器尺寸模式
 */
export type ContainerSizeMode = 'fill' | 'auto' | 'fixed'

/**
 * 列宽模式
 */
export type ColumnWidthMode = 'auto' | 'fixed' | 'equal'

/**
 * 虚拟滚动配置选项
 * 兼容 PrimeVue VirtualScroller 的配置
 */
export interface VxeVirtualScrollerOptions {
  /** 每项的高度（像素），必需 */
  itemSize?: number
  /** 滚动方向：'vertical' | 'horizontal' | 'both' */
  orientation?: 'vertical' | 'horizontal' | 'both'
  /** 延迟时间（毫秒） */
  delay?: number
  /** 调整大小延迟（毫秒） */
  resizeDelay?: number
  /** 是否懒加载 */
  lazy?: boolean
  /** 是否显示加载器 */
  showLoader?: boolean
  /** 是否正在加载 */
  loading?: boolean
  /** 容差项目数 */
  numToleratedItems?: number
  /** 是否自动调整大小 */
  autoSize?: boolean
  /** 步进值 */
  step?: number
  /** 滚动到索引 */
  scrollToIndex?: number
  /** 是否禁用 */
  disabled?: boolean
  /** 其他扩展属性 */
  [key: string]: any
}

/**
 * 表格尺寸配置
 */
export interface TableSizeConfig {
  /** 宽度模式：'auto' 自适应 | 'fixed' 固定宽度 */
  widthMode?: 'auto' | 'fixed'
  /** 高度模式：'fill' 撑满父容器 | 'auto' 自适应 | 'fixed' 固定高度 */
  heightMode?: ContainerSizeMode
  /** 固定宽度（当 widthMode 为 'fixed' 时生效） */
  width?: string | number
  /** 固定高度（当 heightMode 为 'fixed' 时生效） */
  height?: string | number
  /** 列宽模式：'auto' 自适应内容 | 'fixed' 使用列配置的宽度 | 'equal' 等宽 */
  columnWidthMode?: ColumnWidthMode
  /** 最小表格宽度（当 widthMode 为 'auto' 时生效） */
  minWidth?: string | number
  /** 最小表格高度（当 heightMode 为 'auto' 时生效） */
  minHeight?: string | number
  /** 最大表格宽度（当 widthMode 为 'auto' 时生效） */
  maxWidth?: string | number
  /** 最大表格高度（当 widthMode 为 'auto' 时生效） */
  maxHeight?: string | number
}

/**
 * 列宽度信息
 */
export interface ColumnWidthInfo {
  /** 字段名 */
  field: string
  /** 列宽度（像素） */
  width: number
  /** 最小宽度 */
  minWidth?: number
  /** 最大宽度 */
  maxWidth?: number
}

/**
 * 分页状态
 */
export interface PaginationState {
  /** 当前页码 */
  page: number
  /** 每页显示数量 */
  rows: number
  /** 第一条记录的索引 */
  first: number
  /** 总记录数 */
  totalRecords?: number
}

/**
 * 排序状态
 */
export interface SortState {
  /** 排序字段 */
  sortField?: string
  /** 排序方向：1 升序，-1 降序，0 无排序 */
  sortOrder?: 1 | -1 | 0
  /** 多字段排序 */
  multiSortMeta?: SortMeta[]
}

/**
 * 筛选状态
 */
export interface FilterState {
  /** 字段筛选 */
  filters?: Record<string, any>
  /** 全局筛选值 */
  globalFilterValue?: string
}

/**
 * 列配置（扩展 PrimeVue Column）
 */
export interface VxeTableColumn<T = any> extends Omit<Partial<ColumnProps>, 'field' | 'header'> {
  /** 字段名 */
  field: FieldKey<T>
  /** 列标题 */
  header: string | (() => string)
  /** 列宽度 */
  width?: string | number
  /** 最小宽度 */
  minWidth?: string | number
  /** 最大宽度 */
  maxWidth?: string | number
  /** 是否可排序 */
  sortable?: boolean
  /** 是否可筛选 */
  filterable?: boolean
  /** 筛选类型 */
  filterType?: 'text' | 'numeric' | 'date' | 'boolean'
  /** 是否可调整大小 */
  resizable?: boolean
  /** 是否可重新排序 */
  reorderable?: boolean
  /** 是否可导出 */
  exportable?: boolean
  /** 对齐方式 */
  align?: 'left' | 'center' | 'right'
  /** 自定义渲染函数 */
  body?: (rowData: T, column: VxeTableColumn<T>) => VNode | string
  /** 自定义头部渲染 */
  headerRenderer?: () => VNode
  /** 自定义筛选器 */
  filterElement?: VNode | Component
  /**
   * 自定义底部渲染（仅底部模式为 column-aligned 时生效）
   * @param params - 渲染参数，包含该列对应的所有行数据
   * @returns TSX 渲染内容
   */
  customFooter?: (params: {
    /** 该列对应的所有行数据 */
    rows: Array<{ value: any; row: T; column: VxeTableColumn<T>; columnIndex: number }>
    /** 列配置 */
    column: VxeTableColumn<T>
    /** 列索引 */
    columnIndex: number
  }) => VNode | VNode[]
  /** 是否可编辑（配合 editable、editMode 使用） */
  editable?: boolean
  /** 单元格编辑器渲染（仅 editable 为 true 时生效） */
  editorRenderer?: (params: { data: T; value: any; field: string }) => VNode | string

  /**
   * 透传给底层 Column 组件的额外属性（官方未封装的原生 props）
   */
  componentsProps?: Record<string, any>

  /**
   * 允许额外扩展字段，支持未来 PrimeVue Column 新增的属性
   */
  [key: string]: any
}

/**
 * 分页配置
 */
export interface PaginatorConfig {
  /** 每页显示数量 */
  rows?: number
  /** 每页数量选项 */
  rowsPerPageOptions?: number[]
  /** 是否显示总记录数 */
  showTotalRecords?: boolean
  /** 是否显示当前页信息 */
  showCurrentPageReport?: boolean
  /** 当前页报告模板 */
  currentPageReportTemplate?: string
}

/**
 * 导出配置
 */
export interface ExportConfig {
  /** 导出格式 */
  formats?: ('csv' | 'xlsx' | 'json')[]
  /** 导出文件名 */
  filename?: string
  /** 是否包含表头 */
  includeHeader?: boolean
}

/**
 * VxeTable API 配置
 */
export interface VxeTableApiConfig<T = any> {
  /**
   * API 接口路径（如 '/list'）
   */
  api: string
  /**
   * 请求参数对象
   */
  params?: Record<string, any>
  /**
   * 请求方法类型，默认 'post'
   */
  type?: 'get' | 'post' | 'put' | 'patch' | 'delete' | 'head'
  /** 是否在组件挂载时自动请求，默认 true */
  immediate?: boolean
  /**
   * API 模式
   * - 'infinite': 无限滚动模式，自动监听 scroll-bottom 事件加载下一页并追加数据
   * - 'pagination': 分页模式，用户切换分页时调用接口更新数据
   */
  mode?: 'infinite' | 'pagination'
  /**
   * 无限滚动模式配置（仅 mode='infinite' 时生效）
   */
  infinite?: {
    /** 每页数量，默认 20 */
    pageSize?: number
    /** 页码参数名，默认 'page' */
    pageParam?: string
    /** 每页数量参数名，默认 'pageSize' */
    pageSizeParam?: string
    /** 是否还有下一页的判断字段名，默认 'hasNext'，如果返回结果中没有此字段，则根据 list.length < pageSize 判断 */
    hasNextField?: string
  }
  /**
   * 分页模式配置（仅 mode='pagination' 时生效）
   */
  pagination?: {
    /** 每页数量，默认 10 */
    pageSize?: number
    /** 页码参数名，默认 'page' */
    pageParam?: string
    /** 每页数量参数名，默认 'pageSize' */
    pageSizeParam?: string
  }
}

export interface VxeTableProps<T = any> extends Omit<Partial<DataTableProps>, 'selectionMode'> {
  // ========== 数据相关 ==========
  /**
   * 表格数据（当传入 api 时，data 可选；否则 data 必填）
   */
  data?: T[]
  /**
   * 表格数据 API 配置（与 data 同时存在时，api 优先）
   */
  api?: VxeTableApiConfig<T>
  /** 列配置 */
  columns: VxeTableColumn<T>[]
  /** 加载状态 */
  loading?: boolean
  /**
   * 表格唯一标识（用于持久化存储列顺序和列宽）
   * - 如果提供，将自动保存和恢复用户的列顺序和列宽偏好
   * - 建议使用有意义的唯一标识，如 'user-list-table'、'order-management-table' 等
   */
  tableId?: string

  // ========== HeaderSetting 头部设置 ==========
  /** 是否显示头部 */
  showHeader?: boolean
  /** 全局搜索 */
  globalFilter?: boolean
  /** 是否显示导出按钮 */
  exportable?: boolean
  /** 导出配置 */
  exportConfig?: ExportConfig

  // ========== FooterSetting 底部设置 ==========
  /** 是否显示底部 */
  showFooter?: boolean
  /** 底部模式：'custom' 完全自定义 | 'column-aligned' 列对齐模式 */
  footerMode?: FooterMode

  // ========== PaginationSetting 分页设置 ==========
  /** 是否显示分页 */
  pagination?: boolean
  /** 分页配置 */
  paginatorConfig?: PaginatorConfig
  /** 分页器位置：'left' | 'center' | 'right' */
  paginatorPosition?: 'left' | 'center' | 'right'

  // ========== SortSetting 排序设置 ==========
  /** 是否启用排序 */
  sortable?: boolean
  /** 默认排序 */
  defaultSort?: SortMeta[]

  // ========== FilterSetting 筛选设置 ==========
  /** 是否启用筛选 */
  filterable?: boolean

  // ========== SelectionSetting 选择设置 ==========
  /** 是否启用选择功能（默认 false） */
  selectable?: boolean
  /** 行选择模式：'single'(单选) | 'multiple'(多选)（默认 'multiple'） */
  selectionMode?: 'single' | 'multiple' | null | undefined
  /** 是否可以通过点击行选择（默认 true） */
  rowSelectable?: boolean
  /** 已选择的行 */
  selectedRows?: T[]
  /** 选择列是否冻结（默认 false） */
  selectionFrozen?: boolean
  /** 选择列冻结方向（默认 left） */
  selectionAlignFrozen?: 'left' | 'right'

  // ========== ScrollSetting 滚动设置 ==========
  /** 滚动配置 */
  scrollable?: boolean
  /** 是否启用编辑 */
  editable?: boolean
  /** 编辑模式：cell | row（当前仅推荐 cell） */
  editMode?: 'cell' | 'row'

  // ========== VirtualScroll 虚拟滚动配置 ==========
  /**
   * 虚拟滚动配置
   * - 开启条件：设置 scrollable=true 且 scrollHeight 为固定值
   * - 核心参数：itemSize (行高，必需)
   * - 示例：{ itemSize: 50 }
   * - 适用于大数据量场景，提升渲染性能
   */
  virtualScrollerOptions?: VxeVirtualScrollerOptions

  // ========== Column Capabilities 列功能配置 ==========
  /** 是否允许拖拽调整列顺序 */
  reorderableColumns?: boolean
  /** 是否允许调整列宽 */
  resizableColumns?: boolean
  /**
   * 列宽调整模式
   * - 'fit': 调整列宽时，表格总宽度不变，其他列会自动伸缩 (推荐)
   * - 'expand': 调整列宽时，表格总宽度会变化
   */
  columnResizeMode?: 'fit' | 'expand'

  // ========== SizeSetting 尺寸设置 ==========
  /** 表格尺寸配置 */
  sizeConfig?: TableSizeConfig

  // ========== UISetting UI 设置 ==========
  /** 表格大小 */
  size?: 'small' | 'normal' | 'large'
  /** 显示网格线 */
  showGridlines?: boolean
  /** 斑马纹 */
  stripedRows?: boolean
  /**
   * 是否开启行悬停高亮（默认 true）
   * - PrimeVue 默认不开启，除非启用了 selection
   * - 在封装层默认开启，提升交互体验
   */
  rowHover?: boolean
  /** 响应式布局 */
  responsiveLayout?: 'scroll' | 'stack'

  // ========== OtherSetting 其他设置 ==========
  /** 行类名函数 */
  rowClass?: (data: T) => string | string[]
  /** 行样式函数 */
  rowStyle?: (data: T) => CSSProperties
  /** 空数据提示 */
  emptyMessage?: string

  // ========== RowGrouping 行合并/分组配置 ==========

  /**
   * 行分组模式
   * - 'rowspan': 自动合并相同数据的行（行合并）
   * - 'subheader': 插入分组标题行
   */
  rowGroupMode?: 'rowspan' | 'subheader'

  /**
   * 用于分组的字段名
   * - 对应 data 中的 key
   * - 如果是数组，则支持多级分组
   */
  groupRowsBy?: string | string[]

  /**
   * 是否允许触发展开/收起分组（仅当 rowGroupMode='subheader' 时生效）
   */
  expandableRowGroups?: boolean

  /**
   * 已展开的分组（支持 v-model:expandedRowGroups）
   */
  expandedRowGroups?: any[]
}

/**
 * 组件内部使用的扩展 Props（用于 withDefaults）
 * - 为 VxeTable 组件整体增加一个通用的 componentsProps，用于透传 DataTable 的原生属性
 */
export type VxeTableExtendedProps<T = any> = VxeTableProps<T> & {
  /** 传递给底层 DataTable 组件的额外 props（透传官方未封装的属性） */
  componentsProps?: Record<string, any>
}

/**
 * 用户偏好设置结构
 */
export interface VxeTableUserPreferences {
  /** 列顺序（存放 field 字段名） */
  columnOrder?: string[]
  /** 列宽设置（field -> width） */
  columnWidths?: Record<string, number | string>
  /** 隐藏的列（field 数组） */
  hiddenColumns?: string[]
}

/**
 * VxeTable Emits
 */
export type VxeTableEmits<T = any> = {
  // 数据更新（使用函数签名格式避免 ESLint 错误）
  (e: 'update:selectedRows', rows: T[]): void

  // 分页
  (e: 'page-change', event: PageState): void

  // 排序
  (e: 'sort-change', event: SortEvent): void

  // 筛选
  (e: 'filter-change', event: FilterEvent): void

  // 选择
  (e: 'row-select', event: RowSelectEvent<T>): void
  (e: 'row-unselect', event: RowUnselectEvent<T>): void
  (e: 'select-all', event: SelectAllEvent<T>): void

  // 编辑
  (e: 'cell-edit-complete', event: CellEditCompleteEvent<T>): void
  (e: 'row-edit-save', event: RowEditSaveEvent<T>): void
  (e: 'row-edit-cancel', event: RowEditCancelEvent<T>): void

  // 其他
  (e: 'row-click', event: RowClickEvent<T>): void
  (e: 'row-dblclick', event: RowDblClickEvent<T>): void
  (e: 'context-menu', event: ContextMenuEvent<T>): void

  // 滚动触底（用于无限滚动加载场景）
  (e: 'scroll-bottom', event: ScrollBottomEvent): void

  // 分组展开状态更新
  (e: 'update:expandedRowGroups', groups: any[]): void
  // 分组展开/收起事件
  (e: 'rowgroup-expand', event: { originalEvent: Event; data: any }): void
  (e: 'rowgroup-collapse', event: { originalEvent: Event; data: any }): void

  // 列宽度变化
  (e: 'column-widths-change', widths: ColumnWidthInfo[]): void

  // 列顺序变更事件
  (e: 'column-reorder', event: { originalEvent: Event; dragIndex: number; dropIndex: number }): void

  // 列宽调整事件
  (e: 'column-resize-end', event: { element: HTMLElement; column: any; delta: number }): void
}

/**
 * VxeTable 组件暴露的 API
 */
export interface VxeTableExpose<T = any> {
  /** 表格数据 */
  data: T[]
  /** 选中的行 */
  selectedRows?: T[]
  /** 分页状态 */
  paginationState?: PaginationState
  /** 排序状态 */
  sortState?: SortState
  /** 筛选状态 */
  filterState?: FilterState
  /** 列宽度信息 */
  columnWidths: ColumnWidthInfo[]
  /** 刷新数据 */
  refresh: () => void
  /** 导出数据 */
  exportData: (format?: 'csv' | 'xlsx' | 'json') => void
  /** 清除筛选 */
  clearFilters: () => void
  /** 清除排序 */
  clearSort: () => void
  /** 设置排序 */
  setSort?: (field: string, order: 1 | -1 | 0) => void
  /** 设置筛选 */
  setFilter?: (field: string, value: any, matchMode?: string) => void
  /** 清除选择 */
  clearSelection: () => void
  /** 全选 */
  selectAll: () => void
  /** 选择单行 */
  selectRow: (row: T) => boolean
  /** 取消选择单行 */
  unselectRow: (row: T) => boolean
  /** 跳转到指定页面 */
  goToPage?: (page: number) => void
  /** 设置每页显示数量 */
  setPageSize?: (size: number) => void
  /** 设置全局搜索 */
  setGlobalFilter?: (value: string) => void
  /** 获取表格实例 */
  getTableInstance: () => any
  /** 获取列宽度 */
  getColumnWidths: () => ColumnWidthInfo[]
  /** 更新列宽度 */
  updateColumnWidths: () => void
}
