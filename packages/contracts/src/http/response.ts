import type { HttpHeaders } from './request'

export interface BackendApiResponseEnvelope<TData = unknown> {
  readonly code: number
  readonly message: string
  readonly data: TData
}

export interface HttpResponseMetadata {
  readonly status: number
  readonly statusText?: string
  readonly headers?: HttpHeaders
  readonly requestId?: string
  readonly durationMs?: number
}

export interface HttpResponseEnvelope<TData = unknown, TMetadata = HttpResponseMetadata> {
  readonly data: TData
  readonly metadata: TMetadata
}
