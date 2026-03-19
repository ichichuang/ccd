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
import { createCustomPreset } from '@/utils/theme/primevuePreset'
import { formControlsPt } from '@/utils/theme/ptPresets/formControlsPt'
import { menuPt } from '@/utils/theme/ptPresets/menuPt'

/**
 * Register PrimeVue v4 (Styled Mode)
 * Uses @primevue/themes with a custom preset adapted to this template's design system.
 * Locale 按当前系统语言设置，运行时切换由 AppPrimeVueGlobals.vue 的 watch 同步。
 */
export function setupPrimeVue(app: App) {
  const sizeStore = useSizeStore()
  const localeStore = useLocaleStore(store)
  const initialLocale: SupportedLocale = localeStore.locale
  const initialPrimeLocale = PRIMEVUE_LOCALE_MAP[initialLocale] ?? primevueZhCN

  // Generate the dynamic preset adapted to our design & size system
  const dynamicPreset = createCustomPreset(sizeStore)

  // ⚠️ HMR 限制：PT 对象在 app.use() 时被静态捕获，修改 ptPresets 文件后需全页面刷新。
  // 这是 PrimeVue v4 的框架限制，非项目缺陷。PT 属于设计系统基础设施，变更频率低。
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
    pt: { ...menuPt, ...formControlsPt },
    ptOptions: {
      mergeSections: true,
      mergeProps: true,
    },
    ripple: true,
    locale: initialPrimeLocale,
  })

  app.use(ToastService)
  app.use(ConfirmationService)
  app.use(DialogService)
  app.directive('tooltip', Tooltip)
}
