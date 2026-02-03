import type { App } from 'vue'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'
import DialogService from 'primevue/dialogservice'
import Tooltip from 'primevue/tooltip'
import { primevueZhCN } from '@/locales/primevue-zh-CN'
import { useSizeStore } from '@/stores/modules/size'
import { createCustomPreset } from '@/utils/theme/primevue-preset'

/**
 * Register PrimeVue v4 (Styled Mode)
 * Uses @primevue/themes with a custom preset adapted to CCD's design system.
 */
export function setupPrimeVue(app: App) {
  const sizeStore = useSizeStore()

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
    locale: primevueZhCN,
  })

  app.use(ToastService)
  app.use(ConfirmationService)
  app.use(DialogService)
  app.directive('tooltip', Tooltip)
}
