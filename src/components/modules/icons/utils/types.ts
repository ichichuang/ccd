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

/**
 * 图标动画类型
 * - 'spin': 旋转动画
 * - 'spin-pulse': 旋转脉冲动画
 * - 'wrench': 扳手动画
 * - 'ring': 环形动画
 * - 'pulse': 脉冲动画
 * - 'flash': 闪烁动画
 * - 'float': 浮动动画
 */
export type IconAnimation = 'spin' | 'spin-pulse' | 'wrench' | 'ring' | 'pulse' | 'flash' | 'float'

/**
 * 动画速度类型
 * - 'slow': 慢速
 * - 'fast': 快速
 */
export type AnimationSpeed = 'slow' | 'fast'

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
 * <Icons name="FcVip" animation="spin" speed="fast" />
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
   * **固定尺寸**：'s' | 'm' | 'l'
   * - 自定义图标映射：'s' -> fs-appFontSizes, 'm' -> fs-appFontSizesx, 'l' -> fs-appFontSizel, 默认 -> fs-appFontSize
   * - OhVueIcon 映射：'s' -> w-appFontSizes h-appFontSizes, 'm' -> w-appFontSizesx h-appFontSizesx, 'l' -> w-appFontSizel h-appFontSizel, 默认 -> w-appFontSize h-appFontSize
   *
   * **数字类型**：单位为 px（如 100 表示 100px）
   *
   * **字符串类型**：支持各种单位（如 '100%', '100vw', '100vh', '100px'）
   *
   * @default undefined
   * @example
   * - size="s" - 小尺寸
   * - :size="24" - 24px
   * - size="100%" - 100% 宽度/高度
   */
  size?: IconSize

  /**
   * 图标颜色（仅对 OhVueIcon 有效）
   *
   * 支持任何 CSS 颜色值（如 '#ff0000', 'red', 'rgb(255,0,0)', 'var(--primary-color)' 等）
   *
   * @default undefined
   * @example
   * - color="#ff0000" - 红色
   * - color="var(--primary-color)" - CSS 变量
   */
  color?: string

  /**
   * 图标动画（仅对 OhVueIcon 有效）
   *
   * @default undefined
   * @example
   * - animation="spin" - 旋转动画
   * - animation="pulse" - 脉冲动画
   */
  animation?: IconAnimation

  /**
   * 动画速度（仅对 OhVueIcon 有效，需配合 animation 使用）
   *
   * @default undefined
   * @example
   * - speed="slow" - 慢速动画
   * - speed="fast" - 快速动画
   */
  speed?: AnimationSpeed

  /**
   * 是否显示悬停效果（仅对 OhVueIcon 有效）
   *
   * @default false
   * @example
   * - hover - 启用悬停效果
   * - :hover="true" - 启用悬停效果
   */
  hover?: boolean

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
   * 旋转角度（仅对 OhVueIcon 有效）
   *
   * 数字类型，单位为度（degree），支持 0-360 度
   *
   * @default undefined
   * @example
   * - :rotate="90" - 旋转 90 度
   * - :rotate="180" - 旋转 180 度
   * - :rotate="270" - 旋转 270 度
   */
  rotate?: number

  /**
   * 是否反色（仅对 OhVueIcon 有效）
   *
   * 当设置为 true 时，图标颜色会反转
   *
   * @default false
   * @example
   * - inverse - 启用反色
   * - :inverse="true" - 启用反色
   */
  inverse?: boolean

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

  /**
   * 自定义类名
   *
   * 支持字符串或字符串数组，可以传入多个类名
   *
   * @default undefined
   * @example
   * - class="my-icon" - 单个类名
   * - :class="['class1', 'class2']" - 多个类名
   */
  class?: string | string[]
}
