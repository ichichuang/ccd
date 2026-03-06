/**
 * API 表格配置 - 远程数据加载
 * 使用 JSONPlaceholder 公共 API 演示（支持 CORS）
 */
import type { DataTableApiConfig } from '@/components/DataTable'

export interface PostItem {
  userId: number
  id: number
  title: string
  body: string
}

export const apiTableColumns = [
  { field: 'id', header: 'ID', width: 80 },
  { field: 'userId', header: 'User ID', width: 200 },
  { field: 'title', header: 'Title', sortable: true },
  { field: 'body', header: 'Body', width: 200 },
] as const

export const apiTableConfig: DataTableApiConfig<PostItem> = {
  api: '/jsonplaceholder/posts',
  type: 'get',
  immediate: true,
  mode: 'pagination',
  pagination: {
    pageSize: 10,
    pageParam: '_page',
    pageSizeParam: '_limit',
  },
}
