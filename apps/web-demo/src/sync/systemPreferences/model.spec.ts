// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

const mockApplyTheme = vi.fn()
const mockApplyThemeModeToRoot = vi.fn()
const mockApplySizeTheme = vi.fn()
const mockSetLocale = vi.fn()

vi.mock('@ccd/design-tokens', async importOriginal => ({
  ...(await importOriginal<typeof import('@ccd/design-tokens')>()),
  THEME_PRESETS: [{ name: 'default' }, { name: 'ocean' }],
  DEFAULT_THEME_NAME: 'default',
  DEFAULT_THEME_MODE: 'light',
  DEFAULT_TRANSITION_DURATION: 600,
}))

vi.mock('@/utils/theme/engine', () => ({
  generateThemeVars: vi.fn(() => ({})),
  applyTheme: mockApplyTheme,
}))

vi.mock('@/utils/theme/mode', () => ({
  applyThemeModeToRoot: mockApplyThemeModeToRoot,
  getSystemDarkModeQuery: vi.fn(() => null),
  resolveThemeModeIsDark: vi.fn((mode: string) => mode === 'dark'),
}))

vi.mock('@/utils/theme/transitions', () => ({
  isThemeLocked: vi.fn(() => false),
}))

vi.mock('@/constants/size', () => ({
  ...Object.fromEntries([
    ['DEFAULT_SIZE_NAME', 'comfortable'],
    ['SIZE_PERSIST_KEY', 'test-size'],
    [
      'SIZE_PRESETS',
      [
        {
          name: 'compact',
          label: 'Compact',
          radius: 6,
          spacingBase: 3,
          fontSizeBase: 14,
          sidebarWidth: 260,
          sidebarCollapsedWidth: 56,
          headerHeight: 48,
          breadcrumbHeight: 28,
          footerHeight: 28,
          tabsHeight: 36,
        },
        {
          name: 'comfortable',
          label: 'Comfortable',
          radius: 8,
          spacingBase: 4,
          fontSizeBase: 16,
          sidebarWidth: 280,
          sidebarCollapsedWidth: 64,
          headerHeight: 60,
          breadcrumbHeight: 32,
          footerHeight: 32,
          tabsHeight: 40,
        },
      ],
    ],
  ]),
}))

vi.mock('@/utils/theme/sizeEngine', () => ({
  generateSizeVars: vi.fn(() => ({})),
  applySizeTheme: mockApplySizeTheme,
}))

vi.mock('@/locales', () => ({
  ...Object.fromEntries([
    ['DEFAULT_LOCALE', 'zh-CN'],
    ['LOCALE_TO_TIMEZONE_MAP', { 'zh-CN': 'Asia/Shanghai', en: 'UTC' }],
  ]),
  supportedLocales: [
    { key: 'zh-CN', name: '中文', flag: '🇨🇳', direction: 'ltr' },
    { key: 'en', name: 'English', flag: '🇺🇸', direction: 'ltr' },
  ],
  getCurrentLocale: vi.fn(() => 'en'),
  setLocale: mockSetLocale,
}))

vi.mock('@/utils/safeStorage/piniaSerializer', () => ({
  createPiniaEncryptedSerializer: () => ({
    serialize: (value: unknown) => JSON.stringify(value),
    deserialize: (value: string) => JSON.parse(value),
  }),
}))

vi.mock('@/stores', async () => {
  const pinia = await import('pinia')
  return { default: pinia.createPinia() }
})

describe('system preferences model', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
  })

  it('applies remote preferences to theme, size, layout, and locale stores', async () => {
    const { applySystemPreferencesToStores } = await import('./model')
    const { useThemeStore, useSizeStore, useLayoutStore, useLocaleStore } =
      await import('@/stores/modules/system')

    applySystemPreferencesToStores({
      theme: { mode: 'dark', theme: 'ocean', accentColor: '#336699' },
      size: { size: 'compact' },
      layout: { layout: 'mix', collapsed: true },
      locale: 'en',
      updatedAt: 10,
    })

    const themeStore = useThemeStore()
    const sizeStore = useSizeStore()
    const layoutStore = useLayoutStore()
    const localeStore = useLocaleStore()

    expect(themeStore.mode).toBe('dark')
    expect(themeStore.themeName).toBe('ocean')
    expect(themeStore.accentColor).toBe('#336699')
    expect(mockApplyTheme).toHaveBeenCalled()
    expect(sizeStore.sizeName).toBe('compact')
    expect(mockApplySizeTheme).toHaveBeenCalled()
    expect(layoutStore.preferredMode).toBe('mix')
    expect(layoutStore.sidebarCollapse).toBe(true)
    expect(layoutStore.userAdjusted).toBe(true)
    expect(localeStore.locale).toBe('en')
    expect(mockSetLocale).toHaveBeenCalledWith('en')
  })
})
