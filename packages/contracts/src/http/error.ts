export type HttpErrorKind =
  | 'network'
  | 'timeout'
  | 'cancelled'
  | 'auth'
  | 'client'
  | 'server'
  | 'validation'
  | 'security'
  | 'unknown'

export interface HttpRequestErrorShape<TDetails = unknown, TCause = unknown> {
  readonly kind: HttpErrorKind
  readonly message: string
  readonly status?: number
  readonly code?: string
  readonly requestId?: string
  readonly retryable?: boolean
  readonly details?: TDetails
  readonly cause?: TCause
}
