import { DEFAULT_LAYOUT_SETTING, DEFAULT_LAYOUT_VISIBILITY_SETTINGS } from '@/constants/layout'
import { DEFAULT_SIZE_NAME, SIZE_PRESETS } from '@/constants/size'
import { DEFAULT_THEME_MODE, DEFAULT_THEME_NAME, THEME_PRESETS } from '@/constants/theme'
import { supportedLocales, type SupportedLocale } from '@/locales'
import {
  useLayoutStore,
  useLocaleStore,
  useSizeStore,
  useThemeStore,
} from '@/stores/modules/system'
import type {
  SystemPreferenceEnvelope,
  SystemPreferencePayload,
  SystemPreferences,
} from '@/types/systems/preferences'
import { deepClone } from '@/utils/lodashes'

const LAYOUT_MODES: readonly AdminLayoutMode[] = ['vertical', 'horizontal', 'mix']
const THEME_MODES: readonly ThemeMode[] = ['light', 'dark', 'auto', 'glass']

export function isThemeMode(value: string): value is ThemeMode {
  return THEME_MODES.some(mode => mode === value)
}

function isThemeName(value: string): boolean {
  return THEME_PRESETS.some(preset => preset.name === value)
}

export function isSizeMode(value: string): value is SizeMode {
  return SIZE_PRESETS.some(preset => preset.name === value)
}

export function isAdminLayoutMode(value: string): value is AdminLayoutMode {
  return LAYOUT_MODES.some(mode => mode === value)
}

export function isSupportedLocale(value: string): value is SupportedLocale {
  return supportedLocales.some(item => item.key === value)
}

function normalizeTheme(input: SystemPreferencePayload['theme']): SystemPreferences['theme'] {
  return {
    mode: input && isThemeMode(input.mode) ? input.mode : DEFAULT_THEME_MODE,
    theme: input && isThemeName(input.theme) ? input.theme : DEFAULT_THEME_NAME,
    accentColor: input?.accentColor ?? null,
  }
}

function normalizeSize(input: SystemPreferencePayload['size']): SystemPreferences['size'] {
  return {
    size: input && isSizeMode(input.size) ? input.size : DEFAULT_SIZE_NAME,
  }
}

function normalizeLayout(input: SystemPreferencePayload['layout']): SystemPreferences['layout'] {
  return {
    layout:
      input && isAdminLayoutMode(input.layout)
        ? input.layout
        : DEFAULT_LAYOUT_SETTING.preferredMode,
    collapsed: input?.collapsed ?? DEFAULT_LAYOUT_SETTING.sidebarCollapse,
  }
}

export function readSystemPreferencesFromStores(updatedAt = Date.now()): SystemPreferences {
  const themeStore = useThemeStore()
  const sizeStore = useSizeStore()
  const layoutStore = useLayoutStore()
  const localeStore = useLocaleStore()

  return {
    theme: {
      mode: themeStore.mode,
      theme: themeStore.themeName,
      accentColor: themeStore.accentColor,
    },
    size: {
      size: sizeStore.sizeName,
    },
    layout: {
      layout: layoutStore.preferredMode,
      collapsed: layoutStore.sidebarCollapse,
    },
    locale: localeStore.locale,
    updatedAt,
  }
}

export function normalizeSystemPreferences(payload: SystemPreferencePayload): SystemPreferences {
  const fallback = readSystemPreferencesFromStores(payload.updatedAt)
  const locale =
    typeof payload.locale === 'string' && isSupportedLocale(payload.locale)
      ? payload.locale
      : fallback.locale

  return {
    theme: normalizeTheme(payload.theme ?? fallback.theme),
    size: normalizeSize(payload.size ?? fallback.size),
    layout: normalizeLayout(payload.layout ?? fallback.layout),
    ...(locale ? { locale } : {}),
    updatedAt: payload.updatedAt,
  }
}

export function envelopeToPreferences(envelope: SystemPreferenceEnvelope): SystemPreferences {
  return normalizeSystemPreferences(envelope.payload)
}

export function applySystemPreferencesToStores(preferences: SystemPreferences): void {
  const themeStore = useThemeStore()
  const sizeStore = useSizeStore()
  const layoutStore = useLayoutStore()
  const localeStore = useLocaleStore()
  const themeMode = isThemeMode(preferences.theme.mode)
    ? preferences.theme.mode
    : DEFAULT_THEME_MODE
  const sizeMode = isSizeMode(preferences.size.size) ? preferences.size.size : DEFAULT_SIZE_NAME
  const layoutMode = isAdminLayoutMode(preferences.layout.layout)
    ? preferences.layout.layout
    : DEFAULT_LAYOUT_SETTING.preferredMode

  themeStore.$patch({
    mode: themeMode,
    themeName: preferences.theme.theme,
    accentColor: preferences.theme.accentColor,
  })
  themeStore.refreshTheme()

  sizeStore.setSize(sizeMode, { sync: false })

  const visibilitySettings = layoutStore.visibilitySettings[layoutMode]
    ? layoutStore.visibilitySettings
    : deepClone(DEFAULT_LAYOUT_VISIBILITY_SETTINGS)

  layoutStore.$patch({
    preferredMode: layoutMode,
    sidebarCollapse: preferences.layout.collapsed,
    visibilitySettings,
    userAdjusted: true,
  })

  if (
    preferences.locale &&
    isSupportedLocale(preferences.locale) &&
    preferences.locale !== localeStore.locale
  ) {
    localeStore.locale = preferences.locale
    localeStore.initLocale()
  }
}
