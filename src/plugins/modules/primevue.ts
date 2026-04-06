import type { App } from 'vue'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'
import DialogService from 'primevue/dialogservice'
import Tooltip from 'primevue/tooltip'
import { primevueZhCN } from '@/locales/primevue-zh-CN'
import { PRIMEVUE_LOCALE_MAP } from '@/locales/primevue-locales'
import type { SupportedLocale } from '@/locales'
import store from '@/stores'
import { useLocaleStore } from '@/stores/modules/locale'
import { useSizeStore } from '@/stores/modules/size'
import { createCustomPreset } from '@/utils/theme/primevuePreset'
import { formControlsPt } from '@/utils/theme/ptPresets/formControlsPt'
import { menuPt } from '@/utils/theme/ptPresets/menuPt'

const OVERLAY_GLASS_SHELL_CLASS = 'glass-shell'
const BG_TRANSPARENT = 'bg-transparent'
// Tabs 内部的默认样式使用 `background: ...`（而非 background-color）
// 因此仅用 bg-transparent 可能会被 PrimeVue 的 background 覆盖。
// 这里用重要声明确保覆盖 PrimeVue 的 background shorthand。
const BG_TRANSPARENT_IMPORTANT = '!bg-transparent'
const TEXT_FOREGROUND = 'text-foreground'

/**
 * Tabs glass 化：
 * - Tabs 外层用 `glass-shell` 提供玻璃背景与边框
 * - tablist / tabpanel 用 `bg-transparent` 覆盖 PrimeVue 默认不透明 background
 * 这样能避免“容器玻璃但内容面板仍盖住”的问题
 */
const tabsPt = {
  tabs: {
    root: { class: `${OVERLAY_GLASS_SHELL_CLASS} rounded-none!` },
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
    // `content` 在 v4 里更偏向 TabView 的兼容能力，这里同样透传背景透明
    content: { class: BG_TRANSPARENT_IMPORTANT },
  },
  tab: {
    root: { class: BG_TRANSPARENT_IMPORTANT },
  },
} as const

/**
 * App-level PT defaults for PrimeVue overlay components.
 * Goal: glassy mask + entity-ish panel surface.
 * Note: Dialog surfaces are primarily styled by PrimeDialog wrapper.
 */
const overlayPt = {
  drawer: {
    root: { class: OVERLAY_GLASS_SHELL_CLASS },
    header: { class: BG_TRANSPARENT },
    title: { class: BG_TRANSPARENT },
    content: { class: BG_TRANSPARENT },
    footer: { class: BG_TRANSPARENT },
    mask: { class: BG_TRANSPARENT_IMPORTANT },
  },
  popover: {
    root: { class: OVERLAY_GLASS_SHELL_CLASS },
    content: { class: BG_TRANSPARENT },
  },
  overlaypanel: {
    root: { class: OVERLAY_GLASS_SHELL_CLASS },
    content: { class: BG_TRANSPARENT },
  },
  confirmpopup: {
    root: { class: OVERLAY_GLASS_SHELL_CLASS },
    content: { class: BG_TRANSPARENT },
    message: { class: TEXT_FOREGROUND },
    footer: { class: BG_TRANSPARENT },
  },
} as const

const splitterPt = {
  splitter: {
    root: { class: 'glass-shell !rounded-md border border-border overflow-hidden' },
    handle: { class: 'bg-transparent' },
  },
} as const

/**
 * Register PrimeVue v4 (Styled Mode)
 * Uses @primeuix/themes with a custom preset adapted to this template's design system.
 * Locale 按当前系统语言设置，运行时切换由 AppPrimeVueGlobals.vue 的 watch 同步。
 */
export function setupPrimeVue(app: App) {
  const sizeStore = useSizeStore()
  const localeStore = useLocaleStore(store)
  const initialLocale: SupportedLocale = localeStore.locale
  const initialPrimeLocale = PRIMEVUE_LOCALE_MAP[initialLocale] ?? primevueZhCN

  // Generate the dynamic preset adapted to our design & size system
  const dynamicPreset = createCustomPreset(sizeStore)

  // ⚠️ HMR 限制：PT 对象在 app.use() 时被静态捕获，修改 ptPresets 文件后需全页面刷新。
  // 这是 PrimeVue v4 的框架限制，非项目缺陷。PT 属于设计系统基础设施，变更频率低。
  app.use(PrimeVue, {
    theme: {
      preset: dynamicPreset,
      options: {
        prefix: 'p',
        darkModeSelector: '.dark', // Sync with our Tailwind/UnoCSS dark mode
        // cssLayer: {
        //   name: 'primevue',
        //   order: 'tailwind-base, primevue, tailwind-utilities',
        // },
      },
    },
    pt: { ...menuPt, ...formControlsPt, ...overlayPt, ...tabsPt, ...splitterPt },
    ptOptions: {
      mergeSections: true,
      mergeProps: true,
    },
    ripple: true,
    locale: initialPrimeLocale,
  })

  app.use(ToastService)
  app.use(ConfirmationService)
  app.use(DialogService)
  app.directive('tooltip', Tooltip)
}
