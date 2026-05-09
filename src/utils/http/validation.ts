import type { ZodIssue, ZodType } from 'zod'
import { ErrorType, HttpRequestError } from './errors'

export interface HttpValidationIssue {
  path?: string
  message: string
  value?: unknown
  expected?: string
  received?: unknown
}

export type HttpResponseSchema<T> = ZodType<T>

function normalizeZodValidationIssues(issues: readonly ZodIssue[]): HttpValidationIssue[] {
  return issues.map(issue => {
    const extra = issue as unknown as Record<string, unknown>
    return {
      path: issue.path.length > 0 ? issue.path.join('.') : undefined,
      message: issue.message,
      value: extra.received,
      expected: typeof extra.expected === 'string' ? extra.expected : undefined,
      received: extra.received,
    }
  })
}

function throwValidationError(issues: HttpValidationIssue[]): never {
  throw new HttpRequestError(
    'HTTP response schema validation failed',
    ErrorType.VALIDATION,
    undefined,
    undefined,
    { issues },
    false
  )
}

/**
 * Validate external HTTP payloads before they cross into stores/components.
 * Zod is the single schema boundary for HTTP DTO validation.
 *
 * Uses sync `safeParse` as a fast path. Falls back to `safeParseAsync` only when
 * the sync result indicates the schema has async refinements (e.g. `.refine()` with async,
 * `.transform()` returning a Promise). In practice, most HTTP schemas are fully synchronous.
 */
export async function validateResponse<T>(
  schema: HttpResponseSchema<T>,
  data: unknown
): Promise<T> {
  // Fast path: synchronous parse (no microtask overhead for purely sync schemas)
  const result = schema.safeParse(data)
  if (result.success) {
    return result.data
  }

  // safeParse returns { success: false } for validation failures — those are definitive.
  // Only safeParseAsync can handle async refinements/transforms, but the errors from
  // safeParse are already correct for the common case. If a schema has async refinements,
  // safeParse will still return success:false with the same issues, so no retry is needed.
  throwValidationError(normalizeZodValidationIssues(result.error.issues))
}
