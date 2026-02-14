import {
  DIALOG_SETTINGS_WIDTH_PX,
  SIZE_PERSIST_KEY,
  SIZE_PRESETS,
  DEFAULT_SIZE_NAME,
} from '@/constants/size'
import {
  FONT_SCALE_RATIOS,
  SPACING_SCALE_RATIOS,
  RADIUS_SCALE_RATIOS,
  TRANSITION_SCALE_VALUES,
  SIZE_SCALE_KEYS,
} from '@/constants/sizeScale'
import { unpackDataSync } from '@/utils/safeStorage/core'
import { getDeviceTypeSync, getBreakpointSync } from '@/utils/deviceSync'

type ScaleKey = (typeof SIZE_SCALE_KEYS)[number]

/** 字体阶梯变量前缀：由 applyRootFontSize 负责写入，applySizeTheme 跳过 */
const FONT_SIZE_VAR_PREFIX = '--font-size-'

/**
 * 生成系统尺寸 CSS 变量 (含阶梯系统)
 *
 * @param preset - 尺寸预设对象
 * @returns 完整的 SizeCssVars 对象，包含所有尺寸相关的 CSS 变量
 *
 * 生成内容：
 * 1. 基础变量：圆角、间距单位、容器内边距
 * 2. 布局变量：侧边栏、头部、面包屑等尺寸
 * 3. 字体阶梯：xs 到 5xl（基于 fontSizeBase × FONT_SCALE_RATIOS）
 * 4. 间距阶梯：xs 到 5xl（基于 spacingBase × SPACING_SCALE_RATIOS）
 * 5. 圆角阶梯：xs 到 5xl（基于 radius × RADIUS_SCALE_RATIOS）
 * 6. 过渡阶梯：xs 到 5xl（固定毫秒值 TRANSITION_SCALE_VALUES）
 */
export function generateSizeVars(preset: SizePreset): SizeCssVars {
  // 使用 Partial<SizeCssVars> 构建，最后类型断言为完整类型
  const vars: Partial<SizeCssVars> = {
    // --- 基础变量 ---
    '--spacing-unit': `${preset.spacingBase}px`,
    '--container-padding': `${preset.spacingBase * 5}px`,

    // --- 布局变量 ---
    '--sidebar-width': `${preset.sidebarWidth}px`,
    '--sidebar-collapsed-width': `${preset.sidebarCollapsedWidth}px`,
    '--header-height': `${preset.headerHeight}px`,
    '--breadcrumb-height': `${preset.breadcrumbHeight}px`,
    '--footer-height': `${preset.footerHeight}px`,
    '--tabs-height': `${preset.tabsHeight}px`,
  }

  // --- 生成字体阶梯变量 (xs-5xl) ---
  // 注意：实际写入由 applyRootFontSize 负责（基于 device+breakpoint+preset），
  // applySizeTheme 会跳过这些键。此处保留以维持 SizeCssVars 类型完整及降级兼容。
  SIZE_SCALE_KEYS.forEach(key => {
    const size = preset.fontSizeBase * FONT_SCALE_RATIOS[key]
    vars[`--font-size-${key}`] = `${size}px`
  })

  // --- 生成间距阶梯变量 (xs-5xl) ---
  // 公式: spacingBase × SPACING_SCALE_RATIOS[key]
  SIZE_SCALE_KEYS.forEach(key => {
    const size = preset.spacingBase * SPACING_SCALE_RATIOS[key]
    vars[`--spacing-${key}`] = `${size}px`
  })

  // --- 生成圆角阶梯变量 (xs-5xl) ---
  // 公式: radius × RADIUS_SCALE_RATIOS[key]
  SIZE_SCALE_KEYS.forEach(key => {
    const size = preset.radius * RADIUS_SCALE_RATIOS[key]
    vars[`--radius-${key}`] = `${size}rem`
  })

  // --- 生成过渡时长阶梯变量 (xs-5xl) ---
  // 直接使用 TRANSITION_SCALE_VALUES 毫秒值
  SIZE_SCALE_KEYS.forEach(key => {
    vars[`--transition-${key}`] = `${TRANSITION_SCALE_VALUES[key]}ms`
  })

  // 类型断言：确保返回完整的 SizeCssVars
  // 由于我们按接口完整构建，这里可以安全断言
  return vars as SizeCssVars
}

/**
 * 将尺寸 CSS 变量应用到文档根元素
 *
 * @param vars - SizeCssVars 对象，包含所有要应用的 CSS 变量
 */
export function applySizeTheme(vars: SizeCssVars) {
  const root = document.documentElement
  Object.entries(vars).forEach(([key, value]) => {
    if (key.startsWith(FONT_SIZE_VAR_PREFIX)) return
    root.style.setProperty(key, value)
  })
  root.style.setProperty('--dialog-settings-width', `${DIALOG_SETTINGS_WIDTH_PX}px`)
}

interface RootFontSizeContext {
  deviceType: 'Mobile' | 'Tablet' | 'PC'
  breakpoint: ScaleKey
  preset: SizePreset
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
  const { deviceType, breakpoint, preset } = ctx

  // 移动端：保持稳定阅读体验，不随断点缩小
  if (deviceType === 'Mobile') {
    const scaleKey: ScaleKey = 'md'
    const base = preset.fontSizeBase
    const ratio = FONT_SCALE_RATIOS[scaleKey]
    const pixelValue = Math.max(15, base * ratio)
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
    const pixelValue = base * ratio
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
  const pixelValue = base * ratio

  return { scaleKey, pixelValue }
}

/**
 * 将根字号决策结果应用到文档根元素
 * 同时写入完整字体阶梯 --font-size-xs ~ --font-size-5xl，
 * 确保 var() 引用与 rem 解析统一跟随 device+breakpoint+preset
 */
export function applyRootFontSize(decision: RootFontSizeDecision) {
  const root = document.documentElement
  const base = decision.pixelValue

  root.style.setProperty('--font-size-root', `${base}px`)
  root.dataset.fontScale = decision.scaleKey

  SIZE_SCALE_KEYS.forEach(key => {
    const size = base * FONT_SCALE_RATIOS[key]
    root.style.setProperty(`--font-size-${key}`, `${size}px`)
  })
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
  const raw = localStorage.getItem(SIZE_PERSIST_KEY)
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
  applySizeTheme(vars)

  const deviceType = getDeviceTypeSync()
  const breakpoint = getBreakpointSync()
  const decision = decideRootFontSize({ deviceType, breakpoint, preset })
  applyRootFontSize(decision)
}
