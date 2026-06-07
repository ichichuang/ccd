import type { NetworkRequest } from '@ccd/core'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const invokeMock = vi.hoisted(() => vi.fn())

vi.mock('@tauri-apps/api/core', () => ({
  invoke: invokeMock,
}))

import { desktopAdapters } from './index'

describe('desktop IPC adapters', () => {
  beforeEach(() => {
    invokeMock.mockReset()
  })

  it('routes storage calls through typed IPC commands', async () => {
    invokeMock.mockResolvedValueOnce(null)

    await expect(desktopAdapters.storage.get('session')).resolves.toBeNull()

    expect(invokeMock).toHaveBeenCalledWith('storage_get', { key: 'session' })
  })

  it('rejects malformed storage payloads before invoking Tauri', () => {
    expect(() => desktopAdapters.storage.get('')).toThrow('[DesktopIPC] storage_get.key')
    expect(invokeMock).not.toHaveBeenCalled()
  })

  it('validates HTTP IPC payloads before invoking Tauri', async () => {
    const response = { status: 200, data: { ok: true }, headers: {} }
    invokeMock.mockResolvedValueOnce(response)

    await expect(
      desktopAdapters.network.request({
        method: 'GET',
        url: 'https://example.test/api',
        headers: { Accept: 'application/json' },
      })
    ).resolves.toEqual(response)

    expect(invokeMock).toHaveBeenCalledWith('http_request', {
      request: {
        method: 'GET',
        url: 'https://example.test/api',
        headers: { Accept: 'application/json' },
      },
    })
  })

  it('rejects unsupported HTTP methods before invoking Tauri', () => {
    const request = {
      method: 'TRACE',
      url: 'https://example.test/api',
    } as unknown as NetworkRequest

    expect(() => desktopAdapters.network.request(request)).toThrow(
      '[DesktopIPC] http_request.request.method is unsupported: TRACE'
    )
    expect(invokeMock).not.toHaveBeenCalled()
  })
})
