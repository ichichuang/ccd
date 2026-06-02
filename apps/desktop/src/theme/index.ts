import {
  DEFAULT_SIZE_NAME,
  DEFAULT_THEME_NAME,
  DIALOG_SETTINGS_WIDTH_PX,
  SIZE_PRESETS,
  THEME_PRESETS,
  generateSizeVars,
  resolveSizePreset as resolveDesignSizePreset,
} from '@ccd/design-tokens'
import { generateThemeVars } from '@ccd/design-tokens/theme-engine'
import type { SizeCssVars, SizeMode, SizePreset } from '@ccd/design-tokens'
import type { PrimeVueSizeSource } from '@ccd/vue-primevue-adapter'

export const desktopSizeSource: PrimeVueSizeSource = {
  sizeName: DEFAULT_SIZE_NAME,
}

function resolveDesktopSizePreset(sizeName: SizeMode): SizePreset {
  return resolveDesignSizePreset(sizeName, SIZE_PRESETS, SIZE_PRESETS[0].name)
}

function createDesktopThemeVars() {
  const preset = THEME_PRESETS.find(item => item.name === DEFAULT_THEME_NAME) ?? THEME_PRESETS[0]
  return generateThemeVars(preset, false)
}

function normalizeSizeVars(vars: Partial<SizeCssVars>): Record<string, string> {
  const normalized: Record<string, string> = {}
  for (const [key, value] of Object.entries(vars)) {
    if (value != null) normalized[key] = value
  }
  return normalized
}

function createDesktopSizeVars(preset: SizePreset): Record<string, string> {
  return {
    ...normalizeSizeVars(generateSizeVars(preset)),
    '--sidebar-width': `${preset.sidebarWidth}px`,
    '--sidebar-collapsed-width': `${preset.sidebarCollapsedWidth}px`,
    '--header-height': `${preset.headerHeight}px`,
    '--breadcrumb-height': `${preset.breadcrumbHeight}px`,
    '--footer-height': `${preset.footerHeight}px`,
    '--tabs-height': `${preset.tabsHeight}px`,
    '--font-size-root': `${preset.fontSizeBase}px`,
    '--dialog-settings-width': `${DIALOG_SETTINGS_WIDTH_PX}px`,
  }
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
    ...createDesktopThemeVars(),
    ...createDesktopSizeVars(resolveDesktopSizePreset(desktopSizeSource.sizeName)),
  })
}
