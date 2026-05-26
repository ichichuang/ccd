export interface VitePreloadErrorRecoveryOptions {
  storage?: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>
  storageKey: string
  reload?: () => void
  logger?: Pick<Console, 'error'>
}

export function setupVitePreloadErrorRecovery(
  options: VitePreloadErrorRecoveryOptions
): () => void {
  if (typeof window === 'undefined') {
    return () => {}
  }

  const storage = options.storage ?? window.sessionStorage
  const reload = options.reload ?? (() => window.location.reload())
  const logger = options.logger ?? console
  const listener = (event: Event) => {
    event.preventDefault()

    const hasReloaded = storage.getItem(options.storageKey)
    if (!hasReloaded) {
      storage.setItem(options.storageKey, 'true')
      reload()
      return
    }

    logger.error('Vite chunk preload failed permanently.')
    storage.removeItem(options.storageKey)
  }

  window.addEventListener('vite:preloadError', listener as EventListener)

  return () => {
    window.removeEventListener('vite:preloadError', listener as EventListener)
  }
}
