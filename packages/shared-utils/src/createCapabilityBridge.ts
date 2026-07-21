export type ExplicitCapabilityShape<T extends object> = string extends keyof T
  ? never
  : number extends keyof T
    ? never
    : symbol extends keyof T
      ? never
      : T

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
}

export function createCapabilityBridge<T extends object>(
  options: CapabilityBridgeOptions<T>,
  ...indexSignatureGuard: [ExplicitCapabilityShape<T>] extends [never] ? [never] : []
): CapabilityBridge<T> {
  const { label, assert, onMissing } = options
  void indexSignatureGuard

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
  }
}
