import { beforeEach, describe, expect, it } from 'vitest'
import {
  applySyncMiddleware,
  registerSyncMiddleware,
  resetSyncMiddlewaresForTest,
  type SyncContext,
} from './middleware'

function createContext(): SyncContext {
  return {
    type: 'theme:update',
    payload: {
      theme: { mode: 'dark', theme: 'default', accentColor: null },
      size: { size: 'comfortable' },
      layout: { layout: 'vertical', collapsed: false },
      updatedAt: 1,
    },
    source: 'local',
    clientId: 'test-client',
    timestamp: 1,
  }
}

describe('system preferences sync middleware', () => {
  beforeEach(() => {
    resetSyncMiddlewaresForTest()
  })

  it('runs registered middlewares in order', () => {
    const calls: string[] = []

    registerSyncMiddleware((_ctx, next) => {
      calls.push('a:before')
      next()
      calls.push('a:after')
    })
    registerSyncMiddleware((_ctx, next) => {
      calls.push('b:before')
      next()
      calls.push('b:after')
    })

    applySyncMiddleware(createContext())

    expect(calls).toEqual(['a:before', 'b:before', 'b:after', 'a:after'])
  })

  it('does not allow a middleware to dispatch the same next index twice', () => {
    const calls: string[] = []

    registerSyncMiddleware((_ctx, next) => {
      calls.push('first')
      next()
      next()
    })
    registerSyncMiddleware(() => {
      calls.push('second')
    })

    applySyncMiddleware(createContext())

    expect(calls).toEqual(['first', 'second'])
  })
})
