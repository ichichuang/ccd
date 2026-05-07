/**
 * 系统 API DTO（Data Transfer Objects）
 * 动态路由、权限菜单等接口的单一类型来源
 * 与 src/types/modules/router.d.ts 中的 BackendRouteConfig 对齐
 */

import type { RouteMeta } from 'vue-router'
import { z } from 'zod'

/**
 * 后端动态路由单项（与全局 BackendRouteConfig 结构一致）
 * 用于 System API 响应类型定义
 */
export interface SystemAsyncRouteItem {
  /** 路由路径 */
  path: string
  /** 路由名称 */
  name?: string
  /** 组件路径（相对于 src/views） */
  component?: string
  /** 路由重定向 */
  redirect?: string
  /** 路由元信息 */
  meta: RouteMeta
  /** 子路由 */
  children?: SystemAsyncRouteItem[]
}

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
