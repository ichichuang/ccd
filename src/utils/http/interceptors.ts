import { HTTP_CONFIG } from '@/constants/http'
import { useUserStoreWithOut } from '@/stores/modules/user'
import { decompressAndDecryptSync, encryptAndCompressSync } from '@/utils/safeStorage'
import type { Method } from 'alova'
import { ErrorType, HttpRequestError } from './errors'

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
 * 处理请求数据加密
 * 如果 data 中存在 isSafeStorage: true，则加密其他字段的值（保持key不变）
 * @param data 请求数据对象
 * @returns 处理后的数据对象
 */
export const processRequestData = <T extends Record<string, any>>(data: T): T => {
  // 检查是否存在 isSafeStorage 且为 true
  if (data && typeof data === 'object' && data.isSafeStorage === true) {
    try {
      // 创建新对象，保持原有key，只加密value
      const encryptedData: Record<string, any> = {
        isSafeStorage: true,
      }

      // 遍历所有字段，加密每个字段的值（除了 isSafeStorage）
      for (const key in data) {
        if (key !== 'isSafeStorage' && Object.prototype.hasOwnProperty.call(data, key)) {
          const value = data[key]
          // 加密每个字段的值
          const encrypted = encryptAndCompressSync(value)
          if (encrypted) {
            encryptedData[key] = encrypted
          } else {
            // 如果加密失败，保留原始值
            encryptedData[key] = value
          }
        }
      }

      return encryptedData as unknown as T
    } catch (error) {
      console.error('[RequestEncrypt] 加密请求数据失败:', error)
    }
  }

  // 如果没有 isSafeStorage 或加密失败，返回原始数据
  return data
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

  // 数据脱敏处理（在加密之前进行，因为加密后的数据不需要脱敏）
  if (!method.url.startsWith('/')) {
    if (method.config.security?.sensitiveFields) {
      method.data = sanitizeData(method.data, method.config.security.sensitiveFields)
    } else {
      method.data = sanitizeData(method.data, [...HTTP_CONFIG.sensitiveFields])
    }
  }

  // 检查请求数据是否需要加密（在脱敏之后进行）
  if (method.data && typeof method.data === 'object') {
    method.data = processRequestData(method.data)
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

      // HEAD 请求成功，返回 void 或空对象
      return undefined
    }

    // 检查响应类型
    const contentType = response.headers.get('content-type')

    // 检查是否是 blob 响应（文件下载）
    // 通过 Content-Type 或配置中的 responseType 判断
    const isBlobResponse =
      method.config?.responseType === 'blob' ||
      contentType?.includes('application/octet-stream') ||
      contentType?.includes('application/force-download') ||
      method.config?.['responseType'] === 'blob' // 兼容不同的配置方式

    // 如果是 blob 响应，直接返回 blob
    if (isBlobResponse) {
      // 先检查 HTTP 状态码错误
      if (!response.ok) {
        // 尝试读取错误信息（可能是 JSON）
        let errorData: any
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
    let json: any = null

    // 尝试解析 JSON
    try {
      json = JSON.parse(text)
    } catch {
      json = null
    }

    // 判定逻辑：如果解析成功且是对象，走标准的 JSON 处理流程
    if (json && typeof json === 'object') {
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
          json.message || $t('http.error.requestFailed'),
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
        if (
          responseData &&
          typeof responseData === 'object' &&
          responseData.isSafeStorage === true
        ) {
          try {
            // 创建新对象，保持原有key，只解密value
            const decryptedData: Record<string, any> = {}

            // 遍历所有字段，解密每个字段的值（除了 isSafeStorage）
            for (const key in responseData) {
              if (
                key !== 'isSafeStorage' &&
                Object.prototype.hasOwnProperty.call(responseData, key)
              ) {
                const value = responseData[key]
                // 如果值是字符串，尝试解密
                if (typeof value === 'string' && value) {
                  const decrypted = decompressAndDecryptSync<any>(value)
                  if (decrypted !== null) {
                    decryptedData[key] = decrypted
                  } else {
                    // 如果解密失败，保留原始值
                    decryptedData[key] = value
                  }
                } else {
                  // 如果不是字符串，直接保留
                  decryptedData[key] = value
                }
              }
            }

            // 使用解密后的数据替换原始数据
            responseData = decryptedData
          } catch (error) {
            console.error('[ResponseHandler] 解密响应数据失败:', error)
            // 解密失败时返回原始数据
          }
        }

        return responseData
      }

      // 如果没有 success 字段，返回整个响应对象
      return json
    } else {
      // 不是 JSON，但状态码正常，直接返回文本
      if (response.ok) {
        return text
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
    // 检查常见的网络错误标识
    const isNetworkError =
      error instanceof TypeError &&
      (errorMessage.includes('Failed to fetch') ||
        errorMessage.includes('fetch failed') ||
        errorMessage.includes('NetworkError') ||
        errorMessage.includes('Network request failed') ||
        errorMessage.includes('ERR_NETWORK') ||
        errorMessage.includes('ERR_CONNECTION_REFUSED') ||
        errorMessage.includes('ERR_CONNECTION_RESET') ||
        errorMessage.includes('ERR_CONNECTION_ABORTED') ||
        errorMessage.includes('ERR_INTERNET_DISCONNECTED') ||
        errorMessage.includes('ERR_NAME_NOT_RESOLVED') ||
        errorMessage.includes('ERR_ADDRESS_UNREACHABLE') ||
        errorName === 'NetworkError' ||
        errorName === 'TypeError')

    if (isNetworkError) {
      console.error('❌ 网络连接错误:', errorMessage || errorName)
      const statusMessage = $t('http.error.networkConnectionFailed')
      const _networkErrorMessage = errorMessage || $t('http.error.networkConnectionFailed')

      // 显示网络错误提示
      try {
        if (window.$message?.error) {
          window.$message.error(_networkErrorMessage, statusMessage)
        } else if (window.$toast?.errorIn) {
          window.$toast.errorIn('top-left', statusMessage, _networkErrorMessage)
        }
      } catch (toastError) {
        console.error('❌ 显示网络错误提示失败:', toastError)
      }

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
      console.error('❌ CORS 错误:', errorMessage)
      throw new HttpRequestError(
        $t('http.error.corsBlocked'),
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
        $t('http.error.requestTimeout'),
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
        $t('http.error.securityVerificationFailed'),
        ErrorType.SECURITY,
        undefined,
        undefined,
        undefined,
        false
      )
    }

    handleRequestError(error as Error)
    throw new HttpRequestError(
      errorMessage || $t('http.error.unknownError'),
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
  const errorMessage = data?.message || $t('http.error.httpError', { status })
  let statusMessage = `HTTP ${status}`

  switch (status) {
    case 400:
      // 处理请求错误
      statusMessage = $t('http.error.badRequest')
      console.warn('请求错误')
      break
    case 401:
      // 处理未授权错误
      statusMessage = $t('http.error.unauthorized')
      useUserStoreWithOut().logout()
      break
    case 403:
      // 处理权限不足错误
      statusMessage = $t('http.error.forbidden')
      console.warn('权限不足')
      break
    case 404:
      // 处理资源不存在错误
      statusMessage = $t('http.error.notFound')
      console.warn('请求的资源不存在')
      break
    case 500:
      // 处理服务器内部错误
      statusMessage = $t('http.error.internalServerError')
      console.error('服务器内部错误')
      break
    case 502:
    case 503:
    case 504:
      statusMessage = $t('http.error.serviceUnavailable')
      console.error('服务器暂时不可用')
      break
    default:
      statusMessage = $t('http.error.httpError', { status })
      console.error(`HTTP ${status} 错误`)
  }

  try {
    if (window.$message?.error) {
      window.$message.error(errorMessage, statusMessage)
    } else if (window.$toast?.errorIn) {
      window.$toast.errorIn('top-left', statusMessage, errorMessage)
    }
  } catch (error) {
    console.error('❌ 显示错误提示失败:', error)
  }
}

/**
 * 处理请求错误
 */
const handleRequestError = (error: Error) => {
  // 根据错误类型进行不同处理
  if (error.message.includes('timeout')) {
    console.warn('请求超时')
  } else if (error.message.includes('Network')) {
    console.warn('网络错误')
  } else if (error.message.includes('Failed to fetch')) {
    console.warn('网络连接失败')
  }
}
