import {
  DEFAULT_SIZE_NAME,
  DEFAULT_THEME_NAME,
  DIALOG_SETTINGS_WIDTH_PX,
  FONT_SCALE_RATIOS,
  RADIUS_SCALE_RATIOS,
  SIZE_PRESETS,
  SIZE_SCALE_KEYS,
  SPACING_SCALE_RATIOS,
  THEME_PRESETS,
  TRANSITION_SCALE_MS,
  hexToRgb,
} from '@ccd/design-tokens'
import type { CompleteThemeModeConfig, SizeCssVars, SizeMode, SizePreset, ThemeCssVars } from '@ccd/design-tokens'
import type { PrimeVueSizeSource } from '@ccd/vue-primevue-adapter'

export const desktopSizeSource: PrimeVueSizeSource = {
  sizeName: DEFAULT_SIZE_NAME,
}

function resolveSizePreset(sizeName: SizeMode): SizePreset {
  return SIZE_PRESETS.find(preset => preset.name === sizeName) ?? SIZE_PRESETS[0]
}

function resolveThemeConfig(): CompleteThemeModeConfig {
  const preset = THEME_PRESETS.find(item => item.name === DEFAULT_THEME_NAME) ?? THEME_PRESETS[0]
  return preset.colors.light
}

function channels(hex: string): string {
  return hexToRgb(hex)
}

function createThemeVars(config: CompleteThemeModeConfig): ThemeCssVars {
  return {
    '--background': channels(config.background),
    '--foreground': channels(config.foreground),
    '--card': channels(config.neutral.bg),
    '--card-foreground': channels(config.neutral.foreground),
    '--popover': channels(config.neutral.bg),
    '--popover-foreground': channels(config.neutral.foreground),
    '--primary': channels(config.primary.default),
    '--primary-foreground': channels(config.primary.foreground),
    '--primary-hover': channels(config.primary.hover),
    '--primary-hover-foreground': channels(config.primary.foreground),
    '--primary-light': channels(config.primary.light),
    '--primary-light-foreground': channels(config.primary.lightForeground),
    '--secondary': channels(config.secondary),
    '--secondary-foreground': channels(config.secondaryForeground),
    '--muted': channels(config.muted),
    '--muted-foreground': channels(config.mutedForeground),
    '--accent': channels(config.accent.default),
    '--accent-foreground': channels(config.accent.foreground),
    '--accent-hover': channels(config.accent.hover),
    '--accent-hover-foreground': channels(config.accent.foreground),
    '--accent-light': channels(config.accent.light),
    '--accent-light-foreground': channels(config.accent.lightForeground),
    '--danger': channels(config.danger.default),
    '--danger-foreground': channels(config.danger.foreground),
    '--danger-hover': channels(config.danger.hover),
    '--danger-hover-foreground': channels(config.danger.foreground),
    '--danger-light': channels(config.danger.light),
    '--danger-light-foreground': channels(config.danger.lightForeground),
    '--warn': channels(config.warn.default),
    '--warn-foreground': channels(config.warn.foreground),
    '--warn-hover': channels(config.warn.hover),
    '--warn-hover-foreground': channels(config.warn.foreground),
    '--warn-light': channels(config.warn.light),
    '--warn-light-foreground': channels(config.warn.lightForeground),
    '--success': channels(config.success.default),
    '--success-foreground': channels(config.success.foreground),
    '--success-hover': channels(config.success.hover),
    '--success-hover-foreground': channels(config.success.foreground),
    '--success-light': channels(config.success.light),
    '--success-light-foreground': channels(config.success.lightForeground),
    '--info': channels(config.info.default),
    '--info-foreground': channels(config.info.foreground),
    '--info-hover': channels(config.info.hover),
    '--info-hover-foreground': channels(config.info.foreground),
    '--info-light': channels(config.info.light),
    '--info-light-foreground': channels(config.info.lightForeground),
    '--help': channels(config.help.default),
    '--help-foreground': channels(config.help.foreground),
    '--help-hover': channels(config.help.hover),
    '--help-hover-foreground': channels(config.help.foreground),
    '--help-light': channels(config.help.light),
    '--help-light-foreground': channels(config.help.lightForeground),
    '--border': channels(config.border),
    '--input': channels(config.input),
    '--ring': channels(config.ring),
    '--sidebar-background': channels(config.sidebar.background),
    '--sidebar-foreground': channels(config.sidebar.foreground),
    '--sidebar-primary': channels(config.sidebar.primary),
    '--sidebar-primary-foreground': channels(config.sidebar.primaryForeground),
    '--sidebar-accent': channels(config.sidebar.accent),
    '--sidebar-accent-foreground': channels(config.sidebar.accentForeground),
    '--sidebar-border': channels(config.sidebar.border),
    '--sidebar-ring': channels(config.sidebar.ring),
  }
}

function createSizeVars(preset: SizePreset): Partial<SizeCssVars> & Record<string, string> {
  const controlHeight = Math.round(preset.fontSizeBase + preset.spacingBase * 5)
  const controlHeightSm = Math.round(preset.fontSizeBase * 0.96 + preset.spacingBase * 4)
  const controlHeightLg = Math.round(preset.fontSizeBase * 1.125 + preset.spacingBase * 6)
  const vars: Partial<SizeCssVars> & Record<string, string> = {
    '--spacing-unit': `${preset.spacingBase}px`,
    '--container-padding': `${preset.spacingBase * 5}px`,
    '--control-height': `${controlHeight}px`,
    '--control-height-sm': `${controlHeightSm}px`,
    '--control-height-lg': `${controlHeightLg}px`,
    '--control-action-size': `${controlHeight}px`,
    '--control-action-size-sm': `${controlHeightSm}px`,
    '--control-action-size-lg': `${controlHeightLg}px`,
    '--sidebar-width': `${preset.sidebarWidth}px`,
    '--sidebar-collapsed-width': `${preset.sidebarCollapsedWidth}px`,
    '--header-height': `${preset.headerHeight}px`,
    '--breadcrumb-height': `${preset.breadcrumbHeight}px`,
    '--footer-height': `${preset.footerHeight}px`,
    '--tabs-height': `${preset.tabsHeight}px`,
    '--font-size-root': `${preset.fontSizeBase}px`,
    '--dialog-settings-width': `${DIALOG_SETTINGS_WIDTH_PX}px`,
  }

  for (const key of SIZE_SCALE_KEYS) {
    vars[`--font-size-${key}`] = `${Math.round(preset.fontSizeBase * FONT_SCALE_RATIOS[key])}px`
    vars[`--spacing-${key}`] = `${preset.spacingBase * SPACING_SCALE_RATIOS[key]}px`
    vars[`--radius-${key}`] = `${Math.round(preset.radius * RADIUS_SCALE_RATIOS[key])}px`
    vars[`--transition-${key}`] = `${TRANSITION_SCALE_MS[key]}ms`
  }

  return vars
}

function writeRootVars(vars: Record<string, string>): void {
  if (typeof document === 'undefined') return

  const root = document.documentElement
  for (const [key, value] of Object.entries(vars)) {
    root.style.setProperty(key, value)
  }
}

export function setupDesktopDesignSystem(): void {
  writeRootVars({
    ...createThemeVars(resolveThemeConfig()),
    ...createSizeVars(resolveSizePreset(desktopSizeSource.sizeName)),
  })
}
