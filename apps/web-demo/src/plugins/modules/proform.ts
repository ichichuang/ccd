import type { App } from 'vue'
import type { ProFormDateFormatter } from '@ccd/vue-ui'
import {
  PRO_FORM_DATE_FORMATTER_KEY,
  configureProFormDraftStorage,
  registerBuiltinFields,
} from '@ccd/vue-ui'
import { PRO_FORM_STORAGE_PREFIXES } from '@/constants/runtime'
import { DateUtils } from '@/utils/date'
import { packDataSync, unpackDataSync } from '@/utils/safeStorage'

const formatProFormDate: ProFormDateFormatter = (value, format) => {
  if (typeof value === 'string' || typeof value === 'number' || value instanceof Date) {
    return DateUtils.format(value, format)
  }
  return String(value)
}

const unpackDraftPayload = (raw: string): Record<string, unknown> | null => {
  const value = unpackDataSync<Record<string, unknown>>(
    raw,
    import.meta.env.VITE_PUBLIC_STORAGE_OBFUSCATION_KEY
  )
  return value && typeof value === 'object' && !Array.isArray(value) ? value : null
}

/**
 * 预注册 ProForm 内置字段组件到全局 fieldRegistry 单例。
 * 在插件阶段统一初始化，避免依赖组件导入时序。
 */
export const setupProForm = (app: App) => {
  configureProFormDraftStorage({
    prefix: PRO_FORM_STORAGE_PREFIXES.draft,
    getStorage: () => (typeof window === 'undefined' ? undefined : window.localStorage),
    pack: data => packDataSync(data, import.meta.env.VITE_PUBLIC_STORAGE_OBFUSCATION_KEY),
    unpack: unpackDraftPayload,
  })
  app.provide(PRO_FORM_DATE_FORMATTER_KEY, formatProFormDate)
  registerBuiltinFields()
}
