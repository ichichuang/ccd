// @vitest-environment jsdom

import type {
  NetworkClient,
  NetworkRequest,
  RuntimeCapabilities,
  SafeStorageAdapter,
} from '@ccd/contracts'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createBrowserRuntimeCapabilities } from './runtime.adapter'

let networkRequests: NetworkRequest[] = []

const network: NetworkClient = {
  async request<T = unknown>(request: NetworkRequest) {
    networkRequests.push(request)
    return {
      status: 200,
      data: { url: request.url } as T,
      headers: {},
    }
  },
}

function createRuntime(): RuntimeCapabilities {
  return createBrowserRuntimeCapabilities({ network })
}

describe('createBrowserRuntimeCapabilities', () => {
  beforeEach(() => {
    window.localStorage.clear()
    networkRequests = []
  })

  it('conforms to the shared browser runtime capability contract', async () => {
    const runtime = createRuntime()

    expect(runtime.descriptor).toMatchObject({
      kind: 'browser',
      platform: 'web',
      name: 'web-demo',
    })
    const storage = runtime.storage as SafeStorageAdapter
    expect(storage.policy).toMatchObject({
      scope: 'local',
      compression: 'lz-string',
      obfuscation: 'client-visible',
      integrity: 'hmac',
    })
    expect(typeof runtime.logger.warn).toBe('function')
    expect(typeof runtime.externalNavigation?.openExternal).toBe('function')
    expect(typeof runtime.shell?.openExternal).toBe('function')
    expect(typeof runtime.clipboard?.readText).toBe('function')
    expect(typeof runtime.notifications?.notify).toBe('function')

    await runtime.storage.set('runtime:test', 'ok')
    await expect(runtime.storage.get('runtime:test')).resolves.toBe('ok')
    await runtime.storage.remove('runtime:test')
    await expect(runtime.storage.get('runtime:test')).resolves.toBeNull()

    await expect(
      runtime.network.request<{ url: string }>({ method: 'GET', url: '/health' })
    ).resolves.toEqual({
      status: 200,
      data: { url: '/health' },
      headers: {},
    })
    expect(networkRequests).toEqual([{ method: 'GET', url: '/health' }])
  })

  it('delegates external navigation through the browser boundary', async () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)
    const runtime = createRuntime()

    await runtime.externalNavigation?.openExternal('https://example.test')

    expect(openSpy).toHaveBeenCalledWith('https://example.test', '_blank', 'noopener,noreferrer')
  })

  it('delegates clipboard access through the browser boundary', async () => {
    const clipboard = {
      readText: vi.fn(async () => 'copied'),
      writeText: vi.fn(async () => undefined),
    }
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: clipboard,
    })
    const runtime = createRuntime()

    await expect(runtime.clipboard?.readText()).resolves.toBe('copied')
    await runtime.clipboard?.writeText('next')

    expect(clipboard.writeText).toHaveBeenCalledWith('next')
  })
})
