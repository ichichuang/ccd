/**
 * DataTable V2 类型契约
 *
 * 强类型、schema 驱动的表格引擎。
 */

import type { VNode } from 'vue'

/** PrimeVue Button severity */
export type DataTableActionSeverity =
  | 'secondary'
  | 'success'
  | 'info'
  | 'warn'
  | 'danger'
  | 'help'
  | 'contrast'

/**
 * 列配置
 *
 * @template T - 行数据类型
 */
export interface DataTableColumn<T extends object> {
  /** 字段名：keyof T 或自定义列（如 'actions'） */
  field: keyof T | string
  /** 表头文本 */
  header: string
  /** 列宽 */
  width?: string | number
  /** 自定义渲染：返回 VNode 或原始值 */
  render?: (row: T) => VNode | string | number | boolean | null | undefined
}

/**
 * 行级操作按钮
 *
 * @template T - 行数据类型
 */
export interface DataTableAction<T extends object> {
  /** 按钮文案 */
  label: string
  /** 图标（Icons name） */
  icon?: string
  /** PrimeVue 按钮 severity */
  severity?: DataTableActionSeverity
  /** 动态显隐：根据当前行数据决定是否渲染 */
  vIf?: (row: T) => boolean
  /** 点击回调 */
  onClick: (row: T) => void
}

/**
 * API 分页参数
 */
export interface DataTableApiParams {
  page: number
  pageSize: number
}

/**
 * API 返回结构
 */
export interface DataTableApiResult<T> {
  data: T[]
  total: number
}
