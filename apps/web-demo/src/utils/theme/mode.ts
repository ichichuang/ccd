let systemDarkModeQuery: MediaQueryList | null = null

export function getSystemDarkModeQuery(): MediaQueryList | null {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return null
  }
  systemDarkModeQuery ??= window.matchMedia('(prefers-color-scheme: dark)')
  return systemDarkModeQuery
}

export function getSystemPrefersDark(): boolean {
  return getSystemDarkModeQuery()?.matches ?? false
}

export function resolveThemeModeIsDark(
  mode: ThemeMode,
  systemPrefersDark: boolean = getSystemPrefersDark()
): boolean {
  return mode === 'dark' || ((mode === 'auto' || mode === 'glass') && systemPrefersDark)
}

export function applyThemeModeToRoot(
  mode: ThemeMode,
  isDark: boolean = resolveThemeModeIsDark(mode)
): void {
  if (typeof document === 'undefined') return

  const root = document.documentElement
  root.classList.toggle('dark', isDark)
  root.classList.toggle('glass', mode === 'glass')
  root.dataset.themeMode = mode
  root.dataset.themeResolved = isDark ? 'dark' : 'light'
  root.style.colorScheme = isDark ? 'dark' : 'light'
}
