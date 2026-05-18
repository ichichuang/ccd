import { beforeEach, describe, expect, it, vi } from 'vitest'
import { registerSync, resetSyncRegistryForTest } from './registry'
import {
  handleRemoteMessage,
  registerSyncMiddleware,
  resetSyncMiddlewaresForTest,
} from './middleware'
import { syncAction } from './syncAction'

describe('syncAction explicit registry boundary', () => {
  beforeEach(() => {
    resetSyncRegistryForTest()
    resetSyncMiddlewaresForTest()
  })

  it('ignores unregistered sync types', () => {
    const middleware = vi.fn()
    registerSyncMiddleware(middleware)

    syncAction('missing:update', { value: 1 })

    expect(middleware).not.toHaveBeenCalled()
  })

  it('runs middleware for registered local sync actions', () => {
    const middleware = vi.fn((_ctx, next) => next())
    registerSync('theme:update', vi.fn())
    registerSyncMiddleware(middleware)

    syncAction('theme:update', { value: 1 })

    expect(middleware).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'theme:update',
        payload: { value: 1 },
        source: 'local',
      }),
      expect.any(Function)
    )
  })

  it('uses the registered handler after remote middleware completes', () => {
    const handler = vi.fn()
    registerSync('theme:update', handler)
    registerSyncMiddleware((_ctx, next) => next())

    handleRemoteMessage({
      type: 'theme:update',
      payload: { value: 1 },
      clientId: 'remote-client',
      timestamp: 1,
    })

    expect(handler).toHaveBeenCalledWith({ value: 1 }, 'remote')
  })
})
