export type LocaleDirection = 'ltr' | 'rtl'

export interface LocaleRegistration<TLocale extends string = string> {
  key: TLocale
  name: string
  flag: string
  direction: LocaleDirection
}

export interface LocaleFallbackPolicy<TLocale extends string = string> {
  defaultLocale: TLocale
  fallbackLocale: TLocale
}

export type LocaleMessageTree = Readonly<Record<string, unknown>>

export type LocaleMessageRegistry<
  TLocale extends string = string,
  TMessages = LocaleMessageTree,
> = Readonly<Record<TLocale, TMessages>>

export type LocaleMessageLoader<TLocale extends string = string, TMessages = LocaleMessageTree> = (
  locale: TLocale
) => TMessages | Promise<TMessages>

export type PrimeVueLocaleMap<
  TLocale extends string = string,
  TPrimeVueLocale = unknown,
> = Readonly<Record<TLocale, TPrimeVueLocale>>

export interface I18nRegistrationContract<
  TLocale extends string = string,
  TMessages = LocaleMessageTree,
  TPrimeVueLocale = unknown,
> extends LocaleFallbackPolicy<TLocale> {
  supportedLocales: readonly LocaleRegistration<TLocale>[]
  messages?: LocaleMessageRegistry<TLocale, TMessages>
  loadMessages?: LocaleMessageLoader<TLocale, TMessages>
  primeVueLocales?: PrimeVueLocaleMap<TLocale, TPrimeVueLocale>
}
