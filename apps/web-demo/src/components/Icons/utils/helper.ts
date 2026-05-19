/**
 * 图标组件辅助函数
 */

/**
 * 将 PascalCase 或 camelCase 转换为 kebab-case（用于无前缀 name 默认走 Lucide）
 *
 * @example
 * toIconName('FcIcon') // 'fc-icon'
 * toIconName('RiArrowLeftSLine') // 'ri-arrow-left-s-line'
 * toIconName('fc-icon') // 'fc-icon'
 */
export function toIconName(str: string): string {
  if (!/[A-Z]/.test(str)) return str
  return str
    .replace(/([a-z\d])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .toLowerCase()
}
