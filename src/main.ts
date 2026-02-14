// 导入功能样式
import '@/assets/styles/reset.scss'
import 'primeicons/primeicons.css'
import 'animate.css'
import 'uno.css'

// 导入应用
import App from '@/App.vue'
import { setupPlugins } from '@/plugins'
import { preload } from '@/utils/theme/sizeEngine'

async function bootstrap() {
  if (typeof document !== 'undefined') preload()

  const app = createApp(App)

  // 设置插件（支持异步）
  await setupPlugins(app)

  // 挂载应用
  app.mount('#app')
}

// 启动应用
bootstrap().catch(error => {
  console.error('应用启动失败:', error)
})
