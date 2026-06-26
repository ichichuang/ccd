import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DEMO_MOCK_ENABLED } from '@/constants/mock'
import { ConnectionManager } from './connection'

// Hermetic deps: keep i18n/logger init out of this unit test.
vi.mock('@/locales', () => ({ t: (key: string) => key }))
vi.mock('@/adapters/logger.adapter', () => ({
  appLogger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}))

/**
 * HEALTH-01 regression.
 *
 * In frontend-only dev / mock-disabled-backend mode the app must NOT keep
 * polling `/api/health`, which otherwise produces recurring 502 / ECONNREFUSED
 * noise against an absent backend. When backend health checking IS enabled the
 * probe must still be explicit and controlled (HEAD `/api/health`).
 */
describe('ConnectionManager health-check gating (HEALTH-01)', () => {
  let fetchMock: ReturnType<typeof vi.fn>
  const managers: ConnectionManager[] = []

  const createManager = (
    overrides?: Partial<ConstructorParameters<typeof ConnectionManager>[0]>
  ) => {
    const manager = new ConnectionManager(overrides)
    managers.push(manager)
    return manager
  }

  beforeEach(() => {
    vi.useFakeTimers()
    fetchMock = vi.fn().mockResolvedValue({ status: 200 })
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    managers.splice(0).forEach(manager => manager.destroy())
    vi.unstubAllGlobals()
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('never probes /api/health when health checking is disabled (mock / no backend)', async () => {
    const manager = createManager({
      healthCheckEnabled: false,
      healthCheckUrl: '/api/health',
      healthCheckInterval: 1000,
    })

    // Far beyond several poll intervals.
    await vi.advanceTimersByTimeAsync(60000)

    expect(fetchMock).not.toHaveBeenCalled()
    // Backend absence is treated as an expected, connected state (no false drop).
    expect(manager.getConnectionState().isConnected).toBe(navigator.onLine)
  })

  it('keeps an explicit, controlled HEAD probe when health checking is enabled (backend present)', async () => {
    createManager({
      healthCheckEnabled: true,
      healthCheckUrl: '/api/health',
      healthCheckInterval: 1000,
    })

    // The probe is interval-driven, not fired eagerly on construction.
    expect(fetchMock).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(1000)

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/health',
      expect.objectContaining({ method: 'HEAD', cache: 'no-cache' })
    )
  })

  it('defaults to the inverse of DEMO_MOCK_ENABLED so demo/dev stays quiet by default', async () => {
    createManager() // default config -> healthCheckEnabled = !DEMO_MOCK_ENABLED

    // Past one default 30s interval.
    await vi.advanceTimersByTimeAsync(35000)

    if (DEMO_MOCK_ENABLED) {
      expect(fetchMock).not.toHaveBeenCalled()
    } else {
      expect(fetchMock).toHaveBeenCalled()
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/health',
        expect.objectContaining({ method: 'HEAD' })
      )
    }
  })
})
