import { packDataSync, unpackDataSync } from '@/utils/safeStorage'
import type { SystemPreferences } from '@/types/systems/preferences'
import type { SyncMiddleware } from './middleware'
import { readLocalStorageValue, writeLocalStorageValue } from '@/utils/safeStorage'
import { normalizeSystemPreferences } from './model'
import { sanitizeSystemPreferencePayload } from './guards'
import { markSystemPreferencesApplied } from './state'

export const SYSTEM_PREFERENCES_LOCAL_KEY = 'ccd-preferences'

export function writeLocalSystemPreferences(preferences: SystemPreferences): void {
  const packed = packDataSync(preferences)
  if (packed) {
    writeLocalStorageValue(SYSTEM_PREFERENCES_LOCAL_KEY, packed)
  }
}

export function readLocalSystemPreferences(): SystemPreferences | null {
  const raw = readLocalStorageValue(SYSTEM_PREFERENCES_LOCAL_KEY)
  if (!raw) return null
  return unpackDataSync<SystemPreferences>(raw)
}

export const localPersistMiddleware: SyncMiddleware = (ctx, next) => {
  if (ctx.source === 'local') {
    const payload = sanitizeSystemPreferencePayload(ctx.type, ctx.payload)
    if (payload) {
      const preferences = normalizeSystemPreferences(payload)
      writeLocalSystemPreferences(preferences)
      markSystemPreferencesApplied(preferences.updatedAt)
    }
  }
  next()
}
