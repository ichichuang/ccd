// src/utils/http/methods.ts
import { HTTP_CONFIG } from '@/constants/http'
import { alovaInstance } from './instance'
import { ErrorType, HttpRequestError, isRetryableError } from './interceptors'
import type {
  AlovaRequestConfig,
  CacheStats,
  RequestConfig,
  RequestStats,
  RetryConfig,
  UploadConfig,
} from './types'

/**
 * 请求管理器 - 处理去重和并发控制
 */
class RequestManager {
  private pendingRequests = new Map<string, Promise<any>>()
  private requestQueue: Array<() => Promise<any>> = []
  private readonly maxConcurrent = HTTP_CONFIG.maxConcurrentRequests
  private runningCount = 0

  /**
   * 执行请求，支持去重
   */
  async execute<T>(
    key: string,
    requestFn: () => Promise<T>,
    deduplicate: boolean = true
  ): Promise<T> {
    if (deduplicate && this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key) as Promise<T>
    }

    const requestPromise = this.queueRequest(requestFn)

    if (deduplicate) {
      this.pendingRequests.set(key, requestPromise)
      requestPromise.finally(() => {
        this.pendingRequests.delete(key)
      })
    }

    return requestPromise
  }

  private async queueRequest<T>(requestFn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push(async () => {
        try {
          const result = await requestFn()
          resolve(result)
        } catch (error) {
          reject(error)
        }
      })

      this.processQueue()
    })
  }

  private async processQueue(): Promise<void> {
    if (this.runningCount >= this.maxConcurrent || this.requestQueue.length === 0) {
      return
    }

    this.runningCount++
    const requestFn = this.requestQueue.shift()!

    try {
      await requestFn()
    } finally {
      this.runningCount--
      this.processQueue()
    }
  }

  clear(): void {
    this.pendingRequests.clear()
    this.requestQueue = []
    this.runningCount = 0
  }

  getStats(): RequestStats {
    return {
      pendingRequests: this.pendingRequests.size,
      queueLength: this.requestQueue.length,
      runningCount: this.runningCount,
      maxConcurrent: this.maxConcurrent,
    }
  }
}

/**
 * 增强的内存缓存
 */
class EnhancedCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()
  private readonly maxSize = HTTP_CONFIG.maxCacheSize
  private hitCount = 0
  private missCount = 0

  set(key: string, data: any, ttl: number = HTTP_CONFIG.defaultCacheTtl): void {
    // 如果缓存已满，删除最旧的条目
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value
      if (oldestKey) {
        this.cache.delete(oldestKey)
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    })
  }

  get(key: string): any | null {
    const item = this.cache.get(key)
    if (!item) {
      this.missCount++
      return null
    }

    // 检查是否过期
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      this.missCount++
      return null
    }

    this.hitCount++
    return item.data
  }

  clear(): void {
    this.cache.clear()
    this.hitCount = 0
    this.missCount = 0
  }

  getStats(): CacheStats {
    const total = this.hitCount + this.missCount
    return {
      size: this.cache.size,
      hitRate: total > 0 ? this.hitCount / total : 0,
      missRate: total > 0 ? this.missCount / total : 0,
    }
  }
}

// 创建全局实例
const cache = new EnhancedCache()
const requestManager = new RequestManager()

/**
 * 转换请求配置：
 * - 剥离 RequestConfig 中仅供本模块使用的字段（enableCache/cacheTTL/retry）
 * - 其余字段透传给 alova 作为 AlovaRequestConfig
 */
function convertRequestConfig(config?: RequestConfig): AlovaRequestConfig {
  if (!config) {
    return {}
  }

  const { enableCache: _enableCache, cacheTTL: _cacheTTL, retry: _retry, ...alovaConfig } = config
  return alovaConfig
}

/**
 * 带重试的请求执行器
 */
async function executeWithRetry<T>(
  requestFn: () => Promise<T>,
  retryConfig?: RetryConfig
): Promise<T> {
  const config: RetryConfig = {
    retries: HTTP_CONFIG.defaultRetryTimes,
    retryDelay: HTTP_CONFIG.defaultRetryDelay,
    ...retryConfig,
  }

  let lastError: HttpRequestError | undefined

  for (let attempt = 0; attempt <= config.retries; attempt++) {
    try {
      return await requestFn()
    } catch (error) {
      const httpError = error as HttpRequestError
      lastError = httpError

      if (!isRetryableError(httpError) || attempt === config.retries) {
        throw httpError
      }

      if (config.retryCondition && !config.retryCondition(httpError)) {
        throw httpError
      }

      const delay = config.retryDelay * Math.pow(2, attempt)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError!
}

/**
 * GET 请求
 * - 显式 .send(true)
 * - 只缓存数据，不缓存 Method
 */
export const get = async <T = any>(url: string, config?: RequestConfig): Promise<T> => {
  // 缓存键必须包含查询参数，否则不同分页/条件会命中同一缓存
  const paramStr = config?.params ? JSON.stringify(config.params) : ''
  const cacheKey = `GET:${url}:${paramStr}`
  const cacheEnabled = config?.enableCache !== false
  const deduplicate = config?.deduplicate !== false

  if (cacheEnabled) {
    const cachedData = cache.get(cacheKey)
    if (cachedData !== null) {
      return cachedData as T
    }
  }

  const alovaConfig = convertRequestConfig(config)
  const requestFn = () => alovaInstance.Get<T>(url, alovaConfig).send(true)

  const result = await requestManager.execute(
    cacheKey,
    () => executeWithRetry(requestFn, config?.retry),
    deduplicate
  )

  if (cacheEnabled) {
    const ttl = config?.cacheTTL || HTTP_CONFIG.defaultCacheTtl
    cache.set(cacheKey, result, ttl)
  }

  return result
}

/**
 * POST 请求
 */
export const post = <T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> => {
  const requestKey = `POST:${url}:${JSON.stringify(data)}`
  const alovaConfig = convertRequestConfig(config)
  const requestFn = () => alovaInstance.Post<T>(url, data, alovaConfig).send(true)

  return requestManager.execute(
    requestKey,
    () => executeWithRetry(requestFn, config?.retry),
    config?.deduplicate !== false
  )
}

/**
 * PUT 请求
 */
export const put = <T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> => {
  const requestKey = `PUT:${url}:${JSON.stringify(data)}`
  const alovaConfig = convertRequestConfig(config)
  const requestFn = () => alovaInstance.Put<T>(url, data, alovaConfig).send(true)

  return requestManager.execute(
    requestKey,
    () => executeWithRetry(requestFn, config?.retry),
    config?.deduplicate !== false
  )
}

/**
 * DELETE 请求
 */
export const del = <T = any>(url: string, config?: RequestConfig): Promise<T> => {
  const requestKey = `DELETE:${url}:${JSON.stringify(config?.params ?? {})}`
  const alovaConfig = convertRequestConfig(config)
  const requestFn = () => alovaInstance.Delete<T>(url, alovaConfig).send(true)

  return requestManager.execute(
    requestKey,
    () => executeWithRetry(requestFn, config?.retry),
    config?.deduplicate !== false
  )
}

/**
 * PATCH 请求
 */
export const patch = <T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> => {
  const requestKey = `PATCH:${url}:${JSON.stringify(data)}`
  const alovaConfig = convertRequestConfig(config)
  const requestFn = () => alovaInstance.Patch<T>(url, data, alovaConfig).send(true)

  return requestManager.execute(
    requestKey,
    () => executeWithRetry(requestFn, config?.retry),
    config?.deduplicate !== false
  )
}

/**
 * HEAD 请求
 * 用于检查资源是否存在，不返回响应体
 */
export const head = (url: string, config?: RequestConfig): Promise<void> => {
  const requestKey = `HEAD:${url}:${JSON.stringify(config?.params ?? {})}`
  const alovaConfig = convertRequestConfig(config)
  const requestFn = () => alovaInstance.Head(url, alovaConfig).send(true)

  return requestManager.execute(
    requestKey,
    () => executeWithRetry(requestFn, config?.retry),
    config?.deduplicate !== false
  )
}

/**
 * 文件上传
 */
export const uploadFile = <T = any>(url: string, file: File, config?: UploadConfig): Promise<T> => {
  const formData = new FormData()
  formData.append('file', file)

  const uploadConfig: UploadConfig = {
    ...config,
    headers: {
      ...config?.headers,
    },
  }

  // 对于文件上传，让浏览器自动设置 Content-Type 和 boundary
  // 不要手动删除 Content-Type，让浏览器处理
  return post<T>(url, formData, uploadConfig)
}

/**
 * 多文件上传
 */
export const uploadFiles = <T = any>(
  url: string,
  files: File[],
  config?: UploadConfig
): Promise<T> => {
  const formData = new FormData()
  files.forEach((file, index) => {
    formData.append(`files[${index}]`, file)
  })

  const uploadConfig: UploadConfig = {
    ...config,
    headers: {
      ...config?.headers,
    },
  }

  return post<T>(url, formData, uploadConfig)
}

/**
 * 下载文件
 * 使用 Alova 实例确保经过拦截器处理，错误会被正确捕获和处理
 * 拦截器会根据 Content-Type 自动识别 blob 响应
 */
export const downloadFile = async (
  url: string,
  filename?: string,
  config?: RequestConfig
): Promise<void> => {
  const alovaConfig = convertRequestConfig({
    ...(config || {}),
    // 标记为 blob 响应，拦截器会据此识别
    // @ts-expect-error: Alova 类型未必声明 responseType，但运行时会透传
    responseType: 'blob',
  })

  const requestFn = () => alovaInstance.Get<Blob>(url, alovaConfig).send(true)
  const blob = await executeWithRetry(requestFn, config?.retry)

  if (!(blob instanceof Blob)) {
    throw new HttpRequestError(
      '文件下载失败：响应格式错误',
      ErrorType.SERVER,
      undefined,
      undefined,
      undefined,
      false
    )
  }

  const downloadUrl = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = downloadUrl
  link.download = filename || 'download'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(downloadUrl)
}

/**
 * 清除缓存
 */
export const clearCache = () => {
  cache.clear()
}

/**
 * 获取缓存统计信息
 */
export const getCacheStats = () => {
  return cache.getStats()
}

/**
 * 获取请求管理器统计信息
 */
export const getRequestStats = () => {
  return requestManager.getStats()
}

/**
 * 清理所有请求
 */
export const clearRequests = () => {
  requestManager.clear()
}
