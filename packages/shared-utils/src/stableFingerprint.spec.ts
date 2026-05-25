import { describe, expect, it } from 'vitest'
import { fnv1a, stableSerializeRecord } from './stableFingerprint'

describe('stableFingerprint', () => {
  it('sorts keys deterministically', () => {
    expect(stableSerializeRecord({ b: '2', a: '1' })).toBe('a:1|b:2')
  })

  it('preserves string values exactly without JSON escaping changes', () => {
    expect(stableSerializeRecord({ quote: 'a"b', newline: 'a\nb' })).toBe('newline:a\nb|quote:a"b')
  })

  it('produces the same output for equivalent records with different insertion order', () => {
    expect(stableSerializeRecord({ b: '2', a: '1' })).toBe(
      stableSerializeRecord({ a: '1', b: '2' })
    )
  })

  it('is deterministic for hashing', () => {
    expect(fnv1a('stable-input')).toBe(fnv1a('stable-input'))
  })

  it('changes hash when input changes', () => {
    expect(fnv1a('stable-input')).not.toBe(fnv1a('stable-input-2'))
  })

  it('keeps the known hash output stable', () => {
    expect(fnv1a('a:1|b:2')).toBe('d060baff')
  })
})
