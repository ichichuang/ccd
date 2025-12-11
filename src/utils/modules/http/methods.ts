// src/utils/http/methods.ts
import { HTTP_CONFIG } from '@/constants'
import { t } from '@/locales'
import { useUserStoreWithOut } from '@/stores'
import { env } from '@/utils'
import { alovaInstance } from './instance'
import { ErrorType, HttpRequestError, isRetryableError } from './interceptors'
import type { AlovaRequestConfig, RequestConfig, RetryConfig, UploadConfig } from './types'

/**
 * 请求管理器 - 处理去重和并发控制
 */
class RequestManager {
  private pendingRequests = new Map<string, Promise<any>>()
  private requestQueue: Array<() => Promise<any>> = []
  private maxConcurrent = HTTP_CONFIG.maxConcurrentRequests
  private runningCount = 0

  /**
   * 执行请求，支持去重
   */
  async execute<T>(key: string, requestFn: () => Promise<T>, deduplicate = true): Promise<T> {
    // 如果启用去重且请求已存在，返回现有请求
    if (deduplicate && this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key)!
    }

    // 创建新请求
    const requestPromise = this.queueRequest(() => requestFn())

    if (deduplicate) {
      this.pendingRequests.set(key, requestPromise)

      // 请求完成后清理
      requestPromise.finally(() => {
        this.pendingRequests.delete(key)
      })
    }

    return requestPromise
  }

  /**
   * 将请求加入队列
   */
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

  /**
   * 处理请求队列
   */
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

  /**
   * 清理所有待处理请求
   */
  clear(): void {
    this.pendingRequests.clear()
    this.requestQueue = []
    this.runningCount = 0
  }

  /**
   * 获取统计信息
   */
  getStats() {
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
  private maxSize = HTTP_CONFIG.maxCacheSize
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

  getSize(): number {
    return this.cache.size
  }

  getStats() {
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
 * 转换请求配置
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
  const config = {
    retries: HTTP_CONFIG.defaultRetryTimes,
    retryDelay: HTTP_CONFIG.defaultRetryDelay,
    ...retryConfig,
  }

  let lastError: HttpRequestError

  for (let attempt = 0; attempt <= config.retries; attempt++) {
    try {
      return await requestFn()
    } catch (error) {
      lastError = error as HttpRequestError

      // 如果不是可重试的错误，或者已达到最大重试次数，直接抛出
      if (!isRetryableError(lastError) || attempt === config.retries) {
        throw lastError
      }

      // 如果配置了重试条件，检查是否满足
      if (config.retryCondition && !config.retryCondition(lastError)) {
        throw lastError
      }

      // 等待后重试
      if (attempt < config.retries) {
        const delay = config.retryDelay * Math.pow(2, attempt) // 指数退避
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError!
}

/**
 * GET 请求
 */
export const get = <T = any>(url: string, config?: RequestConfig) => {
  const cacheKey = `GET:${url}`
  const cacheEnabled = config?.enableCache !== false
  const deduplicate = config?.deduplicate !== false

  // 如果启用缓存且是 GET 请求，尝试从缓存获取
  if (cacheEnabled) {
    const cachedData = cache.get(cacheKey)
    if (cachedData) {
      return Promise.resolve(cachedData)
    }
  }

  const alovaConfig = convertRequestConfig(config)
  const requestFn = () => alovaInstance.Get<T>(url, alovaConfig)

  return requestManager
    .execute(cacheKey, () => executeWithRetry(requestFn, config?.retry), deduplicate)
    .then(result => {
      // 如果启用缓存，将结果存入缓存
      if (cacheEnabled) {
        const ttl = config?.cacheTTL || HTTP_CONFIG.defaultCacheTtl
        cache.set(cacheKey, result, ttl)
      }
      return result
    })
}

/**
 * POST 请求
 */
export const post = <T = any>(url: string, data?: any, config?: RequestConfig) => {
  const requestKey = `POST:${url}:${JSON.stringify(data)}`
  const alovaConfig = convertRequestConfig(config)
  const requestFn = () => alovaInstance.Post<T>(url, data, alovaConfig)

  return requestManager.execute(requestKey, () => executeWithRetry(requestFn, config?.retry))
}

/**
 * PUT 请求
 */
export const put = <T = any>(url: string, data?: any, config?: RequestConfig) => {
  const requestKey = `PUT:${url}:${JSON.stringify(data)}`
  const alovaConfig = convertRequestConfig(config)
  const requestFn = () => alovaInstance.Put<T>(url, data, alovaConfig)

  return requestManager.execute(requestKey, () => executeWithRetry(requestFn, config?.retry))
}

/**
 * DELETE 请求
 */
export const del = <T = any>(url: string, config?: RequestConfig) => {
  const requestKey = `DELETE:${url}`
  const alovaConfig = convertRequestConfig(config)
  const requestFn = () => alovaInstance.Delete<T>(url, alovaConfig)

  return requestManager.execute(requestKey, () => executeWithRetry(requestFn, config?.retry))
}

/**
 * PATCH 请求
 */
export const patch = <T = any>(url: string, data?: any, config?: RequestConfig) => {
  const requestKey = `PATCH:${url}:${JSON.stringify(data)}`
  const alovaConfig = convertRequestConfig(config)
  const requestFn = () => alovaInstance.Patch<T>(url, data, alovaConfig)

  return requestManager.execute(requestKey, () => executeWithRetry(requestFn, config?.retry))
}

/**
 * 文件上传
 */
export const uploadFile = <T = any>(url: string, file: File, config?: UploadConfig) => {
  const formData = new FormData()
  formData.append('file', file)

  const uploadConfig = {
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
export const uploadFiles = <T = any>(url: string, files: File[], config?: UploadConfig) => {
  const formData = new FormData()
  files.forEach((file, index) => {
    formData.append(`files[${index}]`, file)
  })

  const uploadConfig = {
    ...config,
    headers: {
      ...config?.headers,
    },
  }

  return post<T>(url, formData, uploadConfig)
}

/**
 * 下载文件
 */
export const downloadFile = async (url: string, filename?: string) => {
  try {
    // 构建完整的下载 URL
    const fullUrl = url.startsWith('http') ? url : `${env.apiBaseUrl}${url}`

    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        authorization: `Bearer ${useUserStoreWithOut().getSafeStorageToken}`,
      },
    })

    if (!response.ok) {
      throw new HttpRequestError(
        `HTTP ${response.status}: ${response.statusText}`,
        ErrorType.SERVER,
        response.status,
        response.statusText
      )
    }

    const blob = await response.blob()
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = filename || 'download'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)

    return filename
  } catch (error) {
    console.error('❌ 文件下载失败:', error)
    const errorMessage =
      error instanceof Error ? error.message : t('http.upload.fileDownloadFailed')
    throw new HttpRequestError(
      errorMessage,
      ErrorType.SERVER,
      undefined,
      undefined,
      undefined,
      false
    )
  }
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
