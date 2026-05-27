import { afterEach, describe, expect, it, vi } from 'vitest'

import { fadeOutNativePreloader } from './preloader'

describe('fadeOutNativePreloader DOM regression', () => {
  afterEach(() => {
    vi.useRealTimers()
    document.body.innerHTML = ''
    document.documentElement.removeAttribute('data-app-ready')
    document.documentElement.removeAttribute('data-runtime-loading')
    document.documentElement.removeAttribute('data-preloader-state')
  })

  it('marks the document ready and removes the native preloader from the DOM', () => {
    vi.useFakeTimers()
    document.body.innerHTML = '<div id="preloader-bg"></div>'

    fadeOutNativePreloader({ removeDelayMs: 25 })

    const preloader = document.getElementById('preloader-bg')
    expect(document.documentElement.dataset.appReady).toBe('true')
    expect(document.documentElement.dataset.runtimeLoading).toBe('false')
    expect(document.documentElement.dataset.preloaderState).toBe('hidden')
    expect(preloader?.classList.contains('preloader-fade-out')).toBe(true)

    vi.advanceTimersByTime(25)

    expect(document.getElementById('preloader-bg')).toBeNull()
  })
})
