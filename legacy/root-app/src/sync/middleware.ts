import { getSyncHandler } from './registry'

export type SyncSource = 'local' | 'remote'

export interface SyncContext {
  type: string
  payload: unknown
  source: SyncSource
  clientId: string
  timestamp: number
}

export type SyncContextInput = Pick<SyncContext, 'type' | 'payload' | 'source'> &
  Partial<Pick<SyncContext, 'clientId' | 'timestamp'>>

export interface SyncTransportMessage {
  type: string
  payload: unknown
  clientId: string
  timestamp: number
}

export type SyncMiddleware = (ctx: SyncContext, next: () => void) => void

const middlewares: SyncMiddleware[] = []
let runtimeClientId = 'local-sync-client'

export function setSyncClientId(clientId: string): void {
  runtimeClientId = clientId || 'local-sync-client'
}

export function registerSyncMiddleware(middleware: SyncMiddleware): void {
  middlewares.push(middleware)
}

export function resetSyncMiddlewaresForTest(): void {
  middlewares.length = 0
  runtimeClientId = 'local-sync-client'
}

function createContext(input: SyncContextInput): SyncContext {
  return {
    type: input.type,
    payload: input.payload,
    source: input.source,
    clientId: input.clientId ?? runtimeClientId,
    timestamp: input.timestamp ?? Date.now(),
  }
}

export function applyMiddleware(input: SyncContextInput): boolean {
  const ctx = createContext(input)
  let currentIndex = -1
  let completed = false

  function dispatch(index: number): void {
    if (index <= currentIndex) return
    currentIndex = index
    const middleware = middlewares[index]
    if (!middleware) {
      completed = true
      return
    }
    middleware(ctx, () => dispatch(index + 1))
  }

  dispatch(0)
  return completed
}

export const applySyncMiddleware = applyMiddleware

export function handleRemoteMessage(message: SyncTransportMessage): void {
  const handler = getSyncHandler(message.type)
  if (!handler) return

  const completed = applyMiddleware({
    type: message.type,
    payload: message.payload,
    source: 'remote',
    clientId: message.clientId,
    timestamp: message.timestamp,
  })

  if (!completed) return
  handler(message.payload, 'remote')
}
