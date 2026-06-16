/**
 * Browser CSS custom property reader adapter.
 *
 * Isolates `getComputedStyle`, `document.documentElement`, and `requestAnimationFrame`
 * so view-layer code remains runtime-surface compliant.
 */
let docElement: HTMLElement | null = null

function getDocumentElement(): HTMLElement {
  if (!docElement) {
    docElement = document.documentElement
  }
  return docElement
}

/**
 * Read a CSS custom property value from the document root (`:root` / `<html>`).
 * Returns the trimmed computed value, or an empty string if unavailable.
 */
export function readRootCssVar(name: string): string {
  try {
    return getComputedStyle(getDocumentElement()).getPropertyValue(name).trim()
  } catch {
    return ''
  }
}

/**
 * Read a CSS custom property from a specific element.
 * Returns the trimmed computed value, or an empty string.
 */
export function readElementCssVar(element: HTMLElement, name: string): string {
  try {
    return getComputedStyle(element).getPropertyValue(name).trim()
  } catch {
    return ''
  }
}

/**
 * Wait for the next animation frame, resolving after the browser has painted.
 * Returns immediately with a no-op if requestAnimationFrame is unavailable (SSR).
 */
export function waitForNextFrame(): Promise<void> {
  if (typeof requestAnimationFrame === 'undefined') {
    return Promise.resolve()
  }
  return new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
}
