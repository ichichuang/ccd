/**
 * 全局错误处理插件 (防白屏 GlobalErrorHandler)
 *
 * 职责：
 * - 捕获 Vue 渲染与生命周期错误 (app.config.errorHandler)
 * - 捕获浏览器级错误：window.onerror / window.unhandledrejection
 * - 在开发环境输出详细日志，在生产环境进行“模拟”上报并给出友好提示
 */

export function setupErrorHandler(app: App) {
  const isProd = import.meta.env.PROD

  /**
   * 日志上报（模拟实现）
   * 实际项目中可替换为调用后端日志服务或 Sentry 等
   */
  const reportErrorToServer = (error: unknown, context?: Record<string, unknown>) => {
    if (!isProd) return
    try {
      // 模拟：仅在控制台打印“已上报”的结构化信息
      console.info('[GlobalErrorHandler] 模拟上报错误:', {
        error,
        context,
      })
    } catch (e) {
      console.error('[GlobalErrorHandler] 上报错误失败:', e)
    }
  }

  /**
   * 生产环境下给用户的友好提示
   */
  const showUserFriendlyToast = () => {
    if (!isProd || typeof window === 'undefined') return
    try {
      const anyWindow = window as any

      // 优先使用全局 $message（与现有类型声明对齐）
      if (anyWindow.$message?.error) {
        anyWindow.$message.error('系统遇到问题，请刷新页面重试。')
        return
      }

      // 兼容历史上的 $toast.errorIn 调用方式
      if (anyWindow.$toast?.errorIn) {
        anyWindow.$toast.errorIn('top-left', '系统错误', '系统遇到问题，请刷新页面重试。')
        return
      }

      // 若无全局消息组件，则退化为控制台警告
      console.warn('系统遇到问题，请刷新页面重试。')
    } catch (e) {
      console.error('[GlobalErrorHandler] 显示用户提示失败:', e)
    }
  }

  /**
   * Vue 内部错误处理（渲染 / 生命周期 / 事件回调）
   */
  app.config.errorHandler = (err, instance, info) => {
    if (!isProd) {
      // 开发环境：输出包含组件与信息的详细日志
      console.error('[GlobalErrorHandler][VueError]', {
        err,
        info,
        instance,
      })
    } else {
      console.error('[GlobalErrorHandler] 捕获到 Vue 错误:', err, 'info:', info)
      reportErrorToServer(err, {
        info,
        componentName: instance?.type?.name ?? instance?.type ?? 'unknown',
      })
      showUserFriendlyToast()
    }
  }

  if (typeof window === 'undefined') {
    // SSR 或非浏览器环境下不注册 window 级别监听
    return
  }

  /**
   * 浏览器级错误处理：同步错误 / 资源加载错误
   */
  window.addEventListener(
    'error',
    event => {
      // 默认行为仍然保留（让控制台能显示原生错误）
      if (!isProd) {
        console.error('[GlobalErrorHandler][WindowError]', event.error || event)
      } else {
        // 区分资源加载错误与脚本错误
        const isResourceError = event.target && event.target !== window
        const context =
          isResourceError && event.target instanceof HTMLElement
            ? {
                tagName: event.target.tagName,
                src: (event.target as HTMLImageElement).src,
                href: (event.target as HTMLLinkElement).href,
              }
            : undefined

        reportErrorToServer(event.error || event.message || 'Unknown error', context)

        // 资源加载错误通常不致命，这里仅记录不提示
        if (!isResourceError) {
          showUserFriendlyToast()
        }
      }
    },
    true
  )

  /**
   * 未捕获 Promise 拒绝（典型：异步接口未 catch）
   */
  window.addEventListener('unhandledrejection', event => {
    if (!isProd) {
      console.error('[GlobalErrorHandler][UnhandledRejection]', event.reason)
    } else {
      reportErrorToServer(event.reason || 'Unhandled promise rejection')
      showUserFriendlyToast()
    }
  })
}
