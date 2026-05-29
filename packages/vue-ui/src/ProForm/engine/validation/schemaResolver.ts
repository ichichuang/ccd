import type { ValidationResolver, ValidationResult } from '../types'

interface SchemaResolverOptions {
  formErrorKey?: string
}

interface ValidationIssue {
  path?: string | number | Array<string | number>
  message: string
}

interface ParseableSchema<TValues extends Record<string, unknown>> {
  parse?: (values: TValues) => unknown
  parseAsync?: (values: TValues) => Promise<unknown>
  safeParse?: (values: TValues) => { success: boolean; error?: unknown }
  safeParseAsync?: (values: TValues) => Promise<{ success: boolean; error?: unknown }>
}

function isValidationIssue(value: unknown): value is ValidationIssue {
  if (typeof value !== 'object' || value === null) return false
  const candidate = value as Record<string, unknown>
  return (
    (candidate.path === undefined ||
      typeof candidate.path === 'string' ||
      typeof candidate.path === 'number' ||
      Array.isArray(candidate.path)) &&
    typeof candidate.message === 'string'
  )
}

function normalizeIssuePath(path: ValidationIssue['path'], formErrorKey: string): string {
  if (path === undefined) return formErrorKey
  if (Array.isArray(path)) return path.map(String).join('.') || formErrorKey
  return String(path)
}

function getIssues(error: unknown): ValidationIssue[] {
  if (typeof error !== 'object' || error === null) return []
  const payload = error as Record<string, unknown>
  const directIssues = Array.isArray(payload.issues) ? payload.issues : undefined
  if (directIssues) return directIssues.filter(isValidationIssue)
  const nestedError = payload.error
  if (typeof nestedError === 'object' && nestedError !== null) {
    const nested = nestedError as Record<string, unknown>
    if (Array.isArray(nested.issues)) return nested.issues.filter(isValidationIssue)
  }
  return []
}

function addFieldError(errors: Record<string, string[]>, fieldName: string, message: string): void {
  const current = errors[fieldName] ?? []
  errors[fieldName] = [...current, message]
}

function issuesToErrors(issues: ValidationIssue[], formErrorKey: string): Record<string, string[]> {
  const errors: Record<string, string[]> = {}
  issues.forEach(issue => {
    addFieldError(errors, normalizeIssuePath(issue.path, formErrorKey), issue.message)
  })
  return errors
}

export function createSchemaValidationResolver<
  TValues extends Record<string, unknown> = Record<string, unknown>,
>(
  schema: ParseableSchema<TValues>,
  options: SchemaResolverOptions = {}
): ValidationResolver<TValues> {
  const formErrorKey = options.formErrorKey ?? '_form'

  return async (values: TValues): Promise<ValidationResult> => {
    const safeParseResult = schema.safeParseAsync
      ? await schema.safeParseAsync(values)
      : schema.safeParse?.(values)
    if (safeParseResult) {
      if (safeParseResult.success) return { valid: true, errors: {} }
      const errors = issuesToErrors(getIssues(safeParseResult.error), formErrorKey)
      return {
        valid: Object.keys(errors).length === 0,
        errors,
      }
    }

    try {
      if (schema.parseAsync) {
        await schema.parseAsync(values)
      } else if (schema.parse) {
        schema.parse(values)
      }
      return { valid: true, errors: {} }
    } catch (error) {
      const errors = issuesToErrors(getIssues(error), formErrorKey)
      if (Object.keys(errors).length === 0) {
        throw error
      }
      return {
        valid: false,
        errors,
      }
    }
  }
}
