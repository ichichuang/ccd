import { castValue } from '@ccd/shared-utils'
import { PRO_FORM_LOGGER } from '../utils/logger'

export type ProFormDateFormatter = (value: Date | string | number, format: string) => string

export interface ProFormDraftStorageAdapter {
  prefix: string
  getStorage: () => Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> | undefined
  pack: (data: Record<string, unknown>) => string | null
  unpack: (raw: string) => Record<string, unknown> | null
}

let draftStorageAdapter: ProFormDraftStorageAdapter | undefined

export function configureProFormDraftStorage(adapter: ProFormDraftStorageAdapter): void {
  draftStorageAdapter = adapter
}

export function resetProFormDraftStorage(): void {
  draftStorageAdapter = undefined
}

export class DraftStorage {
  private static getStorageKey(key: string): string {
    return `${draftStorageAdapter?.prefix ?? ''}${key}`
  }

  static save(key: string, data: Record<string, unknown>): void {
    const storage = draftStorageAdapter?.getStorage()
    if (!storage || !draftStorageAdapter) return
    try {
      const packed = draftStorageAdapter.pack(data)
      if (!packed) return
      storage.setItem(this.getStorageKey(key), packed)
    } catch (e) {
      PRO_FORM_LOGGER.warn('Failed to save draft', e)
    }
  }

  static load(key: string): Record<string, unknown> | null {
    const storage = draftStorageAdapter?.getStorage()
    if (!storage || !draftStorageAdapter) return null
    try {
      const raw = storage.getItem(this.getStorageKey(key)) ?? ''
      if (!raw) return null

      const unpacked = draftStorageAdapter.unpack(raw)
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
    const storage = draftStorageAdapter?.getStorage()
    if (!storage) return
    storage.removeItem(this.getStorageKey(key))
  }
}
