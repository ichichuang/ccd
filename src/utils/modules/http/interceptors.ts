import { HTTP_CONFIG } from '@/constants'
import { useUserStoreWithOut } from '@/stores'
import { env } from '@/utils'
import { decompressAndDecryptSync } from '@/utils/modules/safeStorage'
import type { Method } from 'alova'

/**
 * 错误类型枚举
 */
export enum ErrorType {
  NETWORK = 'NETWORK',
  TIMEOUT = 'TIMEOUT',
  AUTH = 'AUTH',
  SERVER = 'SERVER',
  CLIENT = 'CLIENT',
  SECURITY = 'SECURITY',
  UNKNOWN = 'UNKNOWN',
}

/**
 * 自定义 HTTP 错误类
 */
export class HttpRequestError extends Error {
  public type: ErrorType
  public status?: number
  public statusText?: string
  public data?: any
  public retryable: boolean

  constructor(
    message: string,
    type: ErrorType = ErrorType.UNKNOWN,
    status?: number,
    statusText?: string,
    data?: any,
    retryable: boolean = false
  ) {
    super(message)
    this.name = 'HttpRequestError'
    this.type = type
    this.status = status
    this.statusText = statusText
    this.data = data
    this.retryable = retryable
  }
}

/**
 * 判断错误是否可重试
 */
function isRetryableError(error: HttpRequestError): boolean {
  // 网络错误、超时错误、5xx 服务器错误可以重试
  return (
    error.type === ErrorType.NETWORK ||
    error.type === ErrorType.TIMEOUT ||
    (error.status !== undefined && error.status >= 500 && error.status < 600)
  )
}

// 导出供外部使用
export { isRetryableError }

/**
 * 安全检查和数据清理
 */
function sanitizeData(
  data: any,
  sensitiveFields: string[] = [...HTTP_CONFIG.sensitiveFields]
): any {
  if (!data || typeof data !== 'object') {
    return data
  }

  const sanitized = { ...data }

  // 清理敏感字段
  sensitiveFields.forEach(field => {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]'
    }
  })

  return sanitized
}

/**
 * 全局请求拦截器
 */
export const beforeRequest = (method: Method) => {
  method.config.headers = method.config.headers || {}

  // 添加认证头
  const userStore = useUserStoreWithOut()
  const token = userStore.getToken

  if (token && token.trim()) {
    method.config.headers['Authorization'] = `Bearer ${token}`
  } else {
    delete method.config.headers['Authorization']
  }

  // 数据脱敏处理
  if (!method.url.startsWith('/')) {
    if (method.config.security?.sensitiveFields) {
      method.data = sanitizeData(method.data, method.config.security.sensitiveFields)
    } else {
      method.data = sanitizeData(method.data, [...HTTP_CONFIG.sensitiveFields])
    }
  }
}

/**
 * 全局响应拦截器 - 适配 server 的响应格式
 */
export const responseHandler = async (response: Response, _method: Method) => {
  try {
    // 检查响应类型
    const contentType = response.headers.get('content-type')
    let json: any

    if (contentType && contentType.includes('application/json')) {
      json = await response.json()
    } else {
      // 非 JSON 响应，尝试解析为文本
      const text = await response.text()
      if (env.debug) {
        console.warn('⚠️ 收到非 JSON 响应:', text)
      }

      // 如果不是 JSON，但 HTTP 状态码正常，返回文本内容
      if (response.ok) {
        return text
      } else {
        throw new HttpRequestError(
          `HTTP ${response.status}: ${text}`,
          ErrorType.SERVER,
          response.status,
          response.statusText,
          text,
          response.status >= 500
        )
      }
    }

    // 处理 HTTP 状态码错误
    if (!response.ok) {
      const errorType = getErrorTypeByStatus(response.status)
      const retryable = response.status >= 500

      handleHttpError(response.status, json)
      throw new HttpRequestError(
        json?.message || `HTTP ${response.status}`,
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
        json.message || '请求失败',
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
      if (responseData && typeof responseData === 'object' && responseData.isSafeStorage === true) {
        try {
          // 如果存在 encrypted 字段，则解密
          if (responseData.encrypted && typeof responseData.encrypted === 'string') {
            const decrypted = decompressAndDecryptSync<any>(responseData.encrypted)
            if (decrypted) {
              // 返回解密后的原始数据（不包含 isSafeStorage 和 encrypted 字段）
              responseData = decrypted
            }
          }
        } catch (error) {
          console.error('[ResponseHandler] 解密响应数据失败:', error)
          // 解密失败时返回原始数据
        }
      }

      return responseData
    }

    // 如果没有 success 字段，返回整个响应对象
    return json
  } catch (error) {
    // 处理网络错误
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('❌ 网络连接错误:', error.message)
      throw new HttpRequestError(
        '网络连接失败，请检查网络设置',
        ErrorType.NETWORK,
        undefined,
        undefined,
        undefined,
        true
      )
    }

    // 处理 CORS 错误
    if (error instanceof TypeError && error.message.includes('CORS')) {
      console.error('❌ CORS 错误:', error.message)
      throw new HttpRequestError(
        '跨域请求被阻止，请联系管理员',
        ErrorType.CLIENT,
        undefined,
        undefined,
        undefined,
        false
      )
    }

    // 处理超时错误
    if (error instanceof TypeError && error.message.includes('timeout')) {
      throw new HttpRequestError(
        '请求超时，请稍后重试',
        ErrorType.TIMEOUT,
        undefined,
        undefined,
        undefined,
        true
      )
    }

    // 处理安全错误
    if (error instanceof TypeError && error.message.includes('security')) {
      throw new HttpRequestError(
        '安全验证失败',
        ErrorType.SECURITY,
        undefined,
        undefined,
        undefined,
        false
      )
    }

    // 如果是自定义错误，直接抛出
    if (error instanceof HttpRequestError) {
      throw error
    }

    handleRequestError(error as Error)
    throw new HttpRequestError(
      (error as Error).message || '未知错误',
      ErrorType.UNKNOWN,
      undefined,
      undefined,
      undefined,
      false
    )
  }
}

/**
 * 根据状态码获取错误类型
 */
function getErrorTypeByStatus(status: number): ErrorType {
  if (status >= 500) {
    return ErrorType.SERVER
  } else if (status === 401 || status === 403) {
    return ErrorType.AUTH
  } else if (status >= 400 && status < 500) {
    return ErrorType.CLIENT
  }
  return ErrorType.UNKNOWN
}

/**
 * 处理 HTTP 状态码错误
 */
const handleHttpError = (status: number, data: any) => {
  if (env.debug) {
    console.error(`❌ HTTP ${status} 错误:`, data)
  }

  switch (status) {
    case 401:
      // 处理未授权错误
      useUserStoreWithOut().logout()
      break
    case 403:
      // 处理权限不足错误
      console.warn('权限不足')
      break
    case 404:
      console.warn('请求的资源不存在')
      break
    case 500:
      console.error('服务器内部错误')
      break
    case 502:
    case 503:
    case 504:
      console.error('服务器暂时不可用')
      break
    default:
      console.error(`HTTP ${status} 错误`)
  }
}

/**
 * 处理请求错误
 */
const handleRequestError = (error: Error) => {
  if (env.debug) {
    console.error('❌ 请求错误:', error)
  }

  // 根据错误类型进行不同处理
  if (error.message.includes('timeout')) {
    console.warn('请求超时')
  } else if (error.message.includes('Network')) {
    console.warn('网络错误')
  } else if (error.message.includes('Failed to fetch')) {
    console.warn('网络连接失败')
  }
}
