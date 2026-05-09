/**
 * 本地 Hono `GET|POST|PUT|DELETE /api/v1/users` 契约（ProTable 示例用）
 * 与 `server/src/routes/users.ts` mock 对齐；视图层仅从本文件引用类型，禁止跨示例目录互引。
 */

import { z } from 'zod'
import { get, post, put, del } from '@/utils/http/methods'
import { parseZodHttpPayload } from '@/adapters/http.adapter'

// --- DTO Triple: Schema (SSOT) → Type → API functions ---

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

/** 用户列表项 DTO — 类型严格从 schema 推导，无额外宽松字段 */
export type V1UserListItemDTO = z.infer<typeof v1UserListItemSchema>

/** 分页列表响应 */
const v1UserListResponseSchema = z.object({
  list: z.array(v1UserListItemSchema),
  total: z.number(),
})

export type V1UserListResponse = z.infer<typeof v1UserListResponseSchema>

/** 创建/更新请求体 */
const v1UserCreateSchema = v1UserListItemSchema.omit({ id: true, createdAt: true })
export type V1UserCreateDTO = z.infer<typeof v1UserCreateSchema>

const v1UserUpdateSchema = v1UserListItemSchema.partial().extend({ id: z.number() })
export type V1UserUpdateDTO = z.infer<typeof v1UserUpdateSchema>

const v1UserDeleteResponseSchema = z.unknown().transform(() => undefined)

const USERS_API_URL = '/api/v1/users'

/** 获取用户分页列表 */
export const requestUserList = (params: {
  page: number
  pageSize: number
  [key: string]: unknown
}): Promise<V1UserListResponse> =>
  get<V1UserListResponse>(USERS_API_URL, {
    params,
    responseSchema: v1UserListResponseSchema,
  })

/** 创建用户 */
export const requestUserCreate = (data: V1UserCreateDTO): Promise<V1UserListItemDTO> =>
  post<V1UserListItemDTO>(USERS_API_URL, parseZodHttpPayload(v1UserCreateSchema, data), {
    responseSchema: v1UserListItemSchema,
  })

/** 更新用户 */
export const requestUserUpdate = (data: V1UserUpdateDTO): Promise<V1UserListItemDTO> =>
  put<V1UserListItemDTO>(USERS_API_URL, parseZodHttpPayload(v1UserUpdateSchema, data), {
    responseSchema: v1UserListItemSchema,
  })

/** 删除用户 */
export const requestUserDelete = (id: number): Promise<void> =>
  del<void>(`${USERS_API_URL}/${id}`, {
    responseSchema: v1UserDeleteResponseSchema,
  })
