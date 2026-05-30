import fs from 'node:fs'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Method } from 'alova'
import { z } from 'zod'
import { castValue } from '@ccd/shared-utils'
import { ErrorType, HttpRequestError, isHttpRequestError, isRetryableError } from './errors'

interface CapturedAlovaCall {
  method: string
  url: string
  data?: unknown
  config: Record<string, unknown>
  send: () => Promise<unknown>
}

type AlovaResponder = (call: CapturedAlovaCall) => Promise<unknown>

const httpMocks = vi.hoisted(() => {
  const calls: CapturedAlovaCall[] = []
  const responders: AlovaResponder[] = []

  function toRecord(input: unknown): Record<string, unknown> {
    const record: Record<string, unknown> = {}
    if (!input || typeof input !== 'object') {
      return record
    }
    Object.entries(input).forEach(([key, value]) => {
      record[key] = value
    })
    return record
  }

  function createMethod(method: string) {
    return vi.fn((url: string, first?: unknown, second?: unknown) => {
      const hasBody = method === 'POST' || method === 'PUT' || method === 'PATCH'
      const config = toRecord(hasBody ? second : first)
      const call: CapturedAlovaCall = {
        method,
        url,
        data: hasBody ? first : undefined,
        config,
        send: () => Promise.resolve(undefined),
      }
      const send = vi.fn(() => {
        const responder = responders.shift()
        return responder ? responder(call) : Promise.resolve({ ok: true })
      })
      call.send = send
      calls.push(call)
      return { send }
    })
  }

  const getMethod = createMethod('GET')
  const postMethod = createMethod('POST')
  const putMethod = createMethod('PUT')
  const patchMethod = createMethod('PATCH')
  const deleteMethod = createMethod('DELETE')
  const headMethod = createMethod('HEAD')

  return {
    calls,
    responders,
    alovaInstance: {
      options: { baseURL: '' },
      Get: getMethod,
      Post: postMethod,
      Put: putMethod,
      Patch: patchMethod,
      Delete: deleteMethod,
      Head: headMethod,
    },
    reset: () => {
      calls.length = 0
      responders.length = 0
      getMethod.mockClear()
      postMethod.mockClear()
      putMethod.mockClear()
      patchMethod.mockClear()
      deleteMethod.mockClear()
      headMethod.mockClear()
    },
  }
})

const authMocks = vi.hoisted(() => ({
  token: 'boundary-token',
  notifyUnauthorized: vi.fn(() => Promise.resolve()),
}))

vi.mock('./instance', () => ({
  alovaInstance: httpMocks.alovaInstance,
}))

vi.mock('@/constants/router', () => Object.fromEntries([['AUTH_ENABLED', true]]))

vi.mock('@/infra/auth/tokenProvider', () => ({
  readAuthToken: () => authMocks.token,
  notifyUnauthorized: () => authMocks.notifyUnauthorized(),
}))

vi.mock('@/locales', () => ({
  t: (key: string, params?: Record<string, unknown>) =>
    params ? `${key}:${JSON.stringify(params)}` : key,
}))

vi.mock('@/utils/safeStorage', () => ({
  decryptAndDecompressSync: vi.fn((value: string) => (value === 'encrypted' ? 'decrypted' : null)),
  compressAndEncryptSync: vi.fn((value: unknown) => (value ? 'encrypted' : null)),
}))

vi.mock('@/adapters/logger.adapter', () => ({
  appLogger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}))

let methodsModule: Promise<typeof import('./methods')> | undefined
let interceptorsModule: Promise<typeof import('./interceptors')> | undefined

function loadMethods(): Promise<typeof import('./methods')> {
  methodsModule ??= import('./methods')
  return methodsModule
}

function loadInterceptors(): Promise<typeof import('./interceptors')> {
  interceptorsModule ??= import('./interceptors')
  return interceptorsModule
}

function latestCall(): CapturedAlovaCall {
  const call = httpMocks.calls.at(-1)
  if (!call) {
    throw new Error('Expected an alova call to be captured')
  }
  return call
}

function callsFor(method: string, url: string): CapturedAlovaCall[] {
  return httpMocks.calls.filter(call => call.method === method && call.url === url)
}

function createDeferred<T>() {
  let resolveFn: ((value: T) => void) | undefined
  const promise = new Promise<T>(resolve => {
    resolveFn = resolve
  })

  return {
    promise,
    resolve: (value: T) => {
      if (!resolveFn) {
        throw new Error('Deferred promise resolver is missing')
      }
      resolveFn(value)
    },
  }
}

function createResponseMethod(config: Record<string, unknown> = {}): Method {
  return castValue<Method>({
    type: 'GET',
    url: '/request-layer',
    config,
    data: undefined,
  })
}

function collectSourceFiles(root: string): string[] {
  const entries = fs.readdirSync(root, { withFileTypes: true })
  return entries.flatMap(entry => {
    const absolutePath = path.join(root, entry.name)
    if (entry.isDirectory()) {
      return collectSourceFiles(absolutePath)
    }
    if (!entry.name.endsWith('.ts') || entry.name.endsWith('.spec.ts')) {
      return []
    }
    return [absolutePath]
  })
}

beforeEach(async () => {
  vi.useRealTimers()
  httpMocks.reset()
  authMocks.token = 'boundary-token'
  authMocks.notifyUnauthorized.mockClear()
  const { clearCache, clearRequests } = await loadMethods()
  clearCache()
  clearRequests()
})

afterEach(async () => {
  const { clearCache, clearRequests } = await loadMethods()
  clearRequests()
  clearCache()
  vi.useRealTimers()
})

describe('request config mapping', () => {
  it('strips request-manager-only fields while preserving alova boundary fields', async () => {
    const { get } = await loadMethods()
    const responseSchema = z.object({ id: z.string() })
    httpMocks.responders.push(() => Promise.resolve({ id: 'cfg-1' }))

    await expect(
      get('/config-map', {
        headers: { Accept: 'application/json' },
        params: { q: 'ccd' },
        timeout: 5000,
        responseSchema,
        enableCache: false,
        cacheTTL: 100,
        retry: { retries: 2, retryDelay: 0 },
        cancelStrategy: 'cancelPrevious',
      })
    ).resolves.toEqual({ id: 'cfg-1' })

    const call = latestCall()
    expect(call.config.headers).toEqual({ Accept: 'application/json' })
    expect(call.config.params).toEqual({ q: 'ccd' })
    expect(call.config.timeout).toBe(5000)
    expect(call.config.responseSchema).toBe(responseSchema)
    expect(call.config.signal).toBeInstanceOf(AbortSignal)
    expect(call.config).not.toHaveProperty('enableCache')
    expect(call.config).not.toHaveProperty('cacheTTL')
    expect(call.config).not.toHaveProperty('retry')
    expect(call.config).not.toHaveProperty('cancelStrategy')
  })
})

describe('response unwrap and schema boundary', () => {
  it('unwraps ApiResponse data before schema validation reaches callers', async () => {
    const { responseHandler } = await loadInterceptors()
    const schema = z.object({ id: z.string() })
    const response = new Response(
      JSON.stringify({ success: true, data: { id: 'route-1', ignored: true } }),
      { headers: { 'content-type': 'application/json' } }
    )

    await expect(
      responseHandler(response, createResponseMethod({ responseSchema: schema }))
    ).resolves.toEqual({
      id: 'route-1',
    })
  })

  it('stops invalid unwrapped data at the HTTP schema boundary', async () => {
    const { responseHandler } = await loadInterceptors()
    const schema = z.object({ id: z.string() })
    const response = new Response(JSON.stringify({ success: true, data: { id: 42 } }), {
      headers: { 'content-type': 'application/json' },
    })

    await expect(
      responseHandler(response, createResponseMethod({ responseSchema: schema }))
    ).rejects.toSatisfy((error: unknown) => {
      if (!isHttpRequestError(error)) return false
      return error.type === ErrorType.VALIDATION
    })
  })
})

describe('error and retry policy boundaries', () => {
  it('maps 403 to auth classification without retry and 503 to retryable server policy', async () => {
    const { resolveHttpErrorPolicy } = await import('./policies/errorMappingPolicy')

    const forbidden = resolveHttpErrorPolicy(403, { message: 'Forbidden' })
    expect(forbidden.errorType).toBe(ErrorType.AUTH)
    expect(forbidden.retryable).toBe(false)

    const unavailable = resolveHttpErrorPolicy(503, { message: 'Unavailable' })
    expect(unavailable.errorType).toBe(ErrorType.SERVER)
    expect(unavailable.retryable).toBe(true)
  })

  it('retries retryable network errors only within the configured budget', async () => {
    const { get } = await loadMethods()
    httpMocks.responders.push(
      () => Promise.reject(new HttpRequestError('offline', ErrorType.NETWORK)),
      () => Promise.reject(new HttpRequestError('offline', ErrorType.NETWORK)),
      () => Promise.resolve({ recovered: true })
    )

    await expect(
      get('/retry-boundary', {
        enableCache: false,
        retry: { retries: 2, retryDelay: 0 },
      })
    ).resolves.toEqual({ recovered: true })

    expect(callsFor('GET', '/retry-boundary')).toHaveLength(3)
  })

  it('keeps non-transient request errors outside the retry boundary', () => {
    const nonRetryableErrors = [
      new HttpRequestError('auth', ErrorType.AUTH, 401),
      new HttpRequestError('client', ErrorType.CLIENT, 400),
      new HttpRequestError('validation', ErrorType.VALIDATION),
      new HttpRequestError('security', ErrorType.SECURITY),
    ]

    nonRetryableErrors.forEach(error => {
      expect(isRetryableError(error)).toBe(false)
    })
  })
})

describe('deduplication and cancellation policy', () => {
  it('deduplicates identical in-flight GET requests by request key', async () => {
    const { get } = await loadMethods()
    const gate = createDeferred<{ ok: boolean }>()
    httpMocks.responders.push(() => gate.promise)

    const first = get<{ ok: boolean }>('/dedupe', { enableCache: false, deduplicate: true })
    const second = get<{ ok: boolean }>('/dedupe', { enableCache: false, deduplicate: true })

    await Promise.resolve()
    expect(callsFor('GET', '/dedupe')).toHaveLength(1)
    gate.resolve({ ok: true })
    await expect(Promise.all([first, second])).resolves.toEqual([{ ok: true }, { ok: true }])
  })

  it('aborts the previous matching request when cancelPrevious is selected', async () => {
    const { get } = await loadMethods()
    const previousAbortSeen = createDeferred<boolean>()

    httpMocks.responders.push(
      call =>
        new Promise(resolve => {
          const signal = call.config.signal
          if (!(signal instanceof AbortSignal)) {
            throw new Error('Expected request manager to inject an AbortSignal')
          }
          signal.addEventListener(
            'abort',
            () => {
              previousAbortSeen.resolve(signal.aborted)
              resolve({ aborted: true })
            },
            { once: true }
          )
        }),
      () => Promise.resolve({ current: true })
    )

    const previous = get('/cancel-previous', {
      enableCache: false,
      cancelStrategy: 'cancelPrevious',
    })
    await Promise.resolve()
    const current = get('/cancel-previous', {
      enableCache: false,
      cancelStrategy: 'cancelPrevious',
    })

    await expect(previousAbortSeen.promise).resolves.toBe(true)
    await expect(previous).resolves.toEqual({ aborted: true })
    await expect(current).resolves.toEqual({ current: true })
    expect(callsFor('GET', '/cancel-previous')).toHaveLength(2)
  })
})

describe('auth bridge and coupling boundaries', () => {
  it('injects and clears auth headers only through the token provider bridge', async () => {
    const { beforeRequest } = await loadInterceptors()
    const method = createResponseMethod({ headers: {} })

    beforeRequest(method)
    expect(method.config.headers).toEqual({ Authorization: 'Bearer boundary-token' })

    authMocks.token = ''
    method.config.headers = { Authorization: 'Bearer stale-token' }
    beforeRequest(method)
    expect(method.config.headers).toEqual({})
  })

  it('keeps HTTP, adapter, and API source files decoupled from router, store, and session storage', () => {
    const repoRoot = process.cwd()
    const sourceFiles = [
      ...collectSourceFiles(path.join(repoRoot, 'apps/web-demo/src/utils/http')),
      path.join(repoRoot, 'apps/web-demo/src/adapters/http.adapter.ts'),
      ...collectSourceFiles(path.join(repoRoot, 'apps/web-demo/src/api')),
    ]
    const violations = sourceFiles.flatMap(file => {
      const source = fs.readFileSync(file, 'utf8')
      const relative = path.relative(repoRoot, file)
      const checks = [
        { label: 'router import', pattern: /from\s+['"](?:@\/router(?:\/|['"])|vue-router['"])/ },
        { label: 'store import', pattern: /from\s+['"](?:@\/stores(?:\/|['"])|pinia['"])/ },
        { label: 'session storage', pattern: /\b(?:localStorage|sessionStorage)\b/ },
      ]
      return checks
        .filter(check => check.pattern.test(source))
        .map(check => `${relative}: ${check.label}`)
    })

    expect(violations).toEqual([])
  })
})
