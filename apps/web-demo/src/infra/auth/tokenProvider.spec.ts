import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  installAuthBridge,
  isAuthBridgeInstalled,
  notifyUnauthorized,
  readAuthToken,
  resetAuthBridgeForTest,
} from './tokenProvider'

describe('auth bridge', () => {
  beforeEach(() => {
    resetAuthBridgeForTest()
  })

  it('returns null token before the bridge is installed', () => {
    expect(isAuthBridgeInstalled()).toBe(false)
    expect(readAuthToken()).toBeNull()
  })

  it('fails fast when unauthorized handling is triggered before installation', async () => {
    await expect(notifyUnauthorized()).rejects.toThrow('Unauthorized handler is not installed')
  })

  it('reads token through the installed bridge', () => {
    installAuthBridge({
      readToken: () => 'token-1',
      onUnauthorized: vi.fn(),
    })

    expect(isAuthBridgeInstalled()).toBe(true)
    expect(readAuthToken()).toBe('token-1')
  })

  it('coalesces concurrent unauthorized notifications', async () => {
    let releaseHandler!: () => void
    const handler = vi.fn(
      () =>
        new Promise<void>(resolve => {
          releaseHandler = resolve
        })
    )

    installAuthBridge({
      readToken: () => 'token-1',
      onUnauthorized: handler,
    })

    const first = notifyUnauthorized()
    const second = notifyUnauthorized()

    expect(first).toBe(second)
    await Promise.resolve()
    expect(handler).toHaveBeenCalledTimes(1)

    releaseHandler()
    await first
  })

  it('throttles repeated unauthorized notifications after the first handler resolves', async () => {
    const handler = vi.fn()

    installAuthBridge({
      readToken: () => 'token-1',
      onUnauthorized: handler,
    })

    await notifyUnauthorized()
    await notifyUnauthorized()

    expect(handler).toHaveBeenCalledTimes(1)
  })
})
