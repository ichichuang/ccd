/**
 * DataTable 默认配置与阈值常量
 *
 * 本文件集中存放组件内部使用的默认配置及数值阈值，与 utils/types 中的类型对应。
 * 业务可通过 props（如 paginatorConfig、exportConfig、sizeConfig）覆盖对应默认值。
 */

import type { ExportConfig, FooterMode, PaginatorConfig, TableSizeConfig } from './types'

// === 分页默认配置 ===

/** 分页器默认配置；currentPageReportTemplate 占位符便于 i18n 运行时替换 */
export const DEFAULT_PAGINATOR_CONFIG: PaginatorConfig = {
  rows: 10,
  rowsPerPageOptions: [10, 20, 50, 100],
  showTotalRecords: true,
  showCurrentPageReport: false,
  currentPageReportTemplate: '{first} - {last} / {totalRecords}',
}

// === 导出与 Footer 默认配置 ===

/** 导出默认配置：支持格式、默认文件名、是否含表头 */
export const DEFAULT_EXPORT_CONFIG: ExportConfig = {
  formats: ['csv', 'xlsx', 'json'],
  filename: 'table-export',
  includeHeader: true,
}

/** Footer 默认模式：custom | column-aligned */
export const DEFAULT_FOOTER_MODE: FooterMode = 'custom'

// === 尺寸/布局默认配置 ===

/** 表格尺寸默认：宽度/高度/列宽模式 */
export const DEFAULT_TABLE_SIZE_CONFIG: TableSizeConfig = {
  widthMode: 'auto',
  heightMode: 'fill',
  columnWidthMode: 'auto',
}

// === 数值阈值（px / 基准） ===

/** 选择列默认宽度（px），与 PrimeVue Checkbox/RadioButton 列适配；对应 spacing-2xl (12*4) */
export const TABLE_SELECTION_COLUMN_WIDTH_PX = 48

/** 列默认最小宽度（px），DOM 测量失败时的回退值 */
export const DEFAULT_COLUMN_MIN_WIDTH_PX = 60

/** 列默认宽度（px），DOM 测量失败且未配置 width 时的回退值 */
export const DEFAULT_COLUMN_WIDTH_PX = 100

/** fill 模式下，容器高度低于此值（px）不应用 calculatedHeight */
export const MIN_AUTO_HEIGHT_THRESHOLD_PX = 10

/** rem/em 换算为 px 的基准（根字体大小），与 sizeScale 设计一致 */
export const ROOT_FONT_SIZE_BASE = 16

/** Infinite 模式默认每页条数 */
export const DEFAULT_INFINITE_PAGE_SIZE = 20

/** 距离底部多少 px 时触发 infinite 加载更多 */
export const INFINITE_SCROLL_THRESHOLD_PX = 50
