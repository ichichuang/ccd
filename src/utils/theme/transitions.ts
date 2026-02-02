/**
 * 主题切换动画策略工具
 * 支持多种过渡模式：circle, curtain, diamond, implosion, glitch, fade
 */

import { rgbToHex } from './colors'

export interface TransitionConfig {
  duration: number
  easing: string
  overlay?: {
    opacity: number
    blur?: number
  }
}

const ANIMATION_DURATION = 400
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
 */
export function getTransitionConfig(
  mode: ThemeTransitionMode,
  _event: MouseEvent | null
): TransitionConfig {
  switch (mode) {
    case 'circle': {
      return {
        duration: ANIMATION_DURATION,
        easing: DEFAULT_EASING,
        overlay: { opacity: 0, blur: 0 },
      }
    }

    case 'curtain': {
      return {
        duration: ANIMATION_DURATION,
        easing: DEFAULT_EASING,
        overlay: { opacity: 0, blur: 0 },
      }
    }

    case 'diamond': {
      return {
        duration: ANIMATION_DURATION,
        easing: DEFAULT_EASING,
        overlay: { opacity: 0, blur: 0 },
      }
    }

    case 'implosion': {
      return {
        duration: ANIMATION_DURATION,
        easing: DEFAULT_EASING,
        overlay: { opacity: 0, blur: 0 },
      }
    }

    case 'glitch': {
      return {
        duration: ANIMATION_DURATION * 0.8,
        easing: 'steps(4, end)',
        overlay: { opacity: 0, blur: 0 },
      }
    }

    case 'fade':
    default: {
      return {
        duration: ANIMATION_DURATION,
        easing: DEFAULT_EASING,
        overlay: { opacity: 0, blur: 0 },
      }
    }
  }
}
