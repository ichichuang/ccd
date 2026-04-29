import type { Schema as YupSchema, ValidationError as YupValidationError } from 'yup'
import type { ZodIssue, ZodType } from 'zod'
import { ErrorType, HttpRequestError } from './errors'

export interface HttpValidationIssue {
  path?: string
  message: string
  value?: unknown
}

export type HttpResponseSchema<T> = YupSchema<T> | ZodType<T>

function isYupValidationError(error: unknown): error is YupValidationError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    (error as { name?: unknown }).name === 'ValidationError'
  )
}

function isZodSchema<T>(schema: HttpResponseSchema<T>): schema is ZodType<T> {
  const candidate = schema as { safeParseAsync?: unknown }
  return typeof candidate.safeParseAsync === 'function'
}

function normalizeYupValidationIssues(error: YupValidationError): HttpValidationIssue[] {
  const inner = error.inner.length > 0 ? error.inner : [error]
  return inner.map(issue => ({
    path: issue.path,
    message: issue.message,
    value: issue.value,
  }))
}

function normalizeZodValidationIssues(issues: readonly ZodIssue[]): HttpValidationIssue[] {
  return issues.map(issue => ({
    path: issue.path.length > 0 ? issue.path.join('.') : undefined,
    message: issue.message,
  }))
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
 * Supports Yup for existing call sites and Zod for schema-first DTO boundaries.
 */
export async function validateResponse<T>(
  schema: HttpResponseSchema<T>,
  data: unknown
): Promise<T> {
  if (isZodSchema(schema)) {
    const result = await schema.safeParseAsync(data)
    if (result.success) {
      return result.data
    }

    throwValidationError(normalizeZodValidationIssues(result.error.issues))
  }

  try {
    return await schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    })
  } catch (error) {
    if (isYupValidationError(error)) {
      throwValidationError(normalizeYupValidationIssues(error))
    }
    throw error
  }
}
