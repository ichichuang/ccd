import { describe, expect, it } from 'vitest'
import { safeStorageCodecs } from './core'
import {
  browserLocalSafeStorageAdapter,
  browserLocalSafeStorageMaintenance,
} from './storageMaintenance'

describe('safeStorage app-owned contracts', () => {
  it('exposes app-owned codecs through the shared type-only codec suite contract', () => {
    const encoded = safeStorageCodecs.sync.encode({ ok: true })

    expect(typeof encoded).toBe('string')
    expect(safeStorageCodecs.sync.decode(encoded)).toEqual({ ok: true })
  })

  it('exposes browser maintenance through a typed app-owned adapter contract', () => {
    expect(browserLocalSafeStorageAdapter.policy).toMatchObject({
      scope: 'local',
      compression: 'lz-string',
      obfuscation: 'client-visible',
      integrity: 'hmac',
      keyVersion: 'v2',
    })
    expect(browserLocalSafeStorageMaintenance.scope).toBe('local')
    expect(browserLocalSafeStorageMaintenance.read('missing')).toBeNull()
    expect(browserLocalSafeStorageMaintenance.removeWhere(() => true)).toEqual([])
  })
})
