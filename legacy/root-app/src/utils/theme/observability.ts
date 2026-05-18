/**
 * Theme Engine v5 — Observability Layer
 *
 * Lightweight in-memory event stream for theme resolution, derivation,
 * compilation, validation, cache, and diagnostics.
 */

export type ThemeEvent =
  | { type: 'RESOLVE_START'; preset: string; mode: ThemeMode }
  | { type: 'RESOLVE_END'; duration: number }
  | { type: 'TOKEN_DERIVED'; token: string; source: 'base' | 'semantic' | 'fallback' }
  | { type: 'TOKEN_OVERRIDDEN'; token: string }
  | { type: 'CONTRAST_ADJUSTED'; token: string; before: number; after: number }
  | { type: 'CACHE_HIT'; key: string }
  | { type: 'CACHE_MISS'; key: string }

export type ThemeEventListener = (event: ThemeEvent) => void

export interface ThemeObserver {
  subscribe: (fn: ThemeEventListener) => () => void
  getEvents: () => ThemeEvent[]
  clear: () => void
}

interface ThemeObserverInternal extends ThemeObserver {
  emit: (event: ThemeEvent) => void
}

declare global {
  var __THEME_DEVTOOLS__: boolean | undefined
}

const MAX_EVENT_HISTORY = 500

function isDiagnosticsEnabled(): boolean {
  return globalThis.__THEME_DEVTOOLS__ === true && !import.meta.env.PROD
}

function formatEvent(event: ThemeEvent): string {
  if (event.type === 'TOKEN_DERIVED') {
    return `${event.type} ${event.token} (${event.source})`
  }
  if (event.type === 'TOKEN_OVERRIDDEN') {
    return `${event.type} ${event.token}`
  }
  if (event.type === 'CONTRAST_ADJUSTED') {
    return `${event.type} ${event.token} ${event.before.toFixed(2)} -> ${event.after.toFixed(2)}`
  }
  if (event.type === 'CACHE_HIT' || event.type === 'CACHE_MISS') {
    return `${event.type} ${event.key}`
  }
  if (event.type === 'RESOLVE_START') {
    return `${event.type} ${event.preset}:${event.mode}`
  }
  return `${event.type} ${event.duration.toFixed(2)}ms`
}

function writeDiagnostics(event: ThemeEvent): void {
  if (!isDiagnosticsEnabled()) return

  const label = `[theme:v5] ${formatEvent(event)}`
  if (
    (event.type === 'TOKEN_DERIVED' && event.source === 'fallback') ||
    event.type === 'CONTRAST_ADJUSTED'
  ) {
    console.warn(label, event)
    return
  }
  console.info(label, event)
}

export function createThemeObserver(): ThemeObserverInternal {
  const events: ThemeEvent[] = []
  const listeners = new Set<ThemeEventListener>()

  return {
    subscribe(fn) {
      listeners.add(fn)
      return () => {
        listeners.delete(fn)
      }
    },
    getEvents() {
      return [...events]
    },
    clear() {
      events.length = 0
    },
    emit(event) {
      events.push(event)
      if (events.length > MAX_EVENT_HISTORY) {
        events.shift()
      }

      for (const listener of listeners) {
        listener(event)
      }

      writeDiagnostics(event)
    },
  }
}

const defaultThemeObserver = createThemeObserver()

export function getThemeObserver(): ThemeObserver {
  return defaultThemeObserver
}

export function emitThemeEvent(event: ThemeEvent): void {
  defaultThemeObserver.emit(event)
}

export function getThemeEvents(): ThemeEvent[] {
  return defaultThemeObserver.getEvents()
}

export function clearThemeEvents(): void {
  defaultThemeObserver.clear()
}
