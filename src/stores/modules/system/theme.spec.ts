// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

const mockGenerateThemeVars = vi.fn(() => ({}))
const defaultPreset: ThemePreset = { name: 'default', primary: 'var(--primary)' }
const oceanPreset: ThemePreset = { name: 'ocean', primary: 'var(--accent)' }
const mockApplyTheme = vi.fn()
const mockApplyThemeModeToRoot = vi.fn()
const mockGetSystemDarkModeQuery = vi.fn<
  () => {
    addEventListener: (type: string, listener: () => void) => void
    removeEventListener: (type: string, listener: () => void) => void
  } | null
>(() => null)
const mockResolveThemeModeIsDark = vi.fn((mode: string) => mode === 'dark')
const mockIsThemeLocked = vi.fn(() => false)

vi.mock('@/constants/theme', () =>
  Object.fromEntries([
    ['THEME_PRESETS', [defaultPreset, oceanPreset]],
    ['DEFAULT_THEME_NAME', 'default'],
    ['DEFAULT_THEME_MODE', 'light'],
    ['DEFAULT_TRANSITION_DURATION', 300],
  ])
)
vi.mock('@/constants/runtime', () =>
  Object.fromEntries([['RUNTIME_STORAGE_KEYS', { themeMode: 'theme-mode' }]])
)
vi.mock('@/utils/theme/engine', () => ({
  generateThemeVars: mockGenerateThemeVars,
  applyTheme: mockApplyTheme,
}))
vi.mock('@/utils/theme/mode', () => ({
  applyThemeModeToRoot: mockApplyThemeModeToRoot,
  getSystemDarkModeQuery: mockGetSystemDarkModeQuery,
  resolveThemeModeIsDark: mockResolveThemeModeIsDark,
}))
vi.mock('@/utils/theme/transitions', () => ({
  isThemeLocked: mockIsThemeLocked,
}))
vi.mock('@/utils/safeStorage/piniaSerializer', () => ({
  createPiniaEncryptedSerializer: () => ({
    serialize: (v: unknown) => JSON.stringify(v),
    deserialize: (v: string) => JSON.parse(v),
  }),
}))
vi.mock('@/stores', async () => {
  const pinia = await import('pinia')
  return { default: pinia.createPinia() }
})

describe('useThemeStore', () => {
  let useThemeStore: typeof import('./theme').useThemeStore

  beforeEach(async () => {
    vi.resetModules()
    vi.clearAllMocks()
    setActivePinia(createPinia())
    mockApplyTheme.mockClear()
    mockGetSystemDarkModeQuery.mockReturnValue(null)
    mockResolveThemeModeIsDark.mockImplementation((mode: string) => mode === 'dark')
    const mod = await import('./theme')
    useThemeStore = mod.useThemeStore
  })

  describe('setTheme — validation', () => {
    it('accepts valid preset name', () => {
      const store = useThemeStore()
      store.setTheme('ocean')
      expect(store.themeName).toBe('ocean')
    })

    it('rejects invalid preset name and keeps current', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const store = useThemeStore()
      store.themeName = 'default'

      store.setTheme('nonexistent')

      expect(store.themeName).toBe('default')
      expect(warnSpy).toHaveBeenCalled()
      warnSpy.mockRestore()
    })
  })

  describe('setMode', () => {
    it('updates mode and calls refreshTheme', () => {
      const store = useThemeStore()
      store.setMode('dark')
      expect(store.mode).toBe('dark')
      expect(mockApplyTheme).toHaveBeenCalled()
    })
  })

  describe('setAccentColor', () => {
    it('updates accentColor', () => {
      const store = useThemeStore()
      const nextAccent = 'var(--warning)'
      store.setAccentColor(nextAccent)
      expect(store.accentColor).toBe(nextAccent)

      store.setAccentColor(null)
      expect(store.accentColor).toBeNull()
    })
  })

  describe('resetState', () => {
    it('restores all defaults', () => {
      const store = useThemeStore()
      store.mode = 'dark'
      store.themeName = 'ocean'
      store.accentColor = 'var(--warning)'

      store.resetState()

      expect(store.mode).toBe('light')
      expect(store.themeName).toBe('default')
      expect(store.accentColor).toBeNull()
    })
  })

  describe('isDark getter', () => {
    it('returns true when mode resolves to dark', () => {
      mockResolveThemeModeIsDark.mockReturnValue(true)
      const store = useThemeStore()
      expect(store.isDark).toBe(true)
    })

    it('returns false when mode resolves to light', async () => {
      vi.resetModules()
      setActivePinia(createPinia())
      mockResolveThemeModeIsDark.mockReturnValue(false)
      const mod = await import('./theme')
      const freshStore = mod.useThemeStore()
      expect(freshStore.isDark).toBe(false)
    })
  })

  describe('init/dispose — matchMedia lifecycle', () => {
    it('registers and removes change listener', () => {
      const addSpy = vi.fn()
      const removeSpy = vi.fn()
      mockGetSystemDarkModeQuery.mockReturnValue({
        addEventListener: addSpy,
        removeEventListener: removeSpy,
      })

      const store = useThemeStore()
      store.init()

      expect(addSpy).toHaveBeenCalledWith('change', expect.any(Function))

      store.dispose()
      expect(removeSpy).toHaveBeenCalledWith('change', expect.any(Function))
    })

    it('handler only fires refreshTheme when mode is auto or glass', () => {
      let handler: (() => void) | undefined
      const addSpy = vi.fn((_: string, fn: () => void) => {
        handler = fn
      })
      mockGetSystemDarkModeQuery.mockReturnValue({
        addEventListener: addSpy,
        removeEventListener: vi.fn(),
      })

      const store = useThemeStore()
      store.init()
      mockApplyTheme.mockClear()

      store.mode = 'light'
      handler?.()
      expect(mockApplyTheme).not.toHaveBeenCalled()

      store.mode = 'auto'
      handler?.()
      expect(mockApplyTheme).toHaveBeenCalled()
    })

    it('falls back to refreshTheme only when getSystemDarkModeQuery returns null', () => {
      mockGetSystemDarkModeQuery.mockReturnValue(null)
      const store = useThemeStore()
      mockApplyTheme.mockClear()

      store.init()

      expect(mockApplyTheme).toHaveBeenCalled()
    })
  })
})
