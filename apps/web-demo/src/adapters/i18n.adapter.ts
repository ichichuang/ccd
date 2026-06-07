import { applyLocaleDocumentAttributes, type LocaleDescriptor } from '@ccd/vue-app-platform'

export function applyAppLocaleDocumentAttributes<TLocale extends string>(
  locale: TLocale,
  supportedLocales: readonly LocaleDescriptor<TLocale>[]
): void {
  applyLocaleDocumentAttributes(locale, supportedLocales, { document })
}
