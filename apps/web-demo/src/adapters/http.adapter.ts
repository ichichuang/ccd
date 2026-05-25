/**
 * Type Boundary: HTTP & Storage Adapter
 * Validates raw parsed JSON or HTTP data and guarantees a safe object return.
 *
 * @see {@link BackendRouteConfig} 全局类型定义位于 src/types/modules/router.d.ts:96
 */
import type { ZodIssue, ZodType } from 'zod'
import { ErrorType, HttpRequestError } from '@/utils/http/errors'
import { isRecord } from '@/utils/guards'

interface AdapterValidationIssue {
  path?: string
  message: string
}

function normalizeZodIssues(issues: readonly ZodIssue[]): AdapterValidationIssue[] {
  return issues.map(issue => ({
    path: issue.path.length > 0 ? issue.path.join('.') : undefined,
    message: issue.message,
  }))
}

export function parseSafeObject<T extends object>(raw: unknown, fallback: T): T {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return fallback
  }
  return raw as T
}

export function parseSafeArray<T>(raw: unknown, fallback: T[]): T[] {
  if (!Array.isArray(raw)) {
    return fallback
  }
  return raw as T[]
}

export function parseZodHttpPayload<T>(schema: ZodType<T>, raw: unknown): T {
  const result = schema.safeParse(raw)
  if (result.success) {
    return result.data
  }

  throw new HttpRequestError(
    'HTTP adapter schema validation failed',
    ErrorType.VALIDATION,
    undefined,
    undefined,
    { issues: normalizeZodIssues(result.error.issues) },
    false
  )
}

const MAX_ROUTE_DEPTH = 10

type BackendRouteInput = {
  path: string
  meta: Record<string, unknown>
  name?: string
  component?: string
  redirect?: string
  children?: unknown[]
}

function parseBackendRoute(raw: unknown, pathHint: string, depth = 0): BackendRouteConfig {
  if (depth > MAX_ROUTE_DEPTH) {
    throw new Error(
      `Invalid backend route at ${pathHint}: max nesting depth (${MAX_ROUTE_DEPTH}) exceeded`
    )
  }

  if (!isRecord(raw)) {
    throw new Error(`Invalid backend route at ${pathHint}: expected object`)
  }

  if (typeof raw.path !== 'string' || raw.path.trim() === '') {
    throw new Error(`Invalid backend route at ${pathHint}: path is required`)
  }

  if (!isRecord(raw.meta)) {
    throw new Error(`Invalid backend route at ${raw.path}: meta object is required`)
  }

  const routeInput: BackendRouteInput = {
    path: raw.path,
    meta: raw.meta,
    name: typeof raw.name === 'string' ? raw.name : undefined,
    component: typeof raw.component === 'string' ? raw.component : undefined,
    redirect: typeof raw.redirect === 'string' ? raw.redirect : undefined,
    children: Array.isArray(raw.children) ? raw.children : undefined,
  }

  const route: BackendRouteConfig = {
    path: routeInput.path,
    meta: routeInput.meta,
  }

  if (routeInput.name?.trim()) {
    route.name = routeInput.name
  }
  if (routeInput.component?.trim()) {
    route.component = routeInput.component
  }
  if (routeInput.redirect?.trim()) {
    route.redirect = routeInput.redirect
  }
  if (routeInput.children) {
    route.children = routeInput.children.map((child, index) =>
      parseBackendRoute(child, `${routeInput.path}.children[${index}]`, depth + 1)
    )
  }

  return route
}

export function parseBackendRoutes(raw: unknown): BackendRouteConfig[] {
  if (!Array.isArray(raw)) {
    throw new Error('Invalid backend routes payload: expected an array')
  }

  return raw.map((route, index) => parseBackendRoute(route, `routes[${index}]`))
}
