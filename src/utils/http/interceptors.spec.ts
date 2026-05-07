import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Method } from 'alova'
import { z } from 'zod'
import { ErrorType, isHttpRequestError } from './errors'
import {
  beforeRequest,
  processRequestData,
  responseHandler,
  setRefreshTokenExecutor,
} from './interceptors'

const mockNotifyUnauthorized = vi.fn(() => Promise.resolve())

vi.mock('@/constants/router', () => Object.fromEntries([['AUTH_ENABLED', true]]))
vi.mock('@/infra/auth/tokenProvider', () => ({
  readAuthToken: () => 'test-token',
  notifyUnauthorized: (...args: Parameters<typeof mockNotifyUnauthorized>) =>
    mockNotifyUnauthorized(...args),
}))
vi.mock('@/utils/safeStorage', () => ({
  decompressAndDecryptSync: vi.fn((val: string) => (val === 'encrypted' ? 'decrypted' : null)),
  encryptAndCompressSync: vi.fn((val: unknown) => (val ? 'encrypted' : null)),
}))

beforeEach(() => {
  vi.spyOn(console, 'warn').mockImplementation(() => undefined)
  vi.spyOn(console, 'error').mockImplementation(() => undefined)
  mockNotifyUnauthorized.mockClear()
  // Provide a mock refresh executor so 401 tests don't hit real fetch
  setRefreshTokenExecutor(() => Promise.resolve('refreshed-token'))
})

afterEach(() => {
  vi.restoreAllMocks()
})

function createMethod(responseSchema?: z.ZodType<unknown>, overrides?: Partial<Method>): Method {
  return {
    type: 'GET',
    url: '/test',
    config: responseSchema ? { responseSchema } : {},
    data: undefined,
    ...overrides,
  } as unknown as Method
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

describe('responseHandler error classification', () => {
  it('classifies 5xx as SERVER error', async () => {
    const response = createJsonResponse(
      { message: 'Internal Server Error' },
      { status: 500, statusText: 'Internal Server Error' }
    )

    await expect(responseHandler(response, createMethod())).rejects.toSatisfy((error: unknown) => {
      if (!isHttpRequestError(error)) return false
      return error.type === ErrorType.SERVER && error.status === 500
    })
  })

  it('classifies 401 as AUTH error', async () => {
    // Make refresh fail with an AUTH HttpRequestError so the interceptor re-throws it properly
    const { HttpRequestError: HRE, ErrorType: ET } = await import('./errors')
    setRefreshTokenExecutor(() =>
      Promise.reject(new HRE('Unauthorized', ET.AUTH, 401, 'Unauthorized'))
    )

    const response = createJsonResponse(
      { message: 'Unauthorized' },
      { status: 401, statusText: 'Unauthorized' }
    )

    await expect(responseHandler(response, createMethod())).rejects.toSatisfy((error: unknown) => {
      if (!isHttpRequestError(error)) return false
      return error.type === ErrorType.AUTH && error.status === 401
    })
    expect(mockNotifyUnauthorized).toHaveBeenCalled()
  })

  it('classifies 404 as CLIENT error', async () => {
    const response = createJsonResponse(
      { message: 'Not Found' },
      { status: 404, statusText: 'Not Found' }
    )

    await expect(responseHandler(response, createMethod())).rejects.toSatisfy((error: unknown) => {
      if (!isHttpRequestError(error)) return false
      return error.type === ErrorType.CLIENT && error.status === 404
    })
  })
})

describe('responseHandler network errors', () => {
  it('classifies Failed to fetch as NETWORK error', async () => {
    const response = createJsonResponse({})
    // Simulate a network error by making response.text() throw
    vi.spyOn(response, 'text').mockRejectedValue(new TypeError('Failed to fetch'))

    await expect(responseHandler(response, createMethod())).rejects.toSatisfy((error: unknown) => {
      if (!isHttpRequestError(error)) return false
      return error.type === ErrorType.NETWORK && error.retryable === true
    })
  })
})

describe('responseHandler HEAD request', () => {
  it('returns headers for successful HEAD request', async () => {
    const response = new Response(null, {
      status: 200,
      headers: { 'content-length': '1024', etag: '"abc123"' },
    })
    const method = createMethod(undefined, { type: 'HEAD' } as Partial<Method>)

    const result = await responseHandler(response, method)
    expect(result).toHaveProperty('headers')
    expect((result as { headers: Headers }).headers).toBeInstanceOf(Headers)
  })

  it('throws for failed HEAD request', async () => {
    const response = new Response(null, { status: 404, statusText: 'Not Found' })
    const method = createMethod(undefined, { type: 'HEAD' } as Partial<Method>)

    await expect(responseHandler(response, method)).rejects.toSatisfy((error: unknown) => {
      if (!isHttpRequestError(error)) return false
      return error.type === ErrorType.CLIENT && error.status === 404
    })
  })
})

describe('responseHandler blob response', () => {
  it('returns blob for octet-stream content type', async () => {
    const blob = new Blob(['test'], { type: 'application/octet-stream' })
    const response = new Response(blob, {
      status: 200,
      headers: { 'content-type': 'application/octet-stream' },
    })
    const method = createMethod(undefined, { config: {} } as Partial<Method>)

    const result = await responseHandler(response, method)
    expect(result).toBeInstanceOf(Blob)
  })
})

describe('responseHandler success field', () => {
  it('returns data when success is true', async () => {
    const response = createJsonResponse({ success: true, data: { name: 'test' } })

    await expect(responseHandler(response, createMethod())).resolves.toEqual({ name: 'test' })
  })

  it('throws SERVER error when success is false', async () => {
    const response = createJsonResponse({
      success: false,
      message: 'Business error',
    })

    await expect(responseHandler(response, createMethod())).rejects.toSatisfy((error: unknown) => {
      if (!isHttpRequestError(error)) return false
      return error.type === ErrorType.SERVER
    })
  })

  it('returns full json when no success field', async () => {
    const response = createJsonResponse({ id: 1, name: 'test' })

    await expect(responseHandler(response, createMethod())).resolves.toEqual({
      id: 1,
      name: 'test',
    })
  })
})

describe('beforeRequest auth header', () => {
  it('injects Authorization header when token is present', () => {
    const method = createMethod(undefined, {
      config: { headers: {} },
      data: undefined,
    } as Partial<Method>)

    beforeRequest(method)
    expect((method.config as Record<string, unknown>).headers).toHaveProperty('Authorization')
  })
})

describe('processRequestData encryption', () => {
  it('encrypts fields when isSafeStorage is true', () => {
    const data = { isSafeStorage: true, password: 'secret123' }
    const result = processRequestData(data)
    expect(result).toHaveProperty('isSafeStorage', true)
    expect(result.password).not.toBe('secret123')
  })

  it('passes through data without isSafeStorage', () => {
    const data = { name: 'test' }
    const result = processRequestData(data)
    expect(result).toEqual({ name: 'test' })
  })
})
