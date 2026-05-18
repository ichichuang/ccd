// Stores 统一管理入口
// 仅负责创建并导出 Pinia 实例，具体 Store 模块由 AutoImport 负责按需导入
import { createPinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'

// 创建 Pinia 实例并配置持久化插件（默认使用 JSON 序列化器）
// 注意：需要加密的 store 会在各自的 persist 配置中单独指定加密序列化器
const store = createPinia()
store.use(createPersistedState())

// 导出默认 store 实例（供应用挂载时使用）
export default store
