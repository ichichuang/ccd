/**
 * HTTP 错误类型与工具函数
 * - 独立于拦截器与 methods，避免循环依赖
 * - 供业务侧与 hooks 显式引用，形成强类型闭环
 */

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
 * - 网络错误、超时错误、5xx 服务器错误可以重试
 */
export function isRetryableError(error: HttpRequestError): boolean {
  return (
    error.type === ErrorType.NETWORK ||
    error.type === ErrorType.TIMEOUT ||
    (error.status !== undefined && error.status >= 500 && error.status < 600)
  )
}

/**
 * 类型守卫：判断是否为 HttpRequestError
 */
export function isHttpRequestError(error: unknown): error is HttpRequestError {
  return error instanceof HttpRequestError
}
