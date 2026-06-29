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

/**
 * Tauri IPC commands the desktop backend actually implements.
 *
 * The desktop backend is an intentional deny-by-default scaffold: `src-tauri/src/main.rs`
 * registers no `#[tauri::command]` handler and `src-tauri/capabilities/default.json` grants
 * no permissions (deny-by-default policy documented in `src-tauri/security-scopes.json`).
 * Invoking a command in this state would otherwise fail deep inside Tauri with an opaque
 * "command not found" rejection. We gate every command here so an unimplemented capability
 * fails fast with a typed, actionable error instead of a silent or cryptic IPC failure.
 *
 * This is the TypeScript mirror of `capabilities/default.json` `permissions: []`: add a
 * command name to this set only once its Rust `#[tauri::command]` handler and a scoped Tauri
 * capability both exist (see `security-scopes.json` `preEnableRequirements`).
 */
const IMPLEMENTED_DESKTOP_COMMANDS: ReadonlySet<DesktopIpcCommandName> =
  new Set<DesktopIpcCommandName>()

/**
 * Thrown when the desktop adapter is asked to invoke an IPC command the Tauri backend does
 * not implement yet. Carries the offending command name so callers can branch on capability.
 */
export class DesktopIpcUnsupportedError extends Error {
  readonly command: DesktopIpcCommandName

  constructor(command: DesktopIpcCommandName) {
    super(
      `[DesktopIPC] ${command} is not implemented by the desktop backend. ` +
        `The Tauri runtime registers no command handler and the capability set is empty ` +
        `(deny-by-default scaffold; see src-tauri/src/main.rs and src-tauri/security-scopes.json). ` +
        `Implement the Rust #[tauri::command] handler and grant a scoped capability before invoking it.`
    )
    this.name = 'DesktopIpcUnsupportedError'
    this.command = command
  }
}

function assertDesktopCommandImplemented(command: DesktopIpcCommandName): void {
  if (!IMPLEMENTED_DESKTOP_COMMANDS.has(command)) {
    throw new DesktopIpcUnsupportedError(command)
  }
}

function invokeDesktopCommand<TCommand extends DesktopIpcCommandName>(
  command: TCommand,
  args: DesktopIpcCommandArgs<TCommand>
): Promise<DesktopIpcCommandResult<TCommand>> {
  assertDesktopCommandImplemented(command)
  return invoke<DesktopIpcCommandResult<TCommand>>(command, args)
}

function invokeDesktopHttpRequest<T>(request: NetworkRequest): Promise<NetworkResponse<T>> {
  validateNetworkRequest(request)
  assertDesktopCommandImplemented('http_request')
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
