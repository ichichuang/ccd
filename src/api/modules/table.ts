import { get } from '@/utils'

export interface TableDemoRow {
  id: number
  name: string
  email: string
  index: number
  createdAt: string
}

export interface TableDemoResponse {
  list: TableDemoRow[]
  page: number
  pageSize: number
  total: number
  hasNext: boolean
}

export interface TableDemoQuery {
  page: number
  pageSize: number
}

/**
 * 无限滚动示例表格数据
 */
export const getScrollTableDemo = (params: TableDemoQuery) =>
  get<TableDemoResponse>('/table/list', {
    params,
  })
