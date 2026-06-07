import type { alovaInstance } from '@/utils/http/instance'
import type { RequestConfig } from '@/utils/http/types'
import type { SystemPreferences } from '@ccd/contracts'
import { systemPreferencesSchema } from '@/types/systems/preferences'
import { z } from 'zod'

export interface SystemPreferencesGetReq {
  userId?: string
}

export interface SystemPreferencesSaveReq {
  preferences: SystemPreferences
}

export type SystemPreferencesDTO = SystemPreferences

export type SystemPreferencesGetRes = SystemPreferencesDTO | null

export type SystemPreferencesSaveRes = SystemPreferencesDTO

const USER_PREFERENCES_URL = '/user/preferences'

const systemPreferencesEnvelopeSchema = z
  .object({
    preferences: systemPreferencesSchema,
  })
  .transform(value => value.preferences)

export const systemPreferencesResponseSchema = z
  .union([systemPreferencesSchema, systemPreferencesEnvelopeSchema])
  .nullable()
export const systemPreferencesSaveResponseSchema = z.union([
  systemPreferencesSchema,
  systemPreferencesEnvelopeSchema,
])

export const buildSystemPreferencesGetMethod = (client: typeof alovaInstance) => {
  const requestConfig: RequestConfig<SystemPreferencesGetRes> = {
    responseSchema: systemPreferencesResponseSchema,
  }
  return client.Get<SystemPreferencesGetRes>(USER_PREFERENCES_URL, requestConfig)
}

export const buildSystemPreferencesSaveMethod = (
  client: typeof alovaInstance,
  data: SystemPreferencesSaveReq
) => {
  const requestConfig: RequestConfig<SystemPreferencesSaveRes> = {
    responseSchema: systemPreferencesSaveResponseSchema,
  }
  return client.Post<SystemPreferencesSaveRes>(USER_PREFERENCES_URL, data, requestConfig)
}
