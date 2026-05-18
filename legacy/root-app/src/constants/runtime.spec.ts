import { describe, expect, it } from 'vitest'
import {
  PRO_FORM_STORAGE_PREFIXES,
  RUNTIME_E2E_EVENTS,
  RUNTIME_QUERY_KEYS,
  RUNTIME_STORAGE_KEYS,
  THEME_PRELOAD_STORAGE_KEYS,
} from './runtime'

describe('runtime bootstrap constants', () => {
  it('keeps theme preload keys derived from runtime storage keys', () => {
    expect(THEME_PRELOAD_STORAGE_KEYS).toEqual([
      RUNTIME_STORAGE_KEYS.themeMode,
      RUNTIME_STORAGE_KEYS.themePrimary,
      RUNTIME_STORAGE_KEYS.themeBackground,
    ])
  })

  it('keeps bootstrap keys unique and scoped', () => {
    const storageKeys = Object.values(RUNTIME_STORAGE_KEYS)
    const queryKeys = Object.values(RUNTIME_QUERY_KEYS)
    const eventNames = Object.values(RUNTIME_E2E_EVENTS)

    expect(new Set(storageKeys).size).toBe(storageKeys.length)
    expect(new Set(queryKeys).size).toBe(queryKeys.length)
    expect(new Set(eventNames).size).toBe(eventNames.length)
    expect(eventNames.every(name => name.startsWith('ccd:'))).toBe(true)
  })

  it('keeps ProForm persistence prefixes non-overlapping', () => {
    const prefixes = Object.values(PRO_FORM_STORAGE_PREFIXES)

    expect(new Set(prefixes).size).toBe(prefixes.length)
    expect(prefixes.every(prefix => prefix.endsWith(':'))).toBe(true)
  })
})
