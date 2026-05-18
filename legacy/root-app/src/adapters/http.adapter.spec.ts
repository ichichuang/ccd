import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import {
  parseBackendRoutes,
  parseSafeArray,
  parseSafeObject,
  parseZodHttpPayload,
} from './http.adapter'
import { ErrorType, isHttpRequestError } from '@/utils/http/errors'

describe('parseSafeObject', () => {
  it('returns the input when it is a plain object', () => {
    const obj = { a: 1 }
    expect(parseSafeObject(obj, {})).toBe(obj)
  })

  it('returns fallback for null', () => {
    expect(parseSafeObject(null, { a: 1 })).toEqual({ a: 1 })
  })

  it('returns fallback for undefined', () => {
    expect(parseSafeObject(undefined, { a: 1 })).toEqual({ a: 1 })
  })

  it('returns fallback for arrays', () => {
    expect(parseSafeObject([1, 2], { a: 1 })).toEqual({ a: 1 })
  })

  it('returns fallback for primitives', () => {
    expect(parseSafeObject('hello', { a: 1 })).toEqual({ a: 1 })
    expect(parseSafeObject(42, { a: 1 })).toEqual({ a: 1 })
  })
})

describe('parseSafeArray', () => {
  it('returns the input when it is an array', () => {
    const arr = [1, 2, 3]
    expect(parseSafeArray(arr, [])).toBe(arr)
  })

  it('returns fallback for non-arrays', () => {
    expect(parseSafeArray(null, [0])).toEqual([0])
    expect(parseSafeArray(undefined, [0])).toEqual([0])
    expect(parseSafeArray({ a: 1 }, [0])).toEqual([0])
    expect(parseSafeArray('hello', [0])).toEqual([0])
  })

  it('accepts empty arrays', () => {
    expect(parseSafeArray([], [0])).toEqual([])
  })
})

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

  it('rejects non-array top-level payload', () => {
    expect(() => parseBackendRoutes({ path: '/x', meta: {} })).toThrow('expected an array')
  })

  it('rejects routes nested beyond max depth', () => {
    const deep: Record<string, unknown> = { path: '/0', meta: {} }
    let current = deep
    for (let i = 1; i <= 11; i++) {
      const child: Record<string, unknown> = { path: `/${i}`, meta: {} }
      current.children = [child]
      current = child
    }
    expect(() => parseBackendRoutes([deep])).toThrow('max nesting depth')
  })

  it('accepts routes at exactly max depth', () => {
    const deep: Record<string, unknown> = { path: '/0', meta: {} }
    let current = deep
    for (let i = 1; i <= 10; i++) {
      const child: Record<string, unknown> = { path: `/${i}`, meta: {} }
      current.children = [child]
      current = child
    }
    expect(() => parseBackendRoutes([deep])).not.toThrow()
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

  it('returns parsed data for valid payloads', () => {
    const schema = z.object({ id: z.string() })
    expect(parseZodHttpPayload(schema, { id: 'abc' })).toEqual({ id: 'abc' })
  })
})
