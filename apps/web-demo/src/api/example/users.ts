/**
 * 本地 Hono `GET|POST|PUT|DELETE /api/v1/users` 契约（ProTable 示例用）
 * 与 `server/src/routes/users.ts` mock 对齐；视图层仅从本文件引用类型，禁止跨示例目录互引。
 */

import { z } from 'zod'
import { get, post, put, del } from '@/utils/http/methods'
import { parseZodHttpPayload } from '@/adapters/http.adapter'
import type { ApiResponse } from '@/types/api'
import type { RequestConfig } from '@/utils/http/types'
import type { alovaInstance } from '@/utils/http/instance'

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

const v1UserListApiResponseSchema = z.object({
  code: z.number(),
  message: z.string(),
  data: v1UserListResponseSchema,
})

type V1UserListApiResponse = ApiResponse<V1UserListResponse>

const v1UserItemApiResponseSchema = z.object({
  code: z.number(),
  message: z.string(),
  data: v1UserListItemSchema,
})

type V1UserItemApiResponse = ApiResponse<V1UserListItemDTO>

export interface V1UserListReq {
  page: number
  limit: number
  sortBy?: string
  order?: string
  search?: string
  gender?: string
  [key: string]: string | number | boolean | undefined
}

/** 创建/更新请求体 */
const v1UserCreateSchema = z.object({
  name: z.string().min(1),
  gender: z.string().optional(),
  age: z.number().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
})
export type V1UserCreateDTO = z.infer<typeof v1UserCreateSchema>

const v1UserUpdateSchema = v1UserCreateSchema.partial()
export type V1UserUpdateDTO = z.infer<typeof v1UserUpdateSchema>

const v1UserDeleteApiResponseSchema = z.object({
  code: z.number(),
  message: z.string(),
  data: z.unknown().optional(),
})

interface V1UserDeleteApiResponse {
  code: number
  message: string
  data?: unknown
}

const USERS_API_URL = '/api/v1/users'

export const buildExampleUserListMethod = (
  client: typeof alovaInstance,
  params: V1UserListReq,
  config?: RequestConfig
) =>
  client.Get<V1UserListApiResponse>(USERS_API_URL, {
    ...config,
    params,
  })

export const buildExampleUserCreateMethod = (
  client: typeof alovaInstance,
  data: unknown,
  config?: RequestConfig
) =>
  client.Post<V1UserItemApiResponse>(
    USERS_API_URL,
    parseZodHttpPayload(v1UserCreateSchema, data),
    config
  )

export const buildExampleUserUpdateMethod = (
  client: typeof alovaInstance,
  id: number,
  data: unknown,
  config?: RequestConfig
) =>
  client.Put<V1UserItemApiResponse>(
    `${USERS_API_URL}/${id}`,
    parseZodHttpPayload(v1UserUpdateSchema, data),
    config
  )

export const buildExampleUserDeleteMethod = (
  client: typeof alovaInstance,
  id: number,
  config?: RequestConfig
) => client.Delete<V1UserDeleteApiResponse>(`${USERS_API_URL}/${id}`, config)

/** Imperative ProTable executor compatibility wrapper. Prefer buildExampleUserListMethod with useHttpRequest for server-state UIs. */
export const requestUserList = (
  params: V1UserListReq,
  config?: RequestConfig
): Promise<V1UserListResponse> =>
  get<V1UserListApiResponse>(USERS_API_URL, {
    ...config,
    params,
    responseSchema: v1UserListApiResponseSchema,
  }).then(response => response.data)

/** Imperative one-shot mutation wrapper for the example CRUD table. */
export const requestUserCreate = (data: unknown): Promise<V1UserListItemDTO> =>
  post<V1UserItemApiResponse>(USERS_API_URL, parseZodHttpPayload(v1UserCreateSchema, data), {
    enableCache: false,
    responseSchema: v1UserItemApiResponseSchema,
  }).then(response => response.data)

/** Imperative one-shot mutation wrapper for the example CRUD table. */
export const requestUserUpdate = (id: number, data: unknown): Promise<V1UserListItemDTO> =>
  put<V1UserItemApiResponse>(
    `${USERS_API_URL}/${id}`,
    parseZodHttpPayload(v1UserUpdateSchema, data),
    {
      enableCache: false,
      responseSchema: v1UserItemApiResponseSchema,
    }
  ).then(response => response.data)

/** Imperative one-shot mutation wrapper for the example CRUD table. */
export const requestUserDelete = (id: number): Promise<void> =>
  del<V1UserDeleteApiResponse>(`${USERS_API_URL}/${id}`, {
    enableCache: false,
    responseSchema: v1UserDeleteApiResponseSchema,
  }).then(() => undefined)
