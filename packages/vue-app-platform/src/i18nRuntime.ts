import type { LocaleDirection, LocaleRegistration } from '@ccd/contracts'
import type { App } from 'vue'
import { createI18n } from 'vue-i18n'

export type { LocaleDirection }
export type LocaleDescriptor<TLocale extends string = string> = LocaleRegistration<TLocale>

type CreateI18nConfig = NonNullable<Parameters<typeof createI18n>[0]>

export interface CreateI18nRuntimeOptions {
  locale: string
  fallbackLocale: string
  messages: CreateI18nConfig['messages']
  datetimeFormats?: CreateI18nConfig['datetimeFormats']
  globalInjection?: boolean
  development?: boolean
}

export interface AppI18nGlobalRuntime {
  locale: { value: string }
  t(key: string, params?: Record<string, unknown>): string
  d(value: Date | number, format?: string): string
  n(value: number, format?: string): string
}

export type AppI18nRuntime = ReturnType<typeof createI18n> & {
  global: AppI18nGlobalRuntime
}

export function createI18nRuntime(options: CreateI18nRuntimeOptions): AppI18nRuntime {
  return createI18n({
    legacy: false,
    locale: options.locale,
    fallbackLocale: options.fallbackLocale,
    messages: options.messages,
    datetimeFormats: options.datetimeFormats,
    globalInjection: options.globalInjection ?? true,
    missingWarn: options.development ?? false,
    fallbackWarn: options.development ?? false,
  }) as AppI18nRuntime
}

export function installI18nRuntime(app: App, i18n: AppI18nRuntime): void {
  app.use(i18n)
}

export function resolveSupportedLocale<TLocale extends string>(
  locale: string,
  supportedLocales: readonly LocaleDescriptor<TLocale>[],
  fallbackLocale: TLocale
): TLocale {
  return supportedLocales.some(item => item.key === locale) ? (locale as TLocale) : fallbackLocale
}

export function resolveLocaleDescriptor<TLocale extends string>(
  locale: TLocale,
  supportedLocales: readonly LocaleDescriptor<TLocale>[]
): LocaleDescriptor<TLocale> | undefined {
  return supportedLocales.find(item => item.key === locale)
}

export function getI18nRuntimeLocale<TLocale extends string>(
  i18n: AppI18nRuntime,
  supportedLocales: readonly LocaleDescriptor<TLocale>[],
  fallbackLocale: TLocale
): TLocale {
  return resolveSupportedLocale(String(i18n.global.locale.value), supportedLocales, fallbackLocale)
}

export function setI18nRuntimeLocale<TLocale extends string>(
  i18n: AppI18nRuntime,
  locale: TLocale
): void {
  i18n.global.locale.value = locale
}

export interface ApplyLocaleDocumentAttributesOptions {
  document: Document
}

export function applyLocaleDocumentAttributes<TLocale extends string>(
  locale: TLocale,
  supportedLocales: readonly LocaleDescriptor<TLocale>[],
  options: ApplyLocaleDocumentAttributesOptions
): void {
  const activeDocument = options.document

  activeDocument.documentElement.lang = locale
  activeDocument.documentElement.dir =
    resolveLocaleDescriptor(locale, supportedLocales)?.direction ?? 'ltr'
}
