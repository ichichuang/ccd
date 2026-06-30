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
export type ProTreeTableColumnSize = string | number

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

export interface ProTreeTableLazyLoadParams<
  T extends Record<string, unknown> = Record<string, unknown>,
> {
  key: string
  node: ProTreeTableNode<T>
  expandedKeys: ProTreeTableExpandedKeys
  selectionKeys: ProTreeTableSelectionKeys
}

export interface ProTreeTableLazyLoadResult<
  T extends Record<string, unknown> = Record<string, unknown>,
> {
  children: ProTreeTableNode<T>[]
}

export type ProTreeTableLoadChildren<T extends Record<string, unknown> = Record<string, unknown>> =
  (params: ProTreeTableLazyLoadParams<T>) => Promise<ProTreeTableLazyLoadResult<T>>

export interface ProTreeTableLazyLoadEvent<
  T extends Record<string, unknown> = Record<string, unknown>,
> {
  key: string
  node: ProTreeTableNode<T>
  children: ProTreeTableNode<T>[]
}

export interface ProTreeTableLazyLoadErrorEvent<
  T extends Record<string, unknown> = Record<string, unknown>,
> {
  key: string
  node: ProTreeTableNode<T>
  error: unknown
}

export interface ProTreeTableColumnRenderParams<
  T extends Record<string, unknown> = Record<string, unknown>,
> {
  value: unknown
  text: string
  node: ProTreeTableNode<T>
  row: T
  column: ProTreeTableColumn<T>
}

export type ProTreeTableColumnRenderResult = string | number | null | undefined

export type ProTreeTableColumnRender<T extends Record<string, unknown> = Record<string, unknown>> =
  (params: ProTreeTableColumnRenderParams<T>) => ProTreeTableColumnRenderResult

export interface ProTreeTableColumn<T extends Record<string, unknown> = Record<string, unknown>> {
  id: string
  field?: Extract<keyof T, string>
  title: string
  width?: ProTreeTableColumnSize
  minWidth?: ProTreeTableColumnSize
  align?: ProTreeTableColumnAlign
  pinned?: ProTreeTableColumnPinned
  sortable?: boolean
  filterable?: boolean
  valueEnum?: ProTreeTableValueEnum
  render?: ProTreeTableColumnRender<T>
}

export interface ProTreeTableProps<T extends Record<string, unknown> = Record<string, unknown>> {
  nodes?: ProTreeTableNode<T>[]
  columns?: ProTreeTableColumn<T>[]
  loading?: boolean
  disabled?: boolean
  selectionMode?: ProTreeTableSelectionMode
  expandedKeys?: ProTreeTableExpandedKeys
  selectionKeys?: ProTreeTableSelectionKeys
  lazy?: boolean
  loadChildren?: ProTreeTableLoadChildren<T>
}

export interface ProTreeTableNodeEvent<
  T extends Record<string, unknown> = Record<string, unknown>,
> {
  key: string
  node: ProTreeTableNode<T>
}
