import type { AnimateWrapperProps } from './types'

export const defaultAnimateConfig: AnimateWrapperProps = {
  /** 默认进入动画 */
  enter: 'fadeIn',
  /** 默认离开动画 */
  leave: 'fadeOut',
  /** 默认动画时长 */
  duration: '1s',
  /** 默认延迟 */
  delay: '0s',
  /** 默认进入动画延迟 */
  enterDelay: '0s',
  /** 默认离开动画延迟 */
  leaveDelay: '0s',
  /** 默认动画速度 */
  speed: 'fast',
  /** 默认循环次数 */
  repeat: 1,
  /** 默认是否初次渲染时执行动画 */
  appear: true,
  /** 默认是否列表模式 */
  group: false,
  /** 默认队列延迟（ms），group 模式队列延迟 */
  stagger: 120,
  /** 默认是否显示 */
  show: true,
}
