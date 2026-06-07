import type { NetworkRequest, NetworkResponse } from './network'

export interface DesktopIpcCommandMap {
  readonly storage_get: {
    readonly args: { readonly key: string }
    readonly result: string | null
  }
  readonly storage_set: {
    readonly args: { readonly key: string; readonly value: string }
    readonly result: void
  }
  readonly storage_remove: {
    readonly args: { readonly key: string }
    readonly result: void
  }
  readonly fs_read_text: {
    readonly args: { readonly path: string }
    readonly result: string
  }
  readonly fs_write_text: {
    readonly args: { readonly path: string; readonly content: string }
    readonly result: void
  }
  readonly http_request: {
    readonly args: { readonly request: NetworkRequest }
    readonly result: NetworkResponse<unknown>
  }
}

export type DesktopIpcCommandName = keyof DesktopIpcCommandMap

export type DesktopIpcCommandArgs<TCommand extends DesktopIpcCommandName> =
  DesktopIpcCommandMap[TCommand]['args']

export type DesktopIpcCommandResult<TCommand extends DesktopIpcCommandName> =
  DesktopIpcCommandMap[TCommand]['result']
