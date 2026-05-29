import { parseZodHttpPayload } from '@/adapters/http.adapter'
import type { Method } from 'alova'
import type { ZodType } from 'zod'

function getMethodConfigRecord(method: Method): Record<string, unknown> {
  return method.config as Record<string, unknown>
}

export function getResponseSchema(method: Method): ZodType<unknown> | undefined {
  const schema = getMethodConfigRecord(method).responseSchema
  if (schema && typeof schema === 'object' && 'safeParse' in schema) {
    return schema as ZodType<unknown>
  }
  return undefined
}

export function validateResponsePayload(method: Method, payload: unknown): unknown {
  const schema = getResponseSchema(method)
  return schema ? parseZodHttpPayload(schema, payload) : payload
}
