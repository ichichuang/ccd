import { t } from '@/locales'
import { appLogger } from '@/adapters/logger.adapter'
import { getErrorTypeByStatus } from '../errors'

export interface HttpErrorPolicy {
  errorMessage: string
  errorType: ReturnType<typeof getErrorTypeByStatus>
  retryable: boolean
  statusMessage: string
}

export function resolveHttpErrorPolicy(
  status: number,
  data: { message?: string } | undefined
): HttpErrorPolicy {
  const errorMessage = data?.message || t('http.error.httpError', { status })
  let statusMessage = `HTTP ${status}`

  switch (status) {
    case 400:
      statusMessage = t('http.error.badRequest')
      break
    case 401:
      statusMessage = t('http.error.unauthorized')
      break
    case 403:
      statusMessage = t('http.error.forbidden')
      break
    case 404:
      statusMessage = t('http.error.notFound')
      break
    case 500:
      statusMessage = t('http.error.internalServerError')
      break
    case 502:
    case 503:
    case 504:
      statusMessage = t('http.error.serviceUnavailable')
      break
    default:
      statusMessage = t('http.error.httpError', { status })
  }

  return {
    errorMessage,
    errorType: getErrorTypeByStatus(status),
    retryable: status >= 500,
    statusMessage,
  }
}

export function logHttpStatus(status: number): void {
  switch (status) {
    case 400:
      appLogger.warn('请求错误')
      break
    case 401:
      break
    case 403:
      appLogger.warn('权限不足')
      break
    case 404:
      appLogger.warn('请求的资源不存在')
      break
    case 500:
      appLogger.error('服务器内部错误')
      break
    case 502:
    case 503:
    case 504:
      appLogger.error('服务器暂时不可用')
      break
    default:
      appLogger.error(`HTTP ${status} 错误`)
  }
}
