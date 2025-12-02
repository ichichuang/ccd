import { useLoading } from '@/hooks'
import { setupDateUtils } from '@/plugins/modules/date'
import { setupDatepicker } from '@/plugins/modules/datepicker'
import { setupEcharts } from '@/plugins/modules/echarts'
import { setupGridTable } from '@/plugins/modules/gridtable'
import { setupIcons } from '@/plugins/modules/icons'
import { setupLocales } from '@/plugins/modules/locales'
import { setupPrimeVue } from '@/plugins/modules/primevue'
import { setupRouter } from '@/plugins/modules/router'
import { setupStores } from '@/plugins/modules/stores'
import type { App } from 'vue'

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

  setupPrimeVue(app)
  setupIcons(app)
  setupEcharts(app)
  setupGridTable(app)
  setupDatepicker(app)

  // 首屏初始化完成后，确保关闭全局加载遮罩，避免阻塞首次交互
  // 路由 afterEach 也会调用一次，此处冗余调用是安全的
}
