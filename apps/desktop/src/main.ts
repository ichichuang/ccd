import 'uno.css'

import { createApp } from 'vue'
import PrimeVue from 'primevue/config'
import App from './App.vue'
import { desktopSizeSource, setupDesktopDesignSystem } from './theme'
import { createPrimeVueAdapterConfig } from '@ccd/vue-primevue-adapter'

setupDesktopDesignSystem()

createApp(App)
  .use(
    PrimeVue,
    createPrimeVueAdapterConfig({
      sizeSource: desktopSizeSource,
    })
  )
  .mount('#app')
