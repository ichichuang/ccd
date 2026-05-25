import 'uno.css'

import { createApp } from 'vue'
import App from './App.vue'
import { fadeOutNativePreloader } from './bootstrap/preloader'
import { setupPlugins } from './plugins'
import router from './router'
import { setupDesktopDesignSystem } from './theme'

const VITE_PRELOAD_RELOAD_KEY = 'ccd:desktop:vite-preload-reload'

const nextFrame = () =>
  new Promise<void>(resolve => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve())
    })
  })

window.addEventListener('vite:preloadError', event => {
  event.preventDefault()
  const reloadedFlag = sessionStorage.getItem(VITE_PRELOAD_RELOAD_KEY)
  if (!reloadedFlag) {
    sessionStorage.setItem(VITE_PRELOAD_RELOAD_KEY, 'true')
    window.location.reload()
    return
  }
  console.error('Vite chunk preload failed permanently.')
  sessionStorage.removeItem(VITE_PRELOAD_RELOAD_KEY)
})

async function bootstrap() {
  if (typeof document !== 'undefined') {
    document.documentElement.dataset.appReady = 'false'
    document.documentElement.dataset.preloaderState = 'visible'
    document.documentElement.dataset.runtimeLoading = 'true'
  }

  setupDesktopDesignSystem()

  const app = createApp(App)
  setupPlugins(app)
  app.mount('#app')

  await router.isReady()
  await nextFrame()
  fadeOutNativePreloader()
}

bootstrap().catch(error => {
  console.error('Desktop bootstrap failed:', error)

  const preloader = document.getElementById('preloader-bg')
  if (!preloader) return

  const message = error instanceof Error ? error.message : String(error)
  preloader.innerHTML = `
    <div style="text-align:center;color:rgb(var(--foreground,156 163 175));font-family:system-ui,sans-serif;padding:2rem;">
      <p style="font-size:1.125rem;margin-bottom:0.5rem;">桌面端启动失败</p>
      <p style="font-size:0.875rem;opacity:0.7;">${message}</p>
      <button onclick="location.reload()" style="margin-top:1rem;padding:0.5rem 1.5rem;border-radius:0.375rem;border:1px solid rgb(var(--border,229 231 235));background:transparent;color:inherit;cursor:pointer;">刷新页面</button>
    </div>`
})
