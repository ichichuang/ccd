/**
 * 页面全屏控制的 Composable 函数
 *
 * @param target - 可选目标元素，默认 document.body。如果为 null 或 undefined，将使用 document.body
 * @returns 全屏控制相关的方法和状态（与 VueUse useFullscreen 返回类型一致）
 *   - `isSupported`: 浏览器是否支持全屏 API
 *   - `isFullscreen`: 当前是否处于全屏状态（响应式）
 *   - `enter`: 进入全屏
 *   - `exit`: 退出全屏
 *   - `toggle`: 切换全屏状态
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * // 基本使用：控制整个页面全屏
 * const { isFullscreen, enter, exit, toggle } = useFull()
 *
 * // 控制指定元素全屏
 * const containerRef = ref<HTMLElement>()
 * const { isFullscreen, enter, exit } = useFull(containerRef.value)
 * </script>
 *
 * <template>
 *   <div>
 *     <button @click="toggle">
 *       {{ isFullscreen ? '退出全屏' : '进入全屏' }}
 *     </button>
 *   </div>
 * </template>
 * ```
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * // 响应式使用：监听全屏状态变化
 * const { isFullscreen, enter, exit } = useFull()
 *
 * watch(isFullscreen, (isFull) => {
 *   console.log('全屏状态:', isFull ? '已全屏' : '已退出全屏')
 * })
 * </script>
 * ```
 */
import { useFullscreen, type UseFullscreenReturn } from '@vueuse/core'

export function useFull(target?: HTMLElement | null): UseFullscreenReturn {
  // VueUse 的 useFullscreen 接受 MaybeElementRef
  // 如果未提供 target 或为 null，使用 document.body
  const targetRef = ref<HTMLElement>(target ?? document.body)

  // 直接返回 VueUse 的结果，保持 API 一致性
  return useFullscreen(targetRef)
}
