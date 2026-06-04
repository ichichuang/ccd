import { z } from 'zod'

export type {
  SystemPreferenceEnvelope,
  SystemPreferencePayload,
  SystemPreferences,
  SystemPreferenceSyncType,
} from '@ccd/contracts'

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
