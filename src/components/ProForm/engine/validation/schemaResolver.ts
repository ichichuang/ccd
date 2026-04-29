import type { HttpResponseSchema, HttpValidationIssue } from '@/utils/http/validation'
import { validateResponse } from '@/utils/http/validation'
import { ErrorType, isHttpRequestError } from '@/utils/http/errors'
import type { ValidationResolver, ValidationResult } from '../types'

interface SchemaResolverOptions {
  formErrorKey?: string
}

interface ValidationIssuePayload {
  issues?: HttpValidationIssue[]
}

function isValidationIssue(value: unknown): value is HttpValidationIssue {
  if (typeof value !== 'object' || value === null) return false
  const candidate = value as { path?: unknown; message?: unknown }
  return (
    (candidate.path === undefined || typeof candidate.path === 'string') &&
    typeof candidate.message === 'string'
  )
}

function getIssues(data: unknown): HttpValidationIssue[] {
  if (typeof data !== 'object' || data === null) return []
  const payload = data as ValidationIssuePayload
  if (!Array.isArray(payload.issues)) return []
  return payload.issues.filter(isValidationIssue)
}

function addFieldError(errors: Record<string, string[]>, fieldName: string, message: string): void {
  const current = errors[fieldName] ?? []
  errors[fieldName] = [...current, message]
}

function issuesToErrors(
  issues: HttpValidationIssue[],
  formErrorKey: string
): Record<string, string[]> {
  const errors: Record<string, string[]> = {}
  issues.forEach(issue => {
    addFieldError(errors, issue.path ?? formErrorKey, issue.message)
  })
  return errors
}

export function createSchemaValidationResolver<
  TValues extends Record<string, unknown> = Record<string, unknown>,
>(
  schema: HttpResponseSchema<TValues>,
  options: SchemaResolverOptions = {}
): ValidationResolver<TValues> {
  const formErrorKey = options.formErrorKey ?? '_form'

  return async (values: TValues): Promise<ValidationResult> => {
    try {
      await validateResponse(schema, values)
      return { valid: true, errors: {} }
    } catch (error) {
      if (!isHttpRequestError(error) || error.type !== ErrorType.VALIDATION) {
        throw error
      }

      const errors = issuesToErrors(getIssues(error.data), formErrorKey)
      return {
        valid: Object.keys(errors).length === 0,
        errors,
      }
    }
  }
}
