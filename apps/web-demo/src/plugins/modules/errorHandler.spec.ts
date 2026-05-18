// @vitest-environment jsdom
/* eslint-disable vue/one-component-per-file */

import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp } from 'vue'
import { setupErrorHandler } from './errorHandler'

describe('setupErrorHandler', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('registers Vue and browser-level error handlers', () => {
    const app = createApp({ render: () => null })
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    setupErrorHandler(app)
    app.config.errorHandler?.(new Error('render failed'), null, 'render')
    window.dispatchEvent(new ErrorEvent('error', { message: 'script failed' }))

    expect(app.config.errorHandler).toBeTypeOf('function')
    expect(consoleError).toHaveBeenCalledWith(
      '[GlobalErrorHandler][VueError]',
      expect.objectContaining({ info: 'render' })
    )
    expect(consoleError).toHaveBeenCalledWith(
      '[GlobalErrorHandler][WindowError]',
      expect.any(ErrorEvent)
    )
  })

  it('mutes ResizeObserver loop noise', () => {
    const app = createApp({ render: () => null })
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const event = new ErrorEvent('error', {
      message: 'ResizeObserver loop limit exceeded',
      cancelable: true,
    })

    setupErrorHandler(app)
    window.dispatchEvent(event)

    expect(event.defaultPrevented).toBe(true)
    expect(consoleError).not.toHaveBeenCalled()
  })
})
