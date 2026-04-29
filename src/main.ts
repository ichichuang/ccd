// 导入功能样式（全局样式统一在入口注册，避免散落在 composable 中被摇树遗漏）
import '@/assets/styles/reset.scss'
import '@/assets/styles/ambient-orb-animations.scss'
import '@/assets/styles/animate-lite.scss'
import 'uno.css'

// 导入应用
import App from '@/App.vue'
import { RUNTIME_STORAGE_KEYS } from '@/constants/runtime'
import { setupPlugins } from '@/plugins'
import router from '@/router'
import { useLayoutStoreWithOut } from '@/stores/modules/system'
import { fadeOutNativePreloader } from '@/hooks/layout/useLoading'
import { preload } from '@/utils/theme/sizeEngine'

/**
 * Wait two paints to ensure mounted DOM + CSS var updates
 * are fully committed before visual handoff.
 */
const nextFrame = () =>
  new Promise<void>(resolve => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve())
    })
  })

// Handle Vite module preload failures gracefully (e.g., stale cache, transient network)
window.addEventListener('vite:preloadError', event => {
  event.preventDefault()
  const reloadedFlag = sessionStorage.getItem(RUNTIME_STORAGE_KEYS.vitePreloadReload)
  if (!reloadedFlag) {
    sessionStorage.setItem(RUNTIME_STORAGE_KEYS.vitePreloadReload, 'true')
    window.location.reload()
    return
  }
  console.error('Vite chunk preload failed permanently.')
  sessionStorage.removeItem(RUNTIME_STORAGE_KEYS.vitePreloadReload)
})

async function bootstrap() {
  if (typeof document !== 'undefined') {
    document.documentElement.dataset.appReady = 'false'
    document.documentElement.dataset.runtimeLoading = 'true'
  }
  if (typeof document !== 'undefined') preload()

  const app = createApp(App)

  // 设置插件（支持异步，含 Pinia）
  await setupPlugins(app)

  // 挂载应用
  app.mount('#app')
  // Single-Owner Handoff: 首跳路由就绪后结束启动期默认 loading，并移除原生 preloader。
  // Double rAF ensures theme/size CSS vars are applied and first paint is stable.
  await router.isReady()
  await nextFrame()
  const layoutStore = useLayoutStoreWithOut()
  if (layoutStore.loadingCount > 0) {
    layoutStore.endGlobalLoading()
  }
  fadeOutNativePreloader()
}

// 启动应用
bootstrap().catch(error => {
  console.error('应用启动失败:', error)
  // Visual fallback: show error in preloader (which is still visible at this point)
  const preloader = document.getElementById('preloader-bg')
  if (preloader) {
    const msg = error instanceof Error ? error.message : String(error)
    preloader.innerHTML = `
      <div style="text-align:center;color:rgb(var(--foreground,156 163 175));font-family:system-ui,sans-serif;padding:2rem;">
        <p style="font-size:1.125rem;margin-bottom:0.5rem;">应用启动失败</p>
        <p style="font-size:0.875rem;opacity:0.7;">${msg}</p>
        <button onclick="location.reload()" style="margin-top:1rem;padding:0.5rem 1.5rem;border-radius:0.375rem;border:1px solid rgb(var(--border,229 231 235));background:transparent;color:inherit;cursor:pointer;">刷新页面</button>
      </div>`
  }
})
