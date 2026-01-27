import { hexToRgb, adjustBrightness, isDarkColor, mixHex } from './colors'

// ---------------------------------------------------------------------------
// 主题引擎可调参数（便于调试与统一微调）
// ---------------------------------------------------------------------------
const THEME_ENGINE = {
  /* 基础层：未指定 backgroundDark/backgroundLight 时的默认色 */
  bgDark: '#09090b',
  bgLight: '#ffffff',
  fgDark: '#ffffff',
  fgLight: '#09090b',

  /* 中性色：secondary / muted / border 等 */
  neutralDark: '#27272a',
  neutralLight: '#f4f4f5',
  borderLight: '#e4e4e7',

  /* 卡片：默认卡背景及有 backgroundDark/backgroundLight 时的亮度偏移 */
  cardDark: '#18181b',
  cardBrightnessOffset: 5,

  /* Hover：亮度调整，深色模式略亮、浅色模式略暗 */
  hoverBrightnessDark: 10,
  hoverBrightnessLight: -10,

  /* Light 变体：深色模式加亮度；浅色模式与白混合的基色权重 (0~1) */
  lightBrightnessDark: 25,
  lightMixWhiteWeight: 0.88,
  lightMixWhite: '#ffffff',

  /* Accent 未预设时：主色与中性混合的占比 */
  accentMixPrimaryWeightDark: 0.25,
  accentMixPrimaryWeightLight: 0.15,

  /* 状态色默认与固定 */
  destructive: '#ef4444',
  destructiveFg: '#fafafa',
  warnDefault: '#ca8a04',
  successDefault: '#22c55e',

  /* 次要文案色 */
  secondaryFgDark: '#fafafa',
  mutedFgDark: '#a1a1aa',
  mutedFgLight: '#71717a',

  /* Sidebar：默认及有 backgroundDark/backgroundLight 时的亮度偏移 */
  sidebarDark: '#18181b',
  sidebarLight: '#f4f4f5',
  sidebarBrightnessOffset: -2,
}

/**
 * 生成 Shadcn 兼容的 CSS 变量 (Final v3.5)
 * ⚠️ 已彻底移除 --radius，圆角控制权已移交至 SizeEngine
 */
export function generateThemeVars(preset: ThemePreset, isDark: boolean): ThemeCssVars {
  const { primary, backgroundDark, backgroundLight, neutral, accent, warn, success } = preset
  const E = THEME_ENGINE

  // 1. 基础背景（深/浅各自可选）
  const bgBase = isDark ? (backgroundDark ?? E.bgDark) : (backgroundLight ?? E.bgLight)
  const fgBase = isDark ? E.fgDark : E.fgLight

  // 2. 中性色基调
  const defaultNeutral = isDark ? E.neutralDark : E.neutralLight
  const baseNeutral = neutral || defaultNeutral

  // 3. 卡片：深/浅分别基于 backgroundDark/backgroundLight 或默认
  const cardBase = isDark
    ? backgroundDark
      ? adjustBrightness(backgroundDark, E.cardBrightnessOffset)
      : E.cardDark
    : backgroundLight
      ? adjustBrightness(backgroundLight, E.cardBrightnessOffset)
      : E.bgLight
  const cardFg = fgBase

  const borderBase = neutral ? baseNeutral : isDark ? E.neutralDark : E.borderLight

  // Primary
  const primaryBase = primary
  const primaryFg = isDarkColor(primaryBase) ? E.fgDark : E.fgLight

  const primaryLight = isDark
    ? adjustBrightness(primaryBase, E.lightBrightnessDark)
    : mixHex(primaryBase, E.lightMixWhite, E.lightMixWhiteWeight)
  const primaryLightFg = isDark ? E.fgDark : primaryBase
  const primaryHover = adjustBrightness(
    primaryBase,
    isDark ? E.hoverBrightnessDark : E.hoverBrightnessLight
  )

  // Secondary
  const secondaryBase = baseNeutral
  const secondaryFg = isDark ? E.secondaryFgDark : E.fgLight

  // Accent：预设中定义；未指定时混合主色与中性色回退
  const accentBase =
    accent ??
    mixHex(
      primaryBase,
      baseNeutral,
      isDark ? E.accentMixPrimaryWeightDark : E.accentMixPrimaryWeightLight
    )
  const accentFg = isDarkColor(accentBase) ? E.fgDark : E.fgLight
  const accentHover = adjustBrightness(
    accentBase,
    isDark ? E.hoverBrightnessDark : E.hoverBrightnessLight
  )
  const accentLight = isDark
    ? adjustBrightness(accentBase, E.lightBrightnessDark)
    : mixHex(accentBase, E.lightMixWhite, E.lightMixWhiteWeight)
  const accentLightFg = isDark ? E.fgDark : accentBase

  // 状态色：warn / success 未提供时使用默认；destructive 固定基色
  const destructiveBase = E.destructive
  const warnBase = warn ?? E.warnDefault
  const successBase = success ?? E.successDefault
  const warnFg = isDarkColor(warnBase) ? E.fgDark : E.fgLight
  const successFg = isDarkColor(successBase) ? E.fgDark : E.fgLight
  const destructiveFg = E.destructiveFg

  const destructiveHover = adjustBrightness(
    destructiveBase,
    isDark ? E.hoverBrightnessDark : E.hoverBrightnessLight
  )
  const destructiveLight = isDark
    ? adjustBrightness(destructiveBase, E.lightBrightnessDark)
    : mixHex(destructiveBase, E.lightMixWhite, E.lightMixWhiteWeight)
  const destructiveLightFg = isDark ? E.fgDark : destructiveBase
  const warnHover = adjustBrightness(
    warnBase,
    isDark ? E.hoverBrightnessDark : E.hoverBrightnessLight
  )
  const warnLight = isDark
    ? adjustBrightness(warnBase, E.lightBrightnessDark)
    : mixHex(warnBase, E.lightMixWhite, E.lightMixWhiteWeight)
  const warnLightFg = isDark ? E.fgDark : warnBase
  const successHover = adjustBrightness(
    successBase,
    isDark ? E.hoverBrightnessDark : E.hoverBrightnessLight
  )
  const successLight = isDark
    ? adjustBrightness(successBase, E.lightBrightnessDark)
    : mixHex(successBase, E.lightMixWhite, E.lightMixWhiteWeight)
  const successLightFg = isDark ? E.fgDark : successBase

  // Sidebar：有 backgroundDark/backgroundLight 时基于其做亮度偏移
  let sidebarBase = isDark ? E.sidebarDark : E.sidebarLight
  if (isDark && backgroundDark) {
    sidebarBase = adjustBrightness(backgroundDark, E.sidebarBrightnessOffset)
  } else if (!isDark && backgroundLight) {
    sidebarBase = adjustBrightness(backgroundLight, E.sidebarBrightnessOffset)
  }
  const sidebarFg = fgBase

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
    '--primary-light': hexToRgb(primaryLight),
    '--primary-light-foreground': hexToRgb(primaryLightFg),

    '--secondary': hexToRgb(secondaryBase),
    '--secondary-foreground': hexToRgb(secondaryFg),

    '--muted': hexToRgb(secondaryBase),
    '--muted-foreground': hexToRgb(isDark ? E.mutedFgDark : E.mutedFgLight),

    '--accent': hexToRgb(accentBase),
    '--accent-foreground': hexToRgb(accentFg),
    '--accent-hover': hexToRgb(accentHover),
    '--accent-light': hexToRgb(accentLight),
    '--accent-light-foreground': hexToRgb(accentLightFg),

    '--destructive': hexToRgb(destructiveBase),
    '--destructive-foreground': hexToRgb(destructiveFg),
    '--destructive-hover': hexToRgb(destructiveHover),
    '--destructive-light': hexToRgb(destructiveLight),
    '--destructive-light-foreground': hexToRgb(destructiveLightFg),
    '--warn': hexToRgb(warnBase),
    '--warn-foreground': hexToRgb(warnFg),
    '--warn-hover': hexToRgb(warnHover),
    '--warn-light': hexToRgb(warnLight),
    '--warn-light-foreground': hexToRgb(warnLightFg),
    '--success': hexToRgb(successBase),
    '--success-foreground': hexToRgb(successFg),
    '--success-hover': hexToRgb(successHover),
    '--success-light': hexToRgb(successLight),
    '--success-light-foreground': hexToRgb(successLightFg),

    '--border': hexToRgb(borderBase),
    '--input': hexToRgb(borderBase),
    '--ring': hexToRgb(primaryBase),

    '--sidebar-background': hexToRgb(sidebarBase),
    '--sidebar-foreground': hexToRgb(sidebarFg),
    '--sidebar-primary': hexToRgb(primaryBase),
    '--sidebar-primary-foreground': hexToRgb(primaryFg),
    '--sidebar-accent': hexToRgb(accentBase),
    '--sidebar-accent-foreground': hexToRgb(accentFg),
    '--sidebar-border': hexToRgb(borderBase),
    '--sidebar-ring': hexToRgb(primaryBase),
  }
}

export function applyTheme(vars: ThemeCssVars) {
  const root = document.documentElement
  Object.entries(vars).forEach(([key, value]) => {
    root.style.setProperty(key, value)
  })
}
