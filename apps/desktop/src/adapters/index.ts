import type {
  CoreAdapters,
  FileSystemAdapter,
  Logger,
  NetworkClient,
  NetworkRequest,
  NetworkResponse,
  StorageAdapter,
} from '@ccd/core'
import type {
  DesktopIpcCommandArgs,
  DesktopIpcCommandName,
  DesktopIpcCommandResult,
} from '@ccd/contracts'
import { createConsoleLogger } from '@ccd/shared-utils'
import { invoke } from '@tauri-apps/api/core'

const HTTP_METHODS = new Set<NetworkRequest['method']>(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])

function assertNonEmptyString(command: DesktopIpcCommandName, field: string, value: string): void {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new TypeError(`[DesktopIPC] ${command}.${field} must be a non-empty string.`)
  }
}

function isStringRecord(value: unknown): value is Readonly<Record<string, string>> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  return Object.values(value).every(entry => typeof entry === 'string')
}

function validateHeaders(headers: NetworkRequest['headers']): void {
  if (headers === undefined) return
  if (!isStringRecord(headers)) {
    throw new TypeError('[DesktopIPC] http_request.request.headers must be a string record.')
  }
}

function validateNetworkRequest(request: NetworkRequest): void {
  if (!HTTP_METHODS.has(request.method)) {
    throw new TypeError(
      `[DesktopIPC] http_request.request.method is unsupported: ${request.method}`
    )
  }
  assertNonEmptyString('http_request', 'request.url', request.url)
  validateHeaders(request.headers)
}

function invokeDesktopCommand<TCommand extends DesktopIpcCommandName>(
  command: TCommand,
  args: DesktopIpcCommandArgs<TCommand>
): Promise<DesktopIpcCommandResult<TCommand>> {
  return invoke<DesktopIpcCommandResult<TCommand>>(command, args)
}

function invokeDesktopHttpRequest<T>(request: NetworkRequest): Promise<NetworkResponse<T>> {
  validateNetworkRequest(request)
  return invoke<NetworkResponse<T>>('http_request', {
    request,
  } satisfies DesktopIpcCommandArgs<'http_request'>)
}

const storage: StorageAdapter = {
  get(key) {
    assertNonEmptyString('storage_get', 'key', key)
    return invokeDesktopCommand('storage_get', { key })
  },
  set(key, value) {
    assertNonEmptyString('storage_set', 'key', key)
    return invokeDesktopCommand('storage_set', { key, value })
  },
  remove(key) {
    assertNonEmptyString('storage_remove', 'key', key)
    return invokeDesktopCommand('storage_remove', { key })
  },
}

const filesystem: FileSystemAdapter = {
  readText(path) {
    assertNonEmptyString('fs_read_text', 'path', path)
    return invokeDesktopCommand('fs_read_text', { path })
  },
  writeText(path, content) {
    assertNonEmptyString('fs_write_text', 'path', path)
    return invokeDesktopCommand('fs_write_text', { path, content })
  },
}

const network: NetworkClient = {
  request<T = unknown>(request: NetworkRequest) {
    return invokeDesktopHttpRequest<T>(request)
  },
}

export const desktopLogger: Logger = createConsoleLogger(globalThis.console)

export const desktopAdapters: CoreAdapters = {
  descriptor: {
    kind: 'desktop',
    platform: 'tauri',
    name: 'CCD Desktop',
  },
  storage,
  filesystem,
  network,
  logger: desktopLogger,
}
