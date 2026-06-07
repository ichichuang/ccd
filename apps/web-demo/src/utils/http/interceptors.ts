import { HTTP_CONFIG } from '@/constants/http'
import { AUTH_ENABLED } from '@/constants/router'
import { t } from '@/locales'
import { appLogger } from '@/adapters/logger.adapter'
import { readAuthToken } from '@/infra/auth/tokenProvider'
import { compressAndEncryptSync, decryptAndDecompressSync } from '@/utils/safeStorage'
import { castValue } from '@ccd/shared-utils'
import type { HttpInterceptorLifecycleContract } from '@ccd/contracts'
import type { Method } from 'alova'
import { ErrorType, HttpRequestError } from './errors'
import {
  acquireFreshToken,
  createUnauthorizedHttpError,
  isRefreshEndpoint,
  isRetriedAfterRefresh,
  markRetriedAfterRefresh,
  notifyUnauthorizedForHttp,
} from './policies/authRefreshPolicy'
import { logHttpStatus, resolveHttpErrorPolicy } from './policies/errorMappingPolicy'
import { showHttpNotification } from './policies/notificationPolicy'
import {
  isBlobHttpResponse,
  readHttpErrorData,
  readResponseTextAndJson,
} from './policies/responseDecodePolicy'
import { validateResponsePayload } from './policies/schemaValidationPolicy'
import { isWithSafeStorage } from './types'

export { setRefreshTokenExecutor } from './policies/authRefreshPolicy'

export const HTTP_INTERCEPTOR_LIFECYCLE = {
  name: 'web-demo-alova-http',
  stages: ['before-request', 'response', 'request-error'],
  failureMode: 'notify-and-propagate',
} satisfies HttpInterceptorLifecycleContract

async function handle401WithRefresh(method: Method): Promise<unknown> {
  if (isRefreshEndpoint(method.url)) {
    notifyUnauthorizedForHttp()
    throw createUnauthorizedHttpError()
  }

  if (isRetriedAfterRefresh(method)) {
    notifyUnauthorizedForHttp()
    throw createUnauthorizedHttpError()
  }

  await acquireFreshToken()
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
        const policy = handleHttpError(response.status, { message: response.statusText })
        throw new HttpRequestError(
          response.statusText || policy.errorMessage,
          policy.errorType,
          response.status,
          response.statusText,
          undefined,
          policy.retryable
        )
      }

      // HEAD 请求成功，返回响应头供调用方使用
      return { headers: response.headers }
    }

    // 检查是否是 blob 响应（文件下载）
    // 通过 Content-Type 或配置中的 responseType 判断
    const isBlobResponse = isBlobHttpResponse(response, method)

    // 如果是 blob 响应，直接返回 blob
    if (isBlobResponse) {
      // 先检查 HTTP 状态码错误
      if (!response.ok) {
        if (response.status === 401 && AUTH_ENABLED) {
          return await handle401WithRefresh(method)
        }
        // 尝试读取错误信息（可能是 JSON）
        const errorData = await readHttpErrorData(response)

        const policy = handleHttpError(response.status, errorData)
        throw new HttpRequestError(
          errorData?.message || policy.errorMessage,
          policy.errorType,
          response.status,
          response.statusText,
          errorData,
          policy.retryable
        )
      }

      // 状态码正常，返回 blob
      return await response.blob()
    }

    // 文本优先策略：优先获取文本，然后尝试解析 JSON
    const { json, text } = await readResponseTextAndJson(response)

    // 判定逻辑：如果解析成功且是对象，走标准的 JSON 处理流程
    if (json && typeof json === 'object') {
      // 处理 HTTP 状态码错误
      if (!response.ok) {
        if (response.status === 401 && AUTH_ENABLED) {
          return await handle401WithRefresh(method)
        }
        const policy = handleHttpError(response.status, json)
        throw new HttpRequestError(
          String(json?.message ?? policy.errorMessage),
          policy.errorType,
          response.status,
          response.statusText,
          json,
          policy.retryable
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
  const policy = resolveHttpErrorPolicy(status, data)
  logHttpStatus(status)
  showHttpNotification(policy.statusMessage, policy.errorMessage)
  return policy
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
