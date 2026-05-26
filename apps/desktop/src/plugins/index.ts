import type { App } from 'vue'
import PrimeVue from 'primevue/config'
import { createPrimeVueAdapterConfig, installPrimeVueServices } from '@ccd/vue-primevue-adapter'
import { setupRouter } from '../router'
import { desktopSizeSource } from '../theme'

export function setupPlugins(app: App): void {
  app.use(
    PrimeVue,
    createPrimeVueAdapterConfig({
      sizeSource: desktopSizeSource,
    })
  )

  installPrimeVueServices(app)

  setupRouter(app)
}
