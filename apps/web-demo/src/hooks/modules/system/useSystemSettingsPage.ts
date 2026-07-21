import {
  SIZE_PRESETS,
  THEME_PRESETS,
  TRANSITION_DURATION_OPTIONS,
  getPresetPrimaryColor,
  type CompleteThemePreset,
  type SizeMode,
  type ThemeMode,
  type ThemeTransitionDuration,
  type ThemeTransitionMode,
} from '@ccd/design-tokens'
import type { LayoutModuleVisibilityKey } from '@ccd/vue-app-platform'
import type { SupportedLocale } from '@/locales'
import type { ComputedRef } from 'vue'
import { useI18n } from 'vue-i18n'

type SettingOption<TValue extends string | number> = {
  value: TValue
  label: string
}

type PreviewItem = {
  label: string
  value: string
}

type TransitionModeOption = SettingOption<ThemeTransitionMode> & {
  icon: string
}

interface SizeStoreSettingsBridge {
  sizeName: SizeMode
  setSize: (name: SizeMode) => void
}

interface LayoutStoreSettingsBridge {
  preferredMode: AdminLayoutMode
  sidebarUniqueOpened: boolean
  visibilitySettings: Record<AdminLayoutMode, LayoutVisibilitySetting>
  markUserAdjusted: () => void
  setPreferredMode: (mode: AdminLayoutMode) => void
  setModuleVisible: (key: LayoutModuleVisibilityKey, visible: boolean) => void
  updateSetting: (key: 'sidebarUniqueOpened', value: boolean) => void
}

interface UseSystemSettingsPageReturn {
  currentVisibilitySettings: ComputedRef<LayoutVisibilitySetting>
  getThemePresetColor: (name: string) => string
  isLayoutModuleSwitchDisabled: (key: LayoutModuleVisibilityKey) => boolean
  layoutModeOptions: ComputedRef<SettingOption<AdminLayoutMode>[]>
  layoutStore: LayoutStoreSettingsBridge
  locale: ComputedRef<SupportedLocale>
  localeOptions: ComputedRef<SettingOption<SupportedLocale>[]>
  mode: ComputedRef<ThemeMode>
  onLayoutModeChange: (value: unknown) => void
  onLocaleChange: (value: unknown) => void
  onModuleToggle: (key: LayoutModuleVisibilityKey, value: unknown) => void
  onSizeChange: (value: unknown) => void
  onTransitionDurationChange: (value: unknown) => void
  onTransitionModeChange: (value: unknown) => void
  onThemeModeChange: (value: unknown) => void
  onThemePresetChange: (name: string) => void
  previewItems: ComputedRef<PreviewItem[]>
  selectedSizeDescription: ComputedRef<string>
  selectedThemeName: ComputedRef<string>
  selectedTransitionEffectIcon: ComputedRef<string>
  selectedTransitionEffectLabel: ComputedRef<string>
  sizeOptions: ComputedRef<SettingOption<SizeMode>[]>
  sizeStore: SizeStoreSettingsBridge
  transitionDuration: ComputedRef<ThemeTransitionDuration>
  transitionDurationOptions: ComputedRef<SettingOption<ThemeTransitionDuration>[]>
  transitionMode: ComputedRef<ThemeTransitionMode>
  transitionModeOptions: ComputedRef<TransitionModeOption[]>
  themeModeOptions: ComputedRef<SettingOption<ThemeMode>[]>
  themePresets: readonly CompleteThemePreset[]
  visibleLayoutModuleSwitches: ComputedRef<
    Array<{ key: LayoutModuleVisibilityKey; labelKey: string }>
  >
}

const sizeOptionKeys: Record<SizeMode, string> = {
  compact: 'settings.sizeCompact',
  comfortable: 'settings.sizeComfortable',
  loose: 'settings.sizeLoose',
}

const layoutModeLabelKeys: Record<AdminLayoutMode, string> = {
  vertical: 'settings.layoutVertical',
  horizontal: 'settings.layoutHorizontal',
  mix: 'settings.layoutMix',
}

const transitionModeMeta: Record<ThemeTransitionMode, { labelKey: string; icon: string }> = {
  curtain: { labelKey: 'settings.transitionCurtain', icon: 'i-lucide-panel-left' },
  circle: { labelKey: 'settings.transitionCircle', icon: 'i-lucide-circle-dot' },
  diamond: { labelKey: 'settings.transitionDiamond', icon: 'i-lucide-diamond' },
  fade: { labelKey: 'settings.transitionFade', icon: 'i-lucide-sparkles' },
  implosion: { labelKey: 'settings.transitionImplosion', icon: 'i-lucide-minimize-2' },
  glitch: { labelKey: 'settings.transitionGlitch', icon: 'i-lucide-sun-moon' },
}

const transitionModeValues: ThemeTransitionMode[] = [
  'curtain',
  'circle',
  'diamond',
  'fade',
  'implosion',
  'glitch',
]

const layoutModuleSwitches: Array<{ key: LayoutModuleVisibilityKey; labelKey: string }> = [
  { key: 'showHeader', labelKey: 'settings.showHeader' },
  { key: 'showMenu', labelKey: 'settings.showMenu' },
  { key: 'showLogo', labelKey: 'settings.showLogo' },
  { key: 'showSidebar', labelKey: 'settings.showSidebar' },
  { key: 'showBreadcrumb', labelKey: 'settings.showBreadcrumb' },
  { key: 'showBreadcrumbIcon', labelKey: 'settings.showBreadcrumbIcon' },
  { key: 'showTabs', labelKey: 'settings.showTabs' },
  { key: 'showFooter', labelKey: 'settings.showFooter' },
]

function isThemeMode(value: unknown): value is ThemeMode {
  return value === 'light' || value === 'dark' || value === 'auto'
}

function isSizeMode(value: unknown): value is SizeMode {
  return value === 'compact' || value === 'comfortable' || value === 'loose'
}

function isThemeTransitionMode(value: unknown): value is ThemeTransitionMode {
  return (
    value === 'curtain' ||
    value === 'circle' ||
    value === 'diamond' ||
    value === 'fade' ||
    value === 'implosion' ||
    value === 'glitch'
  )
}

function isThemeTransitionDuration(value: unknown): value is ThemeTransitionDuration {
  return value === 400 || value === 600 || value === 800 || value === 1200 || value === 1600
}

function isLayoutMode(value: unknown): value is AdminLayoutMode {
  return value === 'vertical' || value === 'horizontal' || value === 'mix'
}

export function useSystemSettingsPage(): UseSystemSettingsPageReturn {
  const { t } = useI18n()
  const { mode, setThemeWithAnimation } = useThemeSwitch()
  const themeStore = useThemeStore()
  const sizeStore = useSizeStore()
  const layoutStore = useLayoutStore()
  const runtime = useLayoutRuntime()
  const { locale, switchLocale, supportedLocales } = useLocale()

  const themeModeOptions = computed<SettingOption<ThemeMode>[]>(() => [
    { value: 'light', label: t('settings.themeModeLight') },
    { value: 'dark', label: t('settings.themeModeDark') },
    { value: 'auto', label: t('settings.themeModeAuto') },
  ])

  const sizeOptions = computed<SettingOption<SizeMode>[]>(() =>
    SIZE_PRESETS.map(preset => ({
      value: preset.name,
      label: t(sizeOptionKeys[preset.name]),
    }))
  )

  const localeOptions = computed<SettingOption<SupportedLocale>[]>(() =>
    supportedLocales.map(item => ({
      value: item.key,
      label: `${item.flag} ${item.name}`,
    }))
  )

  const layoutModeOptions = computed<SettingOption<AdminLayoutMode>[]>(() => [
    { value: 'vertical', label: t('settings.layoutVertical') },
    { value: 'horizontal', label: t('settings.layoutHorizontal') },
    { value: 'mix', label: t('settings.layoutMix') },
  ])

  const transitionMode = computed(() => themeStore.transitionMode)
  const transitionDuration = computed(() => themeStore.transitionDuration)

  const transitionModeOptions = computed<TransitionModeOption[]>(() =>
    transitionModeValues.map(value => ({
      value,
      label: t(transitionModeMeta[value].labelKey),
      icon: transitionModeMeta[value].icon,
    }))
  )

  const transitionDurationOptions = computed<SettingOption<ThemeTransitionDuration>[]>(() =>
    TRANSITION_DURATION_OPTIONS.map(option => ({
      value: option.value,
      label: t(option.labelKey),
    }))
  )

  const currentVisibilitySettings = computed(
    () => layoutStore.visibilitySettings[layoutStore.preferredMode]
  )

  const allowedLayoutModuleKeys = computed<LayoutModuleVisibilityKey[]>(() => {
    const preferredMode = layoutStore.preferredMode
    if (preferredMode === 'vertical') {
      return [
        'showHeader',
        'showLogo',
        'showSidebar',
        'showBreadcrumb',
        'showBreadcrumbIcon',
        'showTabs',
        'showFooter',
      ]
    }
    if (preferredMode === 'horizontal') {
      return [
        'showHeader',
        'showLogo',
        'showMenu',
        'showBreadcrumb',
        'showBreadcrumbIcon',
        'showTabs',
        'showFooter',
      ]
    }
    return [
      'showHeader',
      'showLogo',
      'showMenu',
      'showSidebar',
      'showBreadcrumb',
      'showBreadcrumbIcon',
      'showTabs',
      'showFooter',
    ]
  })

  const visibleLayoutModuleSwitches = computed(() =>
    layoutModuleSwitches.filter(item => allowedLayoutModuleKeys.value.includes(item.key))
  )

  const previewItems = computed<PreviewItem[]>(() => [
    {
      label: t('settingsPage.preview.breakpoint'),
      value: runtime.breakpoint.value,
    },
    {
      label: t('settingsPage.preview.deviceType'),
      value: runtime.deviceType.value,
    },
    {
      label: t('settingsPage.preview.effectiveMode'),
      value: t(layoutModeLabelKeys[runtime.effectiveMode.value]),
    },
    {
      label: t('settingsPage.preview.sizePreset'),
      value: t(sizeOptionKeys[sizeStore.sizeName]),
    },
  ])

  const selectedThemeName = computed(() => themeStore.themeName)
  const selectedSizeDescription = computed(() =>
    t(`settingsPage.sizeDescriptions.${sizeStore.sizeName}`)
  )
  const selectedTransitionEffectLabel = computed(() =>
    t(transitionModeMeta[themeStore.transitionMode].labelKey)
  )
  const selectedTransitionEffectIcon = computed(
    () => transitionModeMeta[themeStore.transitionMode].icon
  )

  function isLayoutModuleSwitchDisabled(key: LayoutModuleVisibilityKey): boolean {
    if (!currentVisibilitySettings.value.showHeader && (key === 'showMenu' || key === 'showLogo')) {
      return true
    }
    if (!currentVisibilitySettings.value.showBreadcrumb && key === 'showBreadcrumbIcon') {
      return true
    }
    return false
  }

  function onThemeModeChange(value: unknown): void {
    if (isThemeMode(value)) void setThemeWithAnimation(value)
  }

  function onSizeChange(value: unknown): void {
    if (isSizeMode(value)) sizeStore.setSize(value)
  }

  function onTransitionModeChange(value: unknown): void {
    if (isThemeTransitionMode(value)) themeStore.setTransitionMode(value)
  }

  function onTransitionDurationChange(value: unknown): void {
    if (isThemeTransitionDuration(value)) themeStore.setTransitionDuration(value)
  }

  function onLocaleChange(value: unknown): void {
    if (typeof value !== 'string') return
    const targetLocale = supportedLocales.find(item => item.key === value)?.key
    if (targetLocale) void switchLocale(targetLocale)
  }

  function onLayoutModeChange(value: unknown): void {
    if (isLayoutMode(value)) layoutStore.setPreferredMode(value)
  }

  function onThemePresetChange(name: string): void {
    themeStore.setTheme(name)
  }

  function onModuleToggle(key: LayoutModuleVisibilityKey, value: unknown): void {
    if (typeof value === 'boolean') layoutStore.setModuleVisible(key, value)
  }

  function getThemePresetColor(name: string): string {
    const preset = THEME_PRESETS.find(item => item.name === name) ?? THEME_PRESETS[0]
    return getPresetPrimaryColor(preset, themeStore.isDark)
  }

  return {
    currentVisibilitySettings,
    getThemePresetColor,
    isLayoutModuleSwitchDisabled,
    layoutModeOptions,
    layoutStore,
    locale,
    localeOptions,
    mode,
    onLayoutModeChange,
    onLocaleChange,
    onModuleToggle,
    onSizeChange,
    onTransitionDurationChange,
    onTransitionModeChange,
    onThemeModeChange,
    onThemePresetChange,
    previewItems,
    selectedSizeDescription,
    selectedThemeName,
    selectedTransitionEffectIcon,
    selectedTransitionEffectLabel,
    sizeOptions,
    sizeStore,
    transitionDuration,
    transitionDurationOptions,
    transitionMode,
    transitionModeOptions,
    themeModeOptions,
    themePresets: THEME_PRESETS,
    visibleLayoutModuleSwitches,
  }
}
