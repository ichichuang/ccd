// 导入功能样式（全局样式统一在入口注册，避免散落在 composable 中被摇树遗漏）
import '@/assets/styles/reset.scss'
import '@/assets/styles/ambient-orb-animations.scss'
import '@/assets/styles/animate-lite.scss'
import '@ccd/vue-ui/style.css'
import 'uno.css'

// 导入应用
import {
  markAppBootstrapping,
  setupVitePreloadErrorRecovery,
  waitForStablePaint,
} from '@ccd/vue-app-platform'
import App from '@/App.vue'
import { appLogger } from '@/adapters/logger.adapter'
import { RUNTIME_STORAGE_KEYS } from '@/constants/runtime'
import { setupDeferredPlugins, setupPlugins } from '@/plugins'
import router from '@/router'
import { useLayoutStoreWithOut } from '@/stores/modules/system'
import { fadeOutNativePreloader } from '@/hooks/layout/useLoading'
import { preload } from '@/utils/theme/sizeEngine'

setupVitePreloadErrorRecovery({
  storageKey: RUNTIME_STORAGE_KEYS.vitePreloadReload,
})

async function bootstrap() {
  markAppBootstrapping()
  if (typeof document !== 'undefined') preload()

  const app = createApp(App)

  // 设置启动关键插件，保持 Vue shell 挂载所需基础设施同步就绪。
  setupPlugins(app)

  // 挂载应用
  app.mount('#app')
  // Single-Owner Handoff: 首跳路由就绪后结束启动期默认 loading，并移除原生 preloader。
  // Double rAF ensures theme/size CSS vars are applied and first paint is stable.
  await router.isReady()
  await waitForStablePaint()
  const layoutStore = useLayoutStoreWithOut()
  if (layoutStore.loadingCount > 0) {
    layoutStore.endGlobalLoading()
  }
  fadeOutNativePreloader()
  setupDeferredPlugins(app)
}

// 启动应用
bootstrap().catch(error => {
  appLogger.error('应用启动失败:', error)
  // Visual fallback: show error in preloader (which is still visible at this point)
  const preloader = document.getElementById('preloader-bg')
  if (preloader) {
    const msg = error instanceof Error ? error.message : String(error)

    const container = document.createElement('div')
    container.style.textAlign = 'center'
    container.style.color = 'rgb(var(--foreground,156 163 175))'
    container.style.fontFamily = 'system-ui,sans-serif'
    container.style.padding = '2rem'

    const title = document.createElement('p')
    title.style.fontSize = '1.125rem'
    title.style.marginBottom = '0.5rem'
    title.textContent = '应用启动失败'

    const detail = document.createElement('p')
    detail.style.fontSize = '0.875rem'
    detail.style.opacity = '0.7'
    detail.textContent = msg

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
  }
})
