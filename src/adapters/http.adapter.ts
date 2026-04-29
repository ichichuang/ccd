/**
 * Type Boundary: HTTP & Storage Adapter
 * Validates raw parsed JSON or HTTP data and guarantees a safe object return.
 */
import type { ZodIssue, ZodType } from 'zod'
import { ErrorType, HttpRequestError } from '@/utils/http/errors'

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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function parseBackendRoute(raw: unknown, pathHint: string): BackendRouteConfig {
  if (!isRecord(raw)) {
    throw new Error(`Invalid backend route at ${pathHint}: expected object`)
  }

  if (typeof raw.path !== 'string' || raw.path.trim() === '') {
    throw new Error(`Invalid backend route at ${pathHint}: path is required`)
  }

  if (!isRecord(raw.meta)) {
    throw new Error(`Invalid backend route at ${raw.path}: meta object is required`)
  }

  const route: BackendRouteConfig = {
    path: raw.path,
    meta: raw.meta,
  }

  if (typeof raw.name === 'string' && raw.name.trim()) {
    route.name = raw.name
  }
  if (typeof raw.component === 'string' && raw.component.trim()) {
    route.component = raw.component
  }
  if (typeof raw.redirect === 'string' && raw.redirect.trim()) {
    route.redirect = raw.redirect
  }
  if (Array.isArray(raw.children)) {
    route.children = raw.children.map((child, index) =>
      parseBackendRoute(child, `${raw.path}.children[${index}]`)
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
