import type {
  ClipboardAdapter,
  ExternalNavigationAdapter,
  NetworkClient,
  NotificationAdapter,
  RuntimeCapabilities,
  RuntimeDescriptor,
  ShellAdapter,
  StorageAdapter,
} from '@ccd/contracts'
import { appLogger } from './logger.adapter'
import { browserLocalSafeStorageAdapter } from '@/utils/safeStorage/storageMaintenance'

export interface BrowserRuntimeCapabilityOptions {
  readonly network: NetworkClient
  readonly storage?: StorageAdapter
}

const browserDescriptor: RuntimeDescriptor = {
  kind: 'browser',
  platform: 'web',
  name: 'web-demo',
  secureContext: typeof window !== 'undefined' ? window.isSecureContext : undefined,
}

const browserClipboard: ClipboardAdapter = {
  async readText() {
    if (!navigator.clipboard) {
      throw new Error('[BrowserRuntime] Clipboard API is not available')
    }
    return navigator.clipboard.readText()
  },
  async writeText(text) {
    if (!navigator.clipboard) {
      throw new Error('[BrowserRuntime] Clipboard API is not available')
    }
    await navigator.clipboard.writeText(text)
  },
}

const browserExternalNavigation: ExternalNavigationAdapter = {
  async openExternal(url) {
    window.open(url, '_blank', 'noopener,noreferrer')
  },
}

const browserShell: ShellAdapter = {
  openExternal: browserExternalNavigation.openExternal,
}

const browserNotifications: NotificationAdapter = {
  async notify(notification) {
    if (typeof Notification === 'undefined') {
      throw new Error('[BrowserRuntime] Notification API is not available')
    }

    let permission = Notification.permission
    if (permission === 'default') {
      permission = await Notification.requestPermission()
    }

    if (permission !== 'granted') {
      appLogger.warn('[BrowserRuntime] Notification permission was not granted', notification)
      return
    }

    new Notification(notification.title, {
      body: notification.body,
      tag: notification.tag,
    })
  },
}

export function createBrowserRuntimeCapabilities(
  options: BrowserRuntimeCapabilityOptions
): RuntimeCapabilities {
  return {
    descriptor: browserDescriptor,
    storage: options.storage ?? browserLocalSafeStorageAdapter,
    network: options.network,
    logger: appLogger,
    shell: browserShell,
    notifications: browserNotifications,
    clipboard: browserClipboard,
    externalNavigation: browserExternalNavigation,
  }
}
