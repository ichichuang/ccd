import { describe, expect, it } from 'vitest'
import { applyUniqueRoot, areExpandedKeyRecordsEqual, isRecord, toRecord } from './recordGuards'

describe('recordGuards', () => {
  it('detects plain records', () => {
    expect(isRecord({ a: 1 })).toBe(true)
    expect(isRecord(null)).toBe(false)
    expect(isRecord([1, 2, 3])).toBe(false)
  })

  it('normalizes map and nullish values to records', () => {
    expect(toRecord(null)).toEqual({})
    expect(toRecord(undefined)).toEqual({})
    expect(toRecord(new Map([['/dashboard', true]]))).toEqual({ '/dashboard': true })
  })

  it('applies unique root expansion', () => {
    expect(
      applyUniqueRoot(
        {
          '/dashboard': true,
          '/example': true,
          '/example/hooks': true,
        },
        ['/dashboard', '/example'],
        '/example'
      )
    ).toEqual({
      '/dashboard': false,
      '/example': true,
      '/example/hooks': true,
    })
  })

  it('compares expanded key records by keys and values', () => {
    expect(areExpandedKeyRecordsEqual({ a: true }, { a: true })).toBe(true)
    expect(areExpandedKeyRecordsEqual({ a: true }, { a: false })).toBe(false)
    expect(areExpandedKeyRecordsEqual({ a: true }, { a: true, b: false })).toBe(false)
  })
})
