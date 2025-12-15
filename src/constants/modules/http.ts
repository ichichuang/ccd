// HTTP 公共配置变量
export const HTTP_CONFIG = {
  // 基础配置
  timeout: 10000, // 默认超时时间（毫秒）
  maxConcurrentRequests: 10, // 最大并发请求数
  maxCacheSize: 1000, // 最大缓存条目数
  defaultCacheTtl: 5 * 60 * 1000, // 默认缓存时间（5分钟）

  // 重试配置
  defaultRetryTimes: 3, // 默认重试次数
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

  // 安全配置
  enableCsrf: true, // 是否启用CSRF保护
  enableSignature: true, // 是否启用请求签名
  enableRateLimit: true, // 是否启用速率限制
  maxRequestsPerMinute: 60, // 每分钟最大请求数

  // 敏感字段
  sensitiveFields: ['password', 'token', 'secret', 'key', 'ssn', 'creditCard'],

  // 错误码映射
  errorCodes: {
    networkError: 'NETWORK_ERROR',
    timeoutError: 'TIMEOUT_ERROR',
    authError: 'AUTH_ERROR',
    serverError: 'SERVER_ERROR',
    clientError: 'CLIENT_ERROR',
    securityError: 'SECURITY_ERROR',
    unknownError: 'UNKNOWN_ERROR',
  },
} as const
