export type HttpAuthScheme = 'none' | 'bearer' | 'basic' | 'api-key' | 'custom'

export type HttpAuthCredentialPlacement = 'header' | 'query'

export type HttpAuthRefreshMode = 'none' | 'delegated'

export interface HttpAuthPolicy {
  readonly scheme: HttpAuthScheme
  readonly credentialName?: string
  readonly credentialPlacement?: HttpAuthCredentialPlacement
  readonly scopes?: readonly string[]
  readonly refreshMode?: HttpAuthRefreshMode
}
