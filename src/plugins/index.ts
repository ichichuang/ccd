import { setupDateUtils } from '@/plugins/modules/date'
import { setupEcharts } from '@/plugins/modules/echarts'
import { setupLocales } from '@/plugins/modules/locales'
import { setupRouter } from '@/plugins/modules/router'
import { setupStores } from '@/plugins/modules/stores'
import { setupErrorHandler } from '@/plugins/modules/errorHandler'
import { setupPrimeVue } from '@/plugins/modules/primevue'
import { setupScrollbar } from '@/plugins/modules/scrollbar'

/**
 * 统一设置所有插件
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
  const { loadingDone } = useLoading()
  try {
    // loadingStart()
    setupRouter(app)

    // 在语言系统之后初始化 DateUtils，确保语言设置已就绪
    await setupDateUtils(app)

    setupEcharts(app)
  } finally {
    // 无论初始化成功与否，都要确保全局 loading 可关闭，避免页面卡在加载层
    loadingDone()
  }
}
