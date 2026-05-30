import type { App } from 'vue'
import ConfirmationService from 'primevue/confirmationservice'
import DialogService from 'primevue/dialogservice'
import ToastService from 'primevue/toastservice'
import Tooltip from 'primevue/tooltip'

export interface PrimeVueServiceInstallOptions {
  toast?: boolean
  confirmation?: boolean
  dialog?: boolean
  tooltip?: boolean
}

export type PrimeVueToastPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'

export type PrimeVueToastSeverity = 'success' | 'info' | 'warn' | 'error' | 'secondary' | 'contrast'

export interface PrimeVueToastMessageOptions {
  severity?: PrimeVueToastSeverity | 'danger'
  summary?: string
  detail?: string
  life?: number
  group?: string
  closable?: boolean
}

export interface PrimeVueToastServiceLike {
  add(options: PrimeVueToastMessageOptions): void
  remove(message: object): void
  removeGroup(group: string): void
  removeAllGroups?: () => void
}

export interface PrimeVueToastApi {
  add(options: PrimeVueToastMessageOptions): void
  dangerIn(position: PrimeVueToastPosition, summary: string, detail?: string): void
  successIn(position: PrimeVueToastPosition, summary: string, detail?: string): void
  infoIn(position: PrimeVueToastPosition, summary: string, detail?: string): void
  warnIn(position: PrimeVueToastPosition, summary: string, detail?: string): void
  secondaryIn(position: PrimeVueToastPosition, summary: string, detail?: string): void
  contrastIn(position: PrimeVueToastPosition, summary: string, detail?: string): void
  remove(message: object): void
  removeGroup(group: string): void
  clear(): void
}

export interface PrimeVueMessageApi {
  success(message: string, title?: string): void
  danger(message: string, title?: string): void
  info(message: string, title?: string): void
  warn(message: string, title?: string): void
}

export const DEFAULT_PRIMEVUE_TOAST_LIFE_MS = 3000

export const PRIMEVUE_TOAST_GROUP_BY_POSITION: Record<PrimeVueToastPosition, string> = {
  'top-left': 'tl',
  'top-center': 'tc',
  'top-right': 'tr',
  'bottom-left': 'bl',
  'bottom-center': 'bc',
  'bottom-right': 'br',
}

export function installPrimeVueServices(
  app: App,
  options: PrimeVueServiceInstallOptions = {}
): void {
  const { toast = true, confirmation = true, dialog = true, tooltip = true } = options

  if (toast) {
    app.use(ToastService)
  }

  if (confirmation) {
    app.use(ConfirmationService)
  }

  if (dialog) {
    app.use(DialogService)
  }

  if (tooltip) {
    app.directive('tooltip', Tooltip)
  }
}

function normalizeToastSeverity(
  severity: PrimeVueToastMessageOptions['severity']
): PrimeVueToastSeverity | undefined {
  return severity === 'danger' ? 'error' : severity
}

function severityIn(
  toast: PrimeVueToastServiceLike,
  severity: PrimeVueToastSeverity,
  position: PrimeVueToastPosition,
  summary: string,
  detail?: string
): void {
  toast.add({
    severity,
    summary,
    detail: detail ?? '',
    life: DEFAULT_PRIMEVUE_TOAST_LIFE_MS,
    group: PRIMEVUE_TOAST_GROUP_BY_POSITION[position],
  })
}

export function createPrimeVueToastApi(toast: PrimeVueToastServiceLike): PrimeVueToastApi {
  return {
    add(options) {
      toast.add({
        ...options,
        severity: normalizeToastSeverity(options.severity),
      })
    },
    dangerIn: (position, summary, detail) => severityIn(toast, 'error', position, summary, detail),
    successIn: (position, summary, detail) =>
      severityIn(toast, 'success', position, summary, detail),
    infoIn: (position, summary, detail) => severityIn(toast, 'info', position, summary, detail),
    warnIn: (position, summary, detail) => severityIn(toast, 'warn', position, summary, detail),
    secondaryIn: (position, summary, detail) =>
      severityIn(toast, 'secondary', position, summary, detail),
    contrastIn: (position, summary, detail) =>
      severityIn(toast, 'contrast', position, summary, detail),
    remove: toast.remove.bind(toast),
    removeGroup: toast.removeGroup.bind(toast),
    clear: () => {
      toast.removeAllGroups?.()
    },
  }
}

export function createPrimeVueMessageApi(toast: PrimeVueToastServiceLike): PrimeVueMessageApi {
  const show = (
    severity: Extract<PrimeVueToastSeverity, 'success' | 'info' | 'warn' | 'error'>,
    message: string,
    title?: string
  ) => {
    toast.add({
      severity,
      summary: title ?? message,
      detail: title ? message : undefined,
      life: DEFAULT_PRIMEVUE_TOAST_LIFE_MS,
      group: PRIMEVUE_TOAST_GROUP_BY_POSITION['top-center'],
      closable: false,
    })
  }

  return {
    success: (message, title) => show('success', message, title),
    danger: (message, title) => show('error', message, title),
    info: (message, title) => show('info', message, title),
    warn: (message, title) => show('warn', message, title),
  }
}

export function resolvePrimeVueLocale<TLocaleConfig>(
  locale: string,
  localeMap: Readonly<Record<string, TLocaleConfig>>,
  fallbackLocale: string
): TLocaleConfig {
  const fallback = localeMap[fallbackLocale]
  if (fallback === undefined) {
    throw new Error(`Missing PrimeVue fallback locale: ${fallbackLocale}`)
  }
  return localeMap[locale] ?? fallback
}

export function applyPrimeVueLocale<TLocaleConfig>(
  primevue: { config: { locale?: TLocaleConfig } },
  locale: string,
  localeMap: Readonly<Record<string, TLocaleConfig>>,
  fallbackLocale: string
): void {
  primevue.config.locale = resolvePrimeVueLocale(locale, localeMap, fallbackLocale)
}
