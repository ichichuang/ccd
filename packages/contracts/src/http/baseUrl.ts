export type HttpBaseUrlMode = 'relative' | 'absolute' | 'environment' | 'runtime'

export type HttpCredentialPolicy = 'omit' | 'same-origin' | 'include'

export interface HttpBaseUrlPolicy {
  readonly mode: HttpBaseUrlMode
  readonly value: string
  readonly developmentProxyPath?: string
  readonly allowedOrigins?: readonly string[]
  readonly credentials?: HttpCredentialPolicy
}
