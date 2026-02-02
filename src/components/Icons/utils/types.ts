/**
 * 图标组件类型定义
 */

import type { SizeScaleKey } from '@/constants/sizeScale'

/**
 * 图标尺寸类型
 * - 's' | 'm' | 'l': 向后兼容的固定尺寸（映射到标准尺寸）
 * - SizeScaleKey: 标准尺寸键（xs, sm, md, lg, xl, 2xl, 3xl, 4xl, 5xl）
 * - number: 数字，单位为 px
 * - string: 字符串，支持 px、%、vw、vh 等单位
 */
export type IconSize = 's' | 'm' | 'l' | SizeScaleKey | number | string

/**
 * 图标动画类型（与 Icons.vue 实现严格一致）
 * - 'spin': 旋转动画
 * - 'pulse': 脉冲动画
 * - 'spin-pulse': 旋转 + 脉冲组合动画
 */
export type IconAnimation = 'spin' | 'pulse' | 'spin-pulse'

/**
 * 翻转方向类型
 * - 'horizontal': 水平翻转
 * - 'vertical': 垂直翻转
 * - 'both': 同时水平和垂直翻转
 */
export type FlipDirection = 'horizontal' | 'vertical' | 'both'

/**
 * 图标组件 Props 接口
 *
 * @example
 * ```vue
 * <!-- 基础使用 -->
 * <Icons name="FcVip" />
 *
 * <!-- 自定义图标 -->
 * <Icons name="i-custom:juejin" size="l" />
 *
 * <!-- 带动画 -->
 * <Icons name="FcVip" animation="spin" />
 *
 * <!-- 缩放和旋转 -->
 * <Icons name="ri-arrow-right-line" scale="1.5" rotate="90" />
 * ```
 */
export interface IconsProps {
  /**
   * 图标名称（必填）
   *
   * - 如果以 'i-' 开头，使用 UnoCSS 自定义图标（如 'i-custom:juejin'）
   * - 否则使用 OhVueIcon，支持 PascalCase（如 'FcIcon'）或 kebab-case（如 'fc-icon'）
   *
   * @example
   * - 'i-custom:juejin' - UnoCSS 自定义图标
   * - 'FcVip' - OhVueIcon PascalCase 格式
   * - 'ri-home-line' - OhVueIcon kebab-case 格式
   */
  name: string

  /**
   * 图标大小（可选）
   *
   * **兼容尺寸**：'s' | 'm' | 'l'（向后兼容）
   * - 's' -> fs-sm
   * - 'm' -> fs-md（默认）
   * - 'l' -> fs-xl
   *
   * **标准尺寸**：xs | sm | md | lg | xl | 2xl | 3xl | 4xl | 5xl
   * - 所有字体类均联动 SizeStore，响应式适配当前尺寸模式（compact/comfortable/loose）
   *
   * **数字类型**：单位为 px（如 100 表示 100px）
   *
   * **字符串类型**：支持各种单位（如 '100%', '100vw', '100vh', '100px'）
   *
   * @default 'm'
   * @example
   * - size="s" - 小尺寸（兼容）
   * - size="xl" - 超大尺寸（标准）
   * - :size="24" - 24px
   * - size="100%" - 100% 宽度/高度
   */
  size?: IconSize

  /**
   * 图标颜色
   *
   * 支持任何 CSS 颜色值（如 '#ff0000', 'red', 'rgb(255,0,0)', 'var(--primary-color)' 等）
   */
  color?: string

  /**
   * 图标动画
   *
   * @default undefined
   * @example
   * - animation="spin" - 旋转动画
   * - animation="pulse" - 脉冲动画
   */
  animation?: IconAnimation

  /**
   * 缩放比例（对所有图标类型有效，通过 CSS transform: scale() 实现）
   *
   * 数字类型，如 1.5 表示 1.5 倍缩放，0.5 表示缩小到 0.5 倍
   *
   * @default undefined
   * @example
   * - :scale="1.5" - 放大到 1.5 倍
   * - :scale="0.5" - 缩小到 0.5 倍
   * - :scale="2" - 放大到 2 倍
   */
  scale?: number

  /**
   * 翻转方向（仅对 OhVueIcon 有效）
   *
   * @default undefined
   * @example
   * - flip="horizontal" - 水平翻转
   * - flip="vertical" - 垂直翻转
   * - flip="both" - 同时水平和垂直翻转
   */
  flip?: FlipDirection

  /**
   * 旋转角度（单位：deg）
   *
   * 数字或字符串类型，最终会拼接为 transform: rotate(xxdeg)
   */
  rotate?: string | number

  /**
   * 无障碍标签（对所有图标类型有效）
   *
   * 设置图标的 aria-label 属性，用于屏幕阅读器
   *
   * @default undefined
   * @example
   * - label="关闭按钮" - 设置无障碍标签
   */
  label?: string

  /**
   * 标题（对所有图标类型有效）
   *
   * 设置图标的 title 属性，鼠标悬停时显示提示文本
   *
   * @default undefined
   * @example
   * - title="点击关闭" - 设置标题提示
   */
  title?: string
}
