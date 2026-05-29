import { t } from '@/locales'
import { appLogger } from '@/adapters/logger.adapter'
import { notifyUnauthorized } from '@/infra/auth/tokenProvider'
import type { Method } from 'alova'
import { ErrorType, HttpRequestError } from '../errors'

export type RefreshTokenExecutor = () => Promise<string>

interface RefreshQueueItem {
  resolve: (token: string) => void
  reject: (error: Error) => void
}

let refreshTokenExecutor: RefreshTokenExecutor | null = null

export const REFRESH_ENDPOINT = '/auth/refresh'
const RETRIED_AFTER_REFRESH_FLAG = '__retriedAfterRefresh'

export function setRefreshTokenExecutor(executor: RefreshTokenExecutor): void {
  refreshTokenExecutor = executor
}

export function isRefreshEndpoint(url: string): boolean {
  return url.includes(REFRESH_ENDPOINT)
}

/**
 * Fallback token refresh executor using raw `fetch`.
 *
 * INFRASTRUCTURE EXCEPTION: this intentionally bypasses the request
 * interceptors to avoid recursively entering the 401 refresh pipeline.
 */
async function defaultRefreshTokenExecutor(): Promise<string> {
  const response = await fetch(REFRESH_ENDPOINT, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  })

  if (!response.ok) {
    throw new Error(`refresh failed: HTTP ${response.status}`)
  }

  const payload = (await response.json()) as {
    token?: string
    data?: { token?: string }
    message?: string
  } | null
  const token = payload?.data?.token ?? payload?.token

  if (!token || !String(token).trim()) {
    throw new Error(payload?.message || 'refresh token missing in response')
  }

  return token
}

class TokenRefreshCoordinator {
  private isRefreshing = false
  private refreshPromise: Promise<string> | null = null
  private requestsQueue: RefreshQueueItem[] = []
  private unauthorizedNotified = false

  private enqueue(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.requestsQueue.push({ resolve, reject })
    })
  }

  private flushSuccess(token: string): void {
    const queue = [...this.requestsQueue]
    this.requestsQueue = []
    queue.forEach(({ resolve }) => resolve(token))
  }

  private flushFailure(error: Error): void {
    const queue = [...this.requestsQueue]
    this.requestsQueue = []
    queue.forEach(({ reject }) => reject(error))
  }

  private notifyUnauthorizedOnce(): void {
    if (this.unauthorizedNotified) {
      return
    }

    this.unauthorizedNotified = true
    try {
      void notifyUnauthorized().catch(error => {
        appLogger.error('[HTTP] Unauthorized handler failed:', error)
      })
    } finally {
      queueMicrotask(() => {
        this.unauthorizedNotified = false
      })
    }
  }

  private async runRefresh(): Promise<string> {
    const executor = refreshTokenExecutor ?? defaultRefreshTokenExecutor
    return executor()
  }

  async acquireFreshToken(): Promise<string> {
    if (this.isRefreshing && this.refreshPromise) {
      return this.enqueue()
    }

    this.isRefreshing = true
    this.refreshPromise = this.runRefresh()

    try {
      const token = await this.refreshPromise
      this.flushSuccess(token)
      return token
    } catch (error) {
      const normalizedError = error instanceof Error ? error : new Error('refresh failed')
      this.flushFailure(normalizedError)
      this.notifyUnauthorizedOnce()
      throw normalizedError
    } finally {
      this.isRefreshing = false
      this.refreshPromise = null
    }
  }
}

const tokenRefreshCoordinator = new TokenRefreshCoordinator()

function getMethodConfigRecord(method: Method): Record<string, unknown> {
  return method.config as Record<string, unknown>
}

export function isRetriedAfterRefresh(method: Method): boolean {
  return Boolean(getMethodConfigRecord(method)[RETRIED_AFTER_REFRESH_FLAG])
}

export function markRetriedAfterRefresh(method: Method): void {
  getMethodConfigRecord(method)[RETRIED_AFTER_REFRESH_FLAG] = true
}

export function acquireFreshToken(): Promise<string> {
  return tokenRefreshCoordinator.acquireFreshToken()
}

export function notifyUnauthorizedForHttp(): void {
  void notifyUnauthorized().catch(error => {
    appLogger.error('[HTTP] Unauthorized handler failed:', error)
  })
}

export function createUnauthorizedHttpError(): HttpRequestError {
  return new HttpRequestError(
    t('http.error.unauthorized'),
    ErrorType.AUTH,
    401,
    'Unauthorized',
    undefined,
    false
  )
}
