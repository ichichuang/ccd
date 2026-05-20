import { describe, it, expect } from 'vitest'
import { castArray, castRecord, castValue } from './typeCasters'

describe('Type Casters (Anti-Corruption Layer)', () => {
  it('castValue should return the exact same value', () => {
    const input = { a: 1 }
    expect(castValue(input)).toBe(input)
  })

  it('castRecord should return the object unchanged', () => {
    const input = { name: 'test' }
    expect(castRecord(input)).toEqual(input)
  })

  it('castArray should return the array unchanged', () => {
    const input = [1, 2, 3]
    expect(castArray(input)).toEqual(input)
  })
})
