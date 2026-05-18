import { applyMiddleware } from './middleware'
import { isSyncTypeAllowed } from './registry'

export function syncAction(type: string, payload: unknown): void {
  if (!isSyncTypeAllowed(type)) return

  applyMiddleware({
    type,
    payload,
    source: 'local',
  })
}
