/**
 * 英文语言包 (en-US)
 *
 * 结构说明：
 * - core: 业务核心文案（桌面端/主分支共用）
 * - console: web-demo 架构控制台文案
 */
import enUSCore from '@/locales/lang/core/en-US'
import enUSConsole from '@/locales/lang/console/en-US'
import { mergeLocale, type LocaleRecord } from '@/locales/lang/utils/mergeLocale'

const enUS = mergeLocale(enUSCore, enUSConsole)

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

if (isLocaleRecord(enUS.login)) {
  for (const key of unusedLoginKeys) {
    Reflect.deleteProperty(enUS.login, key)
  }
}

export { enUS }
export default enUS
