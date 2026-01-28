import type { LocaleInfo, SupportedLocale } from '@/locales'
import { getCurrentLocale, setLocale, supportedLocales } from '@/locales'
import { DEFAULT_LOCALE, LOCALE_TO_TIMEZONE_MAP } from '@/constants/locale'
import store from '@/stores'
import { defineStore } from 'pinia'
import { useMitt } from '@/utils/mitt'

interface LocaleState {
  locale: SupportedLocale
  loading: boolean
  followTimezone: boolean
}

export const useLocaleStore = defineStore('locale', {
  state: (): LocaleState => ({
    // 默认语言固定为中文
    locale: DEFAULT_LOCALE,
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
      const emitter = useMitt()

      try {
        setLocale(newLocale)
        this.locale = newLocale

        // ===== v7.0 事件总线对齐 =====
        // 1. 通过 mitt 作为新的全局事件总线
        emitter.emit('localeChange', newLocale)

        // 2. 若开启跟随时区，则根据语言派发时区变更
        if (this.followTimezone) {
          const tz = LOCALE_TO_TIMEZONE_MAP[newLocale] || 'UTC'
          emitter.emit('timezoneChange', tz)

          // 仍保留 window 事件作为过渡兼容层（供旧代码监听）
          window.dispatchEvent(
            new CustomEvent('timezone-changed', {
              detail: { timezone: tz },
            })
          )
        }

        // 3. 保留原有的 window 事件，确保过渡期间旧逻辑仍然可用
        window.dispatchEvent(
          new CustomEvent('locale-changed', {
            detail: { locale: newLocale },
          })
        )

        window.dispatchEvent(
          new CustomEvent('locale-store-changed', {
            detail: { locale: newLocale },
          })
        )
      } catch (error) {
        console.error('Failed to switch locale:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // 初始化语言：根据 store 的值应用到 i18n
    initLocale() {
      // [v7.1 FIX] 使用常量替代硬编码，确保单一事实来源
      const target = this.locale || DEFAULT_LOCALE
      setLocale(target)
      this.locale = getCurrentLocale()

      const emitter = useMitt()

      // 初始化时，通过 mitt 与 window 双通道同步 locale 与 timezone
      emitter.emit('localeChange', this.locale)

      window.dispatchEvent(
        new CustomEvent('locale-changed', {
          detail: { locale: this.locale },
        })
      )

      if (this.followTimezone) {
        const tz = LOCALE_TO_TIMEZONE_MAP[this.locale] || 'UTC'
        emitter.emit('timezoneChange', tz)

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
        const tz = LOCALE_TO_TIMEZONE_MAP[this.locale] || 'UTC'
        const emitter = useMitt()

        emitter.emit('timezoneChange', tz)

        // 保留 window 事件作为兼容
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
