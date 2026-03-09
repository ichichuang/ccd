import type { PluginOption } from 'vite'
import { brand } from '../src/constants/brand'
import { THEME_PRESETS, DEFAULT_THEME_NAME } from '../src/constants/theme'
import { hexToRgb } from '../src/utils/theme/colors'

/**
 * 在构建/开发时向 index.html 注入品牌配置
 * 数据源：src/constants/brand.ts
 *
 * Phase 13.33: 注入主题变量 fallback，消除 First Paint 时的 CSS 变量真空期 (Anti-FOIT)
 * 数据源：src/constants/theme.ts，无硬编码颜色
 */
export function configHtmlPlugin(): PluginOption {
  return {
    name: 'vite:html-inject',
    transformIndexHtml(html: string) {
      // 1. 注入主题 fallback（必须在 theme-mode 脚本之前，确保 First Paint 时变量已存在）
      const themeFallback = generateThemeFallbackCss()
      const themeFallbackBlock = `    <style id="theme-fallback">
    /* Injected by Vite at build-time to prevent FOIT (Phase 13.33) */
${themeFallback}
    </style>

`
      // 注入到 <title> 之后、第一个 <script> 之前
      html = html.replace(/(<title>[^<]+<\/title>\s*)/, `$1\n${themeFallbackBlock}`)

      // 2. 品牌配置占位符替换
      return html
        .replace(/%BRAND_NAME%/g, brand.name)
        .replace(/%BRAND_SLOGAN%/g, brand.slogan)
        .replace(/%BRAND_AUTHOR%/g, brand.author)
    },
  }
}

/**
 * 从 theme.ts 读取默认主题的 light/dark 色值，生成 CSS 变量 fallback
 * 与 index.html theme-mode 脚本逻辑一致：默认 dark，:root.dark 覆盖 light 值
 */
function generateThemeFallbackCss(): string {
  const preset = THEME_PRESETS.find(p => p.name === DEFAULT_THEME_NAME) ?? THEME_PRESETS[0]
  const light = preset.colors?.light
  const dark = preset.colors?.dark

  const lightBg = light?.background ?? '#ffffff'
  const lightFg = light?.foreground ?? '#09090b'
  const darkBg = dark?.background ?? '#09090b'
  const darkFg = dark?.foreground ?? '#fafafa'

  return `    :root { --background: ${hexToRgb(lightBg)}; --foreground: ${hexToRgb(lightFg)}; }
    :root.dark { --background: ${hexToRgb(darkBg)}; --foreground: ${hexToRgb(darkFg)}; }`
}
