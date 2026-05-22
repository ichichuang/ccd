import type { PrimeVueConfiguration } from '@primevue/core/config'
import { createCustomPreset, type PrimeVueSizeSource } from './theme/primevuePreset'
import {
  formControlsPt,
  OVERLAY_GLASS_CLASS,
  OVERLAY_GLASS_COMPACT_CLASS,
} from './theme/ptPresets/formControlsPt'
import { menuPt } from './theme/ptPresets/menuPt'
import { buttonPt } from './theme/ptPresets/buttonPt'

export type { PrimeVueSizeSource }
export { createCustomPreset, formControlsPt, menuPt }

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
