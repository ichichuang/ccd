// @/components/modules/grid-table/utils/types.ts
/**
 * GridTable 类型定义 —— 基于 AG Grid 社区版的二次封装
 *
 * 目标：提供动态配色和尺寸控制，支持全局和列级别的配置
 */

import type {
  ColDef,
  ColGroupDef,
  ColSpanParams,
  GridApi,
  GridOptions,
  RowSpanParams,
} from 'ag-grid-community'
import type { ComputedRef, Ref } from 'vue'

// ==================== 基础类型 ====================

/** 表格高度模式 */
export type HeightMode = 'auto' | 'fixed' | 'fill'

/** 表格宽度模式 */
export type WidthMode = 'fixed' | 'fill'

// ==================== 配色配置 ====================

/** 表格配色配置 */
export interface GridColorConfig {
  // 表格整体配色
  /** 表格背景色 */
  backgroundColor?: string
  /** 表格边框颜色 */
  borderColor?: string

  // 表头配色
  /** 表头背景色 */
  headerBackgroundColor?: string
  /** 表头文字颜色 */
  headerTextColor?: string
  /** 表头单元格悬停背景色 */
  headerCellHoverBackgroundColor?: string
  /** 表头单元格拖动中背景色 */
  headerCellMovingBackgroundColor?: string

  // 行配色
  // 注意：rowBackgroundColor 与 backgroundColor 冲突，已删除
  /** 行文字颜色 */
  rowTextColor?: string
  /** 行悬停背景色 */
  rowHoverBackgroundColor?: string
  /** 通用文字颜色 - 控制表格内所有文字颜色 */
  foregroundColor?: string

  // 选中行配色
  /** 选中行背景色 */
  selectedRowBackgroundColor?: string

  // 复选框配色（选中行复选框）
  /** 复选框选中背景色 */
  checkboxCheckedBackgroundColor?: string
  /** 复选框未选中背景色（有些主题在选中时仍读取该变量） */
  checkboxUncheckedBackgroundColor?: string
  /** 复选框未选中边框颜色（有些主题在选中时仍读取该变量） */
  checkboxUncheckedBorderColor?: string
  /** 复选框边框宽度（例如 '1px'） */
  checkboxBorderWidth?: string
  /** 单元格聚焦背景色（点击高亮） */
  cellFocusBackgroundColor?: string

  // 奇偶行配色
  /** 偶行背景色（奇行背景色由 backgroundColor 控制） */
  oddRowBackgroundColor?: string

  // 单元格配色
  // 注意：cellBackgroundColor、cellTextColor、cellBorderColor、cellHoverBackgroundColor、cellHoverForegroundColor 无效，已删除

  // 选中单元格配色
  // 注意：selectedCellBackgroundColor、selectedCellTextColor、selectedCellBorderColor 无效，已删除

  // 编辑状态配色
  /** 编辑单元格背景色 */
  editingCellBackgroundColor?: string
  /** 编辑单元格文字颜色 */
  editingCellTextColor?: string
  /** 编辑单元格边框颜色 */
  editingCellBorderColor?: string

  // 滚动条配色
  /** 滚动条颜色 */
  scrollbarColor?: string
  /** 滚动条悬停颜色 */
  scrollbarHoverColor?: string
  /** 滚动条轨道颜色 */
  scrollbarTrackColor?: string

  // 加载和空状态配色
  /** 加载遮罩背景色 */
  loadingOverlayBackgroundColor?: string
  /** 加载遮罩文字颜色 */
  loadingOverlayTextColor?: string
  /** 无数据遮罩背景色 */
  noRowsOverlayBackgroundColor?: string
  /** 无数据遮罩文字颜色 */
  noRowsOverlayTextColor?: string

  // 工具栏和状态栏配色
  /** 工具栏背景色 */
  toolbarBackgroundColor?: string
  /** 状态栏背景色 */
  statusBarBackgroundColor?: string
  /** 状态栏文字颜色 */
  statusBarTextColor?: string

  // 过滤菜单配色
  /** 过滤菜单背景色 */
  menuBackgroundColor?: string
  /** 过滤菜单文字颜色 */
  menuForegroundColor?: string
  /** 过滤菜单边框颜色 */
  menuBorderColor?: string
  /** 过滤菜单阴影 */
  menuBoxShadow?: string
  /** 过滤菜单输入框背景色 */
  menuInputBackgroundColor?: string
  /** 过滤菜单输入框边框颜色 */
  menuInputBorderColor?: string
  /** 过滤菜单输入框焦点边框颜色 */
  menuInputFocusBorderColor?: string
  /** 过滤菜单输入框文字颜色 */
  menuInputTextColor?: string
  /** 过滤菜单占位符颜色 */
  menuPlaceholderColor?: string

  // 圆角配置
  /** 表格整体圆角 */
  tableBorderRadius?: string
}

/** 列级别配色配置 */
export interface ColumnColorConfig {
  /** 列头背景色 */
  headerBackgroundColor?: string
  /** 列头文字颜色 */
  headerTextColor?: string
  /** 列背景色 */
  backgroundColor?: string
  /** 列文字颜色 */
  textColor?: string
  /** 列悬停背景色 */
  hoverBackgroundColor?: string
  /** 列悬停文字颜色 */
  hoverTextColor?: string
}

// ==================== 尺寸配置 ====================

/** 表格尺寸配置 */
export interface GridSizeConfig {
  /** 行高 */
  rowHeight?: number
  /** 表头行高 */
  headerHeight?: number
  /** 默认列宽，auto 表示按内容自适应 */
  defaultColumnWidth?: number | 'auto'
  /** 最小列宽 */
  minColumnWidth?: number
  /** 最大列宽 */
  maxColumnWidth?: number
  /** 表格最小高度 */
  minHeight?: number
  /** 表格最大高度 */
  maxHeight?: number
  /** 表格高度 */
  height?: number
  /** 高度模式：auto(内容撑开)、fixed(固定高度)、fill(撑满容器) */
  heightMode?: HeightMode
  /** 表格最小宽度 */
  minWidth?: number
  /** 表格最大宽度 */
  maxWidth?: number
  /** 表格宽度 */
  width?: number
  /** 宽度模式：fixed(固定宽度)、fill(撑满容器) */
  widthMode?: WidthMode
  /** 滚动条尺寸（px） */
  scrollbarSize?: number
  /** 全局单元格水平对齐方式 */
  globalCellTextAlign?: 'left' | 'center' | 'right'
  /** 全局单元格垂直对齐方式 */
  globalCellVerticalAlign?: 'top' | 'middle' | 'bottom'
  /** 全局表头水平对齐方式 */
  globalHeaderTextAlign?: 'left' | 'center' | 'right'
  /** 全局表头垂直对齐方式 */
  globalHeaderVerticalAlign?: 'top' | 'middle' | 'bottom'
}

/** 列级别尺寸配置 */
export interface ColumnSizeConfig {
  /** 列宽 */
  width?: number | 'auto'
  /** 最小列宽 */
  minWidth?: number
  /** 最大列宽 */
  maxWidth?: number
  /** 列是否可调整大小 */
  resizable?: boolean
  /** 列是否可排序 */
  sortable?: boolean
  /** 列是否可移动 */
  movable?: boolean
  /** 列是否可隐藏 */
  hide?: boolean
  /** 列是否固定 */
  pinned?: 'left' | 'right' | null
  /** 列头水平对齐方式 */
  headerTextAlign?: 'left' | 'center' | 'right'
  /** 列头垂直对齐方式 */
  headerVerticalAlign?: 'top' | 'middle' | 'bottom'
  /** 列单元格水平对齐方式 */
  cellTextAlign?: 'left' | 'center' | 'right'
  /** 列单元格垂直对齐方式 */
  cellVerticalAlign?: 'top' | 'middle' | 'bottom'
}

// ==================== 列定义扩展 ====================

/** 扩展的列定义 - 继承 AG Grid 的 ColDef，添加自定义 context 属性 */
export interface ExtendedColDef extends ColDef {
  // 注意：社区版支持 colSpan 和 rowSpan，但需要手动实现
  /** 列合并（横向跨越） */
  colSpan?: (params: ColSpanParams<any, any, any>) => number
  /** 行合并（纵向跨越） */
  rowSpan?: (params: RowSpanParams<any, any, any>) => number
  /** 自定义上下文数据，用于存储列级别的配置 */
  context?: {
    /** 列级别配色配置 */
    colorConfig?: ColumnColorConfig
    /** 列级别对齐配置 */
    headerTextAlign?: 'left' | 'center' | 'right'
    headerVerticalAlign?: 'top' | 'middle' | 'bottom'
    cellTextAlign?: 'left' | 'center' | 'right'
    cellVerticalAlign?: 'top' | 'middle' | 'bottom'
    /** 其他自定义数据 */
    [key: string]: any
  }
}

/** 扩展的列分组定义 - 继承 AG Grid 的 ColGroupDef，添加自定义 context 属性 */
export interface ExtendedColGroupDef extends Omit<ColGroupDef, 'children'> {
  /** 子列定义（用于列分组） */
  children: (ExtendedColDef | ExtendedColGroupDef)[]
  /** 自定义上下文数据，用于存储列级别的配置 */
  context?: {
    /** 列级别配色配置 */
    colorConfig?: ColumnColorConfig
    /** 列级别对齐配置 */
    headerTextAlign?: 'left' | 'center' | 'right'
    headerVerticalAlign?: 'top' | 'middle' | 'bottom'
    cellTextAlign?: 'left' | 'center' | 'right'
    cellVerticalAlign?: 'top' | 'middle' | 'bottom'
    /** 其他自定义数据 */
    [key: string]: any
  }
}

// ==================== 表格配置 ====================

/** GridTable 组件 Props */
export interface GridTableProps {
  /** 列定义 */
  columnDefs: (ExtendedColDef | ExtendedColGroupDef)[]
  /** 行数据 */
  rowData?: any[]
  /** 全局配色配置 */
  colorConfig?: GridColorConfig
  /** 全局尺寸配置 */
  sizeConfig?: GridSizeConfig
  /** 表格选项 */
  gridOptions?: GridOptions
  /** 是否显示行号 */
  showRowNumbers?: boolean
  /** 是否可选择行 */
  rowSelection?: 'single' | 'multiple' | null
  /** 是否允许点击行进行选中（需开启单/多选），默认 false：只能点复选框 */
  enableRowClickSelection?: boolean
  /** 是否可排序 - 通过 defaultColDef.sortable 控制 */
  enableSorting?: boolean
  /** 是否可过滤 - 通过 defaultColDef.filter 控制 */
  enableFilter?: boolean
  /** 是否可调整列宽 - 通过 defaultColDef.resizable 控制 */
  enableColumnResize?: boolean
  /** 是否显示工具栏 - 通过组件内部实现 */
  showToolbar?: boolean
  /** 是否显示状态栏 - 通过组件内部实现 */
  showStatusBar?: boolean
  /** 自定义 CSS 类名 */
  customClass?: string
  /** 自定义样式 */
  customStyle?: Record<string, string>
  /** 复选列位置：'left' 或 'right' (AG Grid v32+) */
  selectionCheckboxPosition?: 'left' | 'right'
  /** 是否开启鼠标悬停行高亮 */
  enableRowHoverHighlight?: boolean
  /** 是否开启鼠标悬停列高亮 */
  enableColumnHoverHighlight?: boolean
  /** 使所有列适配视口宽度（不出现横向滚动条） */
  fitColumnsToViewport?: boolean
  /** 是否开启点击格子边框高亮（默认 false） */
  enableCellFocusHighlight?: boolean
  /** 是否启用分页器（AG Grid 内置分页） */
  enablePagination?: boolean
  /** 分页器每页展示条数 */
  paginationPageSize?: number
  /** 分页器可选的每页条数 */
  paginationPageSizeOptions?: number[]
  /** 是否启用斑马线（偶数行背景与奇数行不同），默认 false */
  enableZebraStripe?: boolean
  /** 是否允许拖拽表头移动/隐藏列，默认 false */
  enableColumnDrag?: boolean
  /** 是否显示纵向分割线（列间边框），默认 false */
  enableVerticalSplitLine?: boolean
  /** 是否显示横向分割线（行间边框），默认 true */
  enableHorizontalSplitLine?: boolean
  /** 是否启用剪贴板功能（Ctrl+C/Cmd+C 复制单元格内容），默认 false */
  enableClipboard?: boolean
  /** 是否跟随系统尺寸模式变化（true：跟随系统尺寸，false：使用自定义尺寸），默认 true */
  followSystemSize?: boolean
  /** 触底阈值（px），滚动到距离底部小于等于该距离时触发触底事件 */
  bottomReachOffset?: number
  /** 自定义加载遮罩层模板 */
  overlayLoadingTemplate?: string
  /** 自定义无数据遮罩层模板 */
  overlayNoRowsTemplate?: string
  /** 无感知数据更新模式：'off' | 'transaction' | 'delta' */
  seamlessDataUpdateMode?: 'off' | 'transaction' | 'delta'
  // 注意：enableCellSpan 是 AG Grid 企业版功能，社区版不支持
  // enableCellSpan?: boolean
}

// ==================== 事件类型 ====================

/** GridTable 组件事件 */
export interface GridTableEmits {
  /** 行选择变化 */
  selectionChanged: [selectedRows: any[]]
  /** 列排序变化 */
  sortChanged: [sortModel: any[]]
  /** 列过滤变化 */
  filterChanged: [filterModel: any]
  /** 列大小变化 */
  columnResized: [event: any]
  /** 列移动变化 */
  columnMoved: [event: any]
  /** 列显示/隐藏变化 */
  columnVisible: [event: any]
  /** 行数据变化 */
  rowDataChanged: [rowData: any[]]
  /** 单元格值变化 */
  cellValueChanged: [event: any]
  /** 单元格点击 */
  cellClicked: [event: any]
  /** 单元格双击 */
  cellDoubleClicked: [event: any]
  /** 单元格右键（上下文菜单） */
  cellContextMenu: [event: any]
  /** 单元格编辑开始 */
  cellEditingStarted: [event: any]
  /** 单元格编辑停止 */
  cellEditingStopped: [event: any]
  /** 网格准备就绪 */
  gridReady: [params: { api: GridApi }]
  /** 网格大小变化 */
  gridSizeChanged: [event: any]
  /** 下拉触底（距离底部小于等于阈值时触发） */
  reachBottom: [payload: { scrollTop: number; clientHeight: number; scrollHeight: number }]
}

// ==================== 工具类型 ====================

/** 深度部分可选 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

/** 排除指定键 */
export type ExcludeKeys<T, K extends keyof T> = Omit<T, K>

/** 只包含指定键 */
export type PickKeys<T, K extends keyof T> = Pick<T, K>

// ==================== 组合式函数返回类型 ====================

/** useRevoGrid 返回类型 */
export interface UseRevoGridReturn {
  /** 网格 API */
  gridApi: Ref<GridApi | null>
  /** 网格选项 */
  gridOptions: ComputedRef<GridOptions>
  /** 合并后的网格选项（包含 ActionCell 等组件） */
  mergedGridOptions: ComputedRef<GridOptions>
  /** 列定义 */
  columnDefs: ComputedRef<ExtendedColDef[]>
  /** 行数据 */
  rowData: Ref<any[]>
  /** 选中的行 */
  selectedRows: Ref<any[]>
  /** 表格容器引用 */
  gridContainer: Ref<any>
  /** 布局是否就绪（用于防止初始渲染闪烁） */
  layoutReady: Ref<boolean>
  /** 表格样式 */
  gridStyle: ComputedRef<Record<string, string>>
  /** 表格类名 */
  gridClass: ComputedRef<string>
  /** 滚动条样式 */
  scrollbarStyles: ComputedRef<string>
  /** 工具栏样式 */
  toolbarStyle: ComputedRef<Record<string, string>>
  /** 状态栏样式 */
  statusBarStyle: ComputedRef<Record<string, string>>
  /** 重新计算列宽 */
  autoSizeColumns: () => void
  /** 导出数据 */
  exportData: (format: 'csv' | 'excel') => void
  /** 获取过滤后的数据 */
  getFilteredData: () => any[]
  /** 设置行数据 */
  setRowData: (data: any[]) => void
  /** 添加行 - 使用 push 保持滚动位置 */
  addRow: (row: any) => void
  /** 批量添加行 - 使用 push 保持滚动位置 */
  addRows: (rows: any[]) => void
  /** 无抖动数据加载方法 - 推荐使用此方法进行增量数据加载 */
  loadMoreData: (
    newRows: any[],
    options?: {
      preserveScrollPosition?: boolean
      scrollToBottom?: boolean
    }
  ) => Promise<void>
  /** 更新行 */
  updateRow: (row: any) => void
  /** 删除行 */
  deleteRow: (row: any) => void
  /** 清空选择 */
  clearSelection: () => void
  /** 选择所有行 */
  selectAll: () => void
  /** 反选 */
  deselectAll: () => void
  /** 清除单元格聚焦 */
  clearCellFocus: () => void
  /** 复制选中单元格内容到剪贴板 */
  copySelectedCellsToClipboard: () => void
  /** 显示加载遮罩层 */
  showLoadingOverlay: () => void
  /** 隐藏遮罩层 */
  hideOverlay: () => void
  /** 显示无数据遮罩层 */
  showNoRowsOverlay: () => void
  /** 设置加载状态（统一控制方法） */
  setLoading: (loading: boolean) => void
}
