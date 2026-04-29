import { afterEach, describe, expect, it, vi } from 'vitest'
import { DraftStorage } from './DraftStorage'

const storage = new Map<string, string>()

function installLocalStorage(): void {
  storage.clear()
  vi.stubGlobal('window', {
    localStorage: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => {
        storage.set(key, value)
      },
      removeItem: (key: string) => {
        storage.delete(key)
      },
    },
  })
}

afterEach(() => {
  vi.unstubAllGlobals()
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
