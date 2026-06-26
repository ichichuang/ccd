import type { NetworkRequest } from '@ccd/core'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const invokeMock = vi.hoisted(() => vi.fn())

vi.mock('@tauri-apps/api/core', () => ({
  invoke: invokeMock,
}))

import { DesktopIpcUnsupportedError, desktopAdapters } from './index'

// One well-formed call per command the TypeScript adapter can emit. Every entry passes
// payload validation, so the deny-by-default capability guard is the only thing that can
// stop it. This list must stay aligned with packages/contracts DesktopIpcCommandMap, the
// Rust handler registry (src-tauri/src/main.rs, currently empty), and the granted
// capabilities (src-tauri/capabilities/default.json, currently `permissions: []`).
const SCAFFOLD_COMMAND_CASES: ReadonlyArray<{ command: string; call: () => unknown }> = [
  { command: 'storage_get', call: () => desktopAdapters.storage.get('session') },
  { command: 'storage_set', call: () => desktopAdapters.storage.set('session', 'value') },
  { command: 'storage_remove', call: () => desktopAdapters.storage.remove('session') },
  { command: 'fs_read_text', call: () => desktopAdapters.filesystem?.readText('/tmp/in.txt') },
  {
    command: 'fs_write_text',
    call: () => desktopAdapters.filesystem?.writeText('/tmp/out.txt', 'body'),
  },
  {
    command: 'http_request',
    call: () =>
      desktopAdapters.network.request({
        method: 'GET',
        url: 'https://example.test/api',
        headers: { Accept: 'application/json' },
      }),
  },
]

describe('desktop IPC adapters', () => {
  beforeEach(() => {
    invokeMock.mockReset()
  })

  describe('payload validation precedes the capability guard', () => {
    it('rejects malformed storage payloads before reaching IPC', () => {
      expect(() => desktopAdapters.storage.get('')).toThrow('[DesktopIPC] storage_get.key')
      expect(invokeMock).not.toHaveBeenCalled()
    })

    it('rejects unsupported HTTP methods before reaching IPC', () => {
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

  describe('deny-by-default scaffold: unimplemented IPC fails explicitly without invoking Tauri', () => {
    it.each(SCAFFOLD_COMMAND_CASES)(
      'blocks $command with a typed unsupported-capability error',
      ({ command, call }) => {
        expect(call).toThrow(DesktopIpcUnsupportedError)
        expect(call).toThrow(`${command} is not implemented`)
        // Critical: the missing command is never sent across the IPC bridge.
        expect(invokeMock).not.toHaveBeenCalled()
      }
    )

    it('reports the offending command name on the typed error', () => {
      try {
        desktopAdapters.storage.set('session', 'value')
        expect.unreachable('storage.set must throw while the desktop backend is a scaffold')
      } catch (error) {
        expect(error).toBeInstanceOf(DesktopIpcUnsupportedError)
        expect((error as DesktopIpcUnsupportedError).command).toBe('storage_set')
      }
      expect(invokeMock).not.toHaveBeenCalled()
    })
  })
})
