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
 */
export async function validateResponse<T>(
  schema: HttpResponseSchema<T>,
  data: unknown
): Promise<T> {
  const result = await schema.safeParseAsync(data)
  if (result.success) {
    return result.data
  }

  throwValidationError(normalizeZodValidationIssues(result.error.issues))
}
