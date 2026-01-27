/**
 * 页面全屏控制的Composable函数
 */
import { useFullscreen } from '@vueuse/core'
/**
 * useFull 用于管理页面或指定元素的全屏状态
 * @param target 可选目标元素，默认 document.body
 */
export const useFull = (target?: HTMLElement | null) => {
  // 全屏目标元素（默认 body）
  const targetRef = ref<HTMLElement | null>(target ?? document.body)

  // 使用 vueuse 的 useFullscreen 进行全屏控制
  const {
    isFullscreen,
    enter: enterFull,
    exit: exitFull,
    toggle: toggleFull,
  } = useFullscreen(targetRef)

  /**
   * 进入全屏
   */
  const enter = () => {
    enterFull()
  }

  /**
   * 退出全屏
   */
  const exit = () => {
    exitFull()
  }

  /**
   * 切换全屏
   */
  const toggle = () => {
    toggleFull()
  }

  /**
   * 当前是否全屏
   */
  const fullscreen = isFullscreen

  return {
    targetRef,
    fullscreen,
    enter,
    exit,
    toggle,
  }
}
