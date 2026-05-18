import { packDataSync, unpackDataSync } from '@/utils/safeStorage'
import { castValue } from '@/utils/typeCasters'
import { PRO_FORM_LOGGER } from '../utils/logger'
import { PRO_FORM_STORAGE_PREFIXES } from '@/constants/runtime'

export class DraftStorage {
  private static PREFIX = PRO_FORM_STORAGE_PREFIXES.draft

  private static getStorageKey(key: string): string {
    return this.PREFIX + key
  }

  static save(key: string, data: Record<string, unknown>): void {
    if (typeof window === 'undefined') return
    try {
      const packed = packDataSync(data, import.meta.env.VITE_APP_SECRET)
      if (!packed) return
      window.localStorage.setItem(this.getStorageKey(key), packed)
    } catch (e) {
      PRO_FORM_LOGGER.warn('Failed to save draft', e)
    }
  }

  static load(key: string): Record<string, unknown> | null {
    if (typeof window === 'undefined') return null
    try {
      const raw = window.localStorage.getItem(this.getStorageKey(key)) ?? ''
      if (!raw) return null

      const unpacked = unpackDataSync<Record<string, unknown>>(raw, import.meta.env.VITE_APP_SECRET)
      if (unpacked !== null) {
        return unpacked
      }

      return castValue<Record<string, unknown>>(JSON.parse(raw))
    } catch (e) {
      PRO_FORM_LOGGER.warn('Failed to load draft', e)
      return null
    }
  }

  static clear(key: string): void {
    if (typeof window === 'undefined') return
    window.localStorage.removeItem(this.getStorageKey(key))
  }
}
