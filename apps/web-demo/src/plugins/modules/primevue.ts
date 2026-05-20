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
import { useLocaleStore } from '@/stores/modules/system'
import { useSizeStore } from '@/stores/modules/system'
import { createPrimeVueAdapterConfig } from '@ccd/vue-primevue-adapter'

/**
 * Register PrimeVue v4 (Styled Mode)
 * Uses @primeuix/themes with a custom preset adapted to this template's design system.
 * Locale 按当前系统语言设置，运行时切换由 AppPrimeVueGlobals.vue 的 watch 同步。
 */
export function setupPrimeVue(app: App) {
  const sizeStore = useSizeStore()
  const localeStore = useLocaleStore(store)
  const initialLocale: SupportedLocale = localeStore.locale
  const initialPrimeLocale = PRIMEVUE_LOCALE_MAP[initialLocale] ?? primevueZhCN

  app.use(PrimeVue, createPrimeVueAdapterConfig({
    sizeSource: sizeStore,
    locale: initialPrimeLocale,
  }))

  app.use(ToastService)
  app.use(ConfirmationService)
  app.use(DialogService)
  app.directive('tooltip', Tooltip)
}
