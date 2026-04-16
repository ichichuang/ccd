import type { PluginOption } from 'vite'
import { brand } from '../src/constants/brand'
import { RUNTIME_QUERY_KEYS, RUNTIME_STORAGE_KEYS } from '../src/constants/runtime'
import { THEME_PRESETS, DEFAULT_THEME_MODE, DEFAULT_THEME_NAME } from '../src/constants/theme'
import { generateThemeVars } from '../src/utils/theme/engine'
import type { ViteEnv } from './utils'

/**
 * 从 API 基址生成 preconnect + dns-prefetch（仅绝对 http(s) URL）
 */
function buildApiOriginResourceHints(apiBaseUrl: string): string {
  const trimmed = apiBaseUrl?.trim()
  if (!trimmed) return ''
  try {
    const u = new URL(trimmed)
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return ''
    const origin = u.origin
    return `    <link rel="preconnect" href="${origin}" crossorigin />\n    <link rel="dns-prefetch" href="${origin}" />\n\n`
  } catch {
    return ''
  }
}

/**
 * 在构建/开发时向 index.html 注入品牌配置
 * 数据源：src/constants/brand.ts
 *
 * Phase 13.33: 注入主题变量 fallback，消除 First Paint 时的 CSS 变量真空期 (Anti-FOIT)
 * 数据源：src/constants/theme.ts，无硬编码颜色
 */
export function configHtmlPlugin(env: ViteEnv): PluginOption {
  const resourceHints = buildApiOriginResourceHints(env.VITE_API_BASE_URL ?? '')

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
      // 注入到 <title> 之后：API 资源提示（可选）+ theme fallback
      html = html.replace(/(<title>[^<]+<\/title>\s*)/, `$1\n${resourceHints}${themeFallbackBlock}`)

      // 2. 品牌配置占位符替换
      return html
        .replace(/%BRAND_NAME%/g, brand.name)
        .replace(/%BRAND_SLOGAN%/g, brand.slogan)
        .replace(/%BRAND_AUTHOR%/g, brand.author)
        .replace(/%BRAND_FAVICON%/g, `${env.BASE_URL ?? '/'}face.png`)
        .replace(/%DEFAULT_THEME_MODE%/g, DEFAULT_THEME_MODE)
        .replace(/%THEME_MODE_STORAGE_KEY%/g, RUNTIME_STORAGE_KEYS.themeMode)
        .replace(/%THEME_PRIMARY_STORAGE_KEY%/g, RUNTIME_STORAGE_KEYS.themePrimary)
        .replace(/%THEME_BACKGROUND_STORAGE_KEY%/g, RUNTIME_STORAGE_KEYS.themeBackground)
        .replace(/%E2E_MODE_STORAGE_KEY%/g, RUNTIME_STORAGE_KEYS.e2eMode)
        .replace(/%E2E_MODE_QUERY_KEY%/g, RUNTIME_QUERY_KEYS.e2eMode)
        .replace(/%E2E_PRELOADER_HOLD_QUERY_KEY%/g, RUNTIME_QUERY_KEYS.e2ePreloaderHold)
    },
  }
}

/**
 * 从 theme.ts 读取默认主题的 light/dark 色值，生成 CSS 变量 fallback
 * 与 index.html 的 bootstrap-preload.js 逻辑一致：按 DEFAULT_THEME_MODE 进行系统暗色判断
 */
function generateThemeFallbackCss(): string {
  const defaultPreset = THEME_PRESETS.find(p => p.name === DEFAULT_THEME_NAME) ?? THEME_PRESETS[0]

  const lightVars = generateThemeVars(defaultPreset, false)
  const darkVars = generateThemeVars(defaultPreset, true)

  const varsToCssText = (vars: unknown): string =>
    Object.entries(vars as Record<string, string>)
      .map(([key, value]) => ` ${key}: ${value};`)
      .join('')

  return `    :root {${varsToCssText(lightVars)} }
    :root.dark {${varsToCssText(darkVars)} }`
}
