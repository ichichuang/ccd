/// <reference lib="dom" />
import { RUNTIME_STORAGE_KEYS } from '../../constants/runtime'
import { adjustBrightness, hexToRgb, isDarkColor, mixHex, normalizeHex, shiftHue } from './colors'
import { COLOR_FAMILIES, THEME_ENGINE } from './metadata'

export { COLOR_FAMILIES, THEME_ENGINE }

/**
 * 生成语义化主题 CSS 变量 (Final v4.0 - Switch from color-mix to static JS calc)
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

  const linearizeChannel = (channel: number): number => {
    const normalized = channel / 255
    return normalized <= 0.03928 ? normalized / 12.92 : Math.pow((normalized + 0.055) / 1.055, 2.4)
  }

  const luminance = (hex: string): number => {
    const normalized = normalizeHex(hex).replace('#', '')
    const r = Number.parseInt(normalized.slice(0, 2), 16)
    const g = Number.parseInt(normalized.slice(2, 4), 16)
    const b = Number.parseInt(normalized.slice(4, 6), 16)
    return (
      0.2126 * linearizeChannel(r) + 0.7152 * linearizeChannel(g) + 0.0722 * linearizeChannel(b)
    )
  }

  const contrastRatio = (a: string, b: string): number => {
    const left = luminance(a)
    const right = luminance(b)
    const lighter = Math.max(left, right)
    const darker = Math.min(left, right)
    return (lighter + 0.05) / (darker + 0.05)
  }

  const ensureReadableForeground = (background: string, preferredForeground: string): string => {
    const preferred = normalizeHex(preferredForeground)
    if (contrastRatio(background, preferred) >= 4.6) {
      return preferred
    }

    const darkText = '#000000'
    const lightText = '#ffffff'
    return contrastRatio(background, darkText) >= contrastRatio(background, lightText)
      ? darkText
      : lightText
  }

  // 1. 基础背景与前景色
  const bgBase = resolveToken(modeConfig?.background, () =>
    isDark ? (preset.backgroundDark ?? E.bgDark) : (preset.backgroundLight ?? E.bgLight)
  )

  const fgBase = ensureReadableForeground(
    bgBase,
    resolveToken(modeConfig?.foreground, () => (isDark ? E.fgDark : E.fgLight))
  )

  // 2. 中性色基调 (用于 Border/Input)
  const defaultNeutral = isDark ? E.neutralDark : E.neutralLight
  const baseNeutral = resolveToken(
    modeConfig?.neutral?.base,
    () => preset.neutral || defaultNeutral
  )

  // 3. 卡片/Popover 背景
  const cardBase = resolveToken(modeConfig?.neutral?.bg, () => {
    if (isDark) {
      return preset.backgroundDark
        ? adjustBrightness(preset.backgroundDark, E.cardBrightnessOffset)
        : E.cardDark
    }
    return preset.backgroundLight
      ? adjustBrightness(preset.backgroundLight, -Math.abs(E.cardBrightnessOffset))
      : (E.cardLight ?? E.bgLight)
  })

  const cardFg = ensureReadableForeground(
    cardBase,
    resolveToken(modeConfig?.neutral?.foreground, () => fgBase)
  )

  // 4. Primary (核心逻辑: Config -> Legacy String -> Default)
  const primaryBase = resolveToken(
    modeConfig?.primary?.default,
    () => preset.primary || E.fallbackPrimary
  )

  const primaryFg = ensureReadableForeground(
    primaryBase,
    resolveToken(modeConfig?.primary?.foreground, () =>
      isDarkColor(primaryBase) ? E.fgDark : E.fgLight
    )
  )

  const primaryHover = resolveToken(modeConfig?.primary?.hover, () =>
    adjustBrightness(primaryBase, isDark ? E.hoverBrightnessDark : E.hoverBrightnessLight)
  )

  const primaryHoverFg = ensureReadableForeground(
    primaryHover,
    isDarkColor(primaryHover) ? E.fgDark : E.fgLight
  )

  const primaryLight = resolveToken(modeConfig?.primary?.light, () =>
    isDark
      ? adjustBrightness(primaryBase, E.lightBrightnessDark)
      : mixHex(primaryBase, E.lightMixWhite, 1 - E.lightMixWhiteWeight)
  )

  const getRobustLightFg = (baseColor: string) => {
    return mixHex(baseColor, E.darkForeground, 0.6)
  }

  const primaryLightFg = ensureReadableForeground(
    primaryLight,
    resolveToken(modeConfig?.primary?.lightForeground, () =>
      isDark ? E.fgDark : getRobustLightFg(primaryBase)
    )
  )

  // 5. Secondary / Muted
  const secondaryBase = resolveToken(modeConfig?.neutral?.bg, () => baseNeutral)
  const secondaryFg = ensureReadableForeground(
    secondaryBase,
    resolveToken(modeConfig?.neutral?.secondaryForeground, () =>
      isDark ? E.secondaryFgDark : E.fgLight
    )
  )

  const mutedBase = baseNeutral
  const mutedFg = ensureReadableForeground(
    mutedBase,
    resolveToken(modeConfig?.neutral?.mutedForeground, () =>
      isDark ? E.mutedFgDark : E.mutedFgLight
    )
  )

  // 6. Focus Ring
  const ringBase = resolveToken(modeConfig?.ring, () => primaryBase)

  // 7. Accent
  const accentBase = resolveToken(
    modeConfig?.accent?.default,
    () => preset.accent ?? shiftHue(primaryBase, E.accentHueShift)
  )
  const accentFg = ensureReadableForeground(
    accentBase,
    resolveToken(modeConfig?.accent?.foreground, () =>
      isDarkColor(accentBase) ? E.fgDark : E.fgLight
    )
  )
  const accentHover = resolveToken(modeConfig?.accent?.hover, () =>
    adjustBrightness(accentBase, isDark ? E.hoverBrightnessDark : E.hoverBrightnessLight)
  )
  const accentHoverFg = ensureReadableForeground(
    accentHover,
    isDarkColor(accentHover) ? E.fgDark : E.fgLight
  )

  // Accent Light
  const accentLight = resolveToken(modeConfig?.accent?.light, () =>
    isDark
      ? adjustBrightness(accentBase, E.lightBrightnessDark)
      : mixHex(accentBase, E.lightMixWhite, 1 - E.lightMixWhiteWeight)
  )
  const accentLightFg = ensureReadableForeground(
    accentLight,
    resolveToken(modeConfig?.accent?.lightForeground, () =>
      isDark ? E.fgDark : getRobustLightFg(accentBase)
    )
  )

  // 8. Status Colors (Danger, Warn, Success)
  const generateStatusFamily = (
    config: Partial<ColorTokenState> | undefined,
    baseDefault: string
  ) => {
    const base = resolveToken(config?.default, () => baseDefault)
    const fg = ensureReadableForeground(
      base,
      resolveToken(config?.foreground, () => (isDarkColor(base) ? E.fgDark : E.fgLight))
    )

    const hover = resolveToken(config?.hover, () =>
      adjustBrightness(base, isDark ? E.hoverBrightnessDark : E.hoverBrightnessLight)
    )
    const hoverFg = ensureReadableForeground(hover, isDarkColor(hover) ? E.fgDark : E.fgLight)

    const light = resolveToken(config?.light, () =>
      isDark
        ? adjustBrightness(base, E.lightBrightnessDark)
        : mixHex(base, E.lightMixWhite, 1 - E.lightMixWhiteWeight)
    )
    const lightFg = ensureReadableForeground(
      light,
      resolveToken(config?.lightForeground, () => (isDark ? E.fgDark : getRobustLightFg(base)))
    )

    return { base, fg, hover, hoverFg, light, lightFg }
  }

  const danger = generateStatusFamily(modeConfig?.danger, E.dangerDefault)
  const warn = generateStatusFamily(modeConfig?.warn, preset.warn ?? E.warnDefault)
  const success = generateStatusFamily(modeConfig?.success, preset.success ?? E.successDefault)
  const info = generateStatusFamily(modeConfig?.info, preset.info ?? E.infoDefault)
  const help = generateStatusFamily(modeConfig?.help, preset.help ?? E.helpDefault)

  // 9. Sidebar
  const sidebarConfig = modeConfig?.sidebar

  let sidebarBase = isDark ? E.sidebarDark : E.sidebarLight
  if (sidebarConfig?.background) {
    sidebarBase = extractHex(sidebarConfig.background)
  } else if (isDark && preset.backgroundDark) {
    sidebarBase = adjustBrightness(preset.backgroundDark, E.sidebarBrightnessOffset)
  } else if (!isDark && preset.backgroundLight) {
    sidebarBase = adjustBrightness(preset.backgroundLight, -Math.abs(E.sidebarBrightnessOffset))
  }

  const sidebarFg = ensureReadableForeground(
    sidebarBase,
    sidebarConfig?.foreground ? extractHex(sidebarConfig.foreground) : fgBase
  )
  const sidebarPrimary = sidebarConfig?.primary ? extractHex(sidebarConfig.primary) : primaryBase
  const sidebarPrimaryFg = ensureReadableForeground(
    sidebarPrimary,
    sidebarConfig?.primaryForeground ? extractHex(sidebarConfig.primaryForeground) : primaryFg
  )
  const sidebarAccent = sidebarConfig?.accent ? extractHex(sidebarConfig.accent) : accentBase
  const sidebarAccentFg = ensureReadableForeground(
    sidebarAccent,
    sidebarConfig?.accentForeground ? extractHex(sidebarConfig.accentForeground) : accentFg
  )
  const sidebarBorder = sidebarConfig?.border ? extractHex(sidebarConfig.border) : baseNeutral
  const sidebarRing = sidebarConfig?.ring ? extractHex(sidebarConfig.ring) : accentBase

  function extractHex(val: string) {
    return normalizeHex(val)
  }

  function safeToRgb(val: string) {
    // Now results are guaranteed to be HEX or precalculated HEX strings
    return hexToRgb(val)
  }

  // Dark mode: bgBase/cardBase/baseNeutral use dark values; --background/--input/--popover are correct
  return {
    '--background': safeToRgb(bgBase),
    '--foreground': safeToRgb(fgBase),

    '--card': safeToRgb(cardBase),
    '--card-foreground': safeToRgb(cardFg),

    '--popover': safeToRgb(cardBase),
    '--popover-foreground': safeToRgb(cardFg),

    '--primary': safeToRgb(primaryBase),
    '--primary-foreground': safeToRgb(primaryFg),
    '--primary-hover': safeToRgb(primaryHover),
    '--primary-hover-foreground': safeToRgb(primaryHoverFg),
    '--primary-light': safeToRgb(primaryLight),
    '--primary-light-foreground': safeToRgb(primaryLightFg),

    '--secondary': safeToRgb(secondaryBase),
    '--secondary-foreground': safeToRgb(secondaryFg),

    '--muted': safeToRgb(mutedBase),
    '--muted-foreground': safeToRgb(mutedFg),

    '--accent': safeToRgb(accentBase),
    '--accent-foreground': safeToRgb(accentFg),
    '--accent-hover': safeToRgb(accentHover),
    '--accent-hover-foreground': safeToRgb(accentHoverFg),
    '--accent-light': safeToRgb(accentLight),
    '--accent-light-foreground': safeToRgb(accentLightFg),

    '--danger': safeToRgb(danger.base),
    '--danger-foreground': safeToRgb(danger.fg),
    '--danger-hover': safeToRgb(danger.hover),
    '--danger-hover-foreground': safeToRgb(danger.hoverFg),
    '--danger-light': safeToRgb(danger.light),
    '--danger-light-foreground': safeToRgb(danger.lightFg),

    '--warn': safeToRgb(warn.base),
    '--warn-foreground': safeToRgb(warn.fg),
    '--warn-hover': safeToRgb(warn.hover),
    '--warn-hover-foreground': safeToRgb(warn.hoverFg),
    '--warn-light': safeToRgb(warn.light),
    '--warn-light-foreground': safeToRgb(warn.lightFg),

    '--success': safeToRgb(success.base),
    '--success-foreground': safeToRgb(success.fg),
    '--success-hover': safeToRgb(success.hover),
    '--success-hover-foreground': safeToRgb(success.hoverFg),
    '--success-light': safeToRgb(success.light),
    '--success-light-foreground': safeToRgb(success.lightFg),

    '--info': safeToRgb(info.base),
    '--info-foreground': safeToRgb(info.fg),
    '--info-hover': safeToRgb(info.hover),
    '--info-hover-foreground': safeToRgb(info.hoverFg),
    '--info-light': safeToRgb(info.light),
    '--info-light-foreground': safeToRgb(info.lightFg),

    '--help': safeToRgb(help.base),
    '--help-foreground': safeToRgb(help.fg),
    '--help-hover': safeToRgb(help.hover),
    '--help-hover-foreground': safeToRgb(help.hoverFg),
    '--help-light': safeToRgb(help.light),
    '--help-light-foreground': safeToRgb(help.lightFg),

    '--border': safeToRgb(baseNeutral),
    '--input': safeToRgb(baseNeutral),
    '--ring': safeToRgb(ringBase),

    '--sidebar-background': safeToRgb(sidebarBase),
    '--sidebar-foreground': safeToRgb(sidebarFg),
    '--sidebar-primary': safeToRgb(sidebarPrimary),
    '--sidebar-primary-foreground': safeToRgb(sidebarPrimaryFg),
    '--sidebar-accent': safeToRgb(sidebarAccent),
    '--sidebar-accent-foreground': safeToRgb(sidebarAccentFg),
    '--sidebar-border': safeToRgb(sidebarBorder),
    '--sidebar-ring': safeToRgb(sidebarRing),
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

  // 5. 持久化预加载视觉 token，供 index.html 在 Vue 挂载前恢复首帧主题色。
  // 这是 safe-storage 规则中的显式例外：仅允许 theme-primary/theme-background 这类视觉启动 token 明文存在。
  try {
    const primary = vars['--primary']
    if (primary) {
      localStorage.setItem(RUNTIME_STORAGE_KEYS.themePrimary, primary)
    }
    const background = vars['--background']
    if (background) {
      localStorage.setItem(RUNTIME_STORAGE_KEYS.themeBackground, background)
    }
  } catch (_) {
    /* ignore */
  }
}
