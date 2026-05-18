import type { CoreAdapters, Logger, NetworkClient, StorageAdapter } from '@ccd/core'

const storage: StorageAdapter = {
  async get(key) {
    return globalThis.localStorage.getItem(key)
  },
  async set(key, value) {
    globalThis.localStorage.setItem(key, value)
  },
  async remove(key) {
    globalThis.localStorage.removeItem(key)
  },
}

const network: NetworkClient = {
  async request(request) {
    const response = await globalThis.fetch(request.url, {
      method: request.method,
      headers: request.headers,
      body: request.body === undefined ? undefined : JSON.stringify(request.body),
    })
    const contentType = response.headers.get('content-type') ?? ''
    const data = contentType.includes('application/json') ? await response.json() : await response.text()
    return {
      status: response.status,
      data,
      headers: Object.fromEntries(response.headers.entries()),
    }
  },
}

const logger: Logger = {
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

export const webAdapters: CoreAdapters = {
  storage,
  network,
  logger,
}
