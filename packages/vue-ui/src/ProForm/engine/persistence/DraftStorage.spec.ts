import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  configureProFormDraftStorage,
  DraftStorage,
  resetProFormDraftStorage,
} from './DraftStorage'

const storage = new Map<string, string>()

function installLocalStorage(): void {
  storage.clear()
  configureProFormDraftStorage({
    prefix: 'pro-form-draft:',
    getStorage: () => ({
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => {
        storage.set(key, value)
      },
      removeItem: (key: string) => {
        storage.delete(key)
      },
    }),
    pack: data => JSON.stringify(data),
    unpack: raw => JSON.parse(raw) as Record<string, unknown>,
  })
}

afterEach(() => {
  vi.unstubAllGlobals()
  resetProFormDraftStorage()
  storage.clear()
})

describe('DraftStorage', () => {
  it('saves, loads, and clears encrypted form drafts', () => {
    installLocalStorage()

    DraftStorage.save('profile', { name: 'Ada' })

    expect(DraftStorage.load('profile')).toEqual({ name: 'Ada' })
    DraftStorage.clear('profile')
    expect(DraftStorage.load('profile')).toBeNull()
  })
})
