/**
 * 图标组件辅助函数
 */

import type { IconSize } from './types'

/**
 * 将 PascalCase 或 camelCase 转换为 kebab-case
 * @param str 输入字符串，如 'FcIcon' 或 'RiArrowLeftSLine'
 * @returns kebab-case 字符串，如 'fc-icon' 或 'ri-arrow-left-s-line'
 * @example
 * toIconName('FcIcon') // 'fc-icon'
 * toIconName('RiArrowLeftSLine') // 'ri-arrow-left-s-line'
 * toIconName('fc-icon') // 'fc-icon'
 * toIconName('ri-home-line') // 'ri-home-line'
 */
export function toIconName(str: string): string {
  // 如果已经是 kebab-case 格式（不包含大写字母），直接返回
  if (!/[A-Z]/.test(str)) {
    return str
  }

  // 将 PascalCase/camelCase 转换为 kebab-case
  // 处理规则：
  // 1. 在小写字母和大写字母之间插入连字符
  // 2. 在连续大写字母后跟小写字母时，在最后一个大写字母前插入连字符
  // 3. 转换为小写
  return str
    .replace(/([a-z\d])([A-Z])/g, '$1-$2') // 在小写字母/数字和大写字母之间插入连字符
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2') // 处理连续大写字母后跟小写字母的情况
    .toLowerCase()
}

/**
 * 获取自定义图标的尺寸类名
 * @param size 尺寸值
 * @returns 类名数组
 */
export function getCustomIconSizeClass(size?: IconSize): string[] {
  if (!size) {
    return ['fs-appFontSize']
  }

  if (size === 's') {
    return ['fs-appFontSizes']
  }

  if (size === 'm') {
    return ['fs-appFontSizex']
  }

  if (size === 'l') {
    return ['fs-appFontSizel']
  }

  return []
}

/**
 * 获取自定义图标的尺寸样式
 * @param size 尺寸值
 * @returns 样式对象
 */
export function getCustomIconSizeStyle(size?: IconSize): Record<string, string> | undefined {
  if (!size || size === 's' || size === 'm' || size === 'l') {
    return undefined
  }

  if (typeof size === 'number') {
    return {
      fontSize: `${size}px`,
    }
  }

  if (typeof size === 'string') {
    // 检查是否包含 %、vw、vh 等单位
    if (size.includes('%') || size.includes('vw') || size.includes('vh') || size.includes('px')) {
      return {
        fontSize: size,
      }
    }

    // 如果没有单位，默认添加 px
    return {
      fontSize: `${size}px`,
    }
  }

  return undefined
}

/**
 * 获取 OhVueIcon 的尺寸类名
 * @param size 尺寸值
 * @returns 类名数组
 */
export function getOhVueIconSizeClass(size?: IconSize): string[] {
  if (!size) {
    return ['w-appFontSize', 'h-appFontSize']
  }

  if (size === 's') {
    return ['w-appFontSizes', 'h-appFontSizes']
  }

  if (size === 'm') {
    return ['w-appFontSizex', 'h-appFontSizex']
  }

  if (size === 'l') {
    return ['w-appFontSizel', 'h-appFontSizel']
  }

  return []
}

/**
 * 获取 OhVueIcon 的尺寸样式
 * @param size 尺寸值
 * @returns 样式对象
 */
export function getOhVueIconSizeStyle(size?: IconSize): Record<string, string> | undefined {
  if (!size || size === 's' || size === 'm' || size === 'l') {
    return undefined
  }

  if (typeof size === 'number') {
    return {
      width: `${size}px`,
      height: `${size}px`,
    }
  }

  if (typeof size === 'string') {
    // 检查是否包含 %、vw、vh 等单位
    if (size.includes('%') || size.includes('vw') || size.includes('vh') || size.includes('px')) {
      return {
        width: size,
        height: size,
      }
    }

    // 如果没有单位，默认添加 px
    return {
      width: `${size}px`,
      height: `${size}px`,
    }
  }

  return undefined
}

/**
 * 获取 OhVueIcon 的 size prop 值（用于传递给 OhVueIcon 组件）
 * @param size 尺寸值
 * @returns size prop 值
 */
export function getOhVueIconSizeProp(size?: IconSize): string | number | undefined {
  if (!size || size === 's' || size === 'm' || size === 'l') {
    return undefined
  }

  return size
}
