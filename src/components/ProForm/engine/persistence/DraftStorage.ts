import { packDataSync, unpackDataSync } from '@/utils/safeStorage'
import { PRO_FORM_LOGGER } from '../utils/logger'

export class DraftStorage {
  private static PREFIX = 'pro-form-draft:'

  static save(key: string, data: Record<string, unknown>): void {
    try {
      const packed = packDataSync(data)
      localStorage.setItem(this.PREFIX + key, packed)
    } catch (e) {
      PRO_FORM_LOGGER.warn('Failed to save draft', e)
    }
  }

  static load(key: string): Record<string, unknown> | null {
    try {
      const raw = localStorage.getItem(this.PREFIX + key)
      if (!raw) return null

      // 优先尝试解密（新格式）
      const unpacked = unpackDataSync<Record<string, unknown>>(raw)
      if (unpacked) return unpacked

      // 降级：兼容旧版明文 JSON 草稿
      return JSON.parse(raw) as Record<string, unknown>
    } catch (e) {
      PRO_FORM_LOGGER.warn('Failed to load draft', e)
      return null
    }
  }

  static clear(key: string): void {
    localStorage.removeItem(this.PREFIX + key)
  }
}
