import {
  RUNTIME_E2E_EVENTS,
  RUNTIME_QUERY_KEYS,
  RUNTIME_STORAGE_KEYS,
  type RuntimeE2EMode,
} from '@/constants/runtime'

function normalizeRuntimeE2EMode(value: unknown): RuntimeE2EMode {
  return value === 'visual' ? 'visual' : 'off'
}

export function resolveRuntimeE2EModeFromLocation(search: string): RuntimeE2EMode {
  const params = new URLSearchParams(search)
  return normalizeRuntimeE2EMode(params.get(RUNTIME_QUERY_KEYS.e2eMode))
}

export function resolveRuntimeE2EModeFromDocument(): RuntimeE2EMode {
  if (typeof document === 'undefined') {
    return 'off'
  }

  const htmlMode = document.documentElement.dataset.e2eMode
  if (htmlMode) {
    return normalizeRuntimeE2EMode(htmlMode)
  }

  if (typeof window === 'undefined') {
    return 'off'
  }

  const queryMode = resolveRuntimeE2EModeFromLocation(window.location.search)
  if (queryMode !== 'off') {
    return queryMode
  }

  try {
    return normalizeRuntimeE2EMode(window.localStorage.getItem(RUNTIME_STORAGE_KEYS.e2eMode))
  } catch {
    return 'off'
  }
}

export function isVisualE2EMode(): boolean {
  return resolveRuntimeE2EModeFromDocument() === 'visual'
}

export function shouldHoldPreloaderForE2E(): boolean {
  if (typeof document === 'undefined') {
    return false
  }

  if (document.documentElement.dataset.e2ePreloaderHold === 'true') {
    return true
  }

  if (typeof window === 'undefined') {
    return false
  }

  const params = new URLSearchParams(window.location.search)
  return params.get(RUNTIME_QUERY_KEYS.e2ePreloaderHold) === '1'
}

export function dispatchRuntimeE2EEvent(
  name: (typeof RUNTIME_E2E_EVENTS)[keyof typeof RUNTIME_E2E_EVENTS],
  detail?: Record<string, unknown>
): void {
  if (typeof window === 'undefined') {
    return
  }

  window.dispatchEvent(
    new CustomEvent(name, {
      detail,
    })
  )
}
