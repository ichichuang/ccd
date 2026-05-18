// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('@/locales', () => ({
  getCurrentLocale: vi.fn(() => 'zh-CN'),
  setLocale: vi.fn(),
  supportedLocales: [
    { key: 'zh-CN', label: '简体中文', direction: 'ltr' },
    { key: 'en-US', label: 'English', direction: 'ltr' },
  ],
}))
vi.mock('@/constants/locale', () =>
  Object.fromEntries([
    ['DEFAULT_LOCALE', 'zh-CN'],
    ['LOCALE_TO_TIMEZONE_MAP', { 'zh-CN': 'Asia/Shanghai', 'en-US': 'America/New_York' }],
  ])
)
vi.mock('@/utils/mitt', () => ({
  useMitt: () => ({ emit: vi.fn() }),
}))
vi.mock('@/stores', async () => {
  const pinia = await import('pinia')
  return { default: pinia.createPinia() }
})

describe('useLocaleStore', () => {
  let useLocaleStore: typeof import('./locale').useLocaleStore

  beforeEach(async () => {
    vi.resetModules()
    vi.clearAllMocks()
    setActivePinia(createPinia())
    const mod = await import('./locale')
    useLocaleStore = mod.useLocaleStore
  })

  describe('switchLocale', () => {
    it('is no-op when locale matches store and i18n', async () => {
      const { setLocale, getCurrentLocale } = await import('@/locales')
      vi.mocked(getCurrentLocale).mockReturnValue('zh-CN')
      const store = useLocaleStore()
      store.locale = 'zh-CN'

      await store.switchLocale('zh-CN')

      expect(setLocale).not.toHaveBeenCalled()
    })

    it('updates locale and calls setLocale on change', async () => {
      const { setLocale, getCurrentLocale } = await import('@/locales')
      vi.mocked(getCurrentLocale).mockReturnValue('zh-CN')
      const store = useLocaleStore()
      store.locale = 'zh-CN'

      await store.switchLocale('en-US')

      expect(store.locale).toBe('en-US')
      expect(setLocale).toHaveBeenCalledWith('en-US')
    })

    it('detects i18n desync and warns', async () => {
      const { getCurrentLocale } = await import('@/locales')
      vi.mocked(getCurrentLocale).mockReturnValue('en-US')
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const store = useLocaleStore()
      store.locale = 'zh-CN'

      await store.switchLocale('en-US')

      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('desync'))
      warnSpy.mockRestore()
    })

    it('manages loading flag through async flow', async () => {
      const { getCurrentLocale } = await import('@/locales')
      vi.mocked(getCurrentLocale).mockReturnValue('zh-CN')
      const store = useLocaleStore()
      store.locale = 'zh-CN'

      expect(store.loading).toBe(false)
      const promise = store.switchLocale('en-US')
      await promise
      expect(store.loading).toBe(false)
    })
  })

  describe('resetState', () => {
    it('restores defaults and calls initLocale', async () => {
      const { setLocale } = await import('@/locales')
      const store = useLocaleStore()
      store.locale = 'en-US'
      store.followTimezone = false

      store.resetState()

      expect(store.locale).toBe('zh-CN')
      expect(store.followTimezone).toBe(true)
      expect(setLocale).toHaveBeenCalled()
    })
  })

  describe('setFollowTimezone', () => {
    it('emits timezone for current locale when set to true', () => {
      const store = useLocaleStore()
      store.locale = 'zh-CN'
      store.followTimezone = false

      store.setFollowTimezone(true)

      expect(store.followTimezone).toBe(true)
    })
  })
})
