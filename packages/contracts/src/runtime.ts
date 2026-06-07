import type { CryptoProvider } from './crypto'
import type { EnvironmentProvider } from './environment'
import type { FileSystemAdapter } from './filesystem'
import type { Logger } from './logger'
import type { NetworkClient } from './network'
import type { Scheduler } from './scheduler'
import type { StorageAdapter } from './storage'

export type RuntimeKind = 'browser' | 'desktop'

export type RuntimePlatform = 'web' | 'tauri'

export interface RuntimeDescriptor {
  readonly kind: RuntimeKind
  readonly platform: RuntimePlatform
  readonly name?: string
  readonly secureContext?: boolean
}

export interface ClipboardAdapter {
  readText(): Promise<string>
  writeText(text: string): Promise<void>
}

export interface RuntimeNotification {
  readonly title: string
  readonly body?: string
  readonly tag?: string
  readonly level?: 'info' | 'success' | 'warning' | 'error'
}

export interface NotificationAdapter {
  notify(notification: RuntimeNotification): Promise<void>
}

export interface ExternalNavigationAdapter {
  openExternal(url: string): Promise<void>
}

export type ShellAdapter = ExternalNavigationAdapter

export interface RuntimeCapabilities {
  readonly descriptor: RuntimeDescriptor
  readonly storage: StorageAdapter
  readonly network: NetworkClient
  readonly logger: Logger
  readonly filesystem?: FileSystemAdapter
  readonly shell?: ShellAdapter
  readonly notifications?: NotificationAdapter
  readonly clipboard?: ClipboardAdapter
  readonly externalNavigation?: ExternalNavigationAdapter
  readonly scheduler?: Scheduler
  readonly crypto?: CryptoProvider
  readonly environment?: EnvironmentProvider
}
