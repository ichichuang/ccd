/**
 * Lottie Runtime Theming Engine
 *
 * 将 Lottie JSON 中的主色类颜色同步为系统主题，遵循 colorUsage 与数据不可变性。
 * 使用 HSL 色相迁移算法：保留原始明度以维持 3D 阴影/高光层次，仅替换色相和饱和度。
 */
import { deepClone } from '@/utils/lodashes'

/** HSL 格式，H/S/L 均为 0–1 */
export interface HslTuple {
  h: number
  s: number
  l: number
}

/** RGB 转 HSL（0–1 浮点），纯数学无副作用 */
export function rgbToHsl(r: number, g: number, b: number): HslTuple {
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return { h: 0, s: 0, l }
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h = 0
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
  else if (max === g) h = ((b - r) / d + 2) / 6
  else h = ((r - g) / d + 4) / 6
  return { h, s, l }
}

/** HSL 转 RGB（0–1 浮点），纯数学无副作用 */
export function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  if (s <= 0) return [l, l, l]
  const hue2rgb = (p: number, q: number, t: number): number => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q
  return [hue2rgb(p, q, h + 1 / 3), hue2rgb(p, q, h), hue2rgb(p, q, h - 1 / 3)]
}

/** Lottie 颜色格式：[r, g, b, a]，值域 0–1 */
export type LottieRgba = [number, number, number, number]

/** 支持的 CSS 主题 Token（不含 -- 前缀） */
export type ThemeTokenName =
  | 'primary'
  | 'primary-hover'
  | 'primary-light'
  | 'primary-foreground'
  | 'muted-foreground'
  | 'foreground'

/** SSR 回退色 */
const FALLBACKS: Record<ThemeTokenName, LottieRgba> = {
  primary: [0.23, 0.51, 0.96, 1],
  'primary-hover': [0.18, 0.45, 0.9, 1],
  'primary-light': [0.7, 0.8, 0.98, 1],
  'primary-foreground': [1, 1, 1, 1],
  'muted-foreground': [0.5, 0.5, 0.5, 1],
  foreground: [0.1, 0.1, 0.1, 1],
}

/** Loading 类型：1=页面 loading，2=展示用，3=全局 loading */
export type LoadingType = 1 | 2 | 3

/** 预设配置：按 loading 类型定制主题适配策略 */
export interface LottieThemePreset {
  /** 饱和度低于此值且配置了 neutralToken 时，用该 token 替换（提升深色背景可读性） */
  neutralToken?: ThemeTokenName
  /** 中性色饱和度上限，默认不启用；type 3 用 0.05 以替换文字/阴影等 */
  neutralSaturationMax?: number
  /** Fill 明度分界，默认 0.65 */
  luminanceThreshold?: number
  /** 主色类饱和度阈值，默认 0.15 */
  saturationThreshold?: number
}

/** 预设：type 1 灰云保留；type 2 默认；type 3 全局 loading 用 muted-foreground 替换中性色 */
export const LOTTIE_THEME_PRESETS: Record<LoadingType, LottieThemePreset> = {
  1: { luminanceThreshold: 0.65 },
  2: {},
  3: {
    neutralToken: 'muted-foreground',
    neutralSaturationMax: 0.05,
    luminanceThreshold: 0.65,
  },
}

/** 饱和度阈值：低于此值视为中性色（灰/白），不替换 */
const DEFAULT_SATURATION_THRESHOLD = 0.15

/** Fill 明度分界：低于此值用 primary，高于用 primary-hover（避免 primary-light 过浅） */
const LUMINANCE_THRESHOLD = 0.65

export interface ApplyThemeToLottieOptions {
  /** 饱和度阈值，默认 0.15 */
  saturationThreshold?: number
  /** 自定义主色，不传则从 --primary 读取 */
  primaryRgba?: LottieRgba
  /** 预设配置，与 loadingType 二选一；loadingType 会覆盖为对应预设 */
  preset?: LottieThemePreset
  /** 加载类型 1|2|3，自动应用 LOTTIE_THEME_PRESETS */
  loadingType?: LoadingType
}

/**
 * 从 document.documentElement 读取指定 Token，转为 Lottie 可用的 [r,g,b,1]（0–1）。
 * SSR 或 window 不存在时返回对应回退色。
 */
export function getTokenAsLottieRgba(token: ThemeTokenName): LottieRgba {
  if (typeof window === 'undefined') return FALLBACKS[token]

  const cssVar = token.startsWith('--') ? token : `--${token}`
  const raw = getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim()
  if (!raw) return FALLBACKS[token]

  const parts = raw.split(/\s+/).filter(Boolean)
  if (parts.length < 3) return FALLBACKS[token]

  const r = Number.parseFloat(parts[0])
  const g = Number.parseFloat(parts[1])
  const b = Number.parseFloat(parts[2])
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return FALLBACKS[token]

  return [r / 255, g / 255, b / 255, 1]
}

/** 兼容旧 API */
export function getPrimaryAsLottieRgba(): LottieRgba {
  return getTokenAsLottieRgba('primary')
}

/**
 * 计算 RGB 相对明度（0–1），用于按明度映射 Fill 颜色
 */
export function computeLuminance(rgba: number[]): number {
  const [r, g, b] = rgba
  return 0.299 * r + 0.587 * g + 0.114 * b
}

/** 计算 RGB 饱和度（0–1） */
function computeSaturation(rgba: number[]): number {
  const [r, g, b] = rgba
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  if (max < 0.01) return 0
  return (max - min) / max
}

/** 判断颜色是否为「主色类」（饱和度高于阈值），避免替换灰/白 */
function isPrimaryLike(rgba: number[], threshold: number): boolean {
  return computeSaturation(rgba) >= threshold
}

/**
 * HSL 色相迁移：将原色迁移到 primary 色相，保留原色明度以维持 3D 阴影/高光层次。
 * S_new = S_primary * min(1, S_orig / S_primary) 避免过度饱和原本柔和的中间调。
 */
function shiftToPrimary(originalRgba: number[], primaryRgba: LottieRgba): LottieRgba {
  const [r, g, b, a] = originalRgba
  const [rp, gp, bp] = primaryRgba

  const { s: sOrig, l: lOrig } = rgbToHsl(r, g, b)
  const { h: hPrimary, s: sPrimary, l: _lPrimary } = rgbToHsl(rp, gp, bp)

  const hNew = hPrimary
  const sNew = sPrimary <= 0 ? 0 : sPrimary * Math.min(1, sOrig / (sPrimary || 1e-6))
  const lNew = lOrig

  const [rNew, gNew, bNew] = hslToRgb(hNew, sNew, lNew)
  return [
    Math.max(0, Math.min(1, rNew)),
    Math.max(0, Math.min(1, gNew)),
    Math.max(0, Math.min(1, bNew)),
    a,
  ]
}

/** 判断是否为 Lottie 静态颜色节点 */
function isLottieStaticColor(obj: unknown): obj is { a: 0; k: number[] } {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'a' in obj &&
    (obj as { a: number }).a === 0 &&
    'k' in obj &&
    Array.isArray((obj as { k: unknown }).k) &&
    (obj as { k: number[] }).k.length >= 4
  )
}

/** 判断是否为 Lottie 动画颜色节点 */
function isLottieAnimatedColor(
  obj: unknown
): obj is { a: 1; k: Array<{ t: number; s?: number[] }> } {
  if (
    typeof obj !== 'object' ||
    obj === null ||
    !('a' in obj) ||
    (obj as { a: number }).a !== 1 ||
    !('k' in obj)
  )
    return false
  const k = (obj as { k: unknown }).k
  if (!Array.isArray(k) || k.length === 0) return false
  const first = k[0]
  return typeof first === 'object' && first !== null && 't' in first && 's' in first
}

/** 将 rgba 替换为 target */
function applyRgba(rgba: number[], target: LottieRgba): void {
  rgba[0] = target[0]
  rgba[1] = target[1]
  rgba[2] = target[2]
  rgba[3] = target[3]
}

interface ThemeTokens {
  primary: LottieRgba
  neutral?: LottieRgba
}

interface TraverseContext {
  strokeOnly?: boolean
}

interface TraversePreset {
  neutralToken?: ThemeTokenName
  neutralSaturationMax?: number
  luminanceThreshold: number
  saturationThreshold: number
}

/** 递归遍历并替换主色类颜色：HSL 色相迁移保留明度层次；中性色可替换为 neutralToken */
function traverseAndReplace(
  node: unknown,
  tokens: ThemeTokens,
  preset: TraversePreset,
  context?: TraverseContext
): void {
  const { saturationThreshold } = preset
  if (node === null || node === undefined) return

  if (typeof node === 'object') {
    if (Array.isArray(node)) {
      node.forEach(child => traverseAndReplace(child, tokens, preset, context))
      return
    }

    const obj = node as Record<string, unknown>

    if (obj.ty === 'gr' && Array.isArray(obj.it)) {
      const it = obj.it as Array<{ ty?: string }>
      const hasFill = it.some(item => item?.ty === 'fl')
      const hasStroke = it.some(item => item?.ty === 'st')
      const strokeOnly = hasStroke && !hasFill
      const childContext: TraverseContext = { strokeOnly }
      it.forEach(child => traverseAndReplace(child, tokens, preset, childContext))
      for (const [key, value] of Object.entries(obj)) {
        if (key !== 'it') traverseAndReplace(value, tokens, preset, context)
      }
      return
    }

    if ('c' in obj && typeof obj.c === 'object' && obj.c !== null) {
      const ty = obj.ty as string | undefined
      const c = obj.c

      const replaceColor = (rgba: number[]): void => {
        const sat = computeSaturation(rgba)
        const neutralMax = preset.neutralSaturationMax ?? -1
        const hasNeutral = preset.neutralToken != null && tokens.neutral != null

        if (hasNeutral && neutralMax >= 0 && sat < neutralMax) {
          applyRgba(rgba, tokens.neutral!)
          return
        }
        if (!isPrimaryLike(rgba, saturationThreshold)) return
        const shifted = shiftToPrimary(rgba, tokens.primary)
        applyRgba(rgba, shifted)
      }

      if (ty === 'st') {
        if (isLottieStaticColor(c)) {
          replaceColor(c.k)
        } else if (isLottieAnimatedColor(c)) {
          for (const keyframe of c.k) {
            const s = keyframe.s
            if (Array.isArray(s) && s.length >= 4) replaceColor(s)
          }
        }
      } else if (ty === 'fl') {
        if (isLottieStaticColor(c)) {
          replaceColor(c.k)
        } else if (isLottieAnimatedColor(c)) {
          for (const keyframe of c.k) {
            const s = keyframe.s
            if (Array.isArray(s) && s.length >= 4) replaceColor(s)
          }
        }
      }
    }

    for (const value of Object.values(node)) {
      traverseAndReplace(value, tokens, preset, context)
    }
  }
}

/**
 * 对 Lottie JSON 应用主题色，不修改原对象（使用 deepClone）。
 * 主色类使用 HSL 色相迁移（保留原色明度以维持 3D 层次）；中性色可替换为 neutralToken。
 * 支持 preset/loadingType 定制中性色替换策略。
 */
export function applyThemeToLottieJson(
  json: object,
  options: ApplyThemeToLottieOptions = {}
): object {
  const cloned = deepClone(json)

  const basePreset = options.loadingType != null ? LOTTIE_THEME_PRESETS[options.loadingType] : {}
  const merged = { ...basePreset, ...options.preset }

  const preset: TraversePreset = {
    saturationThreshold: merged.saturationThreshold ?? DEFAULT_SATURATION_THRESHOLD,
    luminanceThreshold: merged.luminanceThreshold ?? LUMINANCE_THRESHOLD,
    neutralToken: merged.neutralToken,
    neutralSaturationMax: merged.neutralSaturationMax,
  }

  const primary = options.primaryRgba ?? getTokenAsLottieRgba('primary')
  const tokens: ThemeTokens = { primary }
  if (preset.neutralToken != null) {
    tokens.neutral = getTokenAsLottieRgba(preset.neutralToken)
  }

  traverseAndReplace(cloned, tokens, preset)
  return cloned
}
