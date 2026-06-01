import type { PrimeVueConfiguration } from '@primevue/core/config'
import type { App } from 'vue'
import PrimeVue from 'primevue/config'
import { createCustomPreset, type PrimeVueSizeSource } from './theme/primevuePreset'
import {
  formControlsPt,
  OVERLAY_GLASS_CLASS,
  OVERLAY_GLASS_COMPACT_CLASS,
} from './theme/ptPresets/formControlsPt'
import { menuPt } from './theme/ptPresets/menuPt'
import { buttonPt } from './theme/ptPresets/buttonPt'
import {
  DEFAULT_PRIMEVUE_TOAST_LIFE_MS,
  PrimeVueGlobalConfirmPopup,
  PrimeVueGlobalDynamicDialog,
  PrimeVueGlobalToast,
  PRIMEVUE_TOAST_GROUP_BY_POSITION,
  applyPrimeVueLocale,
  clearPrimeVueGlobalMessageApis,
  clearPrimeVueToastGroups,
  createPrimeVueGlobalMessageApis,
  createPrimeVueMessageApi,
  createPrimeVueToastApi,
  installPrimeVueServices,
  mountPrimeVueGlobalMessageApis,
  resolvePrimeVueLocale,
  usePrimeVueConfirmService,
  usePrimeVueRuntimeConfig,
  usePrimeVueToastService,
  type PrimeVueConfirmOptions,
  type PrimeVueConfirmService,
  type PrimeVueGlobalMessageApis,
  type PrimeVueGlobalMessageTarget,
  type PrimeVueMessageApi,
  type PrimeVueRuntimeConfig,
  type PrimeVueServiceInstallOptions,
  type PrimeVueToastApi,
  type PrimeVueToastMessageOptions,
  type PrimeVueToastPosition,
  type PrimeVueToastServiceLike,
  type PrimeVueToastSeverity,
} from './services.js'
import { primeVueTooltipDirective } from './directives.js'
import { PRIMEVUE_TOAST_FALLBACK_ICON, PRIMEVUE_TOAST_SEVERITY_ICONS } from './toastIcons.js'

export type { PrimeVueMenuItem, PrimeVueTieredMenuInstance } from './menuTypes.js'
export type { PrimeVuePopoverInstance } from './overlayTypes.js'
export {
  DEFAULT_PRIMEVUE_TOAST_LIFE_MS,
  PrimeVueGlobalConfirmPopup,
  PrimeVueGlobalDynamicDialog,
  PrimeVueGlobalToast,
  PRIMEVUE_TOAST_FALLBACK_ICON,
  PRIMEVUE_TOAST_GROUP_BY_POSITION,
  PRIMEVUE_TOAST_SEVERITY_ICONS,
  applyPrimeVueLocale,
  clearPrimeVueGlobalMessageApis,
  clearPrimeVueToastGroups,
  createCustomPreset,
  createPrimeVueGlobalMessageApis,
  createPrimeVueMessageApi,
  createPrimeVueToastApi,
  formControlsPt,
  installPrimeVueServices,
  menuPt,
  mountPrimeVueGlobalMessageApis,
  primeVueTooltipDirective,
  resolvePrimeVueLocale,
  usePrimeVueConfirmService,
  usePrimeVueRuntimeConfig,
  usePrimeVueToastService,
}
export type { PrimeVueSizeSource }
export type {
  PrimeVueConfirmOptions,
  PrimeVueConfirmService,
  PrimeVueGlobalMessageApis,
  PrimeVueGlobalMessageTarget,
  PrimeVueMessageApi,
  PrimeVueRuntimeConfig,
  PrimeVueServiceInstallOptions,
  PrimeVueToastApi,
  PrimeVueToastMessageOptions,
  PrimeVueToastPosition,
  PrimeVueToastServiceLike,
  PrimeVueToastSeverity,
}

const OVERLAY_GLASS_SHELL_CLASS = 'glass-shell transform-gpu will-change-transform'
const BG_TRANSPARENT = 'bg-transparent'
const BG_TRANSPARENT_IMPORTANT = '!bg-transparent'
const TEXT_FOREGROUND = 'text-foreground'

export const tabsPt = {
  tabs: {
    root: { class: OVERLAY_GLASS_SHELL_CLASS },
  },
  tablist: {
    root: { class: BG_TRANSPARENT_IMPORTANT },
    tabList: { class: BG_TRANSPARENT_IMPORTANT },
    content: { class: BG_TRANSPARENT_IMPORTANT },
  },
  tabpanels: {
    root: { class: BG_TRANSPARENT_IMPORTANT },
  },
  tabpanel: {
    root: { class: BG_TRANSPARENT_IMPORTANT },
    content: { class: BG_TRANSPARENT_IMPORTANT },
  },
  tab: {
    root: { class: BG_TRANSPARENT_IMPORTANT },
  },
} as const

export const overlayPt = {
  drawer: {
    root: { class: OVERLAY_GLASS_CLASS },
    header: { class: BG_TRANSPARENT },
    title: { class: BG_TRANSPARENT },
    content: { class: BG_TRANSPARENT },
    footer: { class: BG_TRANSPARENT },
    mask: { class: BG_TRANSPARENT_IMPORTANT },
  },
  popover: {
    root: { class: OVERLAY_GLASS_COMPACT_CLASS },
    content: { class: BG_TRANSPARENT },
  },
  overlaypanel: {
    root: { class: OVERLAY_GLASS_COMPACT_CLASS },
    content: { class: BG_TRANSPARENT },
  },
  confirmpopup: {
    root: { class: OVERLAY_GLASS_COMPACT_CLASS },
    content: { class: BG_TRANSPARENT },
    message: { class: TEXT_FOREGROUND },
    footer: { class: BG_TRANSPARENT },
  },
} as const

export const splitterPt = {
  splitter: {
    root: { class: `${OVERLAY_GLASS_SHELL_CLASS} border-border overflow-hidden` },
    handle: { class: BG_TRANSPARENT },
  },
} as const

export const primeVueAdapterPt = {
  ...buttonPt,
  ...menuPt,
  ...formControlsPt,
  ...overlayPt,
  ...tabsPt,
  ...splitterPt,
} as const

export interface CreatePrimeVueAdapterConfigOptions {
  sizeSource: PrimeVueSizeSource
  locale?: PrimeVueConfiguration['locale']
}

export interface PrimeVueRuntimeInstallOptions extends CreatePrimeVueAdapterConfigOptions {
  services?: PrimeVueServiceInstallOptions | false
}

export function createPrimeVueAdapterConfig(
  options: CreatePrimeVueAdapterConfigOptions
): PrimeVueConfiguration {
  return {
    theme: {
      preset: createCustomPreset(options.sizeSource),
      options: {
        prefix: 'p',
        darkModeSelector: '.dark',
      },
    },
    pt: primeVueAdapterPt,
    ptOptions: {
      mergeSections: true,
      mergeProps: true,
    },
    ripple: true,
    locale: options.locale,
  }
}

export function installPrimeVueRuntime(app: App, options: PrimeVueRuntimeInstallOptions): void {
  app.use(PrimeVue, createPrimeVueAdapterConfig(options))

  if (options.services !== false) {
    installPrimeVueServices(app, options.services)
  }
}
