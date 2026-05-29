import { t } from '@/locales'
import { appLogger } from '@/adapters/logger.adapter'
import type { RequestConfig } from '../types'

export function showHttpNotification(title: string, message: string): void {
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

function shouldShowRawGlobalError(config?: RequestConfig): boolean {
  const globalError = config?.globalError
  return globalError !== 'silent'
}

export function showRawGlobalError(status: number, message: string, config?: RequestConfig): void {
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
      appLogger.error(`[HTTP ${status}] ${message}`)
    }
  } catch (_error) {
    appLogger.error(`[HTTP ${status}] ${message}`)
  }
}
