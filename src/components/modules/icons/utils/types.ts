/**
 * 图标组件类型定义
 */

/**
 * 图标尺寸类型
 * - 's' | 'm' | 'l': 固定尺寸
 * - number: 数字，单位为 px
 * - string: 字符串，支持 px、%、vw、vh 等单位
 */
export type IconSize = 's' | 'm' | 'l' | number | string

export interface IconsProps {
  /**
   * 图标名称
   * - 如果以 'i-' 开头，使用 UnoCSS 自定义图标
   * - 否则使用 OhVueIcon，支持 PascalCase（如 'FcIcon'）或 kebab-case（如 'fc-icon'）
   */
  name: string
  /**
   * 图标大小
   * - 固定尺寸：'s' | 'm' | 'l'
   *   - 自定义图标：'s' -> fs-appFontSizes, 'm' -> fs-appFontSizesx, 'l' -> fs-appFontSizel, 默认 -> fs-appFontSize
   *   - OhVueIcon：'s' -> w-appFontSizes h-appFontSizes, 'm' -> w-appFontSizesx h-appFontSizesx, 'l' -> w-appFontSizel h-appFontSizel, 默认 -> w-appFontSize h-appFontSize
   * - number: 数字，单位为 px（如 100 -> 100px）
   * - string: 字符串，支持各种单位（如 '100%', '100vw', '100vh', '100px'）
   */
  size?: IconSize
  /**
   * 图标颜色（仅对 OhVueIcon 有效）
   */
  color?: string
  /**
   * 图标动画（仅对 OhVueIcon 有效）
   * 可选值：'spin' | 'spin-pulse' | 'wrench' | 'ring' | 'pulse' | 'flash' | 'float'
   */
  animation?: string
  /**
   * 动画速度（仅对 OhVueIcon 有效）
   * 可选值：'slow' | 'fast'
   */
  speed?: string
  /**
   * 是否显示悬停效果（仅对 OhVueIcon 有效）
   */
  hover?: boolean
  /**
   * 缩放比例（仅对 OhVueIcon 有效）
   * 数字类型，如 1.5 表示 1.5 倍缩放
   */
  scale?: number
  /**
   * 翻转方向（仅对 OhVueIcon 有效）
   * 可选值：'horizontal' | 'vertical' | 'both'
   */
  flip?: 'horizontal' | 'vertical' | 'both'
  /**
   * 旋转角度（仅对 OhVueIcon 有效）
   * 数字类型，单位为度（degree），如 90 表示旋转 90 度
   */
  rotate?: number
  /**
   * 是否反色（仅对 OhVueIcon 有效）
   * 当设置为 true 时，图标颜色会反转
   */
  inverse?: boolean
  /**
   * 无障碍标签（仅对 OhVueIcon 有效）
   * 设置图标的 aria-label 属性，用于屏幕阅读器
   */
  label?: string
  /**
   * 标题（仅对 OhVueIcon 有效）
   * 设置图标的 title 属性，鼠标悬停时显示
   */
  title?: string
  /**
   * 自定义类名
   */
  class?: string | string[]
}
