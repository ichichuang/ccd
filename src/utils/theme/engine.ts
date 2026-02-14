import { hexToRgb, adjustBrightness, isDarkColor, mixHex, normalizeHex } from './colors'
import { COLOR_FAMILIES, THEME_ENGINE } from './metadata'

export { COLOR_FAMILIES, THEME_ENGINE }

/**
 * 生成 Shadcn 兼容的 CSS 变量 (Final v3.5)
 */
export function generateThemeVars(preset: ThemePreset, isDark: boolean): ThemeCssVars {
  const E = THEME_ENGINE
  const modeKey = isDark ? 'dark' : 'light'

  // =====================================================================
  // Resolution Pipeline (优先级管道)
  // L1: Explicit Mode Config (preset.colors[mode])
  // L2: Legacy/Simple Config (preset.primary, etc.)
  // =====================================================================

  const modeConfig = preset.colors?.[modeKey]

  // Helper: Resolve a color token with fallback to algorithm
  const resolveToken = (value: string | undefined, fallbackGenerator: () => string): string => {
    return value ? normalizeHex(value) : fallbackGenerator()
  }

  // 1. 基础背景与前景色
  const bgBase = resolveToken(modeConfig?.background, () =>
    isDark ? (preset.backgroundDark ?? E.bgDark) : (preset.backgroundLight ?? E.bgLight)
  )

  const fgBase = resolveToken(modeConfig?.foreground, () => (isDark ? E.fgDark : E.fgLight))

  // 2. 中性色基调 (用于 Border/Input/Ring)
  const defaultNeutral = isDark ? E.neutralDark : E.neutralLight
  const baseNeutral = resolveToken(
    modeConfig?.neutral?.base,
    () => preset.neutral || defaultNeutral
  )

  // 3. 卡片/Popover 背景
  const cardBase = resolveToken(modeConfig?.neutral?.bg, () =>
    isDark
      ? preset.backgroundDark
        ? adjustBrightness(preset.backgroundDark, E.cardBrightnessOffset)
        : E.cardDark
      : preset.backgroundLight
        ? adjustBrightness(preset.backgroundLight, E.cardBrightnessOffset)
        : E.bgLight
  )

  const cardFg = resolveToken(modeConfig?.neutral?.foreground, () => fgBase)

  // 4. Primary (核心逻辑: Config -> Legacy String -> Default)
  const primaryBase = resolveToken(
    modeConfig?.primary?.default,
    () => preset.primary || '#000000' // Fallback needed if strictly no primary provided (shouldn't happen in valid presets)
  )

  const primaryFg = resolveToken(modeConfig?.primary?.foreground, () =>
    isDarkColor(primaryBase) ? E.fgDark : E.fgLight
  )

  const primaryHover = resolveToken(modeConfig?.primary?.hover, () =>
    adjustBrightness(primaryBase, isDark ? E.hoverBrightnessDark : E.hoverBrightnessLight)
  )

  const primaryHoverFg = isDarkColor(primaryHover) ? E.fgDark : E.fgLight

  const primaryLight = resolveToken(modeConfig?.primary?.light, () =>
    isDark
      ? adjustBrightness(primaryBase, E.lightBrightnessDark)
      : mixHex(primaryBase, E.lightMixWhite, E.lightMixWhiteWeight)
  )

  const getRobustLightFg = (baseColor: string) => {
    const darkened = adjustBrightness(baseColor, -40)
    return isDarkColor(darkened) ? darkened : E.fgLight
  }

  const primaryLightFg = resolveToken(modeConfig?.primary?.lightForeground, () =>
    isDark ? E.fgDark : getRobustLightFg(primaryBase)
  )

  // 5. Secondary / Muted
  const secondaryBase = resolveToken(
    modeConfig?.neutral?.bg, // Default fallback to card bg logic if not overridden, or base neutral
    () => baseNeutral
  )
  const secondaryFg = resolveToken(modeConfig?.neutral?.secondaryForeground, () =>
    isDark ? E.secondaryFgDark : E.fgLight
  )

  const mutedBase = secondaryBase
  const mutedFg = resolveToken(modeConfig?.neutral?.mutedForeground, () =>
    isDark ? E.mutedFgDark : E.mutedFgLight
  )

  // 6. Accent
  const accentBase = resolveToken(
    modeConfig?.accent?.default,
    () =>
      preset.accent ??
      mixHex(
        primaryBase,
        baseNeutral,
        isDark ? E.accentMixPrimaryWeightDark : E.accentMixPrimaryWeightLight
      )
  )
  const accentFg = resolveToken(modeConfig?.accent?.foreground, () =>
    isDarkColor(accentBase) ? E.fgDark : E.fgLight
  )
  const accentHover = resolveToken(modeConfig?.accent?.hover, () =>
    adjustBrightness(accentBase, isDark ? E.hoverBrightnessDark : E.hoverBrightnessLight)
  )
  const accentHoverFg = isDarkColor(accentHover) ? E.fgDark : E.fgLight

  // Accent Light
  const accentLight = resolveToken(modeConfig?.accent?.light, () =>
    isDark
      ? adjustBrightness(accentBase, E.lightBrightnessDark)
      : mixHex(accentBase, E.lightMixWhite, E.lightMixWhiteWeight)
  )
  const accentLightFg = resolveToken(modeConfig?.accent?.lightForeground, () =>
    isDark ? E.fgDark : getRobustLightFg(accentBase)
  )

  // 7. Status Colors (Destructive, Warn, Success)
  // Helper to generate a full quad family if config unavailable
  const generateStatusFamily = (
    config: Partial<ColorTokenState> | undefined,
    baseDefault: string
  ) => {
    const base = resolveToken(config?.default, () => baseDefault)
    const fg = resolveToken(config?.foreground, () => (isDarkColor(base) ? E.fgDark : E.fgLight)) // often white on status colors

    const hover = resolveToken(config?.hover, () =>
      adjustBrightness(base, isDark ? E.hoverBrightnessDark : E.hoverBrightnessLight)
    )
    const hoverFg = isDarkColor(hover) ? E.fgDark : E.fgLight

    const light = resolveToken(config?.light, () =>
      isDark
        ? adjustBrightness(base, E.lightBrightnessDark)
        : mixHex(base, E.lightMixWhite, E.lightMixWhiteWeight)
    )
    const lightFg = resolveToken(config?.lightForeground, () =>
      isDark ? E.fgDark : getRobustLightFg(base)
    )

    return { base, fg, hover, hoverFg, light, lightFg }
  }

  const destructive = generateStatusFamily(modeConfig?.destructive, E.destructive)
  const warn = generateStatusFamily(modeConfig?.warn, preset.warn ?? E.warnDefault)
  const success = generateStatusFamily(modeConfig?.success, preset.success ?? E.successDefault)
  const info = generateStatusFamily(modeConfig?.info, preset.info ?? E.infoDefault)
  const help = generateStatusFamily(modeConfig?.help, preset.help ?? E.helpDefault)

  // 8. Sidebar
  const sidebarConfig = modeConfig?.sidebar

  let sidebarBase = isDark ? E.sidebarDark : E.sidebarLight
  if (sidebarConfig?.background) {
    sidebarBase = extractHex(sidebarConfig.background)
  } else if (isDark && preset.backgroundDark) {
    sidebarBase = adjustBrightness(preset.backgroundDark, E.sidebarBrightnessOffset)
  } else if (!isDark && preset.backgroundLight) {
    sidebarBase = adjustBrightness(preset.backgroundLight, E.sidebarBrightnessOffset)
  }

  const sidebarFg = sidebarConfig?.foreground ? extractHex(sidebarConfig.foreground) : fgBase
  // defaults for others match main theme if not provided
  const sidebarPrimary = sidebarConfig?.primary ? extractHex(sidebarConfig.primary) : primaryBase
  const sidebarPrimaryFg = sidebarConfig?.primaryForeground
    ? extractHex(sidebarConfig.primaryForeground)
    : primaryFg
  const sidebarAccent = sidebarConfig?.accent ? extractHex(sidebarConfig.accent) : accentBase
  const sidebarAccentFg = sidebarConfig?.accentForeground
    ? extractHex(sidebarConfig.accentForeground)
    : accentFg
  const sidebarBorder = sidebarConfig?.border ? extractHex(sidebarConfig.border) : baseNeutral
  const sidebarRing = sidebarConfig?.ring ? extractHex(sidebarConfig.ring) : primaryBase

  // Helper because explicit config values might not need normalization if we trust them, but safer to do it
  function extractHex(val: string) {
    return normalizeHex(val)
  }

  return {
    '--background': hexToRgb(bgBase),
    '--foreground': hexToRgb(fgBase),

    '--card': hexToRgb(cardBase),
    '--card-foreground': hexToRgb(cardFg),

    '--popover': hexToRgb(cardBase),
    '--popover-foreground': hexToRgb(cardFg),

    '--primary': hexToRgb(primaryBase),
    '--primary-foreground': hexToRgb(primaryFg),
    '--primary-hover': hexToRgb(primaryHover),
    '--primary-hover-foreground': hexToRgb(primaryHoverFg),
    '--primary-light': hexToRgb(primaryLight),
    '--primary-light-foreground': hexToRgb(primaryLightFg),

    '--secondary': hexToRgb(secondaryBase),
    '--secondary-foreground': hexToRgb(secondaryFg),

    '--muted': hexToRgb(mutedBase),
    '--muted-foreground': hexToRgb(mutedFg),

    '--accent': hexToRgb(accentBase),
    '--accent-foreground': hexToRgb(accentFg),
    '--accent-hover': hexToRgb(accentHover),
    '--accent-hover-foreground': hexToRgb(accentHoverFg),
    '--accent-light': hexToRgb(accentLight),
    '--accent-light-foreground': hexToRgb(accentLightFg),

    '--destructive': hexToRgb(destructive.base),
    '--destructive-foreground': hexToRgb(destructive.fg),
    '--destructive-hover': hexToRgb(destructive.hover),
    '--destructive-hover-foreground': hexToRgb(destructive.hoverFg),
    '--destructive-light': hexToRgb(destructive.light),
    '--destructive-light-foreground': hexToRgb(destructive.lightFg),

    '--warn': hexToRgb(warn.base),
    '--warn-foreground': hexToRgb(warn.fg),
    '--warn-hover': hexToRgb(warn.hover),
    '--warn-hover-foreground': hexToRgb(warn.hoverFg),
    '--warn-light': hexToRgb(warn.light),
    '--warn-light-foreground': hexToRgb(warn.lightFg),

    '--success': hexToRgb(success.base),
    '--success-foreground': hexToRgb(success.fg),
    '--success-hover': hexToRgb(success.hover),
    '--success-hover-foreground': hexToRgb(success.hoverFg),
    '--success-light': hexToRgb(success.light),
    '--success-light-foreground': hexToRgb(success.lightFg),

    '--info': hexToRgb(info.base),
    '--info-foreground': hexToRgb(info.fg),
    '--info-hover': hexToRgb(info.hover),
    '--info-hover-foreground': hexToRgb(info.hoverFg),
    '--info-light': hexToRgb(info.light),
    '--info-light-foreground': hexToRgb(info.lightFg),

    '--help': hexToRgb(help.base),
    '--help-foreground': hexToRgb(help.fg),
    '--help-hover': hexToRgb(help.hover),
    '--help-hover-foreground': hexToRgb(help.hoverFg),
    '--help-light': hexToRgb(help.light),
    '--help-light-foreground': hexToRgb(help.lightFg),

    '--border': hexToRgb(baseNeutral),
    '--input': hexToRgb(baseNeutral),
    '--ring': hexToRgb(primaryBase),

    '--sidebar-background': hexToRgb(sidebarBase),
    '--sidebar-foreground': hexToRgb(sidebarFg),
    '--sidebar-primary': hexToRgb(sidebarPrimary),
    '--sidebar-primary-foreground': hexToRgb(sidebarPrimaryFg),
    '--sidebar-accent': hexToRgb(sidebarAccent),
    '--sidebar-accent-foreground': hexToRgb(sidebarAccentFg),
    '--sidebar-border': hexToRgb(sidebarBorder),
    '--sidebar-ring': hexToRgb(sidebarRing),
  }
}

export function applyTheme(vars: ThemeCssVars) {
  const root = document.documentElement

  // ═══════════════════════════════════════════════════════════════
  // 关键优化：使用单次 cssText 更新替代多次 setProperty
  // 避免 29+ 次 style attribute mutation 导致的闪烁
  // ═══════════════════════════════════════════════════════════════

  // 1. 获取当前所有非主题变量的样式（如 --transition-x 等）
  const currentStyles: Record<string, string> = {}
  const themeVarKeys = new Set(Object.keys(vars))

  for (let i = 0; i < root.style.length; i++) {
    const prop = root.style[i]
    if (!themeVarKeys.has(prop)) {
      currentStyles[prop] = root.style.getPropertyValue(prop)
    }
  }

  // 2. 合并：主题变量 + 保留的非主题变量
  const allStyles = { ...currentStyles, ...vars }

  // 3. 构建完整的 cssText 字符串
  const cssText = Object.entries(allStyles)
    .map(([key, value]) => `${key}: ${value}`)
    .join('; ')

  // 4. 单次原子更新 - 只触发 1 次 style mutation
  root.style.cssText = cssText
}
