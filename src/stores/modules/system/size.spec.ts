// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

const comfortablePreset: SizePreset = {
  name: 'comfortable',
  label: 'Comfortable',
  radius: 8,
  spacingBase: 4,
  fontSizeBase: 16,
  sidebarWidth: 280,
  sidebarCollapsedWidth: 60,
  headerHeight: 60,
  breadcrumbHeight: 32,
  footerHeight: 32,
  tabsHeight: 40,
}
const compactPreset: SizePreset = {
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
}
const loosePreset: SizePreset = {
  name: 'loose',
  label: 'Loose',
  radius: 12,
  spacingBase: 5,
  fontSizeBase: 18,
  sidebarWidth: 300,
  sidebarCollapsedWidth: 80,
  headerHeight: 66,
  breadcrumbHeight: 36,
  footerHeight: 38,
  tabsHeight: 46,
}

vi.mock('@/constants/size', () =>
  Object.fromEntries([
    ['SIZE_PRESETS', [comfortablePreset, compactPreset, loosePreset]],
    ['DEFAULT_SIZE_NAME', 'comfortable'],
    ['SIZE_PERSIST_KEY', 'test-size'],
  ])
)
vi.mock('@/utils/theme/sizeEngine', () => ({
  generateSizeVars: vi.fn(() => ({})),
  applySizeTheme: vi.fn(),
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

describe('useSizeStore', () => {
  let useSizeStore: typeof import('./size').useSizeStore

  beforeEach(async () => {
    vi.resetModules()
    vi.clearAllMocks()
    setActivePinia(createPinia())
    const mod = await import('./size')
    useSizeStore = mod.useSizeStore
  })

  describe('setSize', () => {
    it('accepts valid preset name', async () => {
      const { applySizeTheme } = await import('@/utils/theme/sizeEngine')
      const store = useSizeStore()

      store.setSize('compact')

      expect(store.sizeName).toBe('compact')
      expect(applySizeTheme).toHaveBeenCalled()
    })

    it('warns and resets on invalid name', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const store = useSizeStore()

      store.setSize('invalid' as SizeMode)

      expect(store.sizeName).toBe('comfortable')
      expect(warnSpy).toHaveBeenCalled()
      warnSpy.mockRestore()
    })
  })

  describe('currentPreset getter', () => {
    it('returns matching preset', () => {
      const store = useSizeStore()
      store.sizeName = 'compact'
      expect(store.currentPreset.name).toBe('compact')
    })

    it('falls back to default if name does not match', () => {
      const store = useSizeStore()
      store.sizeName = 'nonexistent' as SizeMode
      expect(store.currentPreset.name).toBe('comfortable')
    })
  })

  describe('resetState', () => {
    it('restores default size', () => {
      const store = useSizeStore()
      store.sizeName = 'compact'

      store.resetState()

      expect(store.sizeName).toBe('comfortable')
    })
  })
})
