/**
 * NProgress 进度条 Composable
 *
 * 设计约束：
 * - **只提供控制方法**（start/done/set/inc/remove 等），**不在此处监听路由**
 * - 路由切换的启停应由 `src/router/utils/permission.ts` 统一接管，避免重复注册守卫/重复调用
 *
 * @example
 * ```ts
 * // 路由守卫（推荐做法：统一放在 permission guard）
 * router.beforeEach((_to, _from, next) => {
 *   const { startProgress } = useNprogress()
 *   startProgress()
 *   next()
 * })
 *
 * router.afterEach(() => {
 *   const { doneProgress } = useNprogress()
 *   doneProgress()
 * })
 * ```
 *
 * @example
 * ```ts
 * // 任意异步任务中使用（注意 finally，避免进度条卡住）
 * const { startProgress, doneProgress } = useNprogress()
 * startProgress()
 * try {
 *   await doSomethingAsync()
 * } finally {
 *   doneProgress()
 * }
 * ```
 */
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// 配置只需在应用生命周期内执行一次，避免重复调用
let nprogressConfigured = false

export function useNprogress() {
  /**
   * NProgress 配置
   * - 内部带一次性保护：多次调用也只会真正配置一次
   */
  const configureNProgress = () => {
    if (nprogressConfigured) return
    NProgress.configure({
      easing: 'ease-in-out', // 缓动更顺滑
      speed: 700, // 稍微慢一点，更有节奏感
      trickle: true, // 保持涓流推进
      trickleSpeed: 150, // 更平滑的涓流速度
      showSpinner: false, // 不显示右上角小圈
      minimum: 0.05, // 从更低的值开始
    })
    nprogressConfigured = true
  }

  // 保证每次使用前都已完成配置（实际只会生效一次）
  configureNProgress()

  /**
   * 开始进度条
   */
  const startProgress = () => {
    NProgress.start()
  }

  /**
   * 结束进度条
   */
  const doneProgress = () => {
    NProgress.done()
  }

  /**
   * 设置进度条进度
   * @param progress 进度值 (0-1)
   */
  const setProgress = (progress: number) => {
    NProgress.set(progress)
  }

  /**
   * 增加进度条进度
   * @param amount 增加的进度值
   */
  const incProgress = (amount?: number) => {
    NProgress.inc(amount)
  }

  /**
   * 移除进度条
   */
  const removeProgress = () => {
    NProgress.remove()
  }

  /**
   * 获取当前进度值
   * @returns 当前进度值（0-1），未开始时为 null
   */
  const getCurrentProgress = () => {
    return NProgress.status
  }

  /**
   * 检查进度条是否正在运行
   * @returns 响应式布尔值：当前是否 started
   */
  const isProgressRunning = computed(() => {
    return NProgress.isStarted()
  })

  /**
   * 初始化 NProgress（仅做配置，不注册任何路由监听）
   */
  const initNProgress = () => {
    configureNProgress()
  }

  return {
    // 配置相关
    configureNProgress,
    initNProgress,

    // 进度控制
    startProgress,
    doneProgress,
    setProgress,
    incProgress,
    removeProgress,

    // 状态查询
    getCurrentProgress,
    isProgressRunning,
  }
}
