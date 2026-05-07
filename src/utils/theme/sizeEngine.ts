import {
  DIALOG_SETTINGS_WIDTH_PX,
  SIZE_PERSIST_KEY,
  SIZE_PRESETS,
  DEFAULT_SIZE_NAME,
} from '@/constants/size'
import {
  FONT_SCALE_RATIOS,
  LAYOUT_SCALE_RATIOS,
  SPACING_SCALE_RATIOS,
  RADIUS_SCALE_RATIOS,
  SIZE_SCALE_KEYS,
  TRANSITION_SCALE_MS,
} from '@/constants/sizeScale'
import { unpackDataSync } from '@/utils/safeStorage/core'
import { getDeviceTypeSync, getBreakpointSync } from '@/utils/deviceSync'

type ScaleKey = (typeof SIZE_SCALE_KEYS)[number]

/** 字体阶梯变量前缀：由 applyRootFontSize 负责写入，applySizeTheme 跳过 */
const FONT_SIZE_VAR_PREFIX = '--font-size-'

/**
 * 生成系统尺寸 CSS 变量 (仅阶梯与基础变量，不含布局尺寸)
 *
 * 布局变量（--sidebar-width、--header-height 等）由 decideLayoutDimensions + applyLayoutDimensions
 * 按 device + breakpoint 动态计算并注入。
 *
 * @param preset - 尺寸预设对象
 * @returns 不含布局变量的 SizeCssVars 子集（基础 + 间距/圆角/过渡阶梯 + 字体占位）
 *
 * 生成内容：
 * 1. 基础变量：圆角、间距单位、容器内边距
 * 2. 字体阶梯占位（实际写入由 applyRootFontSize 负责，applySizeTheme 跳过）
 * 3. 间距阶梯：xs 到 5xl
 * 4. 圆角阶梯：xs 到 5xl
 * 5. 过渡阶梯：xs 到 5xl
 *
 * @see sizeMetrics.ts 同源 px 推导（供 TS / ECharts 等使用，与上式一致）
 */
export function generateSizeVars(preset: SizePreset): Partial<SizeCssVars> {
  const controlHeight = Math.round(preset.fontSizeBase + preset.spacingBase * 5)
  const controlHeightSm = Math.round(preset.fontSizeBase * 0.96 + preset.spacingBase * 4)
  const controlHeightLg = Math.round(preset.fontSizeBase * 1.125 + preset.spacingBase * 6)

  const vars: Partial<SizeCssVars> = {
    // --- 基础变量 ---
    '--spacing-unit': `${preset.spacingBase}px`,
    '--container-padding': `${preset.spacingBase * 5}px`,
    '--control-height': `${controlHeight}px`,
    '--control-height-sm': `${controlHeightSm}px`,
    '--control-height-lg': `${controlHeightLg}px`,
    '--control-action-size': `${controlHeight}px`,
    '--control-action-size-sm': `${controlHeightSm}px`,
    '--control-action-size-lg': `${controlHeightLg}px`,
  }

  // --- 字体阶梯占位（applySizeTheme 会跳过，由 applyRootFontSize 写入）---
  SIZE_SCALE_KEYS.forEach(key => {
    const size = Math.round(preset.fontSizeBase * FONT_SCALE_RATIOS[key])
    vars[`--font-size-${key}` as keyof SizeCssVars] = `${size}px`
  })

  // --- 间距阶梯变量 (xs-5xl) ---
  SIZE_SCALE_KEYS.forEach(key => {
    const size = preset.spacingBase * SPACING_SCALE_RATIOS[key]
    vars[`--spacing-${key}` as keyof SizeCssVars] = `${size}px`
  })

  // --- 圆角阶梯变量 (xs-5xl) ---
  SIZE_SCALE_KEYS.forEach(key => {
    const size = preset.radius * RADIUS_SCALE_RATIOS[key]
    const pixel = Math.round(size)
    vars[`--radius-${key}` as keyof SizeCssVars] = `${pixel}px`
  })

  // --- 过渡时长阶梯变量 (xs-5xl) ---
  SIZE_SCALE_KEYS.forEach(key => {
    vars[`--transition-${key}` as keyof SizeCssVars] = `${TRANSITION_SCALE_MS[key]}ms`
  })

  return vars
}

/**
 * 将尺寸 CSS 变量应用到文档根元素（不含布局变量，布局由 applyLayoutDimensions 负责）
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
 * 根据设备类型与断点计算布局尺寸 CSS 变量（双轨：预设 + 断点）
 * Mobile/Tablet 不缩放 (ratio=1)；PC 使用 LAYOUT_SCALE_RATIOS[breakpoint]
 */
export function decideLayoutDimensions(ctx: RootFontSizeContext): Record<string, string> {
  const { deviceType, breakpoint, preset } = ctx
  const ratio =
    deviceType === 'Mobile' || deviceType === 'Tablet' ? 1 : (LAYOUT_SCALE_RATIOS[breakpoint] ?? 1)

  return {
    '--sidebar-width': `${preset.sidebarWidth * ratio}px`,
    '--sidebar-collapsed-width': `${preset.sidebarCollapsedWidth * ratio}px`,
    '--header-height': `${preset.headerHeight * ratio}px`,
    '--breadcrumb-height': `${preset.breadcrumbHeight * ratio}px`,
    '--footer-height': `${preset.footerHeight * ratio}px`,
    '--tabs-height': `${preset.tabsHeight * ratio}px`,
  }
}

/**
 * 将布局尺寸 CSS 变量应用到文档根元素
 * @deprecated 运行时路径请使用 applyRuntimeSizeUpdate 合并写入
 */
export function applyLayoutDimensions(dimensions: Record<string, string>) {
  const root = document.documentElement
  Object.entries(dimensions).forEach(([key, value]) => {
    root.style.setProperty(key, value)
  })
}

/**
 * 运行时批量应用根字号 + 布局尺寸 CSS 变量（单次 cssText 写入）
 *
 * 替代 applyRootFontSize + applyLayoutDimensions 的分散调用，
 * 将 ~16 次 setProperty 合并为单次 cssText 原子更新，
 * 避免 resize 跨越断点时触发多次 style recalc。
 */
export function applyRuntimeSizeUpdate(
  decision: RootFontSizeDecision,
  layoutDimensions: Record<string, string>
): void {
  const root = document.documentElement

  // 收集字体 + 布局变量
  const newVars: Record<string, string> = {}

  // 字体阶梯变量
  const base: number = decision.pixelValue
  newVars['--font-size-root'] = `${base}px`
  SIZE_SCALE_KEYS.forEach(key => {
    const size: number = base * FONT_SCALE_RATIOS[key]
    newVars[`--font-size-${key}`] = `${size}px`
  })

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

interface RootFontSizeContext {
  deviceType: 'Mobile' | 'Tablet' | 'PC'
  breakpoint: ScaleKey
  preset: SizePreset
  pixelRatio?: number
}

interface RootFontSizeDecision {
  scaleKey: ScaleKey
  pixelValue: number
}

/**
 * 根字号决策：根据设备类型 + 断点 + 尺寸预设，计算合适的字体阶梯与像素值
 *
 * 规则：
 * - Mobile：忽略断点，统一使用 md 档，并且不小于 15px
 * - Tablet：xs/sm -> md，md/lg -> lg，其余 -> xl
 * - PC：xs -> sm，sm -> md，md/lg/xl -> 自身，2xl 及以上统一 capped 为 2xl
 */
export function decideRootFontSize(ctx: RootFontSizeContext): RootFontSizeDecision {
  const { deviceType, breakpoint, preset, pixelRatio = 1 } = ctx

  // 移动端：保持稳定阅读体验，不随断点缩小
  if (deviceType === 'Mobile') {
    const scaleKey: ScaleKey = 'md'
    const base = preset.fontSizeBase
    const ratio = FONT_SCALE_RATIOS[scaleKey]
    const minBase = pixelRatio >= 3 ? 16 : 15
    const raw = base * ratio
    const pixelValue = Math.max(minBase, Math.round(raw))
    return { scaleKey, pixelValue }
  }

  // 平板：适度随断点放大，但限制在 md~xl 范围
  if (deviceType === 'Tablet') {
    let scaleKey: ScaleKey
    switch (breakpoint) {
      case 'xs':
      case 'sm':
        scaleKey = 'md'
        break
      case 'md':
      case 'lg':
        scaleKey = 'lg'
        break
      default:
        scaleKey = 'xl'
        break
    }
    const base = preset.fontSizeBase
    const ratio = FONT_SCALE_RATIOS[scaleKey]
    const pixelValue = Math.round(base * ratio)
    return { scaleKey, pixelValue }
  }

  // PC：大致跟随断点梯度，但在极小/极大两端做夹逼处理
  let scaleKey: ScaleKey
  switch (breakpoint) {
    case 'xs':
      scaleKey = 'sm'
      break
    case 'sm':
    case 'md':
    case 'lg':
    case 'xl':
      scaleKey = 'md'
      break
    case '2xl':
    case '3xl':
      scaleKey = 'lg'
      break
    case '4xl':
      scaleKey = 'xl'
      break
    case '5xl':
      scaleKey = '2xl'
      break
    default:
      scaleKey = 'md'
      break
  }

  const base = preset.fontSizeBase
  const ratio = FONT_SCALE_RATIOS[scaleKey]
  const pixelValue = Math.round(base * ratio)

  return { scaleKey, pixelValue }
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
 * 专为 preload() 路径设计，将 applySizeTheme + applyRootFontSize + applyLayoutDimensions
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

  // 字体阶梯变量
  const base: number = decision.pixelValue
  allVars['--font-size-root'] = `${base}px`
  SIZE_SCALE_KEYS.forEach(key => {
    const size: number = Math.round(base * FONT_SCALE_RATIOS[key])
    allVars[`--font-size-${key}`] = `${size}px`
  })

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

  const vars = generateSizeVars(preset)

  const deviceType = getDeviceTypeSync()
  const breakpoint = getBreakpointSync()
  const pixelRatio = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
  const ctx: RootFontSizeContext = { deviceType, breakpoint, preset, pixelRatio }
  const decision = decideRootFontSize(ctx)
  const layoutDimensions = decideLayoutDimensions(ctx)

  // 单次 cssText 写入：阶梯 + 字体 + 布局，消除首帧 FOUC
  applyAllSizeVars(vars, decision, layoutDimensions)
}

/**
 * 解析尺寸模式对应的预设（与 size store / preload 同源回退链）
 */
export function getPresetBySizeMode(mode: SizeMode): SizePreset {
  return (
    SIZE_PRESETS.find(p => p.name === mode) ??
    SIZE_PRESETS.find(p => p.name === DEFAULT_SIZE_NAME) ??
    SIZE_PRESETS[0]
  )
}

/**
 * ProTable 等组件在子树根上局部覆盖「内容区」尺寸变量（不修改 :root），
 * 与 `generateSizeVars(preset)` 同源，含间距/圆角/过渡/字体阶梯及 `--font-size-root`。
 * 不含布局壳层变量（侧栏、顶栏高度等），故不影响全局 Shell。
 */
export function getScopedContentSizeVars(mode: SizeMode): Record<string, string> {
  const preset = getPresetBySizeMode(mode)
  const vars = generateSizeVars(preset)
  const out: Record<string, string> = {}
  for (const [key, value] of Object.entries(vars)) {
    if (value != null) out[key] = value
  }
  out['--font-size-root'] = `${preset.fontSizeBase}px`
  return out
}
