import { markAppReady } from './bootstrap.js'

export interface FadeOutNativePreloaderOptions {
  document?: Document
  elementId?: string
  fadeClass?: string
  removeDelayMs?: number
  markReady?: boolean
}

function resolveDocument(documentOverride?: Document): Document | undefined {
  if (documentOverride) return documentOverride
  if (typeof document !== 'undefined') return document
  return undefined
}

export function fadeOutNativePreloader(options: FadeOutNativePreloaderOptions = {}): void {
  const activeDocument = resolveDocument(options.document)
  if (!activeDocument) return

  const {
    elementId = 'preloader-bg',
    fadeClass = 'preloader-fade-out',
    removeDelayMs = 450,
    markReady = true,
  } = options

  if (markReady) {
    markAppReady(activeDocument)
  }
  activeDocument.documentElement.dataset.preloaderState = 'hidden'

  const preloader = activeDocument.getElementById(elementId)
  if (!preloader) return

  preloader.classList.add(fadeClass)
  globalThis.setTimeout(() => {
    preloader.remove()
  }, removeDelayMs)
}
