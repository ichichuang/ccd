export type ProTreeTableSelectionMode = false | 'single' | 'multiple' | 'checkbox'

export type ProTreeTableExpandedKeys = Record<string, boolean>

export interface ProTreeTableCheckboxSelectionState {
  checked?: boolean
  partialChecked?: boolean
}

export type ProTreeTableSelectionKeys =
  | string
  | string[]
  | Record<string, boolean | ProTreeTableCheckboxSelectionState>
  | null

export type ProTreeTableColumnAlign = 'left' | 'center' | 'right'
export type ProTreeTableColumnPinned = false | 'left' | 'right'

export type ProTreeTableValueEnumItem = string | { label: string }
export type ProTreeTableValueEnum = Record<string | number, ProTreeTableValueEnumItem>

export interface ProTreeTableNode<T extends Record<string, unknown> = Record<string, unknown>> {
  key: string
  label?: string
  data: T
  children?: ProTreeTableNode<T>[]
  leaf?: boolean
  loading?: boolean
  selectable?: boolean
}

export interface ProTreeTableColumn<T extends Record<string, unknown> = Record<string, unknown>> {
  id: string
  field?: Extract<keyof T, string>
  title: string
  width?: string
  minWidth?: string
  align?: ProTreeTableColumnAlign
  pinned?: ProTreeTableColumnPinned
  sortable?: boolean
  filterable?: boolean
  valueEnum?: ProTreeTableValueEnum
}

export interface ProTreeTableProps<T extends Record<string, unknown> = Record<string, unknown>> {
  nodes?: ProTreeTableNode<T>[]
  columns?: ProTreeTableColumn<T>[]
  loading?: boolean
  disabled?: boolean
  selectionMode?: ProTreeTableSelectionMode
  expandedKeys?: ProTreeTableExpandedKeys
  selectionKeys?: ProTreeTableSelectionKeys
}

export interface ProTreeTableNodeEvent<
  T extends Record<string, unknown> = Record<string, unknown>,
> {
  key: string
  node: ProTreeTableNode<T>
}
