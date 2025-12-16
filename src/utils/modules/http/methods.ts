// src/utils/http/methods.ts
import { HTTP_CONFIG } from '@/constants'
import { t } from '@/locales'
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

  // 移除之前的 _t 和 cacheFor 逻辑，只做简单的配置分离
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
  // 缓存键必须包含查询参数，否则不同分页/条件会命中同一缓存
  const paramStr = config?.params ? JSON.stringify(config.params) : ''
  const cacheKey = `GET:${url}:${paramStr}`
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

  const requestFn = () => {
    // 创建 Method 实例
    const method = alovaInstance.Get<T>(url, alovaConfig)

    // FIX: 使用 Alova 原生 API 控制缓存
    // 如果明确禁用了缓存 (enableCache: false)，调用 send(true) 强制刷新
    if (config?.enableCache === false) {
      return method.send(true)
    }

    // 否则直接返回 method (它会自动处理默认缓存逻辑)
    return method
  }

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
 * HEAD 请求
 * 用于检查资源是否存在，不返回响应体
 */
export const head = <T = any>(url: string, config?: RequestConfig) => {
  const requestKey = `HEAD:${url}`
  const alovaConfig = convertRequestConfig(config)
  const requestFn = () => alovaInstance.Head<T>(url, alovaConfig)

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
 * 使用 Alova 实例确保经过拦截器处理，错误会被正确捕获和处理
 * 拦截器会根据 Content-Type 自动识别 blob 响应
 */
export const downloadFile = async (url: string, filename?: string) => {
  try {
    // 使用 Alova 实例发送请求，确保经过拦截器
    // 拦截器会根据 Content-Type (application/octet-stream) 自动返回 Blob
    const blob = await alovaInstance.Get<Blob>(url, {
      // 通过配置标记这是文件下载请求，拦截器会识别并返回 blob
      // @ts-expect-error - Alova 可能不支持 responseType，但拦截器会根据 Content-Type 处理
      responseType: 'blob',
    })

    // 如果响应是 Blob，直接使用
    if (blob instanceof Blob) {
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename || 'download'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)

      return filename
    }

    // 如果不是 Blob，说明响应格式错误
    throw new HttpRequestError(
      '文件下载失败：响应格式错误',
      ErrorType.SERVER,
      undefined,
      undefined,
      undefined,
      false
    )
  } catch (error) {
    // 错误会被拦截器处理，这里只需要重新抛出
    // 拦截器会处理错误提示和错误类型判断（包括调用 handleHttpError）
    if (error instanceof HttpRequestError) {
      throw error
    }

    // 如果是其他类型的错误，转换为 HttpRequestError
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
