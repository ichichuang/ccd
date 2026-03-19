import type { VNode } from 'vue'
import type { SelectOption } from '@/components/ProForm/engine/types'

export interface ColumnRenderParams<T extends Record<string, unknown>> {
  row: T
  index: number
  column: ProTableColumn<T>
}

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
  hidden?: boolean
  align?: 'left' | 'center' | 'right'
  render?: (params: ColumnRenderParams<T>) => VNode | string | number | null
  headerRender?: () => VNode | string
  meta?: Record<string, unknown>
  className?: string | ((row: T) => string)
}
