import { useDebounceFn } from '@vueuse/core'
import { SyncSocket } from './socket'
import {
  handleRemoteMessage,
  registerSyncMiddleware,
  setSyncClientId,
  type SyncMiddleware,
  type SyncTransportMessage,
} from './middleware'
import { castValue } from '@ccd/shared-utils'

export interface SyncTransportOptions {
  websocketUrl?: string
}

let activeSocket: SyncSocket | null = null
let activeChannel: BroadcastChannel | null = null
let initialized = false

function getWebSocketUrl(): string | undefined {
  return import.meta.env.VITE_SYNC_WS_URL?.trim() || undefined
}

function isSyncTransportMessage(value: unknown): value is SyncTransportMessage {
  if (!value || typeof value !== 'object') return false
  const record = castValue<Record<string, unknown>>(value)
  return (
    typeof record.type === 'string' &&
    typeof record.payload === 'object' &&
    record.payload !== null &&
    typeof record.clientId === 'string' &&
    typeof record.timestamp === 'number'
  )
}

function createBroadcastMessage(ctx: Parameters<SyncMiddleware>[0]): SyncTransportMessage {
  return {
    type: ctx.type,
    payload: ctx.payload,
    clientId: ctx.clientId,
    timestamp: ctx.timestamp,
  }
}

export function initTransport(options: SyncTransportOptions = {}): void {
  if (initialized) return
  initialized = true

  const websocketUrl = options.websocketUrl ?? getWebSocketUrl()
  activeSocket = websocketUrl ? new SyncSocket(websocketUrl, handleRemoteMessage) : null
  setSyncClientId(activeSocket?.clientId ?? 'local-sync-client')

  const websocketSyncMiddleware: SyncMiddleware = (ctx, next) => {
    if (ctx.source === 'local') {
      activeSocket?.send(createBroadcastMessage(ctx))
    }
    next()
  }

  if (typeof BroadcastChannel !== 'undefined') {
    activeChannel = new BroadcastChannel('ccd-sync')
    activeChannel.onmessage = event => {
      if (!isSyncTransportMessage(event.data)) return
      handleRemoteMessage(event.data)
    }
  }

  const broadcastChannelMiddleware: SyncMiddleware = (ctx, next) => {
    if (ctx.source === 'local') {
      activeChannel?.postMessage(createBroadcastMessage(ctx))
    }
    next()
  }

  registerSyncMiddleware(websocketSyncMiddleware)
  registerSyncMiddleware(broadcastChannelMiddleware)

  activeSocket?.connect()
}

export function resetTransportForTest(): void {
  activeSocket?.close()
  activeChannel?.close()
  activeSocket = null
  activeChannel = null
  initialized = false
  setSyncClientId('local-sync-client')
}

export const createDebouncedSyncTask = useDebounceFn
