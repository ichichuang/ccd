import { describe, expect, it, vi } from 'vitest'
import { createPiniaEncryptedSerializer } from './piniaSerializer'

describe('createPiniaEncryptedSerializer', () => {
  it('encrypts persisted values and round-trips safe object payloads', () => {
    const serializer = createPiniaEncryptedSerializer('unit-test-secret')
    const value = { token: 'secret-token', profile: { name: 'Ada' } }

    const serialized = serializer.serialize(value)

    expect(serialized).not.toContain('secret-token')
    expect(serializer.deserialize(serialized)).toEqual(value)
  })

  it('supports plain JSON migration fallback through the object boundary', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const serializer = createPiniaEncryptedSerializer('unit-test-secret')

    expect(serializer.deserialize(JSON.stringify({ layoutMode: 'vertical' }))).toEqual({
      layoutMode: 'vertical',
    })

    warn.mockRestore()
  })

  it('falls back to an empty object for malformed persisted data', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const serializer = createPiniaEncryptedSerializer('unit-test-secret')

    expect(serializer.deserialize('not encrypted or json')).toEqual({})

    warn.mockRestore()
  })
})
