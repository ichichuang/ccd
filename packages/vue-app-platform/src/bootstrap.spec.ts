import { afterEach, describe, expect, it, vi } from 'vitest'
import { markAppBootstrapping, markAppReady, waitForStablePaint } from './bootstrap'

describe('bootstrap helpers', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('waits for two animation frames when requestAnimationFrame is available', async () => {
    const callbacks: FrameRequestCallback[] = []
    let resolved = false

    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      callbacks.push(callback)
      return callbacks.length
    })

    const promise = waitForStablePaint().then(() => {
      resolved = true
    })

    expect(callbacks).toHaveLength(1)
    callbacks.shift()?.(0)
    expect(resolved).toBe(false)
    expect(callbacks).toHaveLength(1)

    callbacks.shift()?.(16)
    await promise
    expect(resolved).toBe(true)
  })

  it('falls back when requestAnimationFrame is unavailable', async () => {
    vi.stubGlobal('requestAnimationFrame', undefined)
    await expect(waitForStablePaint()).resolves.toBeUndefined()
  })

  it('marks app bootstrapping and ready states on the document element', () => {
    const documentStub = {
      documentElement: {
        dataset: {} as DOMStringMap,
      },
    } as unknown as Document

    markAppBootstrapping(documentStub)
    expect(documentStub.documentElement.dataset.appReady).toBe('false')
    expect(documentStub.documentElement.dataset.runtimeLoading).toBe('true')

    markAppReady(documentStub)
    expect(documentStub.documentElement.dataset.appReady).toBe('true')
    expect(documentStub.documentElement.dataset.runtimeLoading).toBe('false')
  })
})
