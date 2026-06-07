// @vitest-environment jsdom

import { describe, expect, it, vi } from 'vitest'
import type { App } from 'vue'
import {
  applyLocaleDocumentAttributes,
  createI18nRuntime,
  getI18nRuntimeLocale,
  installI18nRuntime,
  resolveLocaleDescriptor,
  resolveSupportedLocale,
  setI18nRuntimeLocale,
  type LocaleDescriptor,
} from './i18nRuntime'

type TestLocale = 'zh-CN' | 'en-US' | 'ar-SA'

const supportedLocales = [
  { key: 'zh-CN', name: '简体中文', flag: 'CN', direction: 'ltr' },
  { key: 'en-US', name: 'English', flag: 'US', direction: 'ltr' },
  { key: 'ar-SA', name: 'Arabic', flag: 'SA', direction: 'rtl' },
] as const satisfies readonly LocaleDescriptor<TestLocale>[]

const messages = Object.fromEntries([
  ['zh-CN', { common: { ok: '确认' } }],
  ['en-US', { common: { ok: 'OK' } }],
  ['ar-SA', { common: { ok: 'OK' } }],
]) as Record<TestLocale, { common: { ok: string } }>

describe('i18n runtime helpers', () => {
  it('creates and installs a Vue I18n runtime', () => {
    const i18n = createI18nRuntime({
      locale: 'zh-CN',
      fallbackLocale: 'zh-CN',
      messages,
      development: true,
    })
    const app = { use: vi.fn() } as unknown as App

    installI18nRuntime(app, i18n)

    expect(app.use).toHaveBeenCalledWith(i18n)
    expect(i18n.global.t('common.ok')).toBe('确认')
  })

  it('resolves and mutates supported locale state with fallback', () => {
    const i18n = createI18nRuntime({
      locale: 'zh-CN',
      fallbackLocale: 'zh-CN',
      messages,
    })

    expect(getI18nRuntimeLocale(i18n, supportedLocales, 'zh-CN')).toBe('zh-CN')
    setI18nRuntimeLocale(i18n, 'en-US')
    expect(getI18nRuntimeLocale(i18n, supportedLocales, 'zh-CN')).toBe('en-US')

    setI18nRuntimeLocale(i18n, 'fr-FR' as TestLocale)
    expect(getI18nRuntimeLocale(i18n, supportedLocales, 'zh-CN')).toBe('zh-CN')
    expect(resolveSupportedLocale('fr-FR', supportedLocales, 'en-US')).toBe('en-US')
  })

  it('applies document language and direction attributes', () => {
    applyLocaleDocumentAttributes('ar-SA', supportedLocales, { document })

    expect(document.documentElement.lang).toBe('ar-SA')
    expect(document.documentElement.dir).toBe('rtl')
    expect(resolveLocaleDescriptor('en-US', supportedLocales)?.direction).toBe('ltr')
  })
})
