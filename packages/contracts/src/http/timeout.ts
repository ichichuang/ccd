export type HttpTimeoutPhase = 'connect' | 'request' | 'response' | 'idle'

export interface HttpTimeoutPolicy {
  readonly requestMs?: number
  readonly connectMs?: number
  readonly responseMs?: number
  readonly idleMs?: number
}
