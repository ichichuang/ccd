import 'uno.css'

import { createApp } from 'vue'
import {
  fadeOutNativePreloader,
  markAppBootstrapping,
  setupVitePreloadErrorRecovery,
  waitForStablePaint,
} from '@ccd/vue-app-platform'
import App from './App.vue'
import { setupPlugins } from './plugins'
import router from './router'
import { setupDesktopDesignSystem } from './theme'

const DESKTOP_PRELOAD_RELOAD_KEY = 'ccd:desktop:vite-preload-reload'

setupVitePreloadErrorRecovery({
  storageKey: DESKTOP_PRELOAD_RELOAD_KEY,
})

async function bootstrap() {
  markAppBootstrapping()
  if (typeof document !== 'undefined') {
    document.documentElement.dataset.preloaderState = 'visible'
  }

  setupDesktopDesignSystem()

  const app = createApp(App)
  setupPlugins(app)
  app.mount('#app')

  await router.isReady()
  await waitForStablePaint()
  fadeOutNativePreloader({ removeDelayMs: 400 })
}

bootstrap().catch(error => {
  console.error('Desktop bootstrap failed:', error)

  const preloader = document.getElementById('preloader-bg')
  if (!preloader) return

  const message = error instanceof Error ? error.message : String(error)

  const container = document.createElement('div')
  container.style.textAlign = 'center'
  container.style.color = 'rgb(var(--foreground,156 163 175))'
  container.style.fontFamily = 'system-ui,sans-serif'
  container.style.padding = '2rem'

  const title = document.createElement('p')
  title.style.fontSize = '1.125rem'
  title.style.marginBottom = '0.5rem'
  title.textContent = '桌面端启动失败'

  const detail = document.createElement('p')
  detail.style.fontSize = '0.875rem'
  detail.style.opacity = '0.7'
  detail.textContent = message

  const retryButton = document.createElement('button')
  retryButton.type = 'button'
  retryButton.style.marginTop = '1rem'
  retryButton.style.padding = '0.5rem 1.5rem'
  retryButton.style.borderRadius = '0.375rem'
  retryButton.style.border = '1px solid rgb(var(--border,229 231 235))'
  retryButton.style.background = 'transparent'
  retryButton.style.color = 'inherit'
  retryButton.style.cursor = 'pointer'
  retryButton.textContent = '刷新页面'
  retryButton.addEventListener('click', () => {
    window.location.reload()
  })

  container.append(title, detail, retryButton)
  preloader.replaceChildren(container)
})
