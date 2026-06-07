/**
 * 主题切换动画策略工具
 * 支持多种过渡模式：circle, curtain, diamond, implosion, glitch, fade
 * 含主题过渡锁（打破 theme store ↔ useThemeSwitch 循环依赖）
 */

import { getDeviceTypeSync } from '@/adapters/device.adapter'
import { rgbToHex } from './colors'

// 主题过渡锁：防止 store.refreshTheme 在动画期间被外部触发（从 useThemeSwitch 抽离，避免循环依赖）
// ⚠️ 模块级全局状态，按 05-state-boundaries.mdc 应迁入 Pinia，但此处刻意放在模块作用域以打破
// useThemeSwitch ↔ themeStore 循环依赖。若未来依赖链解除，应迁移至 useThemeStore。
let isThemeTransitionLocked = false
export function isThemeLocked(): boolean {
  return isThemeTransitionLocked
}
export function setThemeLocked(value: boolean): void {
  isThemeTransitionLocked = value
}

export interface TransitionConfig {
  duration: number
  easing: string
  /**
   * 蒙层配置，当前所有模式均返回 { opacity: 0, blur: 0 }（即不创建蒙层）。
   * 保留为预留扩展点：未来若需在 View Transition 中叠加颜色蒙层，可在此配置 opacity > 0。
   */
  overlay?: {
    opacity: number
    blur?: number
  }
}

const DEFAULT_EASING = 'cubic-bezier(0.4, 0, 0.2, 1)'

/**
 * 计算圆形扩散半径
 */
export function calculateCircleRadius(x: number, y: number): number {
  const maxX = Math.max(x, window.innerWidth - x)
  const maxY = Math.max(y, window.innerHeight - y)
  return Math.hypot(maxX, maxY)
}

/**
 * 计算菱形扩散半径（用于 diamond 模式）
 * 使用对角线长度确保完全覆盖屏幕
 */
export function calculateDiamondRadius(x: number, y: number): number {
  const maxX = Math.max(x, window.innerWidth - x)
  const maxY = Math.max(y, window.innerHeight - y)
  return Math.max(maxX, maxY) * Math.SQRT2
}

/**
 * 从 CSS 变量获取背景色（RGB 格式转换为 Hex）
 * 优化：避免重复获取同一变量
 */
export function getBackgroundColor(cssVar: string = '--background'): string {
  const rgbValue = getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim()

  if (!rgbValue) {
    // 如果 cssVar 就是 '--background'，直接返回默认值，避免重复获取
    if (cssVar === '--background') {
      return '#ffffff'
    }
    // 否则尝试获取默认背景色
    const fallback = getComputedStyle(document.documentElement)
      .getPropertyValue('--background')
      .trim()
    return fallback ? rgbToHex(fallback) : '#ffffff'
  }

  return rgbToHex(rgbValue)
}

/**
 * 获取过渡动画配置
 * @param mode 过渡模式
 * @param _event 鼠标事件（用于 circle/diamond 等模式计算坐标）
 * @param durationMs 自定义过渡时长 (ms)，默认 400
 */
export function getTransitionConfig(
  mode: ThemeTransitionMode,
  _event: MouseEvent | null,
  durationMs: number = 400
): TransitionConfig {
  const duration = durationMs
  const glitchDuration = Math.round(durationMs * 0.8)

  switch (mode) {
    case 'circle':
    case 'curtain':
    case 'diamond':
    case 'implosion':
    case 'fade':
    default: {
      return {
        duration,
        easing: DEFAULT_EASING,
        overlay: { opacity: 0, blur: 0 },
      }
    }

    case 'glitch': {
      return {
        duration: glitchDuration,
        easing: 'steps(4, end)',
        overlay: { opacity: 0, blur: 0 },
      }
    }
  }
}

function isPrefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Graceful Degradation:
 * - Mobile/Tablet: 强制使用 fade（避免 clip-path/circle/diamond 等 CPU-bound 几何计算）
 * - prefers-reduced-motion: 强制使用 fade
 * - PC: 保持用户请求的 transitionMode
 */
export function resolveTransitionMode(requestedMode: ThemeTransitionMode): ThemeTransitionMode {
  const deviceType = getDeviceTypeSync()
  if (deviceType !== 'PC') return 'fade'
  if (isPrefersReducedMotion()) return 'fade'
  return requestedMode
}
