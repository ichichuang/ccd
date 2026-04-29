import { describe, expect, it, vi } from 'vitest'
import type { Method } from 'alova'
import { z } from 'zod'
import { ErrorType, isHttpRequestError } from './errors'
import { responseHandler } from './interceptors'

vi.mock('@/constants/router', () => ({ ['AUTH_ENABLED']: false }))
vi.mock('@/infra/auth/tokenProvider', () => ({
  readAuthToken: () => '',
  notifyUnauthorized: vi.fn(() => Promise.resolve()),
}))
vi.mock('@/utils/safeStorage', () => ({
  decompressAndDecryptSync: vi.fn(),
  encryptAndCompressSync: vi.fn(),
}))

function createMethod(responseSchema?: z.ZodType<unknown>): Method {
  return {
    type: 'GET',
    url: '/test',
    config: responseSchema ? { responseSchema } : {},
  } as Method
}

function createJsonResponse(payload: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { 'content-type': 'application/json' },
    ...init,
  })
}

describe('responseHandler schema boundary', () => {
  it('validates unwrapped success data before callers receive it', async () => {
    const schema = z.object({ id: z.string() })
    const response = createJsonResponse({ success: true, data: { id: 'route-1', extra: true } })

    await expect(responseHandler(response, createMethod(schema))).resolves.toEqual({
      id: 'route-1',
    })
  })

  it('rejects invalid unwrapped success data as HttpRequestError', async () => {
    const schema = z.object({ id: z.string() })
    const response = createJsonResponse({ success: true, data: { id: 123 } })

    await expect(responseHandler(response, createMethod(schema))).rejects.toSatisfy(
      (error: unknown) => {
        if (!isHttpRequestError(error)) return false
        return error.type === ErrorType.VALIDATION
      }
    )
  })
})
