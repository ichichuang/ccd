export interface CapabilityBridgeOptions<T extends object> {
  readonly label: string
  readonly assert: (candidate: T) => void
  readonly onMissing: 'throw' | 'null'
}

export interface CapabilityBridge<T extends object> {
  install(capabilities: T): void
  isInstalled(): boolean
  get(): T | null
  getOrThrow(): T
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
