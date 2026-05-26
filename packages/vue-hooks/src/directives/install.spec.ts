// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'
import type { App } from 'vue'
import { installInteractionDirectives } from './install'

function createAppStub() {
  return {
    directive: vi.fn(),
  } as unknown as App
}

describe('installInteractionDirectives', () => {
  it('registers tap, swipe, and long-press by default', () => {
    const app = createAppStub()

    installInteractionDirectives(app)

    expect(app.directive).toHaveBeenCalledTimes(3)
    expect(app.directive).toHaveBeenNthCalledWith(1, 'tap', expect.any(Object))
    expect(app.directive).toHaveBeenNthCalledWith(2, 'swipe', expect.any(Object))
    expect(app.directive).toHaveBeenNthCalledWith(3, 'long-press', expect.any(Object))
  })

  it('supports disabling and renaming directives', () => {
    const app = createAppStub()

    installInteractionDirectives(app, {
      tapName: 'press',
      swipe: false,
      longPressName: 'hold',
    })

    expect(app.directive).toHaveBeenCalledTimes(2)
    expect(app.directive).toHaveBeenNthCalledWith(1, 'press', expect.any(Object))
    expect(app.directive).toHaveBeenNthCalledWith(2, 'hold', expect.any(Object))
  })
})
