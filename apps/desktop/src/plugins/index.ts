import type { App } from 'vue'
import { installPrimeVueRuntime } from '@ccd/vue-primevue-adapter'
import { setupRouter } from '../router'
import { desktopSizeSource } from '../theme'

export function setupPlugins(app: App): void {
  installPrimeVueRuntime(app, {
    sizeSource: desktopSizeSource,
  })
  setupRouter(app)
}
