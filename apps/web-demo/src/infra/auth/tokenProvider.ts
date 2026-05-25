/**
 * Auth Bridge
 *
 * Infrastructure-only cycle breaker between the HTTP runtime and the session/router
 * runtime. HTTP code may read token state and notify final 401 handling through this
 * typed bridge, without importing Pinia stores or vue-router directly.
 */

import { createCapabilityBridge } from '@ccd/shared-utils'

export type AuthToken = string | null
export type AuthTokenReader = () => AuthToken
export type UnauthorizedHandler = () => void | Promise<void>

export interface AuthBridge {
  readToken: AuthTokenReader
  onUnauthorized: UnauthorizedHandler
}

const UNAUTHORIZED_NOTIFY_COOLDOWN_MS = 1000

const bridge = createCapabilityBridge<AuthBridge>({
  label: 'AuthBridge',
  assert(candidate) {
    if (typeof candidate.readToken !== 'function') {
      throw new TypeError('[AuthBridge] readToken must be a function')
    }
    if (typeof candidate.onUnauthorized !== 'function') {
      throw new TypeError('[AuthBridge] onUnauthorized must be a function')
    }
  },
  onMissing: 'null',
})

let unauthorizedPromise: Promise<void> | null = null
let lastUnauthorizedHandledAt: number | null = null

export function installAuthBridge(auth: AuthBridge): void {
  bridge.install(auth)
}

export function isAuthBridgeInstalled(): boolean {
  return bridge.isInstalled()
}

export function readAuthToken(): AuthToken {
  return bridge.get()?.readToken() ?? null
}

export function notifyUnauthorized(): Promise<void> {
  const instance = bridge.get()
  if (!instance) {
    return Promise.reject(new Error('[AuthBridge] Unauthorized handler is not installed'))
  }

  if (unauthorizedPromise) {
    return unauthorizedPromise
  }

  const now = Date.now()
  if (
    lastUnauthorizedHandledAt !== null &&
    now - lastUnauthorizedHandledAt < UNAUTHORIZED_NOTIFY_COOLDOWN_MS
  ) {
    return Promise.resolve()
  }

  lastUnauthorizedHandledAt = now
  unauthorizedPromise = Promise.resolve()
    .then(() => instance.onUnauthorized())
    .finally(() => {
      unauthorizedPromise = null
    })

  return unauthorizedPromise
}

/**
 * Compatibility alias for architecture demo pages and older non-production examples.
 * New runtime code should use readAuthToken().
 */
export function getToken(): AuthToken {
  return readAuthToken()
}

export function resetAuthBridgeForTest(): void {
  bridge.resetForTest()
  unauthorizedPromise = null
  lastUnauthorizedHandledAt = null
}
