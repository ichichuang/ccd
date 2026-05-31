import {
  DEFAULT_SIZE_NAME,
  DIALOG_SETTINGS_WIDTH_PX,
  FONT_SCALE_RATIOS,
  SIZE_FONT_VAR_PREFIX,
  SIZE_PRESETS,
  SIZE_SCALE_KEYS,
  decideLayoutDimensions as decideDesignLayoutDimensions,
  decideRootFontSize as decideDesignRootFontSize,
  deriveRuntimeFontSizeVars,
  generateSizeVars as generateDesignSizeVars,
  getScopedContentSizeVars as getDesignScopedContentSizeVars,
  resolveSizePreset,
} from '@ccd/design-tokens'
import type {
  RootFontSizeContext,
  RootFontSizeDecision,
  SizeCssVars,
  SizeMode,
  SizePreset,
} from '@ccd/design-tokens'
import { SIZE_PERSIST_KEY } from '@/constants/size'
import { unpackDataSync } from '@/utils/safeStorage/core'
import { getDeviceTypeSync, getBreakpointSync } from '@/utils/deviceSync'

export {
  decideDesignLayoutDimensions as decideLayoutDimensions,
  decideDesignRootFontSize as decideRootFontSize,
  generateDesignSizeVars as generateSizeVars,
}
export type { RootFontSizeContext, RootFontSizeDecision } from '@ccd/design-tokens'

/** 字体阶梯变量前缀：由 applyRootFontSize 负责写入，applySizeTheme 跳过 */
const FONT_SIZE_VAR_PREFIX = SIZE_FONT_VAR_PREFIX

/**
 * 将尺寸 CSS 变量应用到文档根元素（不含布局变量，布局由 applyRuntimeSizeUpdate 负责）
 *
 * 使用单次 cssText 更新替代多次 setProperty，与 engine.ts:applyTheme 保持一致，
 * 避免 ~30 次 style attribute mutation 导致的闪烁。
 *
 * @param vars - SizeCssVars 子集，可不含布局键
 */
export function applySizeTheme(vars: Partial<SizeCssVars>) {
  const root = document.documentElement

  // 收集需要写入的尺寸变量（跳过字体阶梯，由 applyRootFontSize 负责）
  const sizeVars: Record<string, string> = {
    '--dialog-settings-width': `${DIALOG_SETTINGS_WIDTH_PX}px`,
  }
  Object.entries(vars).forEach(([key, value]) => {
    if (key.startsWith(FONT_SIZE_VAR_PREFIX)) return
    if (value != null) sizeVars[key] = value
  })

  // 保留当前所有非尺寸变量的样式
  const sizeVarKeys = new Set(Object.keys(sizeVars))
  const currentStyles: Record<string, string> = {}
  for (let i = 0; i < root.style.length; i++) {
    const prop: string = root.style[i]
    if (!sizeVarKeys.has(prop)) {
      currentStyles[prop] = root.style.getPropertyValue(prop)
    }
  }

  // 合并并单次原子更新
  const allStyles = { ...currentStyles, ...sizeVars }
  root.style.cssText = Object.entries(allStyles)
    .map(([key, value]) => `${key}: ${value}`)
    .join('; ')
}

/**
 * 运行时批量应用根字号 + 布局尺寸 CSS 变量（单次 cssText 写入）
 *
 * 替代 applyRootFontSize 的分散调用，
 * 将 ~16 次 setProperty 合并为单次 cssText 原子更新，
 * 避免 resize 跨越断点时触发多次 style recalc。
 */
export function applyRuntimeSizeUpdate(
  decision: RootFontSizeDecision,
  layoutDimensions: Record<string, string>
): void {
  const root = document.documentElement

  const newVars: Record<string, string> = deriveRuntimeFontSizeVars(decision)

  // 布局尺寸变量
  Object.entries(layoutDimensions).forEach(([key, value]) => {
    newVars[key] = value
  })

  // 保留当前所有非目标变量的样式（如主题色、阶梯间距等）
  const newKeys = new Set(Object.keys(newVars))
  const currentStyles: Record<string, string> = {}
  for (let i = 0; i < root.style.length; i++) {
    const prop: string = root.style[i]
    if (!newKeys.has(prop)) {
      currentStyles[prop] = root.style.getPropertyValue(prop)
    }
  }

  // 单次原子更新
  const merged = { ...currentStyles, ...newVars }
  root.style.cssText = Object.entries(merged)
    .map(([key, value]) => `${key}: ${value}`)
    .join('; ')

  root.dataset.fontScale = decision.scaleKey
}

/**
 * 将根字号决策结果应用到文档根元素
 * 同时写入完整字体阶梯 --font-size-xs ~ --font-size-5xl，
 * 确保 var() 引用与像素字号统一跟随 device+breakpoint+preset
 */
export function applyRootFontSize(decision: RootFontSizeDecision) {
  const root = document.documentElement
  const base = decision.pixelValue

  root.style.setProperty('--font-size-root', `${base}px`)
  root.dataset.fontScale = decision.scaleKey

  SIZE_SCALE_KEYS.forEach(key => {
    const size = Math.round(base * FONT_SCALE_RATIOS[key])
    root.style.setProperty(`--font-size-${key}`, `${size}px`)
  })
}

/**
 * 批量应用所有尺寸相关 CSS 变量（阶梯 + 字体 + 布局），单次 cssText 写入
 * 专为 preload() 路径设计，将 applySizeTheme + applyRootFontSize
 * 合并为单次 DOM mutation，消除首帧 FOUC。
 */
export function applyAllSizeVars(
  vars: Partial<SizeCssVars>,
  decision: RootFontSizeDecision,
  layoutDimensions: Record<string, string>
): void {
  const root = document.documentElement

  // 收集全部变量到单一 map
  const allVars: Record<string, string> = {
    '--dialog-settings-width': `${DIALOG_SETTINGS_WIDTH_PX}px`,
  }

  // 阶梯变量（跳过字体，字体由下方 decision 统一写入）
  Object.entries(vars).forEach(([key, value]) => {
    if (key.startsWith(FONT_SIZE_VAR_PREFIX)) return
    if (value != null) allVars[key] = value
  })

  Object.assign(allVars, deriveRuntimeFontSizeVars(decision))

  // 布局尺寸变量
  Object.entries(layoutDimensions).forEach(([key, value]) => {
    allVars[key] = value
  })

  // 保留非尺寸变量（如主题色变量）
  const newKeys = new Set(Object.keys(allVars))
  const currentStyles: Record<string, string> = {}
  for (let i = 0; i < root.style.length; i++) {
    const prop: string = root.style[i]
    if (!newKeys.has(prop)) {
      currentStyles[prop] = root.style.getPropertyValue(prop)
    }
  }

  // 单次原子更新
  const merged = { ...currentStyles, ...allVars }
  root.style.cssText = Object.entries(merged)
    .map(([key, value]) => `${key}: ${value}`)
    .join('; ')

  root.dataset.fontScale = decision.scaleKey
}

/** Size 持久化 state 形状（与 stores/modules/size 的 state 一致） */
interface SizePersistState {
  sizeName?: SizeMode
}

/**
 * 在 createApp/mount 前同步注入尺寸与根字号变量，消除首帧 FOUC
 * 仅浏览器环境执行；SSR 时直接 return
 */
export function preload(): void {
  if (typeof document === 'undefined') return

  let sizeName: SizeMode | undefined
  let raw: string | null = null
  try {
    // Technical first-paint exception: preload must read before Pinia mounts.
    // Payload is still safeStorage-packed by useSizeStore's encrypted serializer.
    raw = localStorage.getItem(SIZE_PERSIST_KEY)
  } catch {
    // Safari 隐私模式旧版本可能抛出异常，使用默认值
  }
  if (raw?.trim()) {
    const state = unpackDataSync<SizePersistState>(raw)
    if (state != null && state.sizeName) {
      sizeName = state.sizeName as SizeMode
    } else {
      try {
        const parsed = JSON.parse(raw) as SizePersistState
        if (parsed?.sizeName) sizeName = parsed.sizeName as SizeMode
      } catch {
        // 忽略无效 JSON，使用默认
      }
    }
  }

  const preset =
    SIZE_PRESETS.find(p => p.name === sizeName) ||
    SIZE_PRESETS.find(p => p.name === DEFAULT_SIZE_NAME) ||
    SIZE_PRESETS[0]

  const vars = generateDesignSizeVars(preset)

  const deviceType = getDeviceTypeSync()
  const breakpoint = getBreakpointSync()
  const pixelRatio = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
  const ctx: RootFontSizeContext = { deviceType, breakpoint, preset, pixelRatio }
  const decision = decideDesignRootFontSize(ctx)
  const layoutDimensions = decideDesignLayoutDimensions(ctx)

  // 单次 cssText 写入：阶梯 + 字体 + 布局，消除首帧 FOUC
  applyAllSizeVars(vars, decision, layoutDimensions)
}

/**
 * 解析尺寸模式对应的预设（与 size store / preload 同源回退链）
 */
export function getPresetBySizeMode(mode: SizeMode): SizePreset {
  return resolveSizePreset(mode, SIZE_PRESETS, DEFAULT_SIZE_NAME)
}

/**
 * ProTable 等组件在子树根上局部覆盖「内容区」尺寸变量（不修改 :root），
 * 与 `generateSizeVars(preset)` 同源，含间距/圆角/过渡/字体阶梯及 `--font-size-root`。
 * 不含布局壳层变量（侧栏、顶栏高度等），故不影响全局 Shell。
 */
export function getScopedContentSizeVars(mode: SizeMode): Record<string, string> {
  return getDesignScopedContentSizeVars(mode, SIZE_PRESETS, DEFAULT_SIZE_NAME)
}
