import { describe, expect, it } from 'vitest'
import type { ZodType } from 'zod'
import {
  buildSystemPreferencesGetMethod,
  buildSystemPreferencesSaveMethod,
} from './preferences.api'

const preferences = {
  theme: { mode: 'dark', theme: 'ocean', accentColor: null },
  size: { size: 'compact' },
  layout: { layout: 'mix', collapsed: true },
  locale: 'en-US',
  updatedAt: 100,
}

describe('system preferences Method builders', () => {
  const getMethodName = 'Get'
  const postMethodName = 'Post'
  const client = {
    [getMethodName]: (_url: string, config: unknown) => ({ type: 'GET', config }),
    [postMethodName]: (_url: string, _data: unknown, config: unknown) => ({ type: 'POST', config }),
  } as never

  it('attaches stable response schemas at the API method boundary', () => {
    const getMethod = buildSystemPreferencesGetMethod(client) as unknown as {
      config: Record<string, unknown>
    }
    const getSchema = getMethod.config.responseSchema as ZodType<unknown>

    expect(getMethod).toMatchObject({ type: 'GET' })
    expect(getSchema.safeParse(preferences).success).toBe(true)
    expect(getSchema.safeParse({ preferences }).success).toBe(true)
    expect(getSchema.safeParse(null).success).toBe(true)
    expect(getSchema.safeParse({ theme: preferences.theme }).success).toBe(false)

    const saveMethod = buildSystemPreferencesSaveMethod(client, { preferences }) as unknown as {
      config: Record<string, unknown>
    }
    const saveSchema = saveMethod.config.responseSchema as ZodType<unknown>

    expect(saveMethod).toMatchObject({ type: 'POST' })
    expect(saveSchema.safeParse(preferences).success).toBe(true)
    expect(saveSchema.safeParse({ preferences }).success).toBe(true)
    expect(saveSchema.safeParse(null).success).toBe(false)
  })
})
