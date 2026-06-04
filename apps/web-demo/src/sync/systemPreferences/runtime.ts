import { useDebounceFn } from '@vueuse/core'
import { normalizeSystemPreferences, readSystemPreferencesFromStores } from './model'
import { handleRemoteMessage, registerSyncMiddleware, type SyncMiddleware } from './middleware'
import {
  localPersistMiddleware,
  readLocalSystemPreferences,
  writeLocalSystemPreferences,
} from './localPersist'
import { initTransport, resetTransportForTest } from '@/sync/runtime'
import { syncAction } from '@/sync/syncAction'
import type {
  SystemPreferencePayload,
  SystemPreferenceSyncType,
  SystemPreferences,
} from '@ccd/contracts'
import { registerSystemPreferenceSync } from './register'
import { sanitizeSystemPreferencePayload } from './guards'
import { resetSystemPreferenceSyncStateForTest } from './state'

type SyncStoreId = 'theme' | 'size' | 'layout' | 'locale' | 'preferences'

export interface SystemPreferencesSyncOptions {
  websocketUrl?: string
  onCloudSave?: (preferences: SystemPreferences) => Promise<void>
}

let initialized = false
let cloudSaveHandler: ((preferences: SystemPreferences) => Promise<void>) | undefined
let lastLocalPreferenceTimestamp = 0

const emitCloudSave = useDebounceFn((preferences: SystemPreferences) => {
  const task = cloudSaveHandler?.(preferences)
  if (task) {
    void task.catch(error => {
      console.warn('[SystemPreferencesSync] Cloud save failed:', error)
    })
  }
}, 1000)

function resolveSyncType(storeId: SyncStoreId): SystemPreferenceSyncType {
  if (storeId === 'theme') return 'theme:update'
  if (storeId === 'size') return 'size:update'
  if (storeId === 'layout') return 'layout:update'
  if (storeId === 'locale') return 'locale:update'
  return 'preferences:update'
}

function buildPayload(storeId: SyncStoreId): SystemPreferencePayload {
  lastLocalPreferenceTimestamp = Math.max(Date.now(), lastLocalPreferenceTimestamp + 1)
  const preferences = readSystemPreferencesFromStores(lastLocalPreferenceTimestamp)
  if (storeId === 'theme') return { theme: preferences.theme, updatedAt: preferences.updatedAt }
  if (storeId === 'size') return { size: preferences.size, updatedAt: preferences.updatedAt }
  if (storeId === 'layout') return { layout: preferences.layout, updatedAt: preferences.updatedAt }
  if (storeId === 'locale') return { locale: preferences.locale, updatedAt: preferences.updatedAt }
  return preferences
}

export function emitLocalSystemPreferenceChange(storeId: SyncStoreId): void {
  if (!initialized) return
  syncAction(resolveSyncType(storeId), buildPayload(storeId))
}

export function applyRemoteSystemPreferences(preferences: SystemPreferences): void {
  const normalized = normalizeSystemPreferences(preferences)
  handleRemoteMessage({
    type: 'preferences:update',
    payload: normalized,
    clientId: 'system-preferences-bootstrap',
    timestamp: Date.now(),
  })
}

export function setupSystemPreferencesSync(options: SystemPreferencesSyncOptions = {}): void {
  if (initialized) return
  initialized = true
  registerSystemPreferenceSync()
  cloudSaveHandler = options.onCloudSave

  const cloudSaveMiddleware: SyncMiddleware = (ctx, next) => {
    if (ctx.source === 'local') {
      const payload = sanitizeSystemPreferencePayload(ctx.type, ctx.payload)
      if (payload) {
        emitCloudSave(normalizeSystemPreferences(payload))
      }
    }
    next()
  }

  registerSyncMiddleware(localPersistMiddleware)
  registerSyncMiddleware(cloudSaveMiddleware)
  initTransport({ websocketUrl: options.websocketUrl })

  const localPreferences = readLocalSystemPreferences()
  const current = readSystemPreferencesFromStores(Date.now())
  if (localPreferences) {
    applyRemoteSystemPreferences(localPreferences)
  } else {
    writeLocalSystemPreferences(current)
  }
}

export function resetSystemPreferencesSyncForTest(): void {
  resetTransportForTest()
  resetSystemPreferenceSyncStateForTest()
  initialized = false
  cloudSaveHandler = undefined
  lastLocalPreferenceTimestamp = 0
}
