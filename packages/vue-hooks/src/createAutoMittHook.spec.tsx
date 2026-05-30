// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createAutoMittHook } from './createAutoMittHook'

type TestEvents = {
  ping: { id: number }
  text: string
}

type AutoMittHarnessRun = () => void

function createAutoMittHarness(run: AutoMittHarnessRun) {
  return {
    name: 'AutoMittHarness',
    setup() {
      run()
      return () => <div />
    },
  }
}

describe('createAutoMittHook', () => {
  it('subscribes with emitter.on and unsubscribes on unmount', async () => {
    const emitter = {
      on: vi.fn(),
      off: vi.fn(),
    }

    const useAutoMitt = createAutoMittHook<TestEvents>(emitter)
    const pingHandler = vi.fn<(event: { id: number }) => void>()
    const textHandler = vi.fn<(event: string) => void>()

    const wrapper = mount(
      createAutoMittHarness(() => {
        const hook = useAutoMitt()
        hook.on('ping', pingHandler)
        hook.on('text', textHandler)
      })
    )

    expect(emitter.on).toHaveBeenCalledTimes(2)
    expect(emitter.on).toHaveBeenNthCalledWith(1, 'ping', pingHandler)
    expect(emitter.on).toHaveBeenNthCalledWith(2, 'text', textHandler)

    wrapper.unmount()

    expect(emitter.off).toHaveBeenCalledTimes(2)
    expect(emitter.off).toHaveBeenNthCalledWith(1, 'ping', pingHandler)
    expect(emitter.off).toHaveBeenNthCalledWith(2, 'text', textHandler)
  })

  it('calls emitter.off directly when off is invoked', async () => {
    const emitter = {
      on: vi.fn(),
      off: vi.fn(),
    }

    const useAutoMitt = createAutoMittHook<TestEvents>(emitter)
    const pingHandler = vi.fn<(event: { id: number }) => void>()
    const wrapper = mount(
      createAutoMittHarness(() => {
        const hook = useAutoMitt()
        hook.off('ping', pingHandler)
        hook.off('ping')
      })
    )

    expect(emitter.off).toHaveBeenCalledTimes(2)
    expect(emitter.off).toHaveBeenNthCalledWith(1, 'ping', pingHandler)
    expect(emitter.off).toHaveBeenNthCalledWith(2, 'ping', undefined)

    wrapper.unmount()
  })
})
