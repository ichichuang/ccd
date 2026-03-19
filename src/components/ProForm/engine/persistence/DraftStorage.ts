import { PRO_FORM_LOGGER } from '../utils/logger'

export class DraftStorage {
  private static PREFIX = 'pro-form-draft:'

  static save(key: string, data: Record<string, unknown>): void {
    try {
      localStorage.setItem(this.PREFIX + key, JSON.stringify(data))
    } catch (e) {
      PRO_FORM_LOGGER.warn('Failed to save draft', e)
    }
  }

  static load(key: string): Record<string, unknown> | null {
    try {
      const raw = localStorage.getItem(this.PREFIX + key)
      return raw ? (JSON.parse(raw) as Record<string, unknown>) : null
    } catch (e) {
      PRO_FORM_LOGGER.warn('Failed to load draft', e)
      return null
    }
  }

  static clear(key: string): void {
    localStorage.removeItem(this.PREFIX + key)
  }
}
