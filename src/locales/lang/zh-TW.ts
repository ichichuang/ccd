/**
 * 繁体中文语言包 (zh-TW)
 */
const zhTW = {
  router: {
    core: {
      root: '首頁',
      login: '登錄',
    },
    dashboard: {
      dashboard: '儀表板',
    },
    error: {
      title: '錯誤',
      notFound: '頁面未找到',
      forbidden: '訪問被拒絕',
      serverError: '服務器錯誤',
    },
  },

  http: {
    error: {
      requestFailed: '請求失敗',
      networkConnectionFailed: '網絡連接失敗，請檢查網絡設置',
      corsBlocked: '跨域請求被阻止，請聯繫管理員',
      requestTimeout: '請求超時，請稍後重試',
      securityVerificationFailed: '安全驗證失敗',
      unknownError: '未知錯誤',
      badRequest: '請求錯誤',
      unauthorized: '未授權',
      forbidden: '權限不足',
      notFound: '請求的資源不存在',
      internalServerError: '服務器內部錯誤',
      serviceUnavailable: '服務器暫時不可用',
      httpError: 'HTTP {status} 錯誤',
    },
    config: {
      timeoutTooShort: '請求超時時間不能小於 1 秒',
      invalidAppEnv: '無效的應用環境: {env}',
      alovaConfigError: 'Alova 配置錯誤: {errors}',
    },
    upload: {
      hashCalculationFailed: '文件哈希計算失敗',
      fileReadFailed: '文件讀取失敗',
      chunkUploadFailed: '分片上傳失敗: {chunk}/{total}',
      fileMergeFailed: '文件合併失敗: {fileName}',
      fileDownloadFailed: '文件下載失敗',
    },
    connection: {
      networkUnavailable: '網絡不可用',
      manualDisconnect: '手動斷開',
      maxReconnectAttemptsReached: '重連次數已達上限',
      reconnectFailed: '重連失敗',
      healthCheckFailed: '健康檢查失敗',
      networkDisconnected: '網絡斷開',
    },
  },
}

export { zhTW }
export default zhTW
