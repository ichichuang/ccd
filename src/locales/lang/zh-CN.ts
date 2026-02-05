/**
 * 中文语言包 (zh-CN)
 */
const zhCN = {
  router: {
    core: {
      root: '首页',
      login: '登录',
    },
    dashboard: {
      dashboard: '仪表盘',
    },
    error: {
      title: '错误',
      notFound: '页面未找到',
      forbidden: '访问被拒绝',
      serverError: '服务器错误',
    },
  },

  http: {
    error: {
      requestFailed: '请求失败',
      networkConnectionFailed: '网络连接失败，请检查网络设置',
      corsBlocked: '跨域请求被阻止，请联系管理员',
      requestTimeout: '请求超时，请稍后重试',
      securityVerificationFailed: '安全验证失败',
      unknownError: '未知错误',
      badRequest: '请求错误',
      unauthorized: '未授权',
      forbidden: '权限不足',
      notFound: '请求的资源不存在',
      internalServerError: '服务器内部错误',
      serviceUnavailable: '服务器暂时不可用',
      httpError: 'HTTP {status} 错误',
    },
    config: {
      timeoutTooShort: '请求超时时间不能小于 1 秒',
      invalidAppEnv: '无效的应用环境: {env}',
      alovaConfigError: 'Alova 配置错误: {errors}',
    },
    upload: {
      hashCalculationFailed: '文件哈希计算失败',
      fileReadFailed: '文件读取失败',
      chunkUploadFailed: '分片上传失败: {chunk}/{total}',
      fileMergeFailed: '文件合并失败: {fileName}',
      fileDownloadFailed: '文件下载失败',
    },
    connection: {
      networkUnavailable: '网络不可用',
      manualDisconnect: '手动断开',
      maxReconnectAttemptsReached: '重连次数已达上限',
      reconnectFailed: '重连失败',
      healthCheckFailed: '健康检查失败',
      networkDisconnected: '网络断开',
    },
  },

  dialog: {
    infoTitle: '提示',
    successTitle: '成功',
    warningTitle: '警告',
    errorTitle: '错误',
    confirmTitle: '确认',
    deleteTitle: '删除确认',
    deleteMessage: '确定要删除吗？',
  },
  common: {
    confirm: '确定',
    cancel: '取消',
    delete: '删除',
  },
  settings: {
    themeMode: '深色 / 浅色',
    themeModeLight: '浅色',
    themeModeDark: '深色',
    themeModeAuto: '跟随系统',
    themePreset: '系统配色',
    size: '尺寸',
    layoutMode: '布局模式',
    layoutVertical: '侧边栏',
    layoutHorizontal: '顶栏',
    layoutMix: '混合',
    locale: '语言',
    transitionDuration: '过渡时长',
    transitionEffect: '切换动画',
    transitionCircle: '圆形扩散',
    transitionCurtain: '窗帘滑入',
    transitionDiamond: '菱形扩散',
    transitionFade: '淡入淡出',
    transitionGlitch: '故障效果',
    transitionImplosion: '内爆收缩',
    durationUltraSlow: '超慢',
    durationSlow: '慢',
    durationComfortable: '舒适',
    durationFast: '快',
    durationUltraFast: '超快',
  },
}

export { zhCN }
export default zhCN
