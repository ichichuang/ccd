import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { RequestHookConfig } from 'alova/client'
import type { AlovaGenerics } from 'alova'
import { z } from 'zod'
import { ErrorType } from '@/utils/http/errors'

type TestMiddleware = (
  context: Record<string, unknown>,
  next: () => Promise<unknown>
) => Promise<unknown>

const capturedConfigs: Array<{ middleware?: TestMiddleware }> = []
let activeLoadingCount = 0

vi.mock('@/utils/http/instance', () => ({
  alovaInstance: {},
}))

vi.mock('@/hooks/layout/useLoading', () => ({
  useLoading: () => ({
    startLoading: () => {
      activeLoadingCount += 1
      let stopped = false
      return () => {
        if (stopped) return
        stopped = true
        activeLoadingCount -= 1
      }
    },
  }),
}))

vi.mock('alova/client', async () => {
  const vue = await vi.importActual<typeof import('vue')>('vue')
  return {
    useRequest: vi.fn(
      (_method: unknown, config?: RequestHookConfig<AlovaGenerics<unknown>, unknown[]>) => {
        capturedConfigs.push({
          middleware: config?.middleware as TestMiddleware | undefined,
        })
        return {
          loading: vue.ref(false),
          data: vue.ref(undefined),
          error: vue.ref(undefined),
          send: vi.fn(),
        }
      }
    ),
  }
})

function delay<T>(ms: number, value: T, shouldReject = false): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    setTimeout(() => {
      if (shouldReject) reject(value)
      else resolve(value)
    }, ms)
  })
}

describe('useHttpRequest globalLoading middleware', () => {
  beforeEach(() => {
    vi.useRealTimers()
    capturedConfigs.length = 0
    activeLoadingCount = 0
  })

  it('keeps global loading active until the longest staggered request completes', async () => {
    const { useHttpRequest } = await import('./useHttpRequest')

    useHttpRequest(() => ({}) as never, { globalLoading: true })
    useHttpRequest(() => ({}) as never, { globalLoading: true })
    useHttpRequest(() => ({}) as never, { globalLoading: true })

    const first = capturedConfigs[0].middleware?.({}, () => delay(10, 'short'))
    const second = capturedConfigs[1].middleware?.({}, () => delay(30, 'middle'))
    const third = capturedConfigs[2].middleware?.({}, () => delay(60, 'long'))

    expect(activeLoadingCount).toBe(3)
    await delay(15, undefined)
    expect(activeLoadingCount).toBe(2)
    await delay(25, undefined)
    expect(activeLoadingCount).toBe(1)

    await expect(Promise.all([first, second, third])).resolves.toEqual(['short', 'middle', 'long'])
    expect(activeLoadingCount).toBe(0)
  })

  it('balances loading when concurrent requests mix success and failure', async () => {
    const { useHttpRequest } = await import('./useHttpRequest')

    useHttpRequest(() => ({}) as never, { globalLoading: true })
    useHttpRequest(() => ({}) as never, { globalLoading: true })

    const success = capturedConfigs[0].middleware?.({}, () => delay(20, 'ok'))
    const failure = capturedConfigs[1].middleware?.({}, () => delay(10, new Error('boom'), true))

    expect(activeLoadingCount).toBe(2)
    await expect(failure).rejects.toThrow('boom')
    expect(activeLoadingCount).toBe(1)
    await expect(success).resolves.toBe('ok')
    expect(activeLoadingCount).toBe(0)
  })

  it('rejects non-object payloads through responseSchema before exposing data', async () => {
    const { useHttpRequest } = await import('./useHttpRequest')
    const schema = z.object({
      id: z.string(),
    })

    useHttpRequest(() => ({}) as never, { responseSchema: schema })

    await expect(
      capturedConfigs[0].middleware?.({}, () => Promise.resolve('not-json'))
    ).rejects.toMatchObject({
      type: ErrorType.VALIDATION,
    })
  })
})
