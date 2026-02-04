/**
 * animate.css 动画类型声明
 */

/** animate.css 动画名称类型 */
export type AnimateName =
  | 'bounce'
  | 'flash'
  | 'pulse'
  | 'rubberBand'
  | 'shakeX'
  | 'shakeY'
  | 'headShake'
  | 'swing'
  | 'tada'
  | 'wobble'
  | 'jello'
  | 'heartBeat'
  | 'backInDown'
  | 'backInLeft'
  | 'backInRight'
  | 'backInUp'
  | 'backOutDown'
  | 'backOutLeft'
  | 'backOutRight'
  | 'backOutUp'
  | 'bounceIn'
  | 'bounceInDown'
  | 'bounceInLeft'
  | 'bounceInRight'
  | 'bounceInUp'
  | 'bounceOut'
  | 'bounceOutDown'
  | 'bounceOutLeft'
  | 'bounceOutRight'
  | 'bounceOutUp'
  | 'fadeIn'
  | 'fadeInDown'
  | 'fadeInDownBig'
  | 'fadeInLeft'
  | 'fadeInLeftBig'
  | 'fadeInRight'
  | 'fadeInRightBig'
  | 'fadeInUp'
  | 'fadeInUpBig'
  | 'fadeInTopLeft'
  | 'fadeInTopRight'
  | 'fadeInBottomLeft'
  | 'fadeInBottomRight'
  | 'fadeOut'
  | 'fadeOutDown'
  | 'fadeOutDownBig'
  | 'fadeOutLeft'
  | 'fadeOutLeftBig'
  | 'fadeOutRight'
  | 'fadeOutRightBig'
  | 'fadeOutUp'
  | 'fadeOutUpBig'
  | 'fadeOutTopLeft'
  | 'fadeOutTopRight'
  | 'fadeOutBottomRight'
  | 'fadeOutBottomLeft'
  | 'flip'
  | 'flipInX'
  | 'flipInY'
  | 'flipOutX'
  | 'flipOutY'
  | 'lightSpeedInRight'
  | 'lightSpeedInLeft'
  | 'lightSpeedOutRight'
  | 'lightSpeedOutLeft'
  | 'rotateIn'
  | 'rotateInDownLeft'
  | 'rotateInDownRight'
  | 'rotateInUpLeft'
  | 'rotateInUpRight'
  | 'rotateOut'
  | 'rotateOutDownLeft'
  | 'rotateOutDownRight'
  | 'rotateOutUpLeft'
  | 'rotateOutUpRight'
  | 'zoomIn'
  | 'zoomInDown'
  | 'zoomInLeft'
  | 'zoomInRight'
  | 'zoomInUp'
  | 'zoomOut'
  | 'zoomOutDown'
  | 'zoomOutLeft'
  | 'zoomOutRight'
  | 'zoomOutUp'
  | 'slideInDown'
  | 'slideInLeft'
  | 'slideInRight'
  | 'slideInUp'
  | 'slideOutDown'
  | 'slideOutLeft'
  | 'slideOutRight'
  | 'slideOutUp'

/** animate.css 动画速度类型 */
export type AnimateSpeed = '' | 'slower' | 'slow' | 'fast' | 'faster'

/** animate.css 动画重复次数类型 */
export type AnimateRepeat = 1 | 2 | 3 | 'infinite'

/**
 * AnimateWrapper 组件 Props 接口
 *
 * 基于 animate.css 的动画包装器组件属性
 *
 * @example
 * ```vue
 * <template>
 *   <AnimateWrapper
 *     :show="visible"
 *     enter="fadeIn"
 *     leave="fadeOut"
 *     :duration="'0.5s'"
 *     :speed="'fast'"
 *   >
 *     <div>内容</div>
 *   </AnimateWrapper>
 *
 *   <!-- 列表动画 -->
 *   <AnimateWrapper
 *     :show="true"
 *     group
 *     enter="fadeInUp"
 *     :stagger="100"
 *   >
 *     <div v-for="item in list" :key="item.id">{{ item.name }}</div>
 *   </AnimateWrapper>
 * </template>
 * ```
 */
export interface AnimateWrapperProps {
  /**
   * 是否显示
   *
   * 控制组件的显示/隐藏状态，触发进入/离开动画
   *
   * @example
   * - :show="visible" - 根据 visible 变量控制
   */
  show: boolean

  /**
   * 进入动画
   *
   * 元素显示时使用的动画名称（animate.css 动画类名）
   *
   * @default 'fadeIn'
   * @example
   * - enter="fadeIn" - 淡入动画
   * - enter="slideInDown" - 从上方滑入
   * - enter="zoomIn" - 缩放进入
   */
  enter?: AnimateName

  /**
   * 离开动画
   *
   * 元素隐藏时使用的动画名称（animate.css 动画类名）
   *
   * @default 'fadeOut'
   * @example
   * - leave="fadeOut" - 淡出动画
   * - leave="slideOutUp" - 向上滑出
   * - leave="zoomOut" - 缩放退出
   */
  leave?: AnimateName

  /**
   * 动画时长
   *
   * CSS 时间格式，例如 '1s'、'500ms'、'0.5s'
   *
   * @default '1s'
   * @example
   * - duration="0.5s" - 0.5 秒
   * - duration="1000ms" - 1000 毫秒
   */
  duration?: string

  /**
   * 动画延迟（通用）
   *
   * 应用于进入和离开动画的延迟时间
   *
   * @default '0s'
   * @example
   * - delay="0.2s" - 延迟 0.2 秒
   */
  delay?: string

  /**
   * 进入动画延迟
   *
   * 仅应用于进入动画的延迟时间，优先级高于 delay
   *
   * @default '0s'
   * @example
   * - enter-delay="0.3s" - 进入动画延迟 0.3 秒
   */
  enterDelay?: string

  /**
   * 离开动画延迟
   *
   * 仅应用于离开动画的延迟时间，优先级高于 delay
   *
   * @default '0s'
   * @example
   * - leave-delay="0.1s" - 离开动画延迟 0.1 秒
   */
  leaveDelay?: string

  /**
   * 动画速度
   *
   * 控制动画的播放速度（对应 animate.css 的速度类）
   *
   * @default 'fast'
   * @example
   * - speed="slow" - 慢速
   * - speed="fast" - 快速
   * - speed="slower" - 更慢
   * - speed="faster" - 更快
   */
  speed?: AnimateSpeed

  /**
   * 循环次数
   *
   * 动画重复播放的次数，或使用 'infinite' 无限循环
   *
   * @default 1（不循环）
   * @example
   * - :repeat="3" - 循环 3 次
   * - repeat="infinite" - 无限循环
   */
  repeat?: AnimateRepeat

  /**
   * 是否初次渲染时执行动画
   *
   * 组件首次挂载时是否执行进入动画
   *
   * @default true
   * @example
   * - :appear="true" - 初次渲染时执行动画
   */
  appear?: boolean

  /**
   * 是否列表模式
   *
   * 启用后，可以为列表项添加队列动画效果
   * 配合 stagger 使用可以实现列表项的依次动画
   *
   * @default false
   * @example
   * - :group="true" - 启用列表模式
   */
  group?: boolean

  /**
   * 队列延迟（仅 group=true 时生效）
   *
   * 列表模式下，每个列表项之间的动画延迟时间（毫秒）
   *
   * @default 120
   * @example
   * - :stagger="100" - 每个项延迟 100ms
   * - :stagger="50" - 每个项延迟 50ms
   */
  stagger?: number
}
