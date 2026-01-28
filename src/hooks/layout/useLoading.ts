/**
 * 页面加载控制的 Composable 函数
 *
 * 提供两套加载控制方法，分别用于不同层级的加载状态：
 * - `loadingStart/Done`: 控制整体页面加载（layouts/index.vue 层），显示全屏加载动画
 * - `pageLoadingStart/Done`: 控制内容区域加载（LayoutAdmin 内容区），显示内容区加载动画
 *
 * @returns 加载控制方法对象
 *   - `loadingStart`: 开始整体页面加载（并发安全：全局 loadingCount +1）
 *   - `loadingDone`: 结束整体页面加载（并发安全：全局 loadingCount -1，下限保护）
 *   - `pageLoadingStart`: 开始页面内容加载（并发安全：pageLoadingCount +1）
 *   - `pageLoadingDone`: 结束页面内容加载（并发安全：pageLoadingCount -1，下限保护）
 *   - `startLoading/withLoading`: 推荐的新用法（自动配对，避免漏写 finally）
 *   - `startPageLoading/withPageLoading`: 推荐的新用法（自动配对，避免漏写 finally）
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * // 在路由守卫中使用
 * const { loadingStart, loadingDone, pageLoadingStart, pageLoadingDone } = useLoading()
 *
 * // 整体页面加载（显示全屏加载动画，覆盖整个布局）
 * loadingStart()
 * await initApp()
 * loadingDone()
 *
 * // 页面内容加载（显示内容区加载动画，仅覆盖内容区域）
 * pageLoadingStart()
 * await loadPageData()
 * pageLoadingDone()
 * </script>
 * ```
 *
 * @example
 * ```typescript
 * // 在路由守卫中使用
 * router.beforeEach(async (to, from, next) => {
 *   const { pageLoadingStart, pageLoadingDone } = useLoading()
 *
 *   pageLoadingStart() // 路由切换开始时显示内容区加载
 *   try {
 *     await loadRouteData(to)
 *     next()
 *   } finally {
 *     pageLoadingDone() // 路由切换完成后隐藏加载
 *   }
 * })
 * ```
 */
import { useLayoutStoreWithOut } from '@/stores/modules/layout'

export function useLoading() {
  const layoutStore = useLayoutStoreWithOut()

  /**
   * 开始全局 loading（并发安全：计数 +1）
   * 兼容旧 API：不返回 stop，保持调用方式不变
   */
  const loadingStart = () => {
    layoutStore.beginGlobalLoading()
  }

  /**
   * 结束全局 loading（并发安全：计数 -1，下限保护）
   * 兼容旧 API：不要求严格配对，但建议使用 startLoading/withLoading
   */
  const loadingDone = () => {
    layoutStore.endGlobalLoading()
  }

  /** 开始内容区 loading（并发安全：计数 +1） */
  const pageLoadingStart = () => {
    layoutStore.beginPageLoading()
  }

  /** 结束内容区 loading（并发安全：计数 -1，下限保护） */
  const pageLoadingDone = () => {
    layoutStore.endPageLoading()
  }

  /**
   * 自动配对：开始全局 loading，并返回一次性 stop()
   * 适合在任意异步流程中使用，避免漏写 finally
   */
  const startLoading = () => {
    loadingStart()
    let stopped = false
    return () => {
      if (stopped) return
      stopped = true
      loadingDone()
    }
  }

  /**
   * 自动配对：开始内容区 loading，并返回一次性 stop()
   */
  const startPageLoading = () => {
    pageLoadingStart()
    let stopped = false
    return () => {
      if (stopped) return
      stopped = true
      pageLoadingDone()
    }
  }

  /**
   * 自动配对：包装异步函数（全局 loading）
   */
  const withLoading = async <T>(fn: () => Promise<T>): Promise<T> => {
    const stop = startLoading()
    try {
      return await fn()
    } finally {
      stop()
    }
  }

  /**
   * 自动配对：包装异步函数（内容区 loading）
   */
  const withPageLoading = async <T>(fn: () => Promise<T>): Promise<T> => {
    const stop = startPageLoading()
    try {
      return await fn()
    } finally {
      stop()
    }
  }

  return {
    loadingStart,
    loadingDone,
    pageLoadingStart,
    pageLoadingDone,
    // 自动配对能力（推荐新代码使用）
    startLoading,
    startPageLoading,
    withLoading,
    withPageLoading,
  }
}
