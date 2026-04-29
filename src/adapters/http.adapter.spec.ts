import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import { parseBackendRoutes, parseZodHttpPayload } from './http.adapter'
import { ErrorType, isHttpRequestError } from '@/utils/http/errors'

describe('parseBackendRoutes', () => {
  it('validates recursive backend route payloads', () => {
    expect(
      parseBackendRoutes([
        {
          path: '/system',
          meta: { title: 'System' },
          children: [{ path: '/system/user', meta: { title: 'User' } }],
        },
      ])
    ).toEqual([
      {
        path: '/system',
        meta: { title: 'System' },
        children: [{ path: '/system/user', meta: { title: 'User' } }],
      },
    ])
  })

  it('rejects invalid dynamic route payloads before router processing', () => {
    expect(() => parseBackendRoutes([{ path: '/broken' }])).toThrow('meta object is required')
  })
})

describe('parseZodHttpPayload', () => {
  it('stops invalid JSON DTO payloads before store or component writes', () => {
    const schema = z.object({
      id: z.string(),
      enabled: z.boolean(),
    })
    const storeWrite = vi.fn<(value: z.infer<typeof schema>) => void>()
    const componentWrite = vi.fn<(value: z.infer<typeof schema>) => void>()
    const invalidJsonPayload: unknown = JSON.parse('{"id":42,"enabled":"yes"}')

    let caught: unknown

    try {
      const parsed = parseZodHttpPayload(schema, invalidJsonPayload)
      storeWrite(parsed)
      componentWrite(parsed)
    } catch (error) {
      caught = error
    }

    expect(isHttpRequestError(caught)).toBe(true)
    if (isHttpRequestError(caught)) {
      const data = caught.data as { issues?: Array<{ path?: string }> } | undefined
      expect(caught.type).toBe(ErrorType.VALIDATION)
      expect(data?.issues?.some(issue => issue.path === 'id')).toBe(true)
      expect(data?.issues?.some(issue => issue.path === 'enabled')).toBe(true)
    }

    expect(storeWrite).not.toHaveBeenCalled()
    expect(componentWrite).not.toHaveBeenCalled()
  })
})
