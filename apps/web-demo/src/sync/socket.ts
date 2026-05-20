import { useTimeoutFn } from '@vueuse/core'
import { castValue } from '@ccd/shared-utils'
import type { SyncTransportMessage } from './middleware'

export type SyncSocketMessage = SyncTransportMessage

export type SyncSocketMessageHandler = (message: SyncSocketMessage) => void

function createClientId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export class SyncSocket {
  private ws: WebSocket | null = null
  private connected = false
  private readonly reconnectTimer: ReturnType<typeof useTimeoutFn>
  private readonly queue: SyncSocketMessage[] = []
  readonly clientId: string

  constructor(
    private readonly url: string,
    private readonly onRemoteMessage: SyncSocketMessageHandler,
    private readonly reconnectDelay = 2000
  ) {
    this.clientId = createClientId()
    this.reconnectTimer = useTimeoutFn(
      () => {
        this.connect()
      },
      this.reconnectDelay,
      { immediate: false }
    )
  }

  connect(): void {
    if (!this.url || typeof WebSocket === 'undefined' || this.ws) return

    this.ws = new WebSocket(this.url)
    this.ws.addEventListener('open', () => {
      this.connected = true
      this.flush()
    })
    this.ws.addEventListener('message', event => {
      this.handleMessage(event.data)
    })
    this.ws.addEventListener('close', () => {
      this.connected = false
      this.ws = null
      this.scheduleReconnect()
    })
    this.ws.addEventListener('error', () => {
      this.connected = false
    })
  }

  send(message: SyncSocketMessage): void {
    if (!this.connected || !this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.queue.push(message)
      return
    }
    this.ws.send(JSON.stringify(message))
  }

  close(): void {
    this.reconnectTimer.stop()
    this.connected = false
    this.ws?.close()
    this.ws = null
    this.queue.length = 0
  }

  private flush(): void {
    while (this.queue.length > 0) {
      const message = this.queue.shift()
      if (message) this.send(message)
    }
  }

  private scheduleReconnect(): void {
    if (!this.url || this.reconnectTimer.isPending.value) return
    this.reconnectTimer.start()
  }

  private handleMessage(raw: unknown): void {
    if (typeof raw !== 'string') return
    try {
      const parsed: unknown = JSON.parse(raw)
      if (!isSyncSocketMessage(parsed)) return
      if (parsed.clientId === this.clientId) return
      this.onRemoteMessage(parsed)
    } catch {
      // Ignore malformed sync frames.
    }
  }
}

function isSyncSocketMessage(value: unknown): value is SyncSocketMessage {
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
