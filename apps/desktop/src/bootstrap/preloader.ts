const PRELOADER_FADE_DURATION_MS = 400
const PRELOADER_REMOVE_FALLBACK_MS = PRELOADER_FADE_DURATION_MS + 200

export function fadeOutNativePreloader(): void {
  if (typeof document === 'undefined') return

  const html = document.documentElement
  const preloader = document.getElementById('preloader-bg')

  html.dataset.appReady = 'true'
  html.dataset.runtimeLoading = 'false'
  html.dataset.preloaderState = 'hidden'

  if (!preloader) return

  const removePreloader = () => {
    preloader.removeEventListener('transitionend', removePreloader)
    preloader.remove()
  }

  preloader.addEventListener('transitionend', removePreloader, { once: true })
  preloader.classList.add('preloader-fade-out')
  window.setTimeout(removePreloader, PRELOADER_REMOVE_FALLBACK_MS)
}
