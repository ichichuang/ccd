import { z } from 'zod'

export const systemPreferencesSchema = z.object({
  theme: z.object({
    mode: z.string(),
    theme: z.string(),
    accentColor: z.string().nullable(),
  }),
  size: z.object({
    size: z.string(),
  }),
  layout: z.object({
    layout: z.string(),
    collapsed: z.boolean(),
  }),
  locale: z.string().optional(),
  updatedAt: z.number(),
})

export type SystemPreferences = z.infer<typeof systemPreferencesSchema>

export type SystemPreferenceSyncType =
  | 'theme:update'
  | 'size:update'
  | 'layout:update'
  | 'locale:update'
  | 'preferences:update'

export type SystemPreferencePayload = Partial<SystemPreferences> & {
  updatedAt: number
}

export interface SystemPreferenceEnvelope {
  type: SystemPreferenceSyncType
  payload: SystemPreferencePayload
}
