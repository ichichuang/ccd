import type { SyncSource } from './middleware'

export type SyncHandler = (payload: unknown, source: SyncSource) => void

const registry = new Map<string, SyncHandler>()

export function registerSync(type: string, handler: SyncHandler): void {
  registry.set(type, handler)
}

export function getSyncHandler(type: string): SyncHandler | undefined {
  return registry.get(type)
}

export function isSyncTypeAllowed(type: string): boolean {
  return registry.has(type)
}
