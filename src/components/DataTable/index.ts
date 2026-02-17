/**
 * DataTable 对外入口
 *
 * - 组件：DataTable, BodyCellRenderer, RenderFn
 * - 常量：分页/导出/尺寸/阈值（含 DEFAULT_*），可与 props 合并使用
 * - 工具：executeTableApi, parseWidth, getColumnHeader, exportToCSV/JSON/XLSX, getColumnWidthsFromTable
 * - 类型：DataTableColumn, DataTableProps, DataTableExpose, DataTableApiConfig, ...
 * - 高级：useTableData, useTableSelection, useTableExport, useTableLayout（用于自定义表格或 headless 用法）
 */
export { default as DataTable } from './DataTable.vue'
export { default as BodyCellRenderer } from './BodyCellRenderer'
export { default as RenderFn } from './RenderFn'

export {
  DEFAULT_COLUMN_MIN_WIDTH_PX,
  DEFAULT_COLUMN_WIDTH_PX,
  DEFAULT_EXPORT_CONFIG,
  DEFAULT_FOOTER_MODE,
  DEFAULT_INFINITE_PAGE_SIZE,
  DEFAULT_PAGINATOR_CONFIG,
  DEFAULT_TABLE_SIZE_CONFIG,
  INFINITE_SCROLL_THRESHOLD_PX,
  MIN_AUTO_HEIGHT_THRESHOLD_PX,
  ROOT_FONT_SIZE_BASE,
  TABLE_SELECTION_COLUMN_WIDTH_PX,
} from './utils/constants'

export { executeTableApi } from './utils/executeTableApi'
export type { DataTableApiResult } from './utils/executeTableApi'

export {
  parseWidth,
  getColumnHeader,
  exportToCSV,
  exportToJSON,
  exportToXLSX,
  getColumnWidthsFromTable,
} from './utils/helper'
export type { ExportResult } from './utils/helper'

export type {
  DataTableColumn,
  DataTableProps,
  DataTableExpose,
  DataTableApiConfig,
  DataTableUserPreferences,
  ColumnWidthInfo,
  ColumnFilterValues,
  ColumnFilterType,
  ColumnFilterOption,
  PaginationState,
  SortState,
  SortMeta,
  FilterState,
  PaginatorConfig,
  ExportConfig,
  TableSizeConfig,
} from './utils/types'

export {
  useTableData,
  useTableSelection,
  useTableExport,
  useTableLayout,
  type UseTableDataReturn,
  type UseTableDataOptions,
  type UseTableSelectionReturn,
  type UseTableSelectionOptions,
  type UseTableExportReturn,
  type UseTableExportOptions,
  type UseTableLayoutReturn,
  type UseTableLayoutOptions,
} from './composables'
