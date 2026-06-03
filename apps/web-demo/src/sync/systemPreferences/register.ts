import { registerSync } from '@/sync/registry'
import {
  useLayoutStore,
  useLocaleStore,
  useSizeStore,
  useThemeStore,
} from '@/stores/modules/system'
import { writeLocalSystemPreferences } from './localPersist'
import {
  applySystemPreferencesToStores,
  isAdminLayoutMode,
  isSizeMode,
  isSupportedLocale,
  isThemeMode,
  normalizeSystemPreferences,
} from './model'
import {
  sanitizeLayoutPayload,
  sanitizeLocalePayload,
  sanitizePreferencesPayload,
  sanitizeSizePayload,
  sanitizeThemePayload,
} from './guards'
import type { SystemPreferencePayload, SystemPreferences } from '@ccd/contracts'
import { markSystemPreferencesApplied, shouldApplySystemPreferences } from './state'

function shouldApplyRemote(preferences: SystemPreferences): boolean {
  return shouldApplySystemPreferences(preferences.updatedAt)
}

function persistIfRemote(preferences: SystemPreferences, source: 'local' | 'remote'): void {
  if (source === 'remote') {
    writeLocalSystemPreferences(preferences)
    markSystemPreferencesApplied(preferences.updatedAt)
  }
}

function toPreferences(payload: SystemPreferencePayload): SystemPreferences {
  return normalizeSystemPreferences(payload)
}

export function registerSystemPreferenceSync(): void {
  registerSync('preferences:update', (payload, source) => {
    const sanitized = sanitizePreferencesPayload(payload)
    if (!sanitized) return
    const preferences = toPreferences(sanitized)
    if (source === 'remote' && !shouldApplyRemote(preferences)) return

    applySystemPreferencesToStores(preferences)
    persistIfRemote(preferences, source)
  })

  registerSync('theme:update', (payload, source) => {
    const sanitized = sanitizeThemePayload(payload)
    if (!sanitized) return
    const preferences = toPreferences(sanitized)
    if (source === 'remote' && !shouldApplyRemote(preferences)) return

    const themeStore = useThemeStore()
    const themeMode = isThemeMode(preferences.theme.mode) ? preferences.theme.mode : themeStore.mode
    themeStore.$patch({
      mode: themeMode,
      themeName: preferences.theme.theme,
      accentColor: preferences.theme.accentColor,
    })
    themeStore.refreshTheme()
    persistIfRemote(preferences, source)
  })

  registerSync('size:update', (payload, source) => {
    const sanitized = sanitizeSizePayload(payload)
    if (!sanitized) return
    const preferences = toPreferences(sanitized)
    if (source === 'remote' && !shouldApplyRemote(preferences)) return

    const sizeStore = useSizeStore()
    const sizeMode = isSizeMode(preferences.size.size) ? preferences.size.size : sizeStore.sizeName
    sizeStore.setSize(sizeMode, { sync: false })
    persistIfRemote(preferences, source)
  })

  registerSync('layout:update', (payload, source) => {
    const sanitized = sanitizeLayoutPayload(payload)
    if (!sanitized) return
    const preferences = toPreferences(sanitized)
    if (source === 'remote' && !shouldApplyRemote(preferences)) return

    const layoutStore = useLayoutStore()
    const layoutMode = isAdminLayoutMode(preferences.layout.layout)
      ? preferences.layout.layout
      : layoutStore.preferredMode
    layoutStore.$patch({
      preferredMode: layoutMode,
      sidebarCollapse: preferences.layout.collapsed,
      userAdjusted: true,
    })
    persistIfRemote(preferences, source)
  })

  registerSync('locale:update', (payload, source) => {
    const sanitized = sanitizeLocalePayload(payload)
    if (!sanitized) return
    const preferences = toPreferences(sanitized)
    if (source === 'remote' && !shouldApplyRemote(preferences)) return

    const localeStore = useLocaleStore()
    if (
      preferences.locale &&
      isSupportedLocale(preferences.locale) &&
      preferences.locale !== localeStore.locale
    ) {
      localeStore.locale = preferences.locale
      localeStore.initLocale()
    }
    persistIfRemote(preferences, source)
  })
}
