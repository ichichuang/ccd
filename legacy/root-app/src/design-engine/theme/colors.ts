import { COLOR_FAMILIES } from '../../utils/theme/metadata'

/**
 * UnoCSS 语义色映射：与主题引擎写入的「空格分隔 RGB 通道」变量（如 `--primary: 8 145 178`）配套。
 *
 * 必须使用 Uno/Tailwind 标准占位符 `<alpha-value>`，`bg-primary/50` 才会生成
 * `rgb(var(--primary) / 0.5)`。若写成无占位符的 `rgb(var(--primary))`，解析可能退化为非法形式。
 *
 * @param cssVarBaseName - 不含 `--` 的变量名，如 `primary`、`card-foreground`、`sidebar-primary`
 */
export function themeRgbVar(cssVarBaseName: string): string {
  return `rgb(var(--${cssVarBaseName}) / <alpha-value>)`
}

/**
 * 构建 `theme.colors` 中与 COLOR_FAMILIES 对齐的整棵颜色树（Single / Pair / Quad / Sidebar）。
 */
export function buildSemanticThemeColors(): Record<string, string | Record<string, string>> {
  const colors: Record<string, string | Record<string, string>> = {}
  const v = themeRgbVar

  for (const token of COLOR_FAMILIES.singleTokens) {
    colors[token] = v(token)
  }

  for (const family of COLOR_FAMILIES.pairFamilies) {
    colors[family] = {
      DEFAULT: v(family),
      foreground: v(`${family}-foreground`),
    }
  }

  for (const family of COLOR_FAMILIES.quadFamilies) {
    colors[family] = {
      DEFAULT: v(family),
      foreground: v(`${family}-foreground`),
      hover: v(`${family}-hover`),
      'hover-foreground': v(`${family}-hover-foreground`),
      light: v(`${family}-light`),
      'light-foreground': v(`${family}-light-foreground`),
    }
  }

  colors.sidebar = {
    DEFAULT: v(COLOR_FAMILIES.sidebar.background),
    foreground: v(COLOR_FAMILIES.sidebar.foreground),
    primary: v(COLOR_FAMILIES.sidebar.primary),
    'primary-foreground': v(COLOR_FAMILIES.sidebar['primary-foreground']),
    accent: v(COLOR_FAMILIES.sidebar.accent),
    'accent-foreground': v(COLOR_FAMILIES.sidebar['accent-foreground']),
    border: v(COLOR_FAMILIES.sidebar.border),
    ring: v(COLOR_FAMILIES.sidebar.ring),
  }

  return colors
}
