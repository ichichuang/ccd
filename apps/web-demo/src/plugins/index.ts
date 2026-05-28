import { setupDateUtils, setupDateUtilsPrerequisites } from '@/plugins/modules/date'
import { setupLocales } from '@/plugins/modules/locales'
import { setupProForm } from '@/plugins/modules/proform'
import { setupRouter } from '@/plugins/modules/router'
import { setupStores } from '@/plugins/modules/stores'
import { setupErrorHandler } from '@/plugins/modules/errorHandler'
import { setupPrimeVue } from '@/plugins/modules/primevue'
import { setupScrollbar } from '@/plugins/modules/scrollbar'
import { setupAuthBridge } from '@/plugins/modules/authBridge'
import { vAuth } from '@/directives/auth'
import { installInteractionDirectives } from '@ccd/vue-hooks'

/**
 * 统一设置所有插件
 * 注意：loadingDone() 由 router.afterEach 在首次导航完成后调用，确保 Vue 挂载后无缝切换
 * @param app Vue 应用实例
 */
export const setupPlugins = (app: App) => {
  // 全局错误兜底：优先注册，确保后续插件中的异常也能被捕获
  setupErrorHandler(app)

  // 先挂载 i18n，再初始化 Stores（initLocale 依赖 i18n 已挂载）
  setupLocales(app)
  setupStores(app)
  setupAuthBridge()
  setupPrimeVue(app)
  setupScrollbar(app)
  setupProForm()

  setupRouter(app)

  // DateUtils dayjs 插件仍保持首屏前同步注册，framework hydration 延后到稳定首屏后执行。
  setupDateUtilsPrerequisites()

  // 全局指令
  app.directive('auth', vAuth)
  installInteractionDirectives(app)
}

/**
 * 设置首屏后可延迟执行的插件 hydration。
 * @param app Vue 应用实例
 */
export const setupDeferredPlugins = (app: App) => {
  void setupDateUtils(app)
}
