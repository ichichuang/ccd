// @/components/modules/grid-table/utils/constants.ts
/**
 * GridTable 默认配置常量
 *
 * 提供基于项目配色方案的默认配置
 */

import type { GridColorConfig, GridSizeConfig } from './types'
// ==================== 默认配色配置 ====================

/**
 * 默认表格配色配置 - 基于项目配色方案，只包含真正有效的配置项
 *
 * 重要说明：
 * 1. 奇行颜色由 backgroundColor 控制，偶行颜色由 oddRowBackgroundColor 控制
 * 2. 已删除所有无效的配置项，只保留经过测试验证有效的配置
 * 3. 使用框架的 CSS 变量确保主题一致性
 */
export const DEFAULT_GRID_COLOR_CONFIG: GridColorConfig = {
  // ==================== 表格整体配色 ====================
  /** 表格背景色 - 控制奇行背景色，对应 AG Grid 的 --ag-background-color */
  backgroundColor: 'var(--bg100)',
  /** 表格边框颜色 - 控制表格整体边框，对应 AG Grid 的 --ag-border-color */
  borderColor: 'var(--bg300)',

  // ==================== 表头配色 ====================
  /** 表头背景色 - 控制表头背景，对应 AG Grid 的 --ag-header-background-color */
  headerBackgroundColor: 'var(--bg200)',
  /** 表头文字颜色 - 控制表头文字，对应 AG Grid 的 --ag-header-text-color */
  headerTextColor: 'var(--text200)',
  /** 表头单元格悬停背景色 */
  headerCellHoverBackgroundColor: 'color-mix(in srgb, var(--bg100) 25%, transparent)',
  /** 表头单元格拖动中背景色 */
  headerCellMovingBackgroundColor: 'color-mix(in srgb, var(--bg100) 30%, transparent)',

  // ==================== 行配色 ====================
  /** 行文字颜色 - 控制表格行内文字颜色，对应 AG Grid 的 --ag-cell-text-color */
  rowTextColor: 'var(--text100)',
  /** 行悬停背景色 - 控制鼠标悬停时的行背景色，对应 AG Grid 的 --ag-row-hover-color */
  rowHoverBackgroundColor: 'var(--bg200)',
  /** 通用文字颜色 - 控制表格内所有文字颜色，对应 AG Grid 的 --ag-foreground-color */
  foregroundColor: 'var(--text100)',

  // ==================== 奇偶行配色 ====================
  /** 偶行背景色 - 控制偶数行背景色，奇行由 backgroundColor 控制，对应 AG Grid 的 --ag-odd-row-background-color */
  oddRowBackgroundColor: 'var(--bg200)',

  // ==================== 选中行配色 ====================
  /** 选中行背景色（半透明） - 对应 --ag-selected-row-background-color */
  selectedRowBackgroundColor: 'color-mix(in srgb, var(--accent100) 20%, transparent)',

  // ==================== 聚焦与复选框配色 ====================
  /** 复选框选中背景色 */
  checkboxCheckedBackgroundColor: 'var(--accent100)',
  /** 复选框未选中背景色（用于覆盖 wrapper 默认变量） */
  checkboxUncheckedBackgroundColor: 'var(--bg100)',
  /** 复选框未选中边框颜色（用于覆盖 wrapper 默认变量） */
  checkboxUncheckedBorderColor: 'var(--bg300)',
  /** 复选框边框宽度 */
  checkboxBorderWidth: '2px',
  /** 单元格聚焦背景色（点击高亮） */
  cellFocusBackgroundColor: 'color-mix(in srgb, var(--accent100) 20%, transparent)',

  // ==================== 编辑状态配色 ====================
  /** 编辑单元格背景色 - 控制编辑状态下的单元格背景，对应 AG Grid 的 --ag-editing-cell-background-color */
  editingCellBackgroundColor: 'var(--bg200)',
  /** 编辑单元格文字颜色 - 控制编辑状态下的单元格文字，对应 AG Grid 的 --ag-editing-cell-foreground-color */
  editingCellTextColor: 'var(--text100)',
  /** 编辑单元格边框颜色 - 控制编辑状态下的单元格边框，对应 AG Grid 的 --ag-editing-cell-border-color */
  editingCellBorderColor: 'var(--primary-color)',

  // ==================== 滚动条配色 ====================
  /** 滚动条颜色 - 控制滚动条滑块颜色，通过 CSS 伪元素 ::-webkit-scrollbar-thumb 实现 */
  scrollbarColor: 'var(--bg300)',
  /** 滚动条悬停颜色 - 控制滚动条悬停时的颜色，通过 CSS 伪元素 ::-webkit-scrollbar-thumb:hover 实现 */
  scrollbarHoverColor: 'var(--primary100)',
  /** 滚动条轨道颜色 - 控制滚动条轨道背景色，通过 CSS 伪元素 ::-webkit-scrollbar-track 实现 */
  scrollbarTrackColor: 'var(--bg100)',

  // ==================== 加载和空状态配色 ====================
  /** 加载遮罩背景色 - 控制数据加载时的遮罩背景，对应 AG Grid 的 --ag-loading-overlay-background-color */
  loadingOverlayBackgroundColor: 'rgba(255, 255, 255, 0.8)',
  /** 加载遮罩文字颜色 - 控制数据加载时的遮罩文字，对应 AG Grid 的 --ag-loading-overlay-foreground-color */
  loadingOverlayTextColor: 'var(--text100)',
  /** 无数据遮罩背景色 - 控制无数据时的遮罩背景，对应 AG Grid 的 --ag-no-rows-overlay-background-color */
  noRowsOverlayBackgroundColor: 'var(--bg100)',
  /** 无数据遮罩文字颜色 - 控制无数据时的遮罩文字，对应 AG Grid 的 --ag-no-rows-overlay-foreground-color */
  noRowsOverlayTextColor: 'var(--text100)',

  // ==================== 工具栏和状态栏配色 ====================
  /** 工具栏背景色 - 控制工具栏背景，对应 AG Grid 的 --ag-toolbar-background-color */
  toolbarBackgroundColor: 'var(--bg200)',
  /** 状态栏背景色 - 控制状态栏背景，对应 AG Grid 的 --ag-status-bar-background-color */
  statusBarBackgroundColor: 'var(--bg200)',
  /** 状态栏文字颜色 - 控制状态栏文字，对应 AG Grid 的 --ag-status-bar-foreground-color */
  statusBarTextColor: 'var(--text100)',

  // ==================== 过滤菜单配色 ====================
  /** 过滤菜单背景色 - 控制过滤菜单背景，对应 AG Grid 的 --ag-menu-background-color */
  menuBackgroundColor: 'var(--bg100)',
  /** 过滤菜单文字颜色 - 控制过滤菜单文字，对应 AG Grid 的 --ag-menu-foreground-color */
  menuForegroundColor: 'var(--text100)',
  /** 过滤菜单边框颜色 - 控制过滤菜单边框，对应 AG Grid 的 --ag-menu-border-color */
  menuBorderColor: 'var(--bg300)',
  /** 过滤菜单阴影 - 控制过滤菜单阴影效果 */
  menuBoxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  /** 过滤菜单输入框背景色 */
  menuInputBackgroundColor: 'var(--bg200)',
  /** 过滤菜单输入框边框颜色 */
  menuInputBorderColor: 'var(--bg300)',
  /** 过滤菜单输入框焦点边框颜色 */
  menuInputFocusBorderColor: 'var(--primary100)',
  /** 过滤菜单输入框文字颜色 */
  menuInputTextColor: 'var(--text100)',
  /** 过滤菜单占位符颜色 */
  menuPlaceholderColor: 'var(--text200)',

  // ==================== 圆角配置 ====================
  /** 表格整体圆角 - 控制表格容器的圆角 */
  tableBorderRadius: 'var(--rounded)',
}

// ==================== 默认尺寸配置 ====================

/** 紧凑模式表格尺寸配置 - 适用于数据密集的表格 */
export const COMPACT_GRID_SIZE_CONFIG: GridSizeConfig = {
  /** 行高 - 控制表格行的高度，对应 AG Grid 的 --ag-row-height */
  rowHeight: 32,
  /** 表头高度 - 控制表头行的高度，对应 AG Grid 的 --ag-header-height */
  headerHeight: 36,

  /** 默认列宽 - 控制列的默认宽度 */
  defaultColumnWidth: 'auto',
  /** 最小列宽 - 控制列的最小宽度 */
  minColumnWidth: 40,
  /** 最大列宽 - 控制列的最大宽度 */
  maxColumnWidth: 300,

  /** 表格最小高度 - 控制表格的最小高度 */
  minHeight: 200,
  /** 表格最大高度 - 控制表格的最大高度 */
  maxHeight: 0,
  /** 表格高度 - 控制表格的默认高度 */
  height: 0,
  /** 高度模式：auto | fixed | fill */
  heightMode: 'fill',
  /** 表格最小宽度 - 控制表格的最小宽度 */
  minWidth: 0,
  /** 表格最大宽度 - 控制表格的最大宽度 */
  maxWidth: 0,
  /** 表格宽度 - 控制表格的默认宽度 */
  width: 0,
  /** 宽度模式：fixed | fill */
  widthMode: 'fill',
  /** 滚动条尺寸（与生成样式联动） */
  scrollbarSize: 6,
  /** 全局单元格水平对齐方式 */
  globalCellTextAlign: 'center',
  /** 全局单元格垂直对齐方式 */
  globalCellVerticalAlign: 'middle',
  /** 全局表头水平对齐方式 */
  globalHeaderTextAlign: 'center',
  /** 全局表头垂直对齐方式 */
  globalHeaderVerticalAlign: 'middle',
}

/** 舒适模式表格尺寸配置 - 默认推荐配置 */
export const COMFORTABLE_GRID_SIZE_CONFIG: GridSizeConfig = {
  /** 行高 - 控制表格行的高度，对应 AG Grid 的 --ag-row-height */
  rowHeight: 38,
  /** 表头高度 - 控制表头行的高度，对应 AG Grid 的 --ag-header-height */
  headerHeight: 42,

  /** 默认列宽 - 控制列的默认宽度 */
  defaultColumnWidth: 'auto',
  /** 最小列宽 - 控制列的最小宽度 */
  minColumnWidth: 40,
  /** 最大列宽 - 控制列的最大宽度 */
  maxColumnWidth: 400,

  /** 表格最小高度 - 控制表格的最小高度 */
  minHeight: 200,
  /** 表格最大高度 - 控制表格的最大高度 */
  maxHeight: 0,
  /** 表格高度 - 控制表格的默认高度 */
  height: 0,
  /** 高度模式：auto | fixed | fill */
  heightMode: 'fill',
  /** 表格最小宽度 - 控制表格的最小宽度 */
  minWidth: 0,
  /** 表格最大宽度 - 控制表格的最大宽度 */
  maxWidth: 0,
  /** 表格宽度 - 控制表格的默认宽度 */
  width: 0,
  /** 宽度模式：fixed | fill */
  widthMode: 'fill',
  /** 滚动条尺寸（与生成样式联动） */
  scrollbarSize: 8,
  /** 全局单元格水平对齐方式 */
  globalCellTextAlign: 'center',
  /** 全局单元格垂直对齐方式 */
  globalCellVerticalAlign: 'middle',
  /** 全局表头水平对齐方式 */
  globalHeaderTextAlign: 'center',
  /** 全局表头垂直对齐方式 */
  globalHeaderVerticalAlign: 'middle',
}

/** 宽松模式表格尺寸配置 - 适用于大屏显示 */
export const LOOSE_GRID_SIZE_CONFIG: GridSizeConfig = {
  /** 行高 - 控制表格行的高度，对应 AG Grid 的 --ag-row-height */
  rowHeight: 48,
  /** 表头高度 - 控制表头行的高度，对应 AG Grid 的 --ag-header-height */
  headerHeight: 52,

  /** 默认列宽 - 控制列的默认宽度 */
  defaultColumnWidth: 'auto',
  /** 最小列宽 - 控制列的最小宽度 */
  minColumnWidth: 40,
  /** 最大列宽 - 控制列的最大宽度 */
  maxColumnWidth: 500,

  /** 表格最小高度 - 控制表格的最小高度 */
  minHeight: 200,
  /** 表格最大高度 - 控制表格的最大高度 */
  maxHeight: 0,
  /** 表格高度 - 控制表格的默认高度 */
  height: 0,
  /** 高度模式：auto | fixed | fill */
  heightMode: 'fill',
  /** 表格最小宽度 - 控制表格的最小宽度 */
  minWidth: 0,
  /** 表格最大宽度 - 控制表格的最大宽度 */
  maxWidth: 0,
  /** 表格宽度 - 控制表格的默认宽度 */
  width: 0,
  /** 宽度模式：fixed | fill */
  widthMode: 'fill',
  /** 滚动条尺寸（与生成样式联动） */
  scrollbarSize: 12,
  /** 全局单元格水平对齐方式 */
  globalCellTextAlign: 'center',
  /** 全局单元格垂直对齐方式 */
  globalCellVerticalAlign: 'middle',
  /** 全局表头水平对齐方式 */
  globalHeaderTextAlign: 'center',
  /** 全局表头垂直对齐方式 */
  globalHeaderVerticalAlign: 'middle',
}

/** 默认表格尺寸配置 - 使用舒适模式作为默认 */
export const DEFAULT_GRID_SIZE_CONFIG: GridSizeConfig = COMFORTABLE_GRID_SIZE_CONFIG

// ==================== 尺寸模式映射 ====================

/** 尺寸模式类型 */
export type SizeMode = 'compact' | 'comfortable' | 'loose'

/** 尺寸模式到表格配置的映射 */
export const SIZE_MODE_TO_GRID_CONFIG: Record<SizeMode, GridSizeConfig> = {
  compact: COMPACT_GRID_SIZE_CONFIG,
  comfortable: COMFORTABLE_GRID_SIZE_CONFIG,
  loose: LOOSE_GRID_SIZE_CONFIG,
}

/**
 * 根据尺寸模式获取对应的表格尺寸配置
 * @param sizeMode 尺寸模式：'compact' | 'comfortable' | 'loose'
 * @returns 对应的表格尺寸配置
 */
export function getGridSizeConfigByMode(sizeMode: SizeMode): GridSizeConfig {
  return SIZE_MODE_TO_GRID_CONFIG[sizeMode] || DEFAULT_GRID_SIZE_CONFIG
}

// ==================== CSS 变量映射 ====================

/** AG Grid CSS 变量映射 - 将配置项映射到 AG Grid 的 CSS 变量 */
export const AG_GRID_CSS_VARS = {
  // ==================== 表格整体配色 ====================
  /** 表格背景色 - 控制奇行背景色 */
  '--ag-background-color': 'backgroundColor',
  /** 表格边框颜色 - 控制表格整体边框 */
  '--ag-border-color': 'borderColor',

  // ==================== 表头配色 ====================
  /** 表头背景色 - 控制表头背景 */
  '--ag-header-background-color': 'headerBackgroundColor',
  /** 表头文字颜色 - 控制表头文字 */
  '--ag-header-text-color': 'headerTextColor',
  /** 表头悬停背景色 */
  '--ag-header-cell-hover-background-color': 'headerCellHoverBackgroundColor',
  /** 表头拖动中背景色 */
  '--ag-header-cell-moving-background-color': 'headerCellMovingBackgroundColor',

  // ==================== 行配色 ====================
  /** 行文字颜色 - 控制表格行内文字颜色 */
  '--ag-cell-text-color': 'rowTextColor',
  /** 行悬停背景色 - 控制鼠标悬停时的行背景色 */
  '--ag-row-hover-color': 'rowHoverBackgroundColor',
  /** 通用文字颜色 - 控制表格内所有文字颜色 */
  '--ag-foreground-color': 'foregroundColor',

  // ==================== 奇偶行配色 ====================
  /** 偶行背景色 - 控制偶数行背景色，奇行由 --ag-background-color 控制 */
  '--ag-odd-row-background-color': 'oddRowBackgroundColor',

  // ==================== 选中行配色 ====================
  /** 选中行背景色 */
  '--ag-selected-row-background-color': 'selectedRowBackgroundColor',

  // ==================== 聚焦与复选框配色 ====================
  /** 复选框选中背景色 */
  '--ag-checkbox-checked-background-color': 'checkboxCheckedBackgroundColor',
  /** 单元格聚焦背景色（用于点击高亮的背景色变量） */
  '--ag-cell-focus-background-color': 'cellFocusBackgroundColor',
  /** 复选框未选中背景色（许多主题的 wrapper 使用该变量） */
  '--ag-checkbox-unchecked-background-color': 'checkboxUncheckedBackgroundColor',
  /** 复选框未选中边框颜色 */
  '--ag-checkbox-unchecked-border-color': 'checkboxUncheckedBorderColor',
  /** 复选框边框宽度 */
  '--ag-checkbox-border-width': 'checkboxBorderWidth',
  /** 兼容继承变量（某些版本从 inherited 变量读取） */
  '--ag-inherited-checkbox-checked-background-color': 'checkboxCheckedBackgroundColor',
  '--ag-inherited-checkbox-unchecked-background-color': 'checkboxUncheckedBackgroundColor',
  '--ag-inherited-checkbox-unchecked-border-color': 'checkboxUncheckedBorderColor',

  // ==================== 编辑状态配色 ====================
  /** 编辑单元格背景色 - 控制编辑状态下的单元格背景 */
  '--ag-editing-cell-background-color': 'editingCellBackgroundColor',
  /** 编辑单元格文字颜色 - 控制编辑状态下的单元格文字 */
  '--ag-editing-cell-foreground-color': 'editingCellTextColor',
  /** 编辑单元格边框颜色 - 控制编辑状态下的单元格边框 */
  '--ag-editing-cell-border-color': 'editingCellBorderColor',

  // ==================== 加载和空状态配色 ====================
  /** 加载遮罩背景色 - 控制数据加载时的遮罩背景 */
  '--ag-loading-overlay-background-color': 'loadingOverlayBackgroundColor',
  /** 加载遮罩文字颜色 - 控制数据加载时的遮罩文字 */
  '--ag-loading-overlay-foreground-color': 'loadingOverlayTextColor',
  /** 无数据遮罩背景色 - 控制无数据时的遮罩背景 */
  '--ag-no-rows-overlay-background-color': 'noRowsOverlayBackgroundColor',
  /** 无数据遮罩文字颜色 - 控制无数据时的遮罩文字 */
  '--ag-no-rows-overlay-foreground-color': 'noRowsOverlayTextColor',
  /** 无数据遮罩文字颜色（备用变量名） */
  '--ag-no-rows-overlay-text-color': 'noRowsOverlayTextColor',

  // ==================== 工具栏和状态栏配色 ====================
  /** 工具栏背景色 - 控制工具栏背景 */
  '--ag-toolbar-background-color': 'toolbarBackgroundColor',
  /** 状态栏背景色 - 控制状态栏背景 */
  '--ag-status-bar-background-color': 'statusBarBackgroundColor',
  /** 状态栏文字颜色 - 控制状态栏文字 */
  '--ag-status-bar-foreground-color': 'statusBarTextColor',

  // ==================== 过滤菜单配色 ====================
  /** 过滤菜单背景色 - 控制过滤菜单背景 */
  '--ag-menu-background-color': 'menuBackgroundColor',
  /** 过滤菜单文字颜色 - 控制过滤菜单文字 */
  '--ag-menu-foreground-color': 'menuForegroundColor',
  /** 过滤菜单边框颜色 - 控制过滤菜单边框 */
  '--ag-menu-border-color': 'menuBorderColor',
  /** 过滤菜单输入框背景色 */
  '--ag-input-background-color': 'menuInputBackgroundColor',
  /** 过滤菜单输入框边框颜色 */
  '--ag-input-border-color': 'menuInputBorderColor',
  /** 过滤菜单输入框焦点边框颜色 */
  '--ag-input-focus-border-color': 'menuInputFocusBorderColor',
  /** 过滤菜单输入框文字颜色 */
  '--ag-input-foreground-color': 'menuInputTextColor',

  // ==================== 圆角配置 ====================
  /** 表格整体圆角 */
  '--ag-border-radius': 'tableBorderRadius',
} as const

// ==================== 默认 Props 工厂 ====================

/**
 * 提供 GridTable 组件的默认 props 设置，便于与 types 强绑定
 * 与 UseEcharts 的 createDefaultUseEchartsProps 一致的用法
 */
export const createDefaultGridTableProps = () => ({
  // 数据
  rowData: () => [],

  // 功能开关
  /** 是否显示行号 */
  showRowNumbers: false,
  /** 是否可选择行 */
  rowSelection: null as 'single' | 'multiple' | null,
  /** 是否允许点击行选中（需开启单/多选），默认 false */
  enableRowClickSelection: false,
  /** 是否可排序 */
  enableSorting: false,
  /** 是否可过滤 */
  enableFilter: false,
  /** 是否可调整列宽 */
  enableColumnResize: false,
  /** 是否显示工具栏 */
  showToolbar: false,
  /** 是否显示状态栏 */
  showStatusBar: false,
  /** 复选列位置 */
  selectionCheckboxPosition: 'left' as 'left' | 'right',
  /** 是否开启鼠标悬停行高亮 */
  enableRowHoverHighlight: true,
  /** 是否开启鼠标悬停列高亮 */
  enableColumnHoverHighlight: false,
  /** 使所有列适配视口宽度（不出现横向滚动条） */
  fitColumnsToViewport: true,
  /** 是否开启点击格子边框高亮（默认 false） */
  enableCellFocusHighlight: false,
  /** 是否允许拖拽表头移动/隐藏列，默认 false */
  enableColumnDrag: false,
  /** 是否启用斑马线（偶数行背景与奇数行不同），默认 false */
  enableZebraStripe: false,
  /** 是否显示纵向分割线（列间边框），默认 false */
  enableVerticalSplitLine: true,
  /** 是否显示横向分割线（行间边框），默认 false */
  enableHorizontalSplitLine: true,
  /** 是否启用剪贴板功能（Ctrl+C/Cmd+C 复制单元格内容），默认 false */
  enableClipboard: false,
  /** 是否跟随系统尺寸模式变化（true：跟随系统尺寸，false：使用自定义尺寸），默认 true */
  followSystemSize: true,
  /** 是否启用分页器（AG Grid 内置分页），默认 false */
  enablePagination: false,
  /** 分页器每页展示条数（默认 20） */
  paginationPageSize: 20,
  /** 分页器每页可选展示条数（默认 10/20/50/80） */
  paginationPageSizeOptions: (_props: any) => [10, 20, 50, 80],
  /** 是否启用单元格跨越功能（合并单元格行），默认 false */
  // enableCellSpan: false, // 企业版功能，社区版不支持

  // 配色与尺寸（来自默认配置）
  colorConfig: () => ({ ...DEFAULT_GRID_COLOR_CONFIG }),
  sizeConfig: () => ({ ...DEFAULT_GRID_SIZE_CONFIG }),

  // 自定义样式
  customClass: '',
  customStyle: () => ({}),
  /** 触底阈值（px），滚动到距离底部小于等于该距离时触发触底事件 */
  bottomReachOffset: 50,
  // overlay 模板默认由 i18n 在运行时注入，保留自定义入口以便业务侧覆盖
  overlayLoadingTemplate: undefined as unknown as string,
  overlayNoRowsTemplate: undefined as unknown as string,
  /** 无感知数据更新模式 */
  seamlessDataUpdateMode: 'transaction' as 'off' | 'transaction' | 'delta',
})
