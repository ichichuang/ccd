import type { HttpAuthPolicy } from './auth'
import type { HttpRetryPolicy } from './retry'
import type { HttpTimeoutPolicy } from './timeout'

export type HttpRequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS'

export type HttpHeaderValue = string

export type HttpHeaders = Readonly<Record<string, HttpHeaderValue>>

export type HttpQueryPrimitive = string | number | boolean | null | undefined

export type HttpQueryValue = HttpQueryPrimitive | readonly HttpQueryPrimitive[]

export type HttpQuery = Readonly<Record<string, HttpQueryValue>>

export type HttpRequestBody = unknown

export interface HttpRequestConfig<
  TBody = HttpRequestBody,
  TQuery = HttpQuery,
  TMetadata = unknown,
> {
  readonly method: HttpRequestMethod
  readonly url: string
  readonly headers?: HttpHeaders
  readonly query?: TQuery
  readonly body?: TBody
  readonly retry?: HttpRetryPolicy
  readonly timeout?: HttpTimeoutPolicy
  readonly auth?: HttpAuthPolicy
  readonly metadata?: TMetadata
}
