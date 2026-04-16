(function () {
  try {
    var script = document.currentScript
    var dataset = script && script.dataset ? script.dataset : {}
    var html = document.documentElement
    var params = new URLSearchParams(window.location.search)

    var defaultThemeMode = dataset.defaultThemeMode || 'auto'
    var themeModeStorageKey = dataset.themeModeStorageKey || 'theme-mode'
    var themePrimaryStorageKey = dataset.themePrimaryStorageKey || 'theme-primary'
    var themeBackgroundStorageKey = dataset.themeBackgroundStorageKey || 'theme-background'
    var e2eModeStorageKey = dataset.e2eModeStorageKey || 'ccd-e2e-mode'
    var e2eModeQueryKey = dataset.e2eModeQueryKey || 'e2e'
    var e2ePreloaderHoldQueryKey = dataset.e2ePreloaderHoldQueryKey || 'e2eHoldPreloader'

    var savedPrimary = localStorage.getItem(themePrimaryStorageKey)
    if (savedPrimary) {
      html.style.setProperty('--primary', savedPrimary)
    }

    var savedBackground = localStorage.getItem(themeBackgroundStorageKey)
    if (savedBackground) {
      html.style.setProperty('--background', savedBackground)
    }

    var e2eMode = params.get(e2eModeQueryKey) || localStorage.getItem(e2eModeStorageKey) || ''
    if (e2eMode) {
      html.dataset.e2eMode = e2eMode
    }

    if (params.get(e2ePreloaderHoldQueryKey) === '1') {
      html.dataset.e2ePreloaderHold = 'true'
    }

    html.dataset.appReady = 'false'
    html.dataset.preloaderState = 'visible'

    var mode = localStorage.getItem(themeModeStorageKey) || defaultThemeMode
    var prefersDark =
      typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
        : false
    var isDark = mode === 'dark' || ((mode === 'auto' || mode === 'glass') && prefersDark)

    html.classList.toggle('dark', isDark)
    html.classList.toggle('glass', mode === 'glass')
  } catch (_error) {
    // Ignore bootstrap preload failures and allow the app runtime to recover.
  }
})()
