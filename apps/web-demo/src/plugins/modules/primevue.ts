import type { App } from 'vue'
import { primevueZhCN } from '@/locales/primevue-zh-CN'
import { PRIMEVUE_LOCALE_MAP } from '@/locales/primevue-locales'
import { t, type SupportedLocale } from '@/locales'
import store from '@/stores'
import { useDeviceStore, useLocaleStore } from '@/stores/modules/system'
import { useSizeStore } from '@/stores/modules/system'
import { installPrimeVueRuntime } from '@ccd/vue-primevue-adapter'
import { PRIME_DIALOG_RUNTIME_CONFIG_KEY } from '@ccd/vue-ui'

/**
 * Register PrimeVue v4 (Styled Mode)
 * Uses @primeuix/themes with a custom preset adapted to the CCD design system.
 * Locale 按当前系统语言设置，运行时切换由 AppPrimeVueGlobals.vue 的 watch 同步。
 */
export function setupPrimeVue(app: App) {
  const sizeStore = useSizeStore()
  const deviceStore = useDeviceStore(store)
  const localeStore = useLocaleStore(store)
  const initialLocale: SupportedLocale = localeStore.locale
  const initialPrimeLocale = PRIMEVUE_LOCALE_MAP[initialLocale] ?? primevueZhCN

  installPrimeVueRuntime(app, {
    sizeSource: sizeStore,
    locale: initialPrimeLocale,
  })
  app.provide(PRIME_DIALOG_RUNTIME_CONFIG_KEY, {
    translate: t,
    isDialogDraggable: () => deviceStore.isPCLayout || deviceStore.isTabletLayout,
  })
}
