/**
 * Runtime bootstrap/storage constants.
 *
 * These keys are technical runtime coordination markers, not business-domain payload keys.
 * Business persistence must still follow safeStorage and Pinia serializer rules.
 */
export const RUNTIME_STORAGE_KEYS = {
  themeMode: 'theme-mode',
  themePrimary: 'theme-primary',
  themeBackground: 'theme-background',
  vitePreloadReload: 'vite-preload-error-reloaded',
} as const

export const THEME_PRELOAD_STORAGE_KEYS = [
  RUNTIME_STORAGE_KEYS.themeMode,
  RUNTIME_STORAGE_KEYS.themePrimary,
  RUNTIME_STORAGE_KEYS.themeBackground,
] as const

/** localStorage key prefixes used by ProForm persistence (shared between DraftStorage and logout cleanup) */
export const PRO_FORM_STORAGE_PREFIXES = {
  schemaForm: 'schemaform:',
  draft: 'pro-form-draft:',
} as const
