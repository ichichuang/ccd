import { describe, expect, it, vi } from 'vitest'
import type { Method } from 'alova'
import { z } from 'zod'
import { ErrorType } from '../errors'
import {
  acquireFreshToken,
  isRefreshEndpoint,
  isRetriedAfterRefresh,
  markRetriedAfterRefresh,
  setRefreshTokenExecutor,
} from './authRefreshPolicy'
import { resolveHttpErrorPolicy } from './errorMappingPolicy'
import {
  isBlobHttpResponse,
  readHttpErrorData,
  readResponseTextAndJson,
} from './responseDecodePolicy'
import { validateResponsePayload } from './schemaValidationPolicy'

const mockNotifyUnauthorized = vi.fn(() => Promise.resolve())

vi.mock('@/infra/auth/tokenProvider', () => ({
  readAuthToken: () => 'test-token',
  notifyUnauthorized: (...args: Parameters<typeof mockNotifyUnauthorized>) =>
    mockNotifyUnauthorized(...args),
}))

function createMethod(overrides?: Partial<Method>): Method {
  return {
    type: 'GET',
    url: '/test',
    config: {},
    data: undefined,
    ...overrides,
  } as unknown as Method
}

describe('HTTP policy modules', () => {
  it('maps HTTP status to structured retry and error policy', () => {
    const unavailable = resolveHttpErrorPolicy(503, { message: 'Service unavailable' })
    expect(unavailable.errorType).toBe(ErrorType.SERVER)
    expect(unavailable.normalizedKind).toBe('server')
    expect(unavailable.errorMessage).toBe('Service unavailable')
    expect(unavailable.retryable).toBe(true)

    const notFound = resolveHttpErrorPolicy(404, undefined)
    expect(notFound.errorType).toBe(ErrorType.CLIENT)
    expect(notFound.normalizedKind).toBe('client')
    expect(notFound.retryable).toBe(false)
  })

  it('parses response text and JSON without hiding the raw body', async () => {
    const parsed = await readResponseTextAndJson(
      new Response(JSON.stringify({ ok: true }), {
        headers: { 'content-type': 'application/json' },
      })
    )

    expect(parsed.json).toEqual({ ok: true })
    expect(parsed.text).toBe('{"ok":true}')
  })

  it('extracts message from JSON or text error responses', async () => {
    await expect(
      readHttpErrorData(new Response(JSON.stringify({ message: 'bad' }), { statusText: 'Bad' }))
    ).resolves.toEqual({ message: 'bad' })

    await expect(
      readHttpErrorData(new Response('plain error', { statusText: 'Bad' }))
    ).resolves.toEqual({
      message: 'plain error',
    })
  })

  it('identifies blob responses from method config or response content type', () => {
    const byConfig = new Response('file')
    expect(isBlobHttpResponse(byConfig, createMethod({ config: { responseType: 'blob' } }))).toBe(
      true
    )

    const byHeader = new Response('file', {
      headers: { 'content-type': 'application/octet-stream' },
    })
    expect(isBlobHttpResponse(byHeader, createMethod())).toBe(true)
  })

  it('validates response payloads through configured Zod schemas', () => {
    const method = createMethod({
      config: {
        responseSchema: z.object({ id: z.string() }),
      },
    })

    expect(validateResponsePayload(method, { id: 'a', extra: true })).toEqual({ id: 'a' })
  })

  it('keeps auth refresh retry state on the Method config boundary', async () => {
    const method = createMethod({ url: '/private' })
    setRefreshTokenExecutor(() => Promise.resolve('token-1'))

    await expect(acquireFreshToken()).resolves.toBe('token-1')
    expect(isRefreshEndpoint('/auth/refresh')).toBe(true)
    expect(isRetriedAfterRefresh(method)).toBe(false)
    markRetriedAfterRefresh(method)
    expect(isRetriedAfterRefresh(method)).toBe(true)
  })
})
