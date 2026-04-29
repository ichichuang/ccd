import { describe, expect, it, vi } from 'vitest'
import * as yup from 'yup'
import { z } from 'zod'
import { validateResponse } from './validation'
import { ErrorType, isHttpRequestError } from './errors'

describe('validateResponse', () => {
  it('returns stripped validated data for valid DTO payloads', async () => {
    const schema = yup
      .object({
        id: yup.string().required(),
        count: yup.number().required(),
      })
      .required()

    await expect(validateResponse(schema, { id: 'a', count: 1, extra: true })).resolves.toEqual({
      id: 'a',
      count: 1,
    })
  })

  it('throws structured HttpRequestError before invalid DTO reaches callers', async () => {
    const schema = yup
      .object({
        id: yup.string().required(),
        count: yup.number().required(),
      })
      .required()

    await expect(validateResponse(schema, { id: 1 })).rejects.toSatisfy((error: unknown) => {
      if (!isHttpRequestError(error)) return false
      const data = error.data as { issues?: Array<{ path?: string }> } | undefined
      return (
        error.type === ErrorType.VALIDATION &&
        Boolean(data?.issues?.some(issue => issue.path === 'count'))
      )
    })
  })

  it('uses zod to stop invalid JSON DTO payloads before store or component writes', async () => {
    const schema = z.object({
      id: z.string(),
      count: z.number(),
    })
    const storeWrite = vi.fn<(value: z.infer<typeof schema>) => void>()
    const componentWrite = vi.fn<(value: z.infer<typeof schema>) => void>()
    const invalidJsonPayload: unknown = JSON.parse('{"id":123,"count":"not-a-number"}')

    await expect(
      validateResponse(schema, invalidJsonPayload).then(value => {
        storeWrite(value)
        componentWrite(value)
      })
    ).rejects.toSatisfy((error: unknown) => {
      if (!isHttpRequestError(error)) return false
      const data = error.data as { issues?: Array<{ path?: string }> } | undefined
      return (
        error.type === ErrorType.VALIDATION &&
        Boolean(data?.issues?.some(issue => issue.path === 'id')) &&
        Boolean(data?.issues?.some(issue => issue.path === 'count'))
      )
    })

    expect(storeWrite).not.toHaveBeenCalled()
    expect(componentWrite).not.toHaveBeenCalled()
  })
})
