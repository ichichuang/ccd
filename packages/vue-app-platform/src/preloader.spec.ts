import { afterEach, describe, expect, it, vi } from 'vitest'
import { fadeOutNativePreloader } from './preloader'

describe('fadeOutNativePreloader', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('marks the app ready and removes the preloader after the delay', () => {
    vi.useFakeTimers()

    const addedClasses: string[] = []
    let removed = false
    const element = {
      classList: {
        add(className: string) {
          addedClasses.push(className)
        },
      },
      remove() {
        removed = true
      },
    } as unknown as HTMLElement

    const documentStub = {
      documentElement: {
        dataset: {} as DOMStringMap,
      },
      getElementById(id: string) {
        return id === 'preloader-bg' ? element : null
      },
    } as unknown as Document

    fadeOutNativePreloader({
      document: documentStub,
      removeDelayMs: 400,
    })

    expect(documentStub.documentElement.dataset.appReady).toBe('true')
    expect(documentStub.documentElement.dataset.runtimeLoading).toBe('false')
    expect(documentStub.documentElement.dataset.preloaderState).toBe('hidden')
    expect(addedClasses).toEqual(['preloader-fade-out'])
    expect(removed).toBe(false)

    vi.advanceTimersByTime(400)
    expect(removed).toBe(true)
  })

  it('tolerates missing preloader elements and optional ready marking', () => {
    const documentStub = {
      documentElement: {
        dataset: {
          appReady: 'false',
          runtimeLoading: 'true',
        } as DOMStringMap,
      },
      getElementById() {
        return null
      },
    } as unknown as Document

    fadeOutNativePreloader({
      document: documentStub,
      markReady: false,
    })

    expect(documentStub.documentElement.dataset.appReady).toBe('false')
    expect(documentStub.documentElement.dataset.runtimeLoading).toBe('true')
    expect(documentStub.documentElement.dataset.preloaderState).toBe('hidden')
  })
})
