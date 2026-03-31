/**
 * 本地 Hono `GET|POST|PUT|DELETE /api/v1/users` 契约（ProTable 示例用）
 * 与 `server/src/routes/users.ts` mock 对齐；视图层仅从本文件引用类型，禁止跨示例目录互引。
 */

export interface V1UserListItemDTO extends Record<string, unknown> {
  id: number
  name: string
  gender: string
  age: number
  email: string
  phone: string
  status: 'active' | 'inactive'
  createdAt: string
}
