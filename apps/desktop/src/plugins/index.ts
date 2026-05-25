import type { App } from 'vue'
import PrimeVue from 'primevue/config'
import ConfirmationService from 'primevue/confirmationservice'
import DialogService from 'primevue/dialogservice'
import Tooltip from 'primevue/tooltip'
import ToastService from 'primevue/toastservice'
import { createPrimeVueAdapterConfig } from '@ccd/vue-primevue-adapter'
import { setupRouter } from '../router'
import { desktopSizeSource } from '../theme'

export function setupPlugins(app: App): void {
  app.use(
    PrimeVue,
    createPrimeVueAdapterConfig({
      sizeSource: desktopSizeSource,
    })
  )

  app.use(ToastService)
  app.use(ConfirmationService)
  app.use(DialogService)
  app.directive('tooltip', Tooltip)

  setupRouter(app)
}
