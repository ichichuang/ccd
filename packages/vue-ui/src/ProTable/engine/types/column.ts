import type { VNode } from 'vue'
import type { SelectOption } from '../../../ProForm'

export interface ColumnRenderParams<T extends Record<string, unknown>> {
  row: T
  index: number
  column: ProTableColumn<T>
}

export interface ProTableValueEnumItem {
  label: string
  severity?: 'secondary' | 'success' | 'info' | 'warn' | 'danger' | 'contrast'
}

export type ProTableValueEnum = Record<string | number, ProTableValueEnumItem | string>

export interface ProTableColumn<T extends Record<string, unknown> = Record<string, unknown>> {
  id: string
  title: string | (() => VNode)
  field?: string
  width?: string
  minWidth?: string
  maxWidth?: string
  sortable?: boolean | 'custom'
  filterable?: boolean
  filterType?: 'text' | 'select' | 'date' | 'number'
  filterOptions?: SelectOption[]
  pinned?: 'left' | 'right' | false
  /**
   * Virtual grid only (`VirtualGridRenderer`): this column’s track uses `minmax(base, 1fr)` in its
   * section (left / center / right) to absorb remaining horizontal space. Ignored when `width` is set.
   * Prefer at most one `true` per section; if multiple are set, only the last eligible column applies.
   */
  virtualFill?: boolean
  hidden?: boolean
  headerAlign?: 'left' | 'center' | 'right'
  align?: 'left' | 'center' | 'right'
  render?: (params: ColumnRenderParams<T>) => VNode | string | number | null
  valueEnum?: ProTableValueEnum
  headerRender?: () => VNode | string
  meta?: Record<string, unknown>
  className?: string | ((row: T) => string)
}
