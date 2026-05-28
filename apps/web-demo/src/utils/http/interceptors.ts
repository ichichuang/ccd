import { HTTP_CONFIG } from '@/constants/http'
import { AUTH_ENABLED } from '@/constants/router'
import { t } from '@/locales'
import { parseZodHttpPayload } from '@/adapters/http.adapter'
import { appLogger } from '@/adapters/logger.adapter'
import { notifyUnauthorized, readAuthToken } from '@/infra/auth/tokenProvider'
import { compressAndEncryptSync, decryptAndDecompressSync } from '@/utils/safeStorage'
import { castValue } from '@ccd/shared-utils'
import type { Method } from 'alova'
import type { ZodType } from 'zod'
import { ErrorType, HttpRequestError, getErrorTypeByStatus } from './errors'
import { isWithSafeStorage } from './types'

type RefreshTokenExecutor = () => Promise<string>

interface RefreshQueueItem {
  resolve: (token: string) => void
  reject: (error: Error) => void
}

let refreshTokenExecutor: RefreshTokenExecutor | null = null

const REFRESH_ENDPOINT = '/auth/refresh'
const RETRIED_AFTER_REFRESH_FLAG = '__retriedAfterRefresh'

export function setRefreshTokenExecutor(executor: RefreshTokenExecutor): void {
  refreshTokenExecutor = executor
}

function isRefreshEndpoint(url: string): boolean {
  return url.includes(REFRESH_ENDPOINT)
}

/**
 * Fallback token refresh executor using raw `fetch`.
 *
 * ⚠️ INFRASTRUCTURE EXCEPTION — intentionally bypasses all interceptor protections:
 * - CSRF / signature injection (N/A for refresh endpoint)
 * - request body encryption (refresh token must be plaintext)
 * - response body decryption (refresh response is plaintext)
 * - request body sanitization (no sensitive fields in refresh request)
 * - rate limiting (refresh is triggered by 401, not user action)
 * - deduplication (handled by TokenRefreshCoordinator instead)
 *
 * DO NOT replace with `alovaInstance.Post()` — it would recurse through this
 * same 401 refresh pipeline, causing infinite recursion.
 */
async function defaultRefreshTokenExecutor(): Promise<string> {
  const response = await fetch(REFRESH_ENDPOINT, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  })

  if (!response.ok) {
    throw new Error(`refresh failed: HTTP ${response.status}`)
  }

  const payload = (await response.json()) as {
    token?: string
    data?: { token?: string }
    message?: string
  } | null
  const token = payload?.data?.token ?? payload?.token

  if (!token || !String(token).trim()) {
    throw new Error(payload?.message || 'refresh token missing in response')
  }

  return token
}

class TokenRefreshCoordinator {
  private isRefreshing = false
  private refreshPromise: Promise<string> | null = null
  private requestsQueue: RefreshQueueItem[] = []
  private unauthorizedNotified = false

  private enqueue(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.requestsQueue.push({ resolve, reject })
    })
  }

  private flushSuccess(token: string): void {
    const queue = [...this.requestsQueue]
    this.requestsQueue = []
    queue.forEach(({ resolve }) => resolve(token))
  }

  private flushFailure(error: Error): void {
    const queue = [...this.requestsQueue]
    this.requestsQueue = []
    queue.forEach(({ reject }) => reject(error))
  }

  private notifyUnauthorizedOnce(): void {
    if (this.unauthorizedNotified) {
      return
    }

    this.unauthorizedNotified = true
    try {
      void notifyUnauthorized().catch(error => {
        appLogger.error('[HTTP] Unauthorized handler failed:', error)
      })
    } finally {
      // Use setTimeout(,0) instead of queueMicrotask: ensures the flag resets
      // after the current macro-task batch, preventing rapid-fire 401 notifications
      // from the same event loop turn while still allowing new batches to notify.
      setTimeout(() => {
        this.unauthorizedNotified = false
      }, 0)
    }
  }

  private async runRefresh(): Promise<string> {
    const executor = refreshTokenExecutor ?? defaultRefreshTokenExecutor
    return executor()
  }

  async acquireFreshToken(): Promise<string> {
    if (this.isRefreshing && this.refreshPromise) {
      return this.enqueue()
    }

    this.isRefreshing = true
    this.refreshPromise = this.runRefresh()

    try {
      const token = await this.refreshPromise
      this.flushSuccess(token)
      return token
    } catch (error) {
      const normalizedError = error instanceof Error ? error : new Error('refresh failed')
      this.flushFailure(normalizedError)
      this.notifyUnauthorizedOnce()
      throw normalizedError
    } finally {
      this.isRefreshing = false
      this.refreshPromise = null
    }
  }
}

const tokenRefreshCoordinator = new TokenRefreshCoordinator()

function getMethodConfigRecord(method: Method): Record<string, unknown> {
  return method.config as Record<string, unknown>
}

function isRetriedAfterRefresh(method: Method): boolean {
  return Boolean(getMethodConfigRecord(method)[RETRIED_AFTER_REFRESH_FLAG])
}

function markRetriedAfterRefresh(method: Method): void {
  getMethodConfigRecord(method)[RETRIED_AFTER_REFRESH_FLAG] = true
}

function getResponseSchema(method: Method): ZodType<unknown> | undefined {
  const schema = getMethodConfigRecord(method).responseSchema
  if (schema && typeof schema === 'object' && 'safeParse' in schema) {
    return schema as ZodType<unknown>
  }
  return undefined
}

function validateResponsePayload(method: Method, payload: unknown): unknown {
  const schema = getResponseSchema(method)
  return schema ? parseZodHttpPayload(schema, payload) : payload
}

async function handle401WithRefresh(method: Method): Promise<unknown> {
  if (isRefreshEndpoint(method.url)) {
    void notifyUnauthorized().catch(error => {
      appLogger.error('[HTTP] Unauthorized handler failed:', error)
    })
    throw new HttpRequestError(
      t('http.error.unauthorized'),
      ErrorType.AUTH,
      401,
      'Unauthorized',
      undefined,
      false
    )
  }

  if (isRetriedAfterRefresh(method)) {
    void notifyUnauthorized().catch(error => {
      appLogger.error('[HTTP] Unauthorized handler failed:', error)
    })
    throw new HttpRequestError(
      t('http.error.unauthorized'),
      ErrorType.AUTH,
      401,
      'Unauthorized',
      undefined,
      false
    )
  }

  await tokenRefreshCoordinator.acquireFreshToken()
  markRetriedAfterRefresh(method)
  return method.send(true)
}

/**
 * Security sanitization: redact sensitive fields from request payloads.
 *
 * **Design decision**: Only applies to absolute URLs (external requests).
 * Relative paths (/api/...) are treated as own-backend requests and skip
 * sanitization to preserve the real request body for backend debugging.
 * If backend logs expose request bodies, consider enabling sanitization
 * for internal routes via per-request security config.
 */
function sanitizeData(
  data: unknown,
  sensitiveFields: string[] = [...HTTP_CONFIG.sensitiveFields]
): unknown {
  if (!data || typeof data !== 'object') {
    return data
  }

  const sanitized = { ...(data as Record<string, unknown>) }

  // 清理敏感字段
  sensitiveFields.forEach(field => {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]'
    }
  })

  return sanitized
}

/**
 * 处理请求数据加密
 * 如果 data 中存在 isSafeStorage: true，则加密其他字段的值（保持key不变）
 * @param data 请求数据对象
 * @returns 处理后的数据对象
 */
export const processRequestData = <T extends Record<string, unknown>>(data: T): T => {
  // 检查是否存在 isSafeStorage 且为 true
  if (isWithSafeStorage(data)) {
    try {
      // 创建新对象，保持原有key，只加密value
      const encryptedData: Record<string, unknown> = {
        isSafeStorage: true,
      }

      // 遍历所有字段，加密每个字段的值（除了 isSafeStorage）
      for (const key in data) {
        if (key !== 'isSafeStorage' && Object.prototype.hasOwnProperty.call(data, key)) {
          const value = data[key]
          // 加密每个字段的值
          const encrypted = compressAndEncryptSync(value)
          if (encrypted) {
            encryptedData[key] = encrypted
          } else {
            // 如果加密失败，保留原始值
            encryptedData[key] = value
          }
        }
      }

      return castValue<T>(encryptedData)
    } catch (error) {
      appLogger.error('[RequestEncrypt] 加密请求数据失败:', error)
    }
  }

  // 如果没有 isSafeStorage 或加密失败，返回原始数据
  return data
}

/**
 * Read CSRF token from cookie or meta tag.
 * Tries cookie first (common pattern), then <meta name="csrf-token">.
 * Returns null if no token found or not in browser environment.
 */
export function readCsrfToken(): string | null {
  if (typeof document === 'undefined') return null

  // Try cookie-based token (e.g. XSRF-TOKEN set by backend)
  const cookieMatch = document.cookie.match(/(?:XSRF-TOKEN|csrf-token|_csrf)=([^;]+)/)
  if (cookieMatch?.[1]) return decodeURIComponent(cookieMatch[1])

  // Try meta tag token
  const meta = document.querySelector('meta[name="csrf-token"]')
  if (meta) {
    const content = meta.getAttribute('content')
    if (content) return content
  }

  return null
}

/**
 * 全局请求拦截器
 */
export const beforeRequest = (method: Method) => {
  method.config.headers = method.config.headers || {}

  // 安全配置：优先使用 per-request security，否则使用 HTTP_CONFIG 全局配置
  const enableCsrf = method.config.security?.enableCSRF ?? HTTP_CONFIG.enableCsrf
  const enableSignature = method.config.security?.enableSignature ?? HTTP_CONFIG.enableSignature
  if (enableCsrf) {
    const csrfToken = readCsrfToken()
    if (csrfToken) {
      method.config.headers['X-CSRF-Token'] = csrfToken
    }
  }
  if (enableSignature) {
    // 预留：请求签名（HTTP_CONFIG.enableSignature 默认关闭，对接后端时启用）
    // 接入方式：对 method.url + method.data + timestamp 进行 HMAC-SHA256 签名，注入签名头。
    // 示例：method.config.headers['X-Request-Signature'] = signRequest(method)
  }

  // 添加认证头（通过 AuthBridge 获取，不依赖 Store）
  const token = readAuthToken()

  if (AUTH_ENABLED && token && String(token).trim()) {
    method.config.headers['Authorization'] = `Bearer ${token}`
  } else {
    delete method.config.headers['Authorization']
  }

  // 仅对完整 URL（视为外部请求）做请求体脱敏，避免敏感字段发往第三方；
  // 相对路径（/api/...）视为自有后端，不脱敏以保留真实请求体。
  // 协议相对 URL（//evil.com）也视为外部请求，需脱敏。
  const isExternalUrl = !method.url.startsWith('/') || method.url.startsWith('//')
  if (isExternalUrl) {
    if (method.config.security?.sensitiveFields) {
      // Alova Method.data 边界：sanitizeData 返回 unknown，需桥接
      method.data = sanitizeData(
        method.data,
        method.config.security.sensitiveFields
      ) as typeof method.data
    } else {
      method.data = sanitizeData(method.data, [
        ...HTTP_CONFIG.sensitiveFields,
      ]) as typeof method.data
    }
  }

  // 检查请求数据是否需要加密（在脱敏之后进行）
  if (method.data && typeof method.data === 'object') {
    method.data = processRequestData(method.data as Record<string, unknown>) as typeof method.data
  }
}

function showHttpNotification(title: string, message: string): void {
  if (typeof window === 'undefined') return

  if (window.$message?.danger) {
    window.$message.danger(message, title)
    return
  }

  if (window.$toast?.dangerIn) {
    window.$toast.dangerIn('top-left', title, message)
    return
  }

  appLogger.error(`[HTTP] ${title}: ${message}`)
}

/**
 * 全局响应拦截器 - 适配 server 的响应格式
 */
export const responseHandler = async (response: Response, method: Method) => {
  try {
    // 检查是否是 HEAD 请求
    // HEAD 请求不返回响应体，只返回响应头
    if (method.type === 'HEAD') {
      // HEAD 请求只检查状态码
      if (!response.ok) {
        if (response.status === 401 && AUTH_ENABLED) {
          return await handle401WithRefresh(method)
        }
        const errorType = getErrorTypeByStatus(response.status)
        const retryable = response.status >= 500

        handleHttpError(response.status, { message: response.statusText })
        throw new HttpRequestError(
          response.statusText || `HTTP ${response.status}`,
          errorType,
          response.status,
          response.statusText,
          undefined,
          retryable
        )
      }

      // HEAD 请求成功，返回响应头供调用方使用
      return { headers: response.headers }
    }

    // 检查响应类型
    const contentType = response.headers.get('content-type')

    // 检查是否是 blob 响应（文件下载）
    // 通过 Content-Type 或配置中的 responseType 判断
    const isBlobResponse =
      method.config?.responseType === 'blob' ||
      contentType?.includes('application/octet-stream') ||
      contentType?.includes('application/force-download') ||
      (method.config as Record<string, unknown>)?.['responseType'] === 'blob' // 兼容不同的配置方式

    // 如果是 blob 响应，直接返回 blob
    if (isBlobResponse) {
      // 先检查 HTTP 状态码错误
      if (!response.ok) {
        if (response.status === 401 && AUTH_ENABLED) {
          return await handle401WithRefresh(method)
        }
        // 尝试读取错误信息（可能是 JSON）
        let errorData: { message?: string }
        try {
          const text = await response.text()
          try {
            errorData = JSON.parse(text)
          } catch {
            errorData = { message: text || response.statusText }
          }
        } catch {
          errorData = { message: response.statusText }
        }

        const errorType = getErrorTypeByStatus(response.status)
        const retryable = response.status >= 500

        handleHttpError(response.status, errorData)
        throw new HttpRequestError(
          errorData?.message || `HTTP ${response.status}`,
          errorType,
          response.status,
          response.statusText,
          errorData,
          retryable
        )
      }

      // 状态码正常，返回 blob
      return await response.blob()
    }

    // 文本优先策略：优先获取文本，然后尝试解析 JSON
    const text = await response.text()
    let json: Record<string, unknown> | null = null

    // 尝试解析 JSON
    try {
      json = JSON.parse(text) as Record<string, unknown>
    } catch {
      json = null
    }

    // 判定逻辑：如果解析成功且是对象，走标准的 JSON 处理流程
    if (json && typeof json === 'object') {
      // 处理 HTTP 状态码错误
      if (!response.ok) {
        if (response.status === 401 && AUTH_ENABLED) {
          return await handle401WithRefresh(method)
        }
        const errorType = getErrorTypeByStatus(response.status)
        const retryable = response.status >= 500

        handleHttpError(response.status, json)
        throw new HttpRequestError(
          String(json?.message ?? `HTTP ${response.status}`),
          errorType,
          response.status,
          response.statusText,
          json,
          retryable
        )
      }

      // server 使用 success 字段而不是 code
      if (json.success === false) {
        throw new HttpRequestError(
          String(json.message ?? t('http.error.requestFailed')),
          ErrorType.SERVER,
          response.status,
          response.statusText,
          json,
          false
        )
      }

      // 如果有 success 字段且为 true，返回 data 字段（如果存在）或整个响应对象
      // 如果没有 success 字段，说明是根路径等简单响应，直接返回
      if (json.success === true) {
        let responseData = json.data !== undefined ? json.data : json

        // 检查响应数据是否需要解密
        if (isWithSafeStorage(responseData)) {
          try {
            // 创建新对象，保持原有key，只解密value
            const decryptedData: Record<string, unknown> = {}
            const responseDataObj = responseData as Record<string, unknown>

            // 遍历所有字段，解密每个字段的值（除了 isSafeStorage）
            for (const key in responseDataObj) {
              if (
                key !== 'isSafeStorage' &&
                Object.prototype.hasOwnProperty.call(responseDataObj, key)
              ) {
                const value = responseDataObj[key]
                // 如果值是字符串，尝试解密
                if (typeof value === 'string' && value) {
                  const decrypted = decryptAndDecompressSync<unknown>(value)
                  if (decrypted !== null) {
                    decryptedData[key] = decrypted
                  } else {
                    appLogger.warn(
                      `[ResponseDecrypt] Failed to decrypt field "${key}", using raw value`
                    )
                    decryptedData[key] = value
                  }
                } else {
                  // 如果不是字符串，直接保留
                  decryptedData[key] = value
                }
              }
            }

            // 使用解密后的数据替换原始数据
            responseData = castValue(decryptedData)
          } catch (error) {
            appLogger.error('[ResponseHandler] 解密响应数据失败:', error)
            // 解密失败时返回原始数据
          }
        }

        return validateResponsePayload(method, responseData)
      }

      // 如果没有 success 字段，返回整个响应对象
      return validateResponsePayload(method, json)
    } else {
      // 不是 JSON，但状态码正常，直接返回文本
      if (response.ok) {
        return validateResponsePayload(method, text)
      }
      // 不是 JSON 且状态码错误，抛出包含文本内容的错误
      throw new HttpRequestError(
        `HTTP ${response.status}: ${text}`,
        ErrorType.SERVER,
        response.status,
        response.statusText,
        text,
        response.status >= 500
      )
    }
  } catch (error) {
    // 如果是自定义错误，直接抛出
    if (error instanceof HttpRequestError) {
      throw error
    }

    const errorMessage = (error as Error).message || ''
    const errorName = (error as Error).name || ''

    // 处理网络错误 - 服务器未开启、无法连接等情况
    // DOMException.name === 'NetworkError' is the most reliable cross-browser signal.
    // TypeError with common fetch failure messages covers older browsers and Node.
    const isNetworkError =
      (error instanceof DOMException && errorName === 'NetworkError') ||
      (error instanceof TypeError &&
        (errorMessage.includes('Failed to fetch') ||
          errorMessage.includes('fetch failed') ||
          errorMessage.includes('NetworkError') ||
          errorMessage.includes('Network request failed') ||
          errorMessage.includes('ERR_NETWORK') ||
          errorMessage.includes('ERR_CONNECTION') ||
          errorMessage.includes('ERR_INTERNET_DISCONNECTED') ||
          errorMessage.includes('ERR_NAME_NOT_RESOLVED') ||
          errorMessage.includes('ERR_ADDRESS_UNREACHABLE')))

    if (isNetworkError) {
      appLogger.error('❌ 网络连接错误:', errorMessage || errorName)
      const statusMessage = t('http.error.networkConnectionFailed')
      const _networkErrorMessage = errorMessage || t('http.error.networkConnectionFailed')

      showHttpNotification(statusMessage, _networkErrorMessage)

      throw new HttpRequestError(
        statusMessage,
        ErrorType.NETWORK,
        undefined,
        undefined,
        undefined,
        true
      )
    }

    // 处理 CORS 错误
    if (error instanceof TypeError && errorMessage.includes('CORS')) {
      appLogger.error('❌ CORS 错误:', errorMessage)
      throw new HttpRequestError(
        t('http.error.corsBlocked'),
        ErrorType.CLIENT,
        undefined,
        undefined,
        undefined,
        false
      )
    }

    // 处理超时错误
    if (error instanceof TypeError && errorMessage.includes('timeout')) {
      throw new HttpRequestError(
        t('http.error.requestTimeout'),
        ErrorType.TIMEOUT,
        undefined,
        undefined,
        undefined,
        true
      )
    }

    // 处理安全错误
    if (error instanceof TypeError && errorMessage.includes('security')) {
      throw new HttpRequestError(
        t('http.error.securityVerificationFailed'),
        ErrorType.SECURITY,
        undefined,
        undefined,
        undefined,
        false
      )
    }

    handleRequestError(error as Error)
    throw new HttpRequestError(
      errorMessage || t('http.error.unknownError'),
      ErrorType.UNKNOWN,
      undefined,
      undefined,
      undefined,
      false
    )
  }
}

/**
 * 处理 HTTP 状态码错误
 */
const handleHttpError = (status: number, data: { message?: string } | undefined) => {
  const errorMessage = data?.message || t('http.error.httpError', { status })
  let statusMessage = `HTTP ${status}`

  switch (status) {
    case 400:
      // 处理请求错误
      statusMessage = t('http.error.badRequest')
      appLogger.warn('请求错误')
      break
    case 401:
      // 401 刷新与未授权处理由 TokenRefreshCoordinator 统一负责
      statusMessage = t('http.error.unauthorized')
      break
    case 403:
      // 处理权限不足错误
      statusMessage = t('http.error.forbidden')
      appLogger.warn('权限不足')
      break
    case 404:
      // 处理资源不存在错误
      statusMessage = t('http.error.notFound')
      appLogger.warn('请求的资源不存在')
      break
    case 500:
      // 处理服务器内部错误
      statusMessage = t('http.error.internalServerError')
      appLogger.error('服务器内部错误')
      break
    case 502:
    case 503:
    case 504:
      statusMessage = t('http.error.serviceUnavailable')
      appLogger.error('服务器暂时不可用')
      break
    default:
      statusMessage = t('http.error.httpError', { status })
      appLogger.error(`HTTP ${status} 错误`)
  }

  showHttpNotification(statusMessage, errorMessage)
}

/**
 * 处理请求错误
 */
const handleRequestError = (error: Error) => {
  // 根据错误类型进行不同处理
  if (error.message.includes('timeout')) {
    appLogger.warn('请求超时')
  } else if (error.message.includes('Network')) {
    appLogger.warn('网络错误')
  } else if (error.message.includes('Failed to fetch')) {
    appLogger.warn('网络连接失败')
  }
}
