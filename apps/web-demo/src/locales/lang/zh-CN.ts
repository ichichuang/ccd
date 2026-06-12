/**
 * 中文语言包 (zh-CN)
 *
 * 结构说明：
 * - core: 业务核心文案（桌面端/主分支共用）
 * - console: web-demo 架构控制台文案
 */
import zhCNCore from '@/locales/lang/core/zh-CN'
import zhCNConsole from '@/locales/lang/console/zh-CN'
import { mergeLocale, type LocaleRecord } from '@/locales/lang/utils/mergeLocale'

const zhCN = mergeLocale(zhCNCore, zhCNConsole)

function isLocaleRecord(value: unknown): value is LocaleRecord {
  return typeof value === 'object' && value !== null
}

const unusedLoginKeys = [
  'title',
  'subtitle',
  'username',
  'password',
  'placeholderUsername',
  'placeholderPassword',
  'authDisabled',
  'required',
  'failed',
  'brandTitle',
  'brandSloganLine2',
  'brandQuoteAuthor',
  'footerText',
  'helpCenter',
  'privacyPolicy',
  'portalEyebrow',
  'quickPasswordHint',
] as const

if (isLocaleRecord(zhCN.login)) {
  for (const key of unusedLoginKeys) {
    Reflect.deleteProperty(zhCN.login, key)
  }
}

export { zhCN }
export default zhCN
