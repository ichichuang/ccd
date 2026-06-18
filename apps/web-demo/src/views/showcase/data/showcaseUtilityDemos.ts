import DateUtils from '@/utils/date'
import { packDataSync, safeStorageCodecs, unpackDataSync } from '@/utils/safeStorage'

export interface UtilityPreviewRow {
  key: string
  labelKey: `showcase.remaining.${string}`
  value: string
}

interface StoragePreviewPayload {
  mode: 'comfortable'
  scope: 'showcase'
  theme: 'system'
}

const SAMPLE_DATE_INPUT = '2026-06-18T09:30:00+08:00'
const SAMPLE_STATE: StoragePreviewPayload = {
  mode: 'comfortable',
  scope: 'showcase',
  theme: 'system',
}

export function createDateUtilsPreviewRows(): UtilityPreviewRow[] {
  return [
    {
      key: 'format',
      labelKey: 'showcase.remaining.utils.dateFormat',
      value: DateUtils.format(SAMPLE_DATE_INPUT, 'YYYY-MM-DD HH:mm'),
    },
    {
      key: 'smart',
      labelKey: 'showcase.remaining.utils.dateSmart',
      value: DateUtils.formatSmart(SAMPLE_DATE_INPUT, 'system'),
    },
    {
      key: 'working',
      labelKey: 'showcase.remaining.utils.workingDay',
      value: DateUtils.isWorkingDay(SAMPLE_DATE_INPUT) ? 'true' : 'false',
    },
  ]
}

export function createSafeStoragePreviewRows(): UtilityPreviewRow[] {
  const encoded = packDataSync(SAMPLE_STATE)
  const decoded = unpackDataSync<StoragePreviewPayload>(encoded)

  return [
    {
      key: 'encoded',
      labelKey: 'showcase.remaining.utils.encodedLength',
      value: String(encoded.length),
    },
    {
      key: 'decoded',
      labelKey: 'showcase.remaining.utils.decodedScope',
      value: decoded?.scope ?? 'none',
    },
    {
      key: 'mode',
      labelKey: 'showcase.remaining.utils.decodedMode',
      value: decoded?.mode ?? 'none',
    },
  ]
}

export function createStatePersistencePreviewRows(): UtilityPreviewRow[] {
  const encoded = safeStorageCodecs.sync.encode(SAMPLE_STATE)
  const decoded = safeStorageCodecs.sync.decode(encoded)
  const restored = typeof decoded === 'object' && decoded !== null ? decoded : {}

  return [
    {
      key: 'codec',
      labelKey: 'showcase.remaining.utils.codec',
      value: encoded.length > 0 ? 'safeStorageCodecs.sync' : 'none',
    },
    {
      key: 'theme',
      labelKey: 'showcase.remaining.utils.restoredTheme',
      value: 'theme' in restored && typeof restored.theme === 'string' ? restored.theme : 'none',
    },
    {
      key: 'scope',
      labelKey: 'showcase.remaining.utils.restoredScope',
      value: 'scope' in restored && typeof restored.scope === 'string' ? restored.scope : 'none',
    },
  ]
}
