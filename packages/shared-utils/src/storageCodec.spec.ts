import { describe, expect, it } from 'vitest'
import { parseJsonStorageValue, stringifyJsonStorageValue } from './storageCodec'

describe('storageCodec', () => {
  it('round-trips JSON-compatible storage values', () => {
    const encoded = stringifyJsonStorageValue({ theme: 'dark', density: 2 })

    expect(encoded).toEqual({ ok: true, value: '{"theme":"dark","density":2}' })
    if (!encoded.ok) return

    expect(parseJsonStorageValue(encoded.value)).toEqual({
      ok: true,
      value: { theme: 'dark', density: 2 },
    })
  })

  it('keeps parse failures explicit instead of throwing', () => {
    const result = parseJsonStorageValue('{')

    expect(result.ok).toBe(false)
  })

  it('reports unserializable values', () => {
    const result = stringifyJsonStorageValue(undefined)

    expect(result.ok).toBe(false)
  })
})
