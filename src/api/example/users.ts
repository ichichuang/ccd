/**
 * 本地 Hono `GET|POST|PUT|DELETE /api/v1/users` 契约（ProTable 示例用）
 * 与 `server/src/routes/users.ts` mock 对齐；视图层仅从本文件引用类型，禁止跨示例目录互引。
 */

import { z } from 'zod'

export const v1UserListItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  gender: z.string(),
  age: z.number(),
  email: z.string(),
  phone: z.string(),
  status: z.enum(['active', 'inactive']),
  createdAt: z.string(),
})

export type V1UserListItemDTO = z.infer<typeof v1UserListItemSchema> & Record<string, unknown>
