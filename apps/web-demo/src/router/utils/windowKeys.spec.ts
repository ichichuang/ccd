import { describe, expect, it } from 'vitest'
import {
  generateRouteWindowKey,
  getRouteWindowKeyFromLocation,
  getRouteWindowKeyFromUrl,
} from './windowKeys'

describe('route window keys', () => {
  it('uses the same key for undefined and empty query objects', () => {
    expect(generateRouteWindowKey('Dashboard')).toBe(generateRouteWindowKey('Dashboard', {}))
  })

  it('reads _windowKey from history-mode search params', () => {
    expect(
      getRouteWindowKeyFromLocation({
        search: '?_windowKey=history-key',
        hash: '',
      })
    ).toBe('history-key')
  })

  it('reads _windowKey from hash-mode route query params', () => {
    expect(
      getRouteWindowKeyFromLocation({
        search: '',
        hash: '#/architecture/governance?foo=bar&_windowKey=hash-key',
      })
    ).toBe('hash-key')
  })

  it('reads hash-mode _windowKey from stored window URLs', () => {
    expect(getRouteWindowKeyFromUrl('http://localhost/#/dashboard?_windowKey=stored-key')).toBe(
      'stored-key'
    )
  })
})
