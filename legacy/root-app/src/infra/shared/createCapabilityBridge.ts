/**
 * Generic factory for the Infrastructure DI bridge pattern.
 *
 * Both `tokenProvider` and `routeProvider` follow the same four-step lifecycle:
 * assert → install → get → resetForTest. This factory eliminates that duplication.
 *
 * @typeParam T - The shape of the capability object being bridged.
 */

export interface CapabilityBridgeOptions<T extends object> {
  /** Human-readable name used in error messages (e.g. "AuthBridge", "RouterCapabilities"). */
  readonly label: string

  /**
   * Validates that a candidate object satisfies the contract for T.
   * Should throw `TypeError` on structural mismatch.
   */
  readonly assert: (candidate: T) => void

  /**
   * Controls what happens when a consumer calls `get()` before `install()`.
   * - `"throw"`  — fail-fast: throws an Error (used by routeProvider).
   * - `"null"`   — graceful degradation: returns null (used by tokenProvider).
   */
  readonly onMissing: 'throw' | 'null'
}

export interface CapabilityBridge<T extends object> {
  /** Validates and stores the capability singleton (frozen). */
  install(capabilities: T): void

  /** Returns true if a capability object has been installed. */
  isInstalled(): boolean

  /**
   * Reads the installed capabilities.
   * Behaviour when nothing is installed is controlled by `onMissing`.
   */
  get(): T | null

  /**
   * Returns the installed capabilities, throwing if nothing is installed.
   * Use this when the consumer expects a non-null result.
   */
  getOrThrow(): T

  /** Nulls out all internal state. Throws outside of test mode. */
  resetForTest(): void
}

export function createCapabilityBridge<T extends object>(
  options: CapabilityBridgeOptions<T>
): CapabilityBridge<T> {
  const { label, assert, onMissing } = options

  let instance: Readonly<T> | null = null

  function createMissingError(): Error {
    return new Error(`[${label}] capabilities are not installed`)
  }

  return {
    install(capabilities: T): void {
      assert(capabilities)
      instance = Object.freeze({ ...capabilities }) as Readonly<T>
    },

    isInstalled(): boolean {
      return instance !== null
    },

    get(): T | null {
      if (!instance) {
        if (onMissing === 'throw') {
          throw createMissingError()
        }
        return null
      }
      return instance as T
    },

    getOrThrow(): T {
      if (!instance) {
        throw createMissingError()
      }
      return instance as T
    },

    resetForTest(): void {
      if (import.meta.env.MODE !== 'test') {
        throw new Error(`[${label}] resetForTest is test-only`)
      }
      instance = null
    },
  }
}
