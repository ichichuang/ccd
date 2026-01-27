import type { LocaleInfo, SupportedLocale } from '@/locales'
import { getCurrentLocale, setLocale, supportedLocales } from '@/locales'
import store from '@/stores'
import { defineStore } from 'pinia'

interface LocaleState {
  locale: SupportedLocale
  loading: boolean
  followTimezone: boolean
}

// 语言到默认时区映射（可按需补充）
const localeToTimezoneMap: Record<SupportedLocale, string> = {
  ['zh-CN']: 'Asia/Shanghai',
  ['en-US']: 'America/New_York',
  ['zh-TW']: 'Asia/Taipei',
}

export const useLocaleStore = defineStore('locale', {
  state: (): LocaleState => ({
    // 默认语言固定为中文
    locale: 'zh-CN',
    loading: false,
    // 控制是否跟随语言自动切换时区
    followTimezone: true,
  }),

  getters: {
    // 获取当前语言
    currentLocale: (state: LocaleState) => state.locale,
    // 获取当前语言信息
    currentLocaleInfo: (state: LocaleState) =>
      supportedLocales.find(item => item.key === state.locale),
    // 是否为中文语言
    isChineseLang: (state: LocaleState) => state.locale.startsWith('zh'),
    // 是否为 RTL 语言
    isRTL: (state: LocaleState) => {
      const localeInfo = supportedLocales.find(item => item.key === state.locale)
      return localeInfo?.direction === 'rtl'
    },
    // 获取可用语言列表
    availableLocales: () => supportedLocales,
    // 是否跟随时区
    isFollowTimezone: (state: LocaleState) => state.followTimezone,
  },

  actions: {
    // 切换语言
    async switchLocale(newLocale: SupportedLocale) {
      if (this.locale === newLocale) {
        return
      }

      this.loading = true

      try {
        setLocale(newLocale)
        this.locale = newLocale

        // 标准事件，供 DateUtils 监听
        window.dispatchEvent(
          new CustomEvent('locale-changed', {
            detail: { locale: newLocale },
          })
        )

        // 兼容现有事件
        window.dispatchEvent(
          new CustomEvent('locale-store-changed', {
            detail: { locale: newLocale },
          })
        )

        // 若开启跟随时区，则根据语言派发时区变更
        if (this.followTimezone) {
          const tz = localeToTimezoneMap[newLocale] || 'UTC'
          window.dispatchEvent(
            new CustomEvent('timezone-changed', {
              detail: { timezone: tz },
            })
          )
        }
      } catch (error) {
        console.error('Failed to switch locale:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // 初始化语言：根据 store 的值应用到 i18n
    initLocale() {
      const target = this.locale || 'zh-CN'
      setLocale(target)
      this.locale = getCurrentLocale()

      // 初始化时，按策略同步 locale 与 timezone
      window.dispatchEvent(
        new CustomEvent('locale-changed', {
          detail: { locale: this.locale },
        })
      )

      if (this.followTimezone) {
        const tz = localeToTimezoneMap[this.locale] || 'UTC'
        window.dispatchEvent(
          new CustomEvent('timezone-changed', {
            detail: { timezone: tz },
          })
        )
      }
    },

    // 获取语言信息
    getLocaleInfo(locale: SupportedLocale): LocaleInfo | undefined {
      return supportedLocales.find(item => item.key === locale)
    },

    // 设置是否跟随时区
    setFollowTimezone(value: boolean) {
      this.followTimezone = value
      // 切换策略后，立即按需应用当前语言对应时区
      if (this.followTimezone) {
        const tz = localeToTimezoneMap[this.locale] || 'UTC'
        window.dispatchEvent(
          new CustomEvent('timezone-changed', {
            detail: { timezone: tz },
          })
        )
      }
    },
  },

  persist: {
    key: `${import.meta.env.VITE_PINIA_PERSIST_KEY_PREFIX}-locale`,
    storage: localStorage,
  },
})

export const useLocaleStoreWithOut = () => {
  return useLocaleStore(store)
}
