import { packDataSync, unpackDataSync } from '@/utils/safeStorage'
import { PRO_FORM_LOGGER } from '../utils/logger'

export class DraftStorage {
  private static PREFIX = 'pro-form-draft:'

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

      return JSON.parse(raw) as Record<string, unknown>
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
