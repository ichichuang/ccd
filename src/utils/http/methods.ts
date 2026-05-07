// src/utils/http/methods.ts
import { HTTP_CONFIG } from '@/constants/http'
import { parseZodHttpPayload } from '@/adapters/http.adapter'
import { readAuthToken } from '@/infra/auth/tokenProvider'
import { t } from '@/locales'
import { alovaInstance } from './instance'
import {
  HttpRequestError,
  isRetryableError,
  ErrorType,
  getErrorTypeByStatus,
  isAbortError,
} from './errors'
import type {
  AlovaRequestConfig,
  CacheStats,
  RequestConfig,
  RequestStats,
  RetryConfig,
  UploadConfig,
} from './types'

function isBinaryBody(data: unknown): boolean {
  return (
    data instanceof FormData ||
    data instanceof Blob ||
    data instanceof ArrayBuffer ||
    data instanceof File
  )
}

function createNonce(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now()}_${Math.random().toString(36).slice(2)}`
}

function stableStringify(value: unknown): string {
  const seen = new WeakSet<object>()

  const normalize = (input: unknown): unknown => {
    if (input === null || typeof input !== 'object') {
      return input
    }
    if (input instanceof Date) {
      return input.toISOString()
    }
    if (Array.isArray(input)) {
      return input.map(item => normalize(item))
    }
    if (seen.has(input as object)) {
      return '[Circular]'
    }
    seen.add(input as object)

    const obj = input as Record<string, unknown>
    const sortedKeys = Object.keys(obj).sort()
    const out: Record<string, unknown> = {}
    sortedKeys.forEach(key => {
      out[key] = normalize(obj[key])
    })
    return out
  }

  return JSON.stringify(normalize(value))
}

function buildRequestKey(method: string, url: string, payload?: unknown): string {
  if (isBinaryBody(payload)) {
    return `${method}:${url}:[binary]:${createNonce()}`
  }
  const body = payload === undefined ? '' : stableStringify(payload)
  return `${method}:${url}:${body}`
}

function shouldShowRawGlobalError(config?: RequestConfig): boolean {
  const globalError = config?.globalError
  return globalError !== 'silent'
}

function showRawGlobalError(status: number, message: string, config?: RequestConfig): void {
  if (!shouldShowRawGlobalError(config)) {
    return
  }

  const statusTitle = t('http.error.httpError', { status })
  try {
    if (window.$message?.danger) {
      window.$message.danger(message, statusTitle)
    } else if (window.$toast?.dangerIn) {
      window.$toast.dangerIn('top-left', statusTitle, message)
    } else {
      console.error(`[HTTP ${status}] ${message}`)
    }
  } catch (_error) {
    console.error(`[HTTP ${status}] ${message}`)
  }
}

/**
 * 请求管理器 - 处理去重和并发控制
 */
class RequestManager {
  private pendingRequests = new Map<string, Promise<unknown>>()
  private activeControllers = new Map<string, AbortController>()
  private requestQueue: Array<() => Promise<unknown>> = []
  private readonly maxConcurrent = HTTP_CONFIG.maxConcurrentRequests
  private runningCount = 0

  /**
   * 执行请求，支持去重
   */
  async execute<T>(
    key: string,
    requestFn: (signal?: AbortSignal) => Promise<T>,
    deduplicate: boolean = true,
    cancelStrategy: 'none' | 'cancelPrevious' = 'none'
  ): Promise<T> {
    if (cancelStrategy === 'cancelPrevious' && this.activeControllers.has(key)) {
      this.activeControllers.get(key)?.abort()
      this.activeControllers.delete(key)
      this.pendingRequests.delete(key)
    }

    if (deduplicate && this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key) as Promise<T>
    }

    const controller = new AbortController()
    this.activeControllers.set(key, controller)
    const requestPromise = this.queueRequest(() => requestFn(controller.signal))

    if (deduplicate) {
      this.pendingRequests.set(key, requestPromise)
    }
    requestPromise.finally(() => {
      this.pendingRequests.delete(key)
      this.activeControllers.delete(key)
    })

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
    this.activeControllers.forEach(controller => controller.abort())
    this.activeControllers.clear()
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
  private cache = new Map<string, { data: unknown; timestamp: number; ttl: number }>()
  private readonly maxSize = HTTP_CONFIG.maxCacheSize
  private hitCount = 0
  private missCount = 0

  set(key: string, data: unknown, ttl: number = HTTP_CONFIG.defaultCacheTtl): void {
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

  get(key: string): unknown | null {
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
    // LRU: move to end by re-inserting (Map iteration order = insertion order)
    this.cache.delete(key)
    this.cache.set(key, item)
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
 * 速率限制：最近 1 分钟内的请求时间戳
 * ⚠️ 本地单 Tab 独立计数，不与其他 Tab 或服务端共享——此机制提供前端公平性限流，
 * 不能替代服务器级别的速率保护（API Gateway / Nginx limit_req 等）。
 */
const rateLimitTimestamps: number[] = []

/**
 * 获取速率限制槽位（HTTP_CONFIG.enableRateLimit 关闭时直接返回）
 */
async function acquireRateLimitSlot(): Promise<void> {
  if (!HTTP_CONFIG.enableRateLimit) return
  const max = HTTP_CONFIG.maxRequestsPerMinute
  const windowMs = 60000
  const now = Date.now()
  const windowStart = now - windowMs
  const valid = rateLimitTimestamps.filter(t => t > windowStart)
  rateLimitTimestamps.length = 0
  rateLimitTimestamps.push(...valid)
  if (rateLimitTimestamps.length >= max) {
    const oldestInWindow = rateLimitTimestamps[0]
    const waitMs = oldestInWindow + windowMs - now + 1
    if (waitMs > 0) {
      await new Promise(r => setTimeout(r, waitMs))
    }
    const refreshed = rateLimitTimestamps.filter(t => t > Date.now() - windowMs)
    rateLimitTimestamps.length = 0
    rateLimitTimestamps.push(...refreshed)
  }
  rateLimitTimestamps.push(Date.now())
}

/**
 * 转换请求配置：
 * - 剥离 RequestConfig 中仅供本模块使用的字段（enableCache/cacheTTL/retry）
 * - 其余字段透传给 alova 作为 AlovaRequestConfig
 */
function convertRequestConfig<TResponse = unknown>(
  config?: RequestConfig<TResponse>
): AlovaRequestConfig<TResponse> {
  if (!config) {
    return {}
  }

  const {
    enableCache: _enableCache,
    cacheTTL: _cacheTTL,
    retry: _retry,
    cancelStrategy: _cancelStrategy,
    ...alovaConfig
  } = config
  return alovaConfig
}

/**
 * 带重试的请求执行器
 */
async function executeWithRetry<T>(
  requestFn: (signal?: AbortSignal) => Promise<T>,
  retryConfig?: RetryConfig,
  signal?: AbortSignal
): Promise<T> {
  const config: RetryConfig = {
    retries: HTTP_CONFIG.defaultRetryTimes,
    retryDelay: HTTP_CONFIG.defaultRetryDelay,
    ...retryConfig,
  }

  let lastError: HttpRequestError | undefined

  for (let attempt = 0; attempt <= config.retries; attempt++) {
    try {
      if (signal?.aborted) {
        throw new DOMException('The request was aborted', 'AbortError')
      }
      await acquireRateLimitSlot()
      return await requestFn(signal)
    } catch (error) {
      if (isAbortError(error)) {
        throw error
      }
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
export const get = async <T = unknown>(url: string, config?: RequestConfig<T>): Promise<T> => {
  // 缓存键必须包含查询参数，否则不同分页/条件会命中同一缓存
  const cacheKey = buildRequestKey('GET', url, config?.params ?? {})
  const cacheEnabled = config?.enableCache !== false
  const deduplicate = config?.deduplicate ?? HTTP_CONFIG.defaultDeduplicate

  if (cacheEnabled) {
    const cachedData = cache.get(cacheKey)
    if (cachedData !== null) {
      return cachedData as T
    }
  }

  const alovaConfig = convertRequestConfig(config)
  const requestFn = (signal?: AbortSignal) =>
    alovaInstance.Get<T>(url, { ...alovaConfig, ...(signal ? { signal } : {}) }).send(true)

  const result = await requestManager.execute(
    cacheKey,
    signal => executeWithRetry(requestFn, config?.retry, signal),
    deduplicate,
    config?.cancelStrategy ?? 'none'
  )

  if (cacheEnabled) {
    const ttl = config?.cacheTTL || HTTP_CONFIG.defaultCacheTtl
    cache.set(cacheKey, result, ttl)
  }

  return result
}

/**
 * GET request returning raw response with headers.
 *
 * **Infrastructure exception**: Uses native `fetch` because Alova does not expose
 * raw response headers. Bypassed protections (by design):
 * - sanitizeData (N/A for GET), processRequestData (N/A for GET)
 * - CSRF/signature injection, response decryption
 * - Global error toast (uses showRawGlobalError instead)
 *
 * Applied protections: auth header, AbortController, Zod schema validation,
 * retry with backoff, cache, network error classification.
 *
 * Do NOT use for isSafeStorage requests — those require interceptor-level encryption.
 */
export const getRaw = async <T = unknown>(
  url: string,
  config?: RequestConfig<T>
): Promise<{ data: T; headers: Headers }> => {
  // 缓存键
  const cacheKey = buildRequestKey('GET_RAW', url, config?.params ?? {})
  const cacheEnabled = config?.enableCache !== false
  // const deduplicate = config?.deduplicate !== false // Not used in raw fetch

  if (cacheEnabled) {
    const cachedData = cache.get(cacheKey)
    if (cachedData !== null) {
      return cachedData as { data: T; headers: Headers }
    }
  }

  // 构建 URL
  const baseURL = alovaInstance.options.baseURL || ''
  const fullUrl = url.startsWith('http') ? url : `${baseURL}${url}`
  const queryString = config?.params
    ? '?' + new URLSearchParams(config.params as Record<string, string>).toString()
    : ''

  // 构建 Headers
  const headers = new Headers(config?.headers as Record<string, string>)

  // 手动添加 Auth Token（绕过 Alova 拦截器时通过 AuthBridge 获取，不依赖 Store）
  const token = readAuthToken()
  if (token && String(token).trim()) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  try {
    const response = await fetch(`${fullUrl}${queryString}`, {
      method: 'GET',
      headers,
      signal: config?.signal as AbortSignal | undefined,
    })

    if (!response.ok) {
      let errorMessage =
        response.statusText || t('http.error.httpError', { status: response.status })

      try {
        const text = await response.text()
        if (text) {
          try {
            const json = JSON.parse(text) as { message?: string }
            errorMessage = json?.message || errorMessage
          } catch {
            errorMessage = text
          }
        }
      } catch {
        // 忽略 body 解析错误，使用 statusText
      }

      const errorType = getErrorTypeByStatus(response.status)
      const retryable = response.status >= 500
      showRawGlobalError(response.status, errorMessage, config)
      throw new HttpRequestError(
        errorMessage,
        errorType,
        response.status,
        response.statusText,
        undefined,
        retryable
      )
    }

    const rawData = await response.json()
    const data = config?.responseSchema
      ? parseZodHttpPayload(config.responseSchema, rawData)
      : (rawData as T)
    const result: { data: T; headers: Headers } = { data, headers: response.headers }

    if (cacheEnabled) {
      const ttl = config?.cacheTTL || HTTP_CONFIG.defaultCacheTtl
      cache.set(cacheKey, result, ttl)
    }

    return result
  } catch (error) {
    if (error instanceof HttpRequestError) {
      throw error
    }
    if (isAbortError(error)) {
      throw error
    }

    const networkMessage = t('http.error.networkConnectionFailed')
    showRawGlobalError(0, networkMessage, config)
    throw new HttpRequestError(
      networkMessage,
      ErrorType.NETWORK,
      undefined,
      undefined,
      undefined,
      true
    )
  }
}

/**
 * POST 请求
 */
export const post = <T = unknown>(
  url: string,
  data?: unknown,
  config?: RequestConfig<T>
): Promise<T> => {
  const requestKey = buildRequestKey('POST', url, data)
  const alovaConfig = convertRequestConfig(config)
  // Alova 边界：data 为 unknown 时类型不匹配，需桥接
  const requestFn = (signal?: AbortSignal) =>
    alovaInstance
      .Post<T>(url, data as BodyInit, { ...alovaConfig, ...(signal ? { signal } : {}) })
      .send(true)

  return requestManager.execute(
    requestKey,
    signal => executeWithRetry(requestFn, config?.retry, signal),
    config?.deduplicate ?? HTTP_CONFIG.defaultDeduplicate,
    config?.cancelStrategy ?? 'none'
  )
}

/**
 * PUT 请求
 */
export const put = <T = unknown>(
  url: string,
  data?: unknown,
  config?: RequestConfig<T>
): Promise<T> => {
  const requestKey = buildRequestKey('PUT', url, data)
  const alovaConfig = convertRequestConfig(config)
  const requestFn = (signal?: AbortSignal) =>
    alovaInstance
      .Put<T>(url, data as BodyInit, { ...alovaConfig, ...(signal ? { signal } : {}) })
      .send(true)

  return requestManager.execute(
    requestKey,
    signal => executeWithRetry(requestFn, config?.retry, signal),
    config?.deduplicate ?? HTTP_CONFIG.defaultDeduplicate,
    config?.cancelStrategy ?? 'none'
  )
}

/**
 * DELETE 请求
 */
export const del = <T = unknown>(url: string, config?: RequestConfig<T>): Promise<T> => {
  const requestKey = buildRequestKey('DELETE', url, config?.params ?? {})
  const alovaConfig = convertRequestConfig(config)
  const requestFn = (signal?: AbortSignal) =>
    alovaInstance.Delete<T>(url, { ...alovaConfig, ...(signal ? { signal } : {}) }).send(true)

  return requestManager.execute(
    requestKey,
    signal => executeWithRetry(requestFn, config?.retry, signal),
    config?.deduplicate ?? HTTP_CONFIG.defaultDeduplicate,
    config?.cancelStrategy ?? 'none'
  )
}

/**
 * PATCH 请求
 */
export const patch = <T = unknown>(
  url: string,
  data?: unknown,
  config?: RequestConfig<T>
): Promise<T> => {
  const requestKey = buildRequestKey('PATCH', url, data)
  const alovaConfig = convertRequestConfig(config)
  const requestFn = (signal?: AbortSignal) =>
    alovaInstance
      .Patch<T>(url, data as BodyInit, { ...alovaConfig, ...(signal ? { signal } : {}) })
      .send(true)

  return requestManager.execute(
    requestKey,
    signal => executeWithRetry(requestFn, config?.retry, signal),
    config?.deduplicate ?? HTTP_CONFIG.defaultDeduplicate,
    config?.cancelStrategy ?? 'none'
  )
}

/**
 * HEAD 请求
 * 用于检查资源是否存在，不返回响应体
 */
export const head = (url: string, config?: RequestConfig<void>): Promise<{ headers: Headers }> => {
  const requestKey = buildRequestKey('HEAD', url, config?.params ?? {})
  const alovaConfig = convertRequestConfig(config)
  const requestFn = async (signal?: AbortSignal): Promise<{ headers: Headers }> => {
    return alovaInstance
      .Head(url, { ...alovaConfig, ...(signal ? { signal } : {}) })
      .send(true) as Promise<{ headers: Headers }>
  }

  return requestManager.execute(
    requestKey,
    signal => executeWithRetry(requestFn, config?.retry, signal),
    config?.deduplicate ?? HTTP_CONFIG.defaultDeduplicate,
    config?.cancelStrategy ?? 'none'
  )
}

/**
 * 文件上传
 */
export const uploadFile = <T = unknown>(
  url: string,
  file: File,
  config?: UploadConfig<T>
): Promise<T> => {
  const formData = new FormData()
  formData.append('file', file)

  const uploadConfig: UploadConfig<T> = {
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
export const uploadFiles = <T = unknown>(
  url: string,
  files: File[],
  config?: UploadConfig<T>
): Promise<T> => {
  const formData = new FormData()
  files.forEach((file, index) => {
    formData.append(`files[${index}]`, file)
  })

  const uploadConfig: UploadConfig<T> = {
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
  config?: RequestConfig<Blob>
): Promise<void> => {
  const alovaConfig = convertRequestConfig({
    ...(config || {}),
    // 标记为 blob 响应，拦截器会据此识别
    responseType: 'blob',
  })

  const requestFn = (signal?: AbortSignal) =>
    alovaInstance.Get<Blob>(url, { ...alovaConfig, ...(signal ? { signal } : {}) }).send(true)
  const blob = await executeWithRetry(requestFn, config?.retry)

  if (!(blob instanceof Blob)) {
    throw new HttpRequestError(
      t('http.upload.invalidResponseFormat'),
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
