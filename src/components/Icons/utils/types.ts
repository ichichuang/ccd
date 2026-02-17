/**
 * 图标组件类型定义
 */

import type { SizeScaleKey } from '@/constants/sizeScale'

/**
 * 图标尺寸类型
 * - SizeScaleKey: 标准尺寸键（xs, sm, md, lg, xl, 2xl, 3xl, 4xl, 5xl），联动 SizeStore
 * - number: 数字，单位为 px
 * - string: 字符串，支持 px、%、vw、vh 等单位
 */
export type IconSize = SizeScaleKey | number | string

/**
 * 图标动画类型（与 Icons.vue 实现严格一致）
 */
export type IconAnimation = 'spin' | 'pulse' | 'spin-pulse'

/**
 * 翻转方向类型
 */
export type FlipDirection = 'horizontal' | 'vertical' | 'both'

/**
 * 图标组件 Props 接口
 *
 * @example
 * ```vue
 * <!-- 基础使用 -->
 * <Icons name="i-lucide-user" />
 *
 * <!-- 自定义图标（子目录参与命名：custom/juejin.svg → i-custom:custom-juejin） -->
 * <Icons name="i-custom:custom-juejin" size="xl" />
 *
 * <!-- 带动画 -->
 * <Icons name="i-lucide-loader" animation="spin" />
 *
 * <!-- 缩放和旋转 -->
 * <Icons name="i-mdi-arrow-right" scale="1.5" rotate="90" />
 * ```
 */
export interface IconsProps {
  /**
   * 图标名称（必填）
   * 推荐始终使用完整类名（以 'i-' 开头），避免歧义。
   *
   * - 以 'i-' 开头：直接作为 UnoCSS 图标类（如 'i-lucide-user'、'i-custom:custom-juejin'）
   * - 含 ':' 且以 custom: 开头：补 i- 前缀且保留冒号 → i-custom:xxx
   * - 含 ':' 其他：集合前缀语法（mdi:home）→ 转为 i-mdi-home
   * - 含连字符（lucide-home）→ 补 i- 前缀
   * - 无前缀（home / Home）→ 默认 Lucide，PascalCase 会转为 kebab-case
   */
  name: string

  /**
   * 图标大小（可选）
   *
   * - 标准尺寸：xs | sm | md | lg | xl | 2xl | 3xl | 4xl | 5xl，通过 fs-* 类名联动 SizeStore
   * - 数字：单位为 px
   * - 字符串：支持 px、%、vw、vh 等单位
   *
   * @default 'md'
   */
  size?: IconSize

  /** 图标颜色，支持任意 CSS 颜色值（含 var(--primary)） */
  color?: string

  /** 图标动画 */
  animation?: IconAnimation

  /** 缩放比例（CSS transform: scale()） */
  scale?: number

  /** 翻转方向（对所有图标有效） */
  flip?: FlipDirection

  /** 旋转角度（单位：deg） */
  rotate?: string | number

  /** 无障碍标签（aria-label） */
  label?: string

  /** 标题（title） */
  title?: string
}
