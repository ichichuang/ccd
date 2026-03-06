/**
 * 无限滚动表格配置
 * 使用 JSONPlaceholder Comments API
 */
import type { DataTableApiConfig } from '@/components/DataTable'

export interface CommentItem {
  postId: number
  id: number
  name: string
  email: string
  body: string
}

export const infiniteTableColumns = [
  { field: 'id', header: 'ID', width: 60 },
  { field: 'name', header: 'Name', width: 200, sortable: true },
  { field: 'email', header: 'Email', width: 180, sortable: true },
  { field: 'body', header: 'Comment', width: 300 },
] as const

export const infiniteTableConfig: DataTableApiConfig<CommentItem> = {
  api: '/jsonplaceholder/comments',
  type: 'get',
  immediate: true,
  mode: 'infinite',
  infinite: {
    pageSize: 20,
    pageParam: '_page',
    pageSizeParam: '_limit',
  },
  params: {
    // Optional: Add default params if needed
  },
}
