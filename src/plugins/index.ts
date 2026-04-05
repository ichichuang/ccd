import { setupDateUtils } from '@/plugins/modules/date'
import { setupLocales } from '@/plugins/modules/locales'
import { setupRouter } from '@/plugins/modules/router'
import { setupStores } from '@/plugins/modules/stores'
import { setupErrorHandler } from '@/plugins/modules/errorHandler'
import { setupPrimeVue } from '@/plugins/modules/primevue'
import { setupScrollbar } from '@/plugins/modules/scrollbar'
import { vAuth } from '@/directives/auth'
import { vTap } from '@/directives/tap'
import { vSwipe } from '@/directives/swipe'
import { vLongPress } from '@/directives/longPress'

/**
 * 统一设置所有插件
 * 注意：loadingDone() 由 router.afterEach 在首次导航完成后调用，确保 Vue 挂载后无缝切换
 * @param app Vue 应用实例
 */
export const setupPlugins = async (app: App) => {
  // 全局错误兜底：优先注册，确保后续插件中的异常也能被捕获
  setupErrorHandler(app)

  // 先挂载 i18n，再初始化 Stores（initLocale 依赖 i18n 已挂载）
  setupLocales(app)
  setupStores(app)
  setupPrimeVue(app)
  setupScrollbar(app)

  setupRouter(app)

  // 在语言系统之后初始化 DateUtils，确保语言设置已就绪
  await setupDateUtils(app)

  // 全局指令
  app.directive('auth', vAuth)
  app.directive('tap', vTap)
  app.directive('swipe', vSwipe)
  app.directive('long-press', vLongPress)
}
