import type {
  SystemPreferencePayload,
  SystemPreferenceSyncType,
  SystemPreferences,
} from '@ccd/contracts'
import { describe, expect, it } from 'vitest'
import { sanitizeSystemPreferencePayload } from './guards'

const fullPreferences = {
  theme: { mode: 'dark', theme: 'ocean', accentColor: null },
  size: { size: 'compact' },
  layout: { layout: 'mix', collapsed: true },
  locale: 'en',
  updatedAt: 100,
} satisfies SystemPreferences

function sanitize(
  type: SystemPreferenceSyncType,
  payload: unknown
): SystemPreferencePayload | null {
  return sanitizeSystemPreferencePayload(type, payload)
}

describe('system preference payload guards', () => {
  it('accepts a complete preferences payload with updatedAt', () => {
    expect(sanitize('preferences:update', fullPreferences)).toEqual(fullPreferences)
  })

  it('accepts partial theme, size, layout, and locale payloads with updatedAt', () => {
    expect(
      sanitize('theme:update', {
        theme: fullPreferences.theme,
        updatedAt: 101,
      })
    ).toEqual({ theme: fullPreferences.theme, updatedAt: 101 })
    expect(
      sanitize('size:update', {
        size: fullPreferences.size,
        updatedAt: 102,
      })
    ).toEqual({ size: fullPreferences.size, updatedAt: 102 })
    expect(
      sanitize('layout:update', {
        layout: fullPreferences.layout,
        updatedAt: 103,
      })
    ).toEqual({ layout: fullPreferences.layout, updatedAt: 103 })
    expect(
      sanitize('locale:update', {
        locale: fullPreferences.locale,
        updatedAt: 104,
      })
    ).toEqual({ locale: fullPreferences.locale, updatedAt: 104 })
  })

  it('rejects payloads without numeric updatedAt', () => {
    expect(sanitize('preferences:update', { ...fullPreferences, updatedAt: '100' })).toBeNull()
    expect(sanitize('theme:update', { theme: fullPreferences.theme })).toBeNull()
  })

  it('rejects unknown sync types', () => {
    expect(sanitizeSystemPreferencePayload('unknown:update', fullPreferences)).toBeNull()
  })
})
