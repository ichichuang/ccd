// HTTP 公共配置变量（客户端超时由环境变量配置；vite.config 代理超时单独从 env 读取，解耦 src 与构建配置）
import type { HttpBaseUrlPolicy } from '@ccd/contracts'

const timeout = Number(import.meta.env.VITE_API_TIMEOUT) || 10000
export const HTTP_BASE_URL_POLICY = {
  mode: import.meta.env.VITE_APP_ENV === 'development' ? 'relative' : 'environment',
  value:
    import.meta.env.VITE_APP_ENV === 'development' ? '/api' : import.meta.env.VITE_API_BASE_URL,
  developmentProxyPath: '/api',
} satisfies HttpBaseUrlPolicy

export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    currentUser: '/auth/userInfo',
  },
  system: {
    asyncRoutes: '/system/menu/routes',
  },
} as const

export const HTTP_CONFIG = {
  // 基础配置
  timeout,
  maxConcurrentRequests: 10, // 最大并发请求数
  maxCacheSize: 1000, // 最大缓存条目数
  defaultCacheTtl: 5 * 60 * 1000, // 默认缓存时间（5分钟）
  defaultDeduplicate: true, // 是否默认启用请求去重

  // 重试配置
  defaultRetryTimes: 0, // 默认重试次数
  defaultRetryDelay: 1000, // 默认重试延迟（毫秒）

  // 文件上传配置
  defaultChunkSize: 2 * 1024 * 1024, // 默认分片大小（2MB）
  defaultConcurrentChunks: 3, // 默认并发分片数
  maxFileSize: 100 * 1024 * 1024, // 最大文件大小（100MB）

  // 上传端点配置
  uploadEndpoints: {
    check: '/api/upload/check', // 检查已上传分片
    chunk: '/api/upload/chunk', // 上传分片
    merge: '/api/upload/merge', // 合并分片
  },

  // 连接管理配置
  maxReconnectAttempts: 5, // 最大重连次数
  reconnectDelay: 2000, // 重连延迟（毫秒）
  healthCheckInterval: 30000, // 健康检查间隔（毫秒）
  healthCheckUrl: '/api/health', // 健康检查端点
  healthCheckTimeout: 5000, // 健康检查超时（毫秒）

  // 安全配置（可被 RequestConfig.security 覆盖）
  enableCsrf: false, // 是否启用 CSRF 保护（预留：拦截器逻辑已就位，对接后端时改为 true）
  enableSignature: false, // 是否启用请求签名（预留：拦截器逻辑已就位，对接后端时改为 true）
  enableRateLimit: true, // 是否启用速率限制（methods.ts 已接入）
  maxRequestsPerMinute: 60, // 每分钟最大请求数（methods.ts 已接入）

  // 敏感字段
  sensitiveFields: ['password', 'token', 'secret', 'key', 'ssn', 'creditCard'],

  // 错误码映射（供 errors.ts getErrorCodeFromType 使用，用于 API 响应/日志）
  errorCodes: {
    networkError: 'NETWORK_ERROR',
    timeoutError: 'TIMEOUT_ERROR',
    authError: 'AUTH_ERROR',
    serverError: 'SERVER_ERROR',
    clientError: 'CLIENT_ERROR',
    validationError: 'VALIDATION_ERROR',
    securityError: 'SECURITY_ERROR',
    unknownError: 'UNKNOWN_ERROR',
  },
} as const
