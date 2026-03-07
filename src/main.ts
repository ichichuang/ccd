// 导入功能样式
import '@/assets/styles/reset.scss'
import 'primeicons/primeicons.css'
import 'animate.css'
import 'uno.css'

// 导入应用
import App from '@/App.vue'
import { setOnUnauthorized, setTokenProvider } from '@/infra/auth/tokenProvider'
import { setupPlugins } from '@/plugins'
import { useUserStoreWithOut } from '@/stores/modules/user'
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

  // 挂载应用
  app.mount('#app')
}

// 启动应用
bootstrap().catch(error => {
  console.error('应用启动失败:', error)
})
