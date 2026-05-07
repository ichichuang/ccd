// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest'

interface Deferred<T> {
  promise: Promise<T>
  resolve: (value: T | PromiseLike<T>) => void
  reject: (reason?: unknown) => void
}

function createDeferred<T>(): Deferred<T> {
  let resolve!: (value: T | PromiseLike<T>) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

async function setupLoading() {
  vi.resetModules()
  localStorage.clear()
  document.body.innerHTML = ''
  document.documentElement.removeAttribute('data-preloader-state')
  document.documentElement.removeAttribute('data-app-ready')

  const [{ useLoading }, { useLayoutStoreWithOut }] = await Promise.all([
    import('./useLoading'),
    import('@/stores/modules/system/layout'),
  ])
  const layoutStore = useLayoutStoreWithOut()
  layoutStore.$reset()
  layoutStore.setIsLoading(false)
  layoutStore.setIsPageLoading(false)

  return {
    layoutStore,
    loading: useLoading(),
  }
}

describe('useLoading counter semantics', () => {
  beforeEach(() => {
    vi.useRealTimers()
  })

  it('keeps global loading active until every concurrent stop handle is released', async () => {
    const { layoutStore, loading } = await setupLoading()

    const stopA = loading.startLoading()
    const stopB = loading.startLoading()

    expect(layoutStore.loadingCount).toBe(2)
    expect(layoutStore.isLoading).toBe(true)

    stopA()
    expect(layoutStore.loadingCount).toBe(1)
    expect(layoutStore.isLoading).toBe(true)

    stopA()
    expect(layoutStore.loadingCount).toBe(1)

    stopB()
    expect(layoutStore.loadingCount).toBe(0)
    expect(layoutStore.isLoading).toBe(false)
  })

  it('does not underflow when callers over-release global and page loading', async () => {
    const { layoutStore, loading } = await setupLoading()

    loading.loadingDone()
    loading.pageLoadingDone()

    expect(layoutStore.loadingCount).toBe(0)
    expect(layoutStore.pageLoadingCount).toBe(0)
    expect(layoutStore.isLoading).toBe(false)
    expect(layoutStore.isPageLoading).toBe(false)
  })

  it('releases global loading when wrapped work rejects or is cancelled by the caller', async () => {
    const { layoutStore, loading } = await setupLoading()
    const cancelled = new Error('cancelled')

    await expect(
      loading.withLoading(async () => {
        throw cancelled
      })
    ).rejects.toBe(cancelled)

    expect(layoutStore.loadingCount).toBe(0)
    expect(layoutStore.isLoading).toBe(false)
  })

  it('keeps page loading active across overlapping route-like work', async () => {
    const { layoutStore, loading } = await setupLoading()
    const first = createDeferred<string>()
    const second = createDeferred<string>()

    const firstRun = loading.withPageLoading(() => first.promise)
    const secondRun = loading.withPageLoading(() => second.promise)

    expect(layoutStore.pageLoadingCount).toBe(2)
    expect(layoutStore.isPageLoading).toBe(true)

    first.resolve('first')
    await expect(firstRun).resolves.toBe('first')
    expect(layoutStore.pageLoadingCount).toBe(1)
    expect(layoutStore.isPageLoading).toBe(true)

    second.resolve('second')
    await expect(secondRun).resolves.toBe('second')
    expect(layoutStore.pageLoadingCount).toBe(0)
    expect(layoutStore.isPageLoading).toBe(false)
  })

  it('stays balanced after an unauthorized-reset style force clear', async () => {
    const { layoutStore, loading } = await setupLoading()

    const stopA = loading.startLoading()
    const stopB = loading.startLoading()
    expect(layoutStore.loadingCount).toBe(2)

    layoutStore.setIsLoading(false)
    expect(layoutStore.loadingCount).toBe(0)
    expect(layoutStore.isLoading).toBe(false)

    stopA()
    stopB()
    expect(layoutStore.loadingCount).toBe(0)
    expect(layoutStore.isLoading).toBe(false)
  })
})
