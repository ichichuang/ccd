import { beforeEach, describe, expect, it } from 'vitest'
import { createCapabilityBridge } from './createCapabilityBridge'
import type { ExplicitCapabilityShape } from './createCapabilityBridge'

type ExpectTrue<T extends true> = T
type IsNever<T> = [T] extends [never] ? true : false

type ExplicitCapabilitiesAcceptNamedKeys = ExpectTrue<
  ExplicitCapabilityShape<TestCapabilities> extends TestCapabilities ? true : false
>
type ExplicitCapabilitiesRejectStringIndexSignature = ExpectTrue<
  IsNever<ExplicitCapabilityShape<Record<string, unknown>>>
>

const explicitCapabilitiesAcceptNamedKeys: ExplicitCapabilitiesAcceptNamedKeys = true
const explicitCapabilitiesRejectStringIndexSignature: ExplicitCapabilitiesRejectStringIndexSignature = true

interface TestCapabilities {
  getValue: () => string
  getCount: () => number
}

function createTestBridge(onMissing: 'throw' | 'null' = 'null') {
  return createCapabilityBridge<TestCapabilities>({
    label: 'TestBridge',
    assert(candidate) {
      if (typeof candidate.getValue !== 'function') {
        throw new TypeError('[TestBridge] getValue must be a function')
      }
      if (typeof candidate.getCount !== 'function') {
        throw new TypeError('[TestBridge] getCount must be a function')
      }
    },
    onMissing,
  })
}

describe('createCapabilityBridge', () => {
  let bridge: ReturnType<typeof createTestBridge>

  it('keeps capability typing explicit at compile time', () => {
    expect(explicitCapabilitiesAcceptNamedKeys).toBe(true)
    expect(explicitCapabilitiesRejectStringIndexSignature).toBe(true)
  })

  beforeEach(() => {
    bridge = createTestBridge()
  })

  describe('onMissing: "null"', () => {
    it('returns null before installation', () => {
      expect(bridge.isInstalled()).toBe(false)
      expect(bridge.get()).toBeNull()
    })

    it('throws from getOrThrow before installation', () => {
      expect(() => bridge.getOrThrow()).toThrow('[TestBridge] capabilities are not installed')
    })
  })

  describe('onMissing: "throw"', () => {
    it('throws from get before installation', () => {
      const throwingBridge = createTestBridge('throw')
      expect(() => throwingBridge.get()).toThrow('[TestBridge] capabilities are not installed')
    })
  })

  describe('install / get', () => {
    it('installs and reads capabilities', () => {
      const caps: TestCapabilities = {
        getValue: () => 'hello',
        getCount: () => 42,
      }

      bridge.install(caps)

      expect(bridge.isInstalled()).toBe(true)
      expect(bridge.get()).not.toBeNull()
      expect(bridge.get()!.getValue()).toBe('hello')
      expect(bridge.get()!.getCount()).toBe(42)
    })

    it('returns the same instance across calls', () => {
      bridge.install({ getValue: () => 'a', getCount: () => 1 })
      const first = bridge.get()
      const second = bridge.get()
      expect(first).toBe(second)
    })

    it('freezes the installed object', () => {
      bridge.install({ getValue: () => 'a', getCount: () => 1 })
      const instance = bridge.get()!
      expect(Object.isFrozen(instance)).toBe(true)
    })
  })

  describe('assert', () => {
    it('rejects candidates with missing functions', () => {
      expect(() =>
        bridge.install({
          getValue: 'not-a-function' as unknown as () => string,
          getCount: () => 1,
        })
      ).toThrow('[TestBridge] getValue must be a function')
    })

    it('rejects candidates with missing second function', () => {
      expect(() =>
        bridge.install({
          getValue: () => 'a',
          getCount: undefined as unknown as () => number,
        })
      ).toThrow('[TestBridge] getCount must be a function')
    })

    it('does not install on assertion failure', () => {
      try {
        bridge.install({
          getValue: 'bad' as unknown as () => string,
          getCount: () => 1,
        })
      } catch (error) {
        expect(error).toBeInstanceOf(TypeError)
      }
      expect(bridge.isInstalled()).toBe(false)
    })
  })

  describe('resetForTest', () => {
    it('clears the installed bridge in test mode', () => {
      bridge.install({ getValue: () => 'a', getCount: () => 1 })
      expect(bridge.isInstalled()).toBe(true)

      bridge.resetForTest()
      expect(bridge.isInstalled()).toBe(false)
      expect(bridge.get()).toBeNull()
    })

    it('throws outside test mode', () => {
      const mutableEnv = import.meta.env as { MODE?: string }
      const originalMode = mutableEnv.MODE
      try {
        mutableEnv.MODE = 'production'
        bridge.install({ getValue: () => 'a', getCount: () => 1 })
        expect(() => bridge.resetForTest()).toThrow('resetForTest is test-only')
      } finally {
        mutableEnv.MODE = originalMode
      }
    })
  })
})
