import type { SystemPreferencePayload } from '@/types/systems/preferences'
import { castValue } from '@/utils/typeCasters'

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object'
}

function getUpdatedAt(record: Record<string, unknown>): number | null {
  return typeof record.updatedAt === 'number' ? record.updatedAt : null
}

export function sanitizePreferencesPayload(payload: unknown): SystemPreferencePayload | null {
  if (!isRecord(payload)) return null
  const updatedAt = getUpdatedAt(payload)
  if (updatedAt === null) return null
  return {
    ...castValue<Partial<SystemPreferencePayload>>(payload),
    updatedAt,
  }
}

export function sanitizeThemePayload(payload: unknown): SystemPreferencePayload | null {
  if (!isRecord(payload)) return null
  const updatedAt = getUpdatedAt(payload)
  if (updatedAt === null || !isRecord(payload.theme)) return null
  return {
    theme: castValue<SystemPreferencePayload['theme']>(payload.theme),
    updatedAt,
  }
}

export function sanitizeSizePayload(payload: unknown): SystemPreferencePayload | null {
  if (!isRecord(payload)) return null
  const updatedAt = getUpdatedAt(payload)
  if (updatedAt === null || !isRecord(payload.size)) return null
  return {
    size: castValue<SystemPreferencePayload['size']>(payload.size),
    updatedAt,
  }
}

export function sanitizeLayoutPayload(payload: unknown): SystemPreferencePayload | null {
  if (!isRecord(payload)) return null
  const updatedAt = getUpdatedAt(payload)
  if (updatedAt === null || !isRecord(payload.layout)) return null
  return {
    layout: castValue<SystemPreferencePayload['layout']>(payload.layout),
    updatedAt,
  }
}

export function sanitizeLocalePayload(payload: unknown): SystemPreferencePayload | null {
  if (!isRecord(payload)) return null
  const updatedAt = getUpdatedAt(payload)
  if (updatedAt === null || typeof payload.locale !== 'string') return null
  return {
    locale: payload.locale,
    updatedAt,
  }
}

export function sanitizeSystemPreferencePayload(
  type: string,
  payload: unknown
): SystemPreferencePayload | null {
  if (type === 'theme:update') return sanitizeThemePayload(payload)
  if (type === 'size:update') return sanitizeSizePayload(payload)
  if (type === 'layout:update') return sanitizeLayoutPayload(payload)
  if (type === 'locale:update') return sanitizeLocalePayload(payload)
  if (type === 'preferences:update') return sanitizePreferencesPayload(payload)
  return null
}
