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
  e2eMode: 'ccd-e2e-mode',
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

export const RUNTIME_QUERY_KEYS = {
  e2eMode: 'e2e',
  e2ePreloaderHold: 'e2eHoldPreloader',
} as const

export const RUNTIME_E2E_EVENTS = {
  appReady: 'ccd:app-ready',
  preloaderReady: 'ccd:preloader-ready',
  preloaderHidden: 'ccd:preloader-hidden',
  releasePreloader: 'ccd:release-preloader',
  runtimeLoadingStart: 'ccd:runtime-loading-start',
  runtimeLoadingIdle: 'ccd:runtime-loading-idle',
  themeTransitionStart: 'ccd:theme-transition-start',
  themeTransitionEnd: 'ccd:theme-transition-end',
} as const

export type RuntimeE2EMode = 'off' | 'visual'
