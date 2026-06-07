import { describe, expect, it } from 'vitest'
import { validateDesktopSecurity } from './desktop-security-rules.mjs'

function baseInputs() {
  return {
    tauriConfig: {
      app: {
        security: {
          csp: {
            'default-src': ["'self'", 'ipc:', 'http://ipc.localhost'],
            'base-uri': ["'none'"],
            'connect-src': ["'self'", 'ipc:', 'http://ipc.localhost'],
            'frame-ancestors': ["'none'"],
            'object-src': ["'none'"],
            'script-src': ["'self'"],
            'style-src': ["'self'"],
          },
        },
      },
    },
    scopePolicy: {
      defaultDecision: 'deny',
      surfaces: [
        'filesystem',
        'shell',
        'dialog',
        'clipboard',
        'updater',
        'opener',
        'notification',
        'http',
        'external-navigation',
      ].map(surface => ({ surface, enabled: false, allow: [], deny: ['*'] })),
    },
    capabilities: [
      {
        path: 'apps/desktop/src-tauri/capabilities/default.json',
        parsed: {
          identifier: 'default',
          local: true,
          windows: ['main'],
          permissions: [],
        },
      },
    ],
    packageManifest: {
      dependencies: {
        '@tauri-apps/api': '^2.9.1',
      },
    },
    cargoToml: '[dependencies]\ntauri = { version = "2", features = [] }\n',
  }
}

describe('desktop security rules', () => {
  it('accepts the restricted desktop baseline', () => {
    expect(validateDesktopSecurity(baseInputs())).toEqual([])
  })

  it('rejects null or unsafe CSP sources', () => {
    const inputs = baseInputs()
    inputs.tauriConfig.app.security.csp = {
      'default-src': ["'self'"],
      'script-src': ["'self'", "'unsafe-inline'"],
    }

    expect(validateDesktopSecurity(inputs)).toEqual(
      expect.arrayContaining([
        "apps/desktop/src-tauri/tauri.conf.json: script-src must not allow 'unsafe-inline'",
      ])
    )
  })

  it('rejects broad core defaults and plugin permissions without scoped policy', () => {
    const inputs = baseInputs()
    inputs.capabilities[0].parsed.permissions = ['core:default', 'fs:allow-read-text-file']

    expect(validateDesktopSecurity(inputs)).toEqual(
      expect.arrayContaining([
        'apps/desktop/src-tauri/capabilities/default.json: core:default is too broad for the desktop baseline',
        'apps/desktop/src-tauri/capabilities/default.json: fs:allow-read-text-file requires enabled filesystem scope policy before use',
      ])
    )
  })

  it('rejects plugin packages before an enabled scoped policy exists', () => {
    const inputs = baseInputs()
    inputs.packageManifest.dependencies['@tauri-apps/plugin-shell'] = '^2.0.0'
    inputs.cargoToml += 'tauri-plugin-shell = "2"\n'

    expect(validateDesktopSecurity(inputs)).toEqual(
      expect.arrayContaining([
        'apps/desktop/package.json: @tauri-apps/plugin-shell requires enabled shell scope policy before use',
        'apps/desktop/src-tauri/Cargo.toml: tauri-plugin-shell requires enabled shell scope policy before use',
      ])
    )
  })
})
