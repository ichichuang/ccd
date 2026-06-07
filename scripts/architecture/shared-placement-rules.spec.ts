import { describe, expect, it } from 'vitest'
import {
  classifyBoundaryImport,
  classifySharedPlacementImport,
  classifyWorkspaceRuntimeImport,
  normalizeImportTarget,
} from './shared-placement-rules.mjs'

describe('shared placement boundary rules', () => {
  it('normalizes web-demo aliases to repository paths', () => {
    expect(
      normalizeImportTarget(
        'apps/web-demo/src/stores/modules/system/theme.ts',
        '@/utils/theme/engine'
      )
    ).toBe('apps/web-demo/src/utils/theme/engine')
    expect(
      normalizeImportTarget('apps/web-demo/src/hooks/modules/useAuth.ts', '@!/auth/auth.api')
    ).toBe('apps/web-demo/src/api/auth/auth.api')
  })

  it('allows web-demo to consume app-owned theme runtime and request runtime', () => {
    expect(
      classifySharedPlacementImport(
        'apps/web-demo/src/stores/modules/system/theme.ts',
        '@/utils/theme/engine'
      )
    ).toMatchObject({ allowed: true, domain: 'theme and design tokens' })
    expect(
      classifySharedPlacementImport('apps/web-demo/build/html.ts', '../src/utils/theme/engine')
    ).toMatchObject({ allowed: true, domain: 'theme and design tokens' })
    expect(
      classifySharedPlacementImport(
        'apps/web-demo/src/hooks/modules/useAuth.ts',
        '@/api/auth/auth.api'
      )
    ).toMatchObject({ allowed: true, domain: 'request runtime and services' })
  })

  it('blocks packages and root tooling from app-local shared-candidate paths', () => {
    expect(
      classifySharedPlacementImport('packages/vue-ui/src/index.ts', '@/utils/theme/engine')
    ).toMatchObject({ allowed: false, owner: '@ccd/design-tokens' })
    expect(
      classifySharedPlacementImport(
        'scripts/architecture/example.mjs',
        '../../apps/web-demo/src/hooks/modules/useLocale'
      )
    ).toMatchObject({ allowed: false, domain: 'Vue composables' })
  })

  it('keeps route, view, store, and plugin surfaces app-local', () => {
    expect(
      classifySharedPlacementImport('apps/web-demo/src/plugins/modules/router.ts', '@/router')
    ).toMatchObject({ allowed: true, domain: 'app-local route surfaces' })
    expect(
      classifySharedPlacementImport(
        'apps/web-demo/src/router/modules/example.ts',
        '@/views/example/index.vue'
      )
    ).toMatchObject({ allowed: true, domain: 'app-local view surfaces' })
    expect(
      classifySharedPlacementImport('apps/web-demo/src/plugins/modules/stores.ts', '@/stores')
    ).toMatchObject({ allowed: true, domain: 'app-local store surfaces' })
    expect(classifySharedPlacementImport('apps/web-demo/src/main.ts', '@/plugins')).toMatchObject({
      allowed: true,
      domain: 'app-local plugin wiring',
    })
    expect(
      classifySharedPlacementImport('packages/vue-ui/src/index.ts', '@/router/utils/helper')
    ).toMatchObject({ allowed: false, owner: 'apps/web-demo/src/router' })
    expect(
      classifySharedPlacementImport(
        'packages/vue-hooks/src/index.ts',
        '@/views/dashboard/index.vue'
      )
    ).toMatchObject({ allowed: false, owner: 'apps/web-demo/src/views' })
    expect(
      classifySharedPlacementImport(
        'packages/vue-app-platform/src/index.ts',
        '@/stores/modules/system'
      )
    ).toMatchObject({ allowed: false, owner: 'apps/web-demo/src/stores' })
    expect(
      classifySharedPlacementImport('packages/vue-ui/src/index.ts', '@/plugins/modules/router')
    ).toMatchObject({ allowed: false, owner: 'apps/web-demo/src/plugins' })
  })

  it('keeps UnoCSS runtime imports inside preset/build ownership paths', () => {
    expect(
      classifyWorkspaceRuntimeImport('packages/unocss-preset/src/index.ts', 'unocss')
    ).toMatchObject({ allowed: true, domain: 'UnoCSS preset runtime' })
    expect(
      classifyWorkspaceRuntimeImport('apps/web-demo/build/plugins.ts', 'unocss/vite')
    ).toMatchObject({ allowed: true, domain: 'UnoCSS preset runtime' })
    expect(
      classifyWorkspaceRuntimeImport('packages/vue-ui/src/index.ts', '@unocss/core')
    ).toMatchObject({ allowed: false, owner: '@ccd/unocss-preset' })
  })

  it('keeps direct request runtime imports inside app-owned HTTP wrappers', () => {
    expect(
      classifyWorkspaceRuntimeImport('apps/web-demo/src/utils/http/instance.ts', 'alova')
    ).toMatchObject({ allowed: true, domain: 'request runtime' })
    expect(
      classifyWorkspaceRuntimeImport(
        'apps/web-demo/src/utils/http/policies/authRefreshPolicy.ts',
        'alova'
      )
    ).toMatchObject({ allowed: true, domain: 'request runtime' })
    expect(
      classifyWorkspaceRuntimeImport(
        'apps/web-demo/src/hooks/modules/useHttpRequest.ts',
        'alova/client'
      )
    ).toMatchObject({ allowed: true, domain: 'request runtime' })
    expect(
      classifyWorkspaceRuntimeImport(
        'apps/web-demo/src/hooks/modules/useHttpRequest.spec.ts',
        'alova/client'
      )
    ).toMatchObject({ allowed: true, domain: 'request runtime' })
    expect(
      classifyWorkspaceRuntimeImport(
        'apps/web-demo/src/hooks/modules/useOtherRequest.ts',
        'alova/client'
      )
    ).toMatchObject({ allowed: false, owner: 'apps/web-demo/src/utils/http' })
    expect(
      classifyWorkspaceRuntimeImport('apps/web-demo/src/views/example/users.vue', 'alova/client')
    ).toMatchObject({ allowed: false, owner: 'apps/web-demo/src/utils/http' })
    expect(classifyBoundaryImport('packages/core/src/index.ts', 'alova')).toMatchObject({
      allowed: false,
      owner: 'apps/web-demo/src/utils/http',
    })
  })

  it('keeps safeStorage crypto and compression runtime app-owned', () => {
    expect(
      classifyWorkspaceRuntimeImport('apps/web-demo/src/utils/safeStorage/crypto.ts', 'crypto-es')
    ).toMatchObject({
      allowed: true,
      domain: 'safeStorage crypto/compression runtime',
    })
    expect(
      classifyWorkspaceRuntimeImport('apps/web-demo/src/utils/safeStorage/lzstring.ts', 'lz-string')
    ).toMatchObject({
      allowed: true,
      domain: 'safeStorage crypto/compression runtime',
    })
    expect(
      classifyWorkspaceRuntimeImport('packages/shared-utils/src/storageCodec.ts', 'lz-string')
    ).toMatchObject({
      allowed: false,
      owner: 'apps/web-demo/src/utils/safeStorage',
    })
    expect(classifyBoundaryImport('packages/core/src/index.ts', 'crypto-es')).toMatchObject({
      allowed: false,
      owner: 'apps/web-demo/src/utils/safeStorage',
    })
  })
})
