function getRuntimeUserAgent(): string {
  if (typeof navigator === 'undefined') {
    return ''
  }

  return navigator.userAgent
}

export const isTauri = (): boolean =>
  typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window

export const isDesktop = (): boolean => isTauri()

export const isWindows = (): boolean => /Windows/i.test(getRuntimeUserAgent())

export const isMacOS = (): boolean => /Mac OS|Macintosh/i.test(getRuntimeUserAgent())

export const isTauriWindows = (): boolean => isTauri() && isWindows()
