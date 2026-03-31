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

async function bootstrap() {
  if (typeof document !== 'undefined') preload()

  const app = createApp(App)

  // 设置插件（支持异步，含 Pinia）
  await setupPlugins(app)

  // 依赖注入：HTTP 层通过 TokenProvider 取 token / 401 回调，不直接依赖 Store
  setTokenProvider(() => useUserStoreWithOut().getToken)
  setOnUnauthorized(async () => {
    await useUserStoreWithOut().logout()
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
})
