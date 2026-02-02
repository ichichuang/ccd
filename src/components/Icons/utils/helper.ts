/**
 * 图标组件辅助函数
 */

import type { IconSize } from './types'

/**
 * 尺寸映射表（单一数据源）
 * 使用响应式字体阶梯系统（fs-sm/md/lg/xl），联动 SizeStore
 */
const sizeMap: Record<'s' | 'm' | 'l', { customClass: string[] }> = {
  s: {
    customClass: ['fs-sm'],
  },
  m: {
    customClass: ['fs-md'],
  },
  l: {
    customClass: ['fs-xl'],
  },
}

/**
 * 检查字符串是否包含单位
 */
function hasUnit(value: string): boolean {
  return /%(?:$|[\s,])|px|vw|vh|em|rem|ex|ch|cm|mm|in|pt|pc/i.test(value)
}

/**
 * 格式化尺寸值为 CSS 值
 */
function formatSizeValue(size: number | string): string {
  if (typeof size === 'number') {
    return `${size}px`
  }
  // 如果是字符串且没有单位，默认添加 px
  if (!hasUnit(size)) {
    return `${size}px`
  }
  return size
}

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
    return ['fs-md']
  }

  if (size === 's' || size === 'm' || size === 'l') {
    return [...sizeMap[size].customClass]
  }

  // 数字或字符串类型的 size 不需要类名（使用 style 控制）
  return []
}

/**
 * 获取自定义图标的尺寸样式
 * @param size 尺寸值
 * @returns 样式对象
 */
export function getCustomIconSizeStyle(size?: IconSize): Record<string, string> | undefined {
  // 未指定尺寸或使用固定尺寸（s/m/l）时，使用类名控制，不需要样式
  if (!size || size === 's' || size === 'm' || size === 'l') {
    return undefined
  }

  // 数字或字符串类型的 size 使用样式控制
  return {
    fontSize: formatSizeValue(size),
  }
}

// 旧版 OhVueIcon 相关辅助函数已移除，改由 UnoCSS Icons 统一实现
