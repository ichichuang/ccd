export type HttpCancellationMode = 'none' | 'manual' | 'cancelPrevious' | 'timeout'

export interface HttpCancellationPolicy {
  readonly mode: HttpCancellationMode
  readonly requestKey?: string
  readonly timeoutMs?: number
  readonly reason?: string
}
