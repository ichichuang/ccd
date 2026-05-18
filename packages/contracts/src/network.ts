export interface NetworkRequest {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  url: string
  headers?: Readonly<Record<string, string>>
  body?: unknown
}

export interface NetworkResponse<T = unknown> {
  status: number
  data: T
  headers: Readonly<Record<string, string>>
}

export interface NetworkClient {
  request<T = unknown>(request: NetworkRequest): Promise<NetworkResponse<T>>
}
