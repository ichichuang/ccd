import { setupDateUtils } from '@/plugins/modules/date'
import { setupEcharts } from '@/plugins/modules/echarts'
import { setupLocales } from '@/plugins/modules/locales'
import { setupRouter } from '@/plugins/modules/router'
import { setupStores } from '@/plugins/modules/stores'

/**
 * 统一设置所有插件
 * @param app Vue 应用实例
 */
export const setupPlugins = async (app: App) => {
  // 先安装并初始化 Pinia Stores，确保持久化状态已就绪，再使用依赖 Store 的逻辑
  setupStores(app)
  const { loadingStart } = useLoading()
  loadingStart()
  setupRouter(app)
  setupLocales(app)

  // 在语言系统之后初始化 DateUtils，确保语言设置已就绪
  await setupDateUtils(app)

  setupEcharts(app)
}
