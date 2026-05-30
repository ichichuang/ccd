export interface StorageAdapter {
  get(key: string): Promise<string | null>
  set(key: string, value: string): Promise<void>
  remove(key: string): Promise<void>
}

export type StorageScope = 'local' | 'session' | 'memory'

export type SafeStorageObfuscation = 'none' | 'client-visible'

export interface SafeStoragePolicy {
  readonly scope: StorageScope
  readonly namespace?: string
  readonly compression?: boolean
  readonly obfuscation: SafeStorageObfuscation
  readonly integrity?: 'none' | 'hmac'
  readonly keyVersion?: string
  readonly previousKeyVersions?: readonly string[]
}

export interface StorageCodec<T = unknown> {
  encode(value: T): string | Promise<string>
  decode(value: string): T | null | Promise<T | null>
}

export interface SyncStorageCodec<T = unknown> {
  encode(value: T): string
  decode(value: string): T | null
}

export interface SafeStorageAdapter extends StorageAdapter {
  readonly policy: SafeStoragePolicy
}
