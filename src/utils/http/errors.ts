/**
 * HTTP 错误类型与工具函数
 * - 独立于拦截器与 methods，避免循环依赖
 * - 供业务侧与 hooks 显式引用，形成强类型闭环
 */

import { HTTP_CONFIG } from '@/constants/http'

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

const ERROR_TYPE_TO_CODE_KEY: Record<ErrorType, keyof typeof HTTP_CONFIG.errorCodes> = {
  [ErrorType.NETWORK]: 'networkError',
  [ErrorType.TIMEOUT]: 'timeoutError',
  [ErrorType.AUTH]: 'authError',
  [ErrorType.SERVER]: 'serverError',
  [ErrorType.CLIENT]: 'clientError',
  [ErrorType.SECURITY]: 'securityError',
  [ErrorType.UNKNOWN]: 'unknownError',
}

/**
 * 根据 ErrorType 获取 HTTP_CONFIG.errorCodes 中的字符串错误码
 */
export function getErrorCodeFromType(type: ErrorType): string {
  return HTTP_CONFIG.errorCodes[ERROR_TYPE_TO_CODE_KEY[type]]
}

/**
 * 自定义 HTTP 错误类
 */
export class HttpRequestError extends Error {
  public type: ErrorType
  public code: string
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
    this.code = getErrorCodeFromType(type)
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
