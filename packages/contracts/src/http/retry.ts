import type { HttpErrorKind } from './error'

export type HttpRetryBackoffStrategy = 'none' | 'fixed' | 'linear' | 'exponential'

export type HttpRetryJitterStrategy = 'none' | 'full' | 'equal'

export type HttpRetryTrigger = HttpErrorKind | number

export interface HttpRetryPolicy {
  readonly maxAttempts: number
  readonly backoff?: HttpRetryBackoffStrategy
  readonly delayMs?: number
  readonly maxDelayMs?: number
  readonly jitter?: HttpRetryJitterStrategy
  readonly retryOn?: readonly HttpRetryTrigger[]
}
