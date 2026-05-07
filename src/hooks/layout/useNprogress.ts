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

// 配置只需在应用生命周期内执行一次，避免重复调用
let nprogressConfigured = false
let trickleTimer: ReturnType<typeof setInterval> | null = null
let removeTimer: ReturnType<typeof setTimeout> | null = null
const progressStatus = ref<number | null>(null)

const progressOptions = {
  minimum: 0.05,
  trickleSpeed: 150,
}

function clampProgress(progress: number): number {
  return Math.min(1, Math.max(0, progress))
}

function ensureProgressElement(): HTMLDivElement | null {
  if (typeof document === 'undefined') return null

  const existing = document.getElementById('nprogress')
  if (existing instanceof HTMLDivElement) return existing

  const root = document.createElement('div')
  root.id = 'nprogress'

  const bar = document.createElement('div')
  bar.className = 'bar'
  bar.setAttribute('role', 'bar')

  const peg = document.createElement('div')
  peg.className = 'peg'

  bar.appendChild(peg)
  root.appendChild(bar)
  document.body.appendChild(root)
  return root
}

function renderProgress(): void {
  const root = ensureProgressElement()
  const status = progressStatus.value
  if (!root || status === null) return

  const bar = root.querySelector<HTMLDivElement>('.bar')
  if (!bar) return
  bar.style.transform = `translate3d(${(-1 + status) * 100}%, 0, 0)`
  bar.style.transition = 'transform 200ms ease'
}

function clearTrickle(): void {
  if (!trickleTimer) return
  clearInterval(trickleTimer)
  trickleTimer = null
}

function scheduleTrickle(): void {
  clearTrickle()
  trickleTimer = setInterval(() => {
    if (progressStatus.value === null) {
      clearTrickle()
      return
    }
    if (progressStatus.value >= 0.94) return
    progressStatus.value = clampProgress(progressStatus.value + 0.03)
    renderProgress()
  }, progressOptions.trickleSpeed)
}

function removeProgressElement(): void {
  if (typeof document === 'undefined') return
  document.getElementById('nprogress')?.remove()
}

export function useNprogress() {
  /**
   * NProgress 配置
   * - 内部带一次性保护：多次调用也只会真正配置一次
   */
  const configureNProgress = () => {
    if (nprogressConfigured) return
    nprogressConfigured = true
  }

  // 保证每次使用前都已完成配置（实际只会生效一次）
  configureNProgress()

  /**
   * 开始进度条
   */
  const startProgress = () => {
    if (removeTimer) {
      clearTimeout(removeTimer)
      removeTimer = null
    }
    progressStatus.value = progressOptions.minimum
    renderProgress()
    scheduleTrickle()
  }

  /**
   * 结束进度条
   */
  const doneProgress = () => {
    if (progressStatus.value === null) return
    clearTrickle()
    progressStatus.value = 1
    renderProgress()
    removeTimer = setTimeout(() => {
      removeProgressElement()
      progressStatus.value = null
      removeTimer = null
    }, 200)
  }

  /**
   * 设置进度条进度
   * @param progress 进度值 (0-1)
   */
  const setProgress = (progress: number) => {
    progressStatus.value = clampProgress(progress)
    renderProgress()
    if (progressStatus.value < 1) scheduleTrickle()
  }

  /**
   * 增加进度条进度
   * @param amount 增加的进度值
   */
  const incProgress = (amount?: number) => {
    const next = (progressStatus.value ?? progressOptions.minimum) + (amount ?? 0.03)
    progressStatus.value = clampProgress(next)
    renderProgress()
  }

  /**
   * 移除进度条
   */
  const removeProgress = () => {
    clearTrickle()
    if (removeTimer) {
      clearTimeout(removeTimer)
      removeTimer = null
    }
    removeProgressElement()
    progressStatus.value = null
  }

  /**
   * 获取当前进度值
   * @returns 当前进度值（0-1），未开始时为 null
   */
  const getCurrentProgress = () => {
    return progressStatus.value
  }

  /**
   * 检查进度条是否正在运行
   * @returns 响应式布尔值：当前是否 started
   */
  const isProgressRunning = computed(() => {
    return progressStatus.value !== null
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
