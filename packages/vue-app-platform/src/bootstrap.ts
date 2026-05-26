function resolveDocument(documentOverride?: Document): Document | undefined {
  if (documentOverride) return documentOverride
  if (typeof document !== 'undefined') return document
  return undefined
}

export function waitForStablePaint(): Promise<void> {
  const raf = globalThis.requestAnimationFrame
  if (typeof raf === 'function') {
    return new Promise(resolve => {
      raf(() => {
        raf(() => resolve())
      })
    })
  }
  if (typeof globalThis.setTimeout === 'function') {
    return new Promise(resolve => {
      globalThis.setTimeout(resolve, 0)
    })
  }
  return Promise.resolve()
}

export function markAppBootstrapping(documentOverride?: Document): void {
  const activeDocument = resolveDocument(documentOverride)
  if (!activeDocument) return

  activeDocument.documentElement.dataset.appReady = 'false'
  activeDocument.documentElement.dataset.runtimeLoading = 'true'
}

export function markAppReady(documentOverride?: Document): void {
  const activeDocument = resolveDocument(documentOverride)
  if (!activeDocument) return

  activeDocument.documentElement.dataset.appReady = 'true'
  activeDocument.documentElement.dataset.runtimeLoading = 'false'
}
