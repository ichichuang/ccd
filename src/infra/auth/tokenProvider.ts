/**
 * Auth Bridge
 *
 * Infrastructure-only cycle breaker between the HTTP runtime and the session/router
 * runtime. HTTP code may read token state and notify final 401 handling through this
 * typed bridge, without importing Pinia stores or vue-router directly.
 */

export type AuthToken = string | undefined | null
export type AuthTokenReader = () => AuthToken
export type UnauthorizedHandler = () => void | Promise<void>

export interface AuthBridge {
  readToken: AuthTokenReader
  onUnauthorized: UnauthorizedHandler
}

const UNAUTHORIZED_NOTIFY_COOLDOWN_MS = 1000

let authBridge: Readonly<AuthBridge> | null = null
let unauthorizedPromise: Promise<void> | null = null
let lastUnauthorizedHandledAt: number | null = null

function assertAuthBridge(candidate: AuthBridge): void {
  if (typeof candidate.readToken !== 'function') {
    throw new TypeError('[AuthBridge] readToken must be a function')
  }
  if (typeof candidate.onUnauthorized !== 'function') {
    throw new TypeError('[AuthBridge] onUnauthorized must be a function')
  }
}

function createMissingBridgeError(): Error {
  return new Error('[AuthBridge] Unauthorized handler is not installed')
}

export function installAuthBridge(bridge: AuthBridge): void {
  assertAuthBridge(bridge)
  authBridge = Object.freeze({
    readToken: bridge.readToken,
    onUnauthorized: bridge.onUnauthorized,
  })
}

export function isAuthBridgeInstalled(): boolean {
  return authBridge !== null
}

export function readAuthToken(): AuthToken {
  return authBridge?.readToken() ?? null
}

export function notifyUnauthorized(): Promise<void> {
  const bridge = authBridge
  if (!bridge) {
    return Promise.reject(createMissingBridgeError())
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
    .then(() => bridge.onUnauthorized())
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
  if (import.meta.env.MODE !== 'test') {
    throw new Error('[AuthBridge] resetAuthBridgeForTest is test-only')
  }
  authBridge = null
  unauthorizedPromise = null
  lastUnauthorizedHandledAt = null
}
