// src/utils/http/instance.ts
import { HTTP_CONFIG } from '@/constants/http'
import { createAlova } from 'alova'
import adapterFetch from 'alova/fetch'
import VueHook from 'alova/vue'
import { addConnectionListener } from './connection'
import { beforeRequest, responseHandler } from './interceptors'

/**
 * 验证 Alova 配置
 */
const validateAlovaConfig = () => {
  const errors: string[] = []
  const warnings: string[] = []

  // 检查超时配置
  const timeout = HTTP_CONFIG.timeout
  if (timeout < 1000) {
    errors.push($t('http.config.timeoutTooShort'))
  }

  // 检查环境配置
  if (
    import.meta.env.VITE_APP_ENV !== 'development' &&
    import.meta.env.VITE_APP_ENV !== 'production'
  ) {
    errors.push($t('http.config.invalidAppEnv', { env: import.meta.env.VITE_APP_ENV }))
  }

  // 输出错误和警告
  if (errors.length > 0) {
    console.error('❌ Alova 配置错误:', errors)
    throw new Error($t('http.config.alovaConfigError', { errors: errors.join(', ') }))
  }

  if (warnings.length > 0) {
    console.warn('⚠️ Alova 配置警告:', warnings)
  }
}

/**
 * 创建全局 Alova 实例
 */
export const alovaInstance = createAlova({
  // 连接到本地 server
  baseURL:
    import.meta.env.VITE_APP_ENV === 'development' ? '/api' : import.meta.env.VITE_API_BASE_URL,

  // 使用 fetch 作为请求适配器
  requestAdapter: adapterFetch(),

  // 使用 Vue 钩子
  statesHook: VueHook,

  // FIX: 全局禁用 Alova 的默认缓存
  // 因为我们在 methods.ts 中已经封装了自定义的 EnhancedCache
  // 这里设置为 null 可以防止双重缓存和刷新失效的问题
  localCache: null as any,

  // 全局请求拦截器
  beforeRequest,

  // 全局响应拦截器
  responded: responseHandler,

  // 全局超时时间 (毫秒)
  timeout: HTTP_CONFIG.timeout,
} as any)

// 验证配置
validateAlovaConfig()

// 监听连接状态变化
addConnectionListener(state => {
  // 当连接断开时，可以在这里做一些清理工作
  if (!state.isConnected && !state.isReconnecting) {
    console.warn('⚠️ 网络连接已断开')
  }
})

// 全局错误处理 - 通过拦截器处理
// Alova 的错误处理通过响应拦截器实现

export default alovaInstance
