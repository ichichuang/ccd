/**
 * 系统 API DTO（Data Transfer Objects）
 * 动态路由、权限菜单等接口的单一类型来源
 *
 * @see {@link BackendRouteConfig} 全局类型定义位于 src/types/modules/router.d.ts:96
 */

import type { RouteMeta } from 'vue-router'
import { z } from 'zod'

/**
 * 后端动态路由单项 — 等价于全局 BackendRouteConfig。
 *
 * @remarks
 * 保留此别名以维持 DTO 三元组（Req/Res/DTO）规约，
 * 底层结构与 {@link BackendRouteConfig} 完全一致。
 */
export type SystemAsyncRouteItem = BackendRouteConfig

/**
 * 获取动态路由 API 的原始响应格式
 * 后端可能返回：直接数组 或 包裹在 { routes: [] } 中
 */
export type SystemAsyncRoutesRawRes = SystemAsyncRouteItem[] | { routes: SystemAsyncRouteItem[] }

const routeMetaSchema: z.ZodType<RouteMeta> = z.record(z.string(), z.unknown())

export const systemAsyncRouteItemSchema: z.ZodType<SystemAsyncRouteItem> = z.lazy(() =>
  z.object({
    path: z.string().min(1),
    name: z.string().min(1).optional(),
    component: z.string().min(1).optional(),
    redirect: z.string().min(1).optional(),
    meta: routeMetaSchema,
    children: z.array(systemAsyncRouteItemSchema).optional(),
  })
)

export const systemAsyncRoutesRawSchema: z.ZodType<SystemAsyncRoutesRawRes> = z.union([
  z.array(systemAsyncRouteItemSchema),
  z.object({ routes: z.array(systemAsyncRouteItemSchema) }),
])
