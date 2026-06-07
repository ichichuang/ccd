export interface StorageAdapter {
  get(key: string): Promise<string | null>
  set(key: string, value: string): Promise<void>
  remove(key: string): Promise<void>
}

export type StorageScope = 'local' | 'session' | 'memory'

export type SafeStorageObfuscation = 'none' | 'client-visible'
export type SafeStorageCompression = 'none' | 'lz-string'
export type SafeStorageIntegrity = 'none' | 'hmac'

export interface SafeStoragePolicy {
  readonly scope: StorageScope
  readonly namespace?: string
  readonly compression?: boolean | SafeStorageCompression
  readonly obfuscation: SafeStorageObfuscation
  readonly integrity?: SafeStorageIntegrity
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

export interface SafeStorageCodecSuite<T = unknown> {
  readonly sync: SyncStorageCodec<T>
  readonly async: StorageCodec<T>
}

export type StorageKeyPredicate = (key: string) => boolean

export interface SafeStorageMaintenanceAdapter {
  readonly scope: StorageScope
  read(key: string): string | null
  write(key: string, value: string): void
  removeWhere(shouldRemove: StorageKeyPredicate): readonly string[]
}
