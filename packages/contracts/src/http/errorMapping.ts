import type { HttpErrorKind } from './error'

export type HttpErrorNotificationPolicy = 'default' | 'silent'

export interface HttpStatusRange {
  readonly min: number
  readonly max: number
}

export interface HttpStatusErrorMapping {
  readonly status: number
  readonly kind: HttpErrorKind
  readonly retryable?: boolean
}

export interface HttpNormalizedErrorMapping {
  readonly kind: HttpErrorKind
  readonly message: string
  readonly retryable: boolean
  readonly status?: number
  readonly statusMessage?: string
  readonly code?: string
  readonly notification?: HttpErrorNotificationPolicy
}

export interface HttpErrorMappingPolicy {
  readonly defaultKind: HttpErrorKind
  readonly statusMappings?: readonly HttpStatusErrorMapping[]
  readonly retryableStatusRanges?: readonly HttpStatusRange[]
  readonly notification?: HttpErrorNotificationPolicy
}
