import type { App } from 'vue'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'
import DialogService from 'primevue/dialogservice'
import Tooltip from 'primevue/tooltip'
import { primevueZhCN } from '@/locales/primevue-zh-CN'
import { PRIMEVUE_LOCALE_MAP } from '@/locales/primevue-locales'
import type { SupportedLocale } from '@/locales'
import store from '@/stores'
import { useLocaleStore } from '@/stores/modules/locale'
import { useSizeStore } from '@/stores/modules/size'
import { createCustomPreset } from '@/utils/theme/primevue-preset'

/**
 * Register PrimeVue v4 (Styled Mode)
 * Uses @primevue/themes with a custom preset adapted to CCD's design system.
 * Locale 按当前系统语言设置，运行时切换由 App.vue 的 watch 同步。
 */
export function setupPrimeVue(app: App) {
  const sizeStore = useSizeStore()
  const localeStore = useLocaleStore(store)
  const initialLocale: SupportedLocale = localeStore.locale
  const initialPrimeLocale = PRIMEVUE_LOCALE_MAP[initialLocale] ?? primevueZhCN

  // Generate the dynamic preset adapted to our design & size system
  const dynamicPreset = createCustomPreset(sizeStore)

  app.use(PrimeVue, {
    theme: {
      preset: dynamicPreset,
      options: {
        prefix: 'p',
        darkModeSelector: '.dark', // Sync with our Tailwind/UnoCSS dark mode
        // cssLayer: {
        //   name: 'primevue',
        //   order: 'tailwind-base, primevue, tailwind-utilities',
        // },
      },
    },
    ripple: true,
    locale: initialPrimeLocale,
  })

  app.use(ToastService)
  app.use(ConfirmationService)
  app.use(DialogService)
  app.directive('tooltip', Tooltip)
}
