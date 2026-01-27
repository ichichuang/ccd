/**
 * NProgress 进度条工具库
 * 仅提供 start/done 等方法，不监听路由；路由变化时的控制权由 src/router/utils/permission.ts 接管
 */
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
export function useNprogress() {
  /**
   * NProgress 配置
   */
  const configureNProgress = () => {
    NProgress.configure({
      easing: 'ease-in-out', // 缓动更顺滑
      speed: 700, // 稍微慢一点，更有节奏感
      trickle: true, // 保持涓流推进
      trickleSpeed: 150, // 更平滑的涓流速度
      showSpinner: false, // 不显示右上角小圈
      minimum: 0.05, // 从更低的值开始
    })
  }

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
   */
  const getCurrentProgress = () => {
    return NProgress.status
  }

  /**
   * 检查进度条是否正在运行
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
