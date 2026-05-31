// @vitest-environment jsdom

import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { emitterMock } = vi.hoisted(() => ({
  emitterMock: {
    emit: vi.fn(),
    off: vi.fn(),
    on: vi.fn(),
  },
}))

vi.mock('@/utils/mitt', () => ({
  default: emitterMock,
}))

function createHarness(run: () => void) {
  return {
    name: 'UseAutoMittHarness',
    setup() {
      run()
      return () => null
    },
  }
}

describe('useAutoMitt app facade', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('binds the app event map emitter and keeps package-owned auto cleanup', async () => {
    const { useAutoMitt } = await import('./useAutoMitt')
    const resizeHandler = vi.fn<(event: { width: number; height: number }) => void>()

    const wrapper = mount(
      createHarness(() => {
        const mitt = useAutoMitt()
        mitt.on('windowResize', resizeHandler)
        mitt.emit('windowResize', { width: 1440, height: 900 })
      })
    )

    expect(emitterMock.on).toHaveBeenCalledTimes(1)
    expect(emitterMock.on).toHaveBeenCalledWith('windowResize', resizeHandler)
    expect(emitterMock.emit).toHaveBeenCalledTimes(1)
    expect(emitterMock.emit).toHaveBeenCalledWith('windowResize', { width: 1440, height: 900 })

    wrapper.unmount()

    expect(emitterMock.off).toHaveBeenCalledTimes(1)
    expect(emitterMock.off).toHaveBeenCalledWith('windowResize', resizeHandler)
  })
})
