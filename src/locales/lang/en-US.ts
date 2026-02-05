/**
 * 英文语言包 (en-US)
 */
const enUS = {
  router: {
    core: {
      root: 'Home',
      login: 'Login',
    },
    dashboard: {
      dashboard: 'Dashboard',
    },
    error: {
      title: 'Error',
      notFound: 'Page Not Found',
      forbidden: 'Forbidden',
      serverError: 'Server Error',
    },
  },

  http: {
    error: {
      requestFailed: 'Request failed',
      networkConnectionFailed: 'Network connection failed, please check your network settings',
      corsBlocked: 'Cross-origin request blocked, please contact administrator',
      requestTimeout: 'Request timeout, please try again later',
      securityVerificationFailed: 'Security verification failed',
      unknownError: 'Unknown error',
      badRequest: 'Bad request',
      unauthorized: 'Unauthorized',
      forbidden: 'Insufficient permissions',
      notFound: 'Requested resource not found',
      internalServerError: 'Internal server error',
      serviceUnavailable: 'Service temporarily unavailable',
      httpError: 'HTTP {status} error',
    },
    config: {
      timeoutTooShort: 'Request timeout cannot be less than 1 second',
      invalidAppEnv: 'Invalid application environment: {env}',
      alovaConfigError: 'Alova configuration error: {errors}',
    },
    upload: {
      hashCalculationFailed: 'File hash calculation failed',
      fileReadFailed: 'File read failed',
      chunkUploadFailed: 'Chunk upload failed: {chunk}/{total}',
      fileMergeFailed: 'File merge failed: {fileName}',
      fileDownloadFailed: 'File download failed',
    },
    connection: {
      networkUnavailable: 'Network unavailable',
      manualDisconnect: 'Manual disconnect',
      maxReconnectAttemptsReached: 'Maximum reconnection attempts reached',
      reconnectFailed: 'Reconnection failed',
      healthCheckFailed: 'Health check failed',
      networkDisconnected: 'Network disconnected',
    },
  },

  dialog: {
    infoTitle: 'Info',
    successTitle: 'Success',
    warningTitle: 'Warning',
    errorTitle: 'Error',
    confirmTitle: 'Confirm',
    deleteTitle: 'Delete Confirmation',
    deleteMessage: 'Are you sure you want to delete?',
  },
  common: {
    confirm: 'Confirm',
    cancel: 'Cancel',
    delete: 'Delete',
  },
  settings: {
    themeMode: 'Theme Mode',
    themeModeLight: 'Light',
    themeModeDark: 'Dark',
    themeModeAuto: 'System',
    themePreset: 'Color Scheme',
    size: 'Size',
    layoutMode: 'Layout',
    layoutVertical: 'Sidebar',
    layoutHorizontal: 'Top Menu',
    layoutMix: 'Mix',
    locale: 'Language',
    transitionDuration: 'Transition Duration',
    transitionEffect: 'Transition Effect',
    transitionCircle: 'Circle',
    transitionCurtain: 'Curtain',
    transitionDiamond: 'Diamond',
    transitionFade: 'Fade',
    transitionGlitch: 'Glitch',
    transitionImplosion: 'Implosion',
    durationUltraSlow: 'Ultra slow',
    durationSlow: 'Slow',
    durationComfortable: 'Comfortable',
    durationFast: 'Fast',
    durationUltraFast: 'Ultra fast',
  },
}

export { enUS }
export default enUS
