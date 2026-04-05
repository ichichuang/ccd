// 导入功能样式
import '@/assets/styles/reset.scss'
import 'animate.css'
import 'uno.css'

// 导入应用
import App from '@/App.vue'
import { setOnUnauthorized, setTokenProvider } from '@/infra/auth/tokenProvider'
import { setupPlugins } from '@/plugins'
import router from '@/router'
import { useUserStoreWithOut } from '@/stores/modules/user'
import { fadeOutNativePreloader } from '@/hooks/layout/useLoading'
import { preload } from '@/utils/theme/sizeEngine'

// Handle Vite module preload failures gracefully (e.g., stale cache, transient network)
window.addEventListener('vite:preloadError', event => {
  event.preventDefault()
  window.location.reload()
})

async function bootstrap() {
  if (typeof document !== 'undefined') preload()

  const app = createApp(App)

  // 设置插件（支持异步，含 Pinia）
  await setupPlugins(app)

  // 依赖注入：HTTP 层通过 TokenProvider 取 token / 401 回调，不直接依赖 Store
  setTokenProvider(() => useUserStoreWithOut().getToken)
  setOnUnauthorized(async () => {
    await useUserStoreWithOut().logout()
    // Guard against infinite reload loops: if reloaded within 5s, redirect to login instead
    const RELOAD_KEY = '__auth_reload_ts'
    const lastReload = Number(sessionStorage.getItem(RELOAD_KEY) || 0)
    if (Date.now() - lastReload < 5000) {
      window.location.hash = '#/login'
      return
    }
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()))
    window.location.reload()
  })

  // 挂载应用（loading 关闭由 router.afterEach 负责）
  app.mount('#app')
  // Single-Owner Handoff: 首跳路由就绪后兜底移除原生 preloader（内部门闩保证只执行一次）
  await router.isReady()
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
