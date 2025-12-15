/**
 * VxeTable 默认配置常量
 */

import type {
  ExportConfig,
  FooterMode,
  PaginatorConfig,
  TableSizeConfig,
  VxeTableProps,
} from './types'

/**
 * 默认分页配置
 */
export const DEFAULT_PAGINATOR_CONFIG: PaginatorConfig = {
  rows: 10,
  rowsPerPageOptions: [10, 20, 50, 100],
  showTotalRecords: true,
  showCurrentPageReport: false,
  currentPageReportTemplate: '显示第 {first} 到 {last} 条，共 {totalRecords} 条记录',
}

/**
 * 默认导出配置
 */
export const DEFAULT_EXPORT_CONFIG: ExportConfig = {
  formats: ['csv', 'xlsx', 'json'],
  filename: 'table-export',
  includeHeader: true,
}

/**
 * 默认底部模式
 */
export const DEFAULT_FOOTER_MODE: FooterMode = 'custom'

/**
 * 默认表格尺寸配置
 */
export const DEFAULT_TABLE_SIZE_CONFIG: TableSizeConfig = {
  widthMode: 'auto', // 默认宽度自适应
  heightMode: 'fill', // 默认高度撑满
  columnWidthMode: 'auto', // 默认列宽自适应
}

/**
 * 默认 Props 工厂函数
 */
export const vxeTableDefaultPropsFactory = <T = any>(): Partial<VxeTableProps<T>> => ({
  // 布局控制
  showHeader: true,
  showFooter: false,
  footerMode: DEFAULT_FOOTER_MODE,

  // 分页
  pagination: false,
  paginatorConfig: DEFAULT_PAGINATOR_CONFIG,

  // 排序
  sortable: false,

  // 筛选
  filterable: false,
  globalFilter: false,

  // 选择
  selectionMode: null,
  selectedRows: undefined,

  // 滚动
  scrollable: false,
  // 编辑
  editable: false,
  editMode: 'cell',

  // 导出
  exportable: false,
  exportConfig: DEFAULT_EXPORT_CONFIG,

  // UI
  size: 'normal',
  showGridlines: false,
  stripedRows: false,
  responsiveLayout: 'scroll',

  // 其他
  loading: false,
  emptyMessage: undefined, // 使用国际化，由组件内部处理
})
