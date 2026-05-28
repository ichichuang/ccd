import type {
  CoreAdapters,
  FileSystemAdapter,
  Logger,
  NetworkClient,
  StorageAdapter,
} from '@ccd/core'
import { invoke } from '@tauri-apps/api/core'

const storage: StorageAdapter = {
  get(key) {
    return invoke<string | null>('storage_get', { key })
  },
  set(key, value) {
    return invoke<void>('storage_set', { key, value })
  },
  remove(key) {
    return invoke<void>('storage_remove', { key })
  },
}

const filesystem: FileSystemAdapter = {
  readText(path) {
    return invoke<string>('fs_read_text', { path })
  },
  writeText(path, content) {
    return invoke<void>('fs_write_text', { path, content })
  },
}

const network: NetworkClient = {
  async request(request) {
    return invoke('http_request', { request })
  },
}

export const desktopLogger: Logger = {
  debug(message, context) {
    globalThis.console.debug(message, context)
  },
  info(message, context) {
    globalThis.console.info(message, context)
  },
  warn(message, context) {
    globalThis.console.warn(message, context)
  },
  error(message, context) {
    globalThis.console.error(message, context)
  },
}

export const desktopAdapters: CoreAdapters = {
  storage,
  filesystem,
  network,
  logger: desktopLogger,
}
