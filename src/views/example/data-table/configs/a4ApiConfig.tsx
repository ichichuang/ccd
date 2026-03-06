/**
 * A4 Table + Drawer 的 API 与列配置
 * 使用 JSONPlaceholder 公共 API 模拟异步数据
 * 列配置通过工厂 createA4Columns 注入操作回调，符合 DataTable golden sample 模式
 */
import Button from 'primevue/button'
import type { DataTableColumn } from '@/components/DataTable'
import type { DataTableApiConfig } from '@/components/DataTable'

export interface PostItem {
  id: number
  userId: number
  title: string
  body: string
}

/** 与 API 分页保持一致 */
export const A4_PAGE_SIZE = 10

const baseColumns: DataTableColumn<PostItem>[] = [
  { field: 'id', header: 'ID', width: 80 },
  { field: 'userId', header: 'User ID', width: 100 },
  { field: 'title', header: '标题', sortable: true },
  { field: 'body', header: '内容', width: 200 },
]

/**
 * 创建 A4 列配置（含操作列）
 * @param onViewDetail 查看详情回调，传入行数据
 */
export function createA4Columns(
  onViewDetail: (row: PostItem) => void
): DataTableColumn<PostItem>[] {
  return [
    ...baseColumns,
    {
      field: '_actions',
      header: '操作',
      width: 100,
      body: (row: PostItem) => (
        <Button
          label="查看详情"
          size="small"
          variant="text"
          class="fs-sm"
          onClick={() => onViewDetail(row)}
        />
      ),
    },
  ]
}

export const a4ApiConfig: DataTableApiConfig<PostItem> = {
  api: '/jsonplaceholder/posts',
  type: 'get',
  immediate: true,
  mode: 'pagination',
  pagination: {
    pageSize: A4_PAGE_SIZE,
    pageParam: '_page',
    pageSizeParam: '_limit',
  },
}
