/**
 * 主题颜色家族元数据
 *
 * 单一 token（直接对应一个 CSS 变量）：
 * - border / input / ring / background / foreground
 *
 * 成对家族（DEFAULT + foreground）：
 * - card / popover / secondary / muted
 *
 * 扩展家族（DEFAULT + foreground + hover + light + light-foreground）：
 * - primary / accent / destructive / warn / success
 *
 * Sidebar 家族：单独使用 sidebar- 前缀的 CSS 变量
 *
 * 该元数据仅用于：
 * 1. 约束 generateThemeVars 返回的 CSS 变量命名规范
 * 2. 提供给 UnoCSS 配置做动态 colors 映射（避免硬编码）
 *
 * 与 PrimeVue 主题链的关系：本文件由 engine.ts 使用并参与生成 ThemeCssVars（写入 :root）；
 * PrimeVue preset（primevue-preset.ts）仅消费已写入的 :root 变量，不直接引用本文件。
 */
export const COLOR_FAMILIES = {
  singleTokens: ['border', 'input', 'ring', 'background', 'foreground'] as const,
  pairFamilies: ['card', 'popover', 'secondary', 'muted'] as const,
  quadFamilies: ['primary', 'accent', 'destructive', 'warn', 'success'] as const,
  sidebar: {
    background: 'sidebar-background',
    foreground: 'sidebar-foreground',
    primary: 'sidebar-primary',
    'primary-foreground': 'sidebar-primary-foreground',
    accent: 'sidebar-accent',
    'accent-foreground': 'sidebar-accent-foreground',
    border: 'sidebar-border',
    ring: 'sidebar-ring',
  } as const,
} as const

// ---------------------------------------------------------------------------
// 主题引擎可调参数（便于调试与统一微调）
// ---------------------------------------------------------------------------
export const THEME_ENGINE = {
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
  /** 浅色模式下与白混合时白色的占比。降低此值可增强 tint，使 bg-*-light 在白底上更易辨认（0.60 ≈ 60% 白 / 40% 色） */
  lightMixWhiteWeight: 0.6,
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
