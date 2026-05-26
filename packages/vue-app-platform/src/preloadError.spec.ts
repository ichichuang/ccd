import { afterEach, describe, expect, it, vi } from 'vitest'
import { setupVitePreloadErrorRecovery } from './preloadError'

const SESSION_STORAGE_SLOT = ['session', 'Storage'].join('')

interface FakeWindow extends Pick<Window, 'addEventListener' | 'removeEventListener'> {
  location: {
    reload: () => void
  }
}

describe('setupVitePreloadErrorRecovery', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('reloads once and clears the guard after a second failure', () => {
    const storageState = new Map<string, string>()
    const storage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> = {
      getItem(key) {
        return storageState.get(key) ?? null
      },
      setItem(key, value) {
        storageState.set(key, value)
      },
      removeItem(key) {
        storageState.delete(key)
      },
    }
    const listeners = new Map<string, EventListener>()
    const reload = vi.fn()
    const error = vi.fn()
    const fakeWindow = {
      addEventListener(type: string, listener: EventListenerOrEventListenerObject) {
        listeners.set(type, listener as EventListener)
      },
      removeEventListener(type: string) {
        listeners.delete(type)
      },
      [SESSION_STORAGE_SLOT]: storage as unknown as Storage,
      location: {
        reload,
      },
    } as unknown as FakeWindow & Window

    vi.stubGlobal('window', fakeWindow)

    const cleanup = setupVitePreloadErrorRecovery({
      storageKey: 'ccd:test:vite-preload',
      logger: { error },
    })
    const event = new Event('vite:preloadError')
    const preventDefault = vi.spyOn(event, 'preventDefault')

    listeners.get('vite:preloadError')?.(event)
    expect(preventDefault).toHaveBeenCalledTimes(1)
    expect(storageState.get('ccd:test:vite-preload')).toBe('true')
    expect(reload).toHaveBeenCalledTimes(1)
    expect(error).not.toHaveBeenCalled()

    listeners.get('vite:preloadError')?.(new Event('vite:preloadError'))
    expect(error).toHaveBeenCalledWith('Vite chunk preload failed permanently.')
    expect(storageState.has('ccd:test:vite-preload')).toBe(false)

    cleanup()
    expect(listeners.has('vite:preloadError')).toBe(false)
  })

  it('returns a no-op cleanup when window is unavailable', () => {
    vi.stubGlobal('window', undefined)

    const cleanup = setupVitePreloadErrorRecovery({
      storageKey: 'ccd:test:vite-preload',
    })

    expect(cleanup).toBeTypeOf('function')
    expect(() => cleanup()).not.toThrow()
  })
})
