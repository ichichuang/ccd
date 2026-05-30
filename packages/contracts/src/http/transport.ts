import type { HttpQuery, HttpRequestConfig } from './request'
import type { HttpResponseEnvelope, HttpResponseMetadata } from './response'

export type HttpTransportRequest<
  TBody = unknown,
  TQuery = HttpQuery,
  TMetadata = unknown,
> = HttpRequestConfig<TBody, TQuery, TMetadata>

export type HttpTransportResponse<
  TData = unknown,
  TMetadata = HttpResponseMetadata,
> = HttpResponseEnvelope<TData, TMetadata>

export interface HttpTransportClient {
  request<TData = unknown, TBody = unknown, TQuery = HttpQuery, TMetadata = unknown>(
    request: HttpTransportRequest<TBody, TQuery, TMetadata>
  ): Promise<HttpTransportResponse<TData>>
}
