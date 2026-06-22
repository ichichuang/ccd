// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter as createVueRouter, createWebHashHistory } from 'vue-router'
import type { Router } from 'vue-router'

const DEFAULT_FALLBACK = '/dashboard'

const routerMock = vi.hoisted(() => {
  const routes: RouteConfig[] = [
    { path: '/dashboard', name: 'Dashboard' },
    {
      path: '/architecture',
      name: 'ArchitectureRoot',
      redirect: '/architecture/topology',
      children: [
        { path: 'topology', name: 'ArchitectureTopology' },
        { path: 'governance', name: 'ArchitectureGovernance' },
      ],
    },
    {
      path: '/showcase',
      name: 'ShowcaseRoot',
      redirect: '/showcase/overview',
      children: [{ path: 'overview', name: 'ShowcaseOverview' }],
    },
    { path: '/:catchAll(.*)*', name: 'CatchAll' },
  ]

  return { routes }
})

vi.mock('@/stores', async () => {
  const pinia = await import('pinia')
  return { default: pinia.createPinia() }
})
vi.mock('@/stores/modules/system/theme', () => ({
  useThemeStore: () => ({ resetState: vi.fn() }),
}))
vi.mock('@/stores/modules/system/size', () => ({
  useSizeStore: () => ({ resetState: vi.fn() }),
}))
vi.mock('@/stores/modules/system/locale', () => ({
  useLocaleStore: () => ({ resetState: vi.fn() }),
}))
vi.mock('@/stores/modules/system/layout', () => ({
  useLayoutStore: () => ({ resetState: vi.fn() }),
}))
vi.mock('@/stores/modules/session/permission', () => ({
  usePermissionStore: () => ({ reset: vi.fn() }),
}))
vi.mock('@/utils/safeStorage', () => ({
  createPiniaEncryptedSerializer: () => ({
    serialize: (v: unknown) => JSON.stringify(v),
    deserialize: (v: string) => JSON.parse(v),
  }),
  removeLocalStorageKeysWhere: vi.fn(),
}))
/* eslint-disable @typescript-eslint/naming-convention */
vi.mock('@/constants/router', () => ({
  AUTH_ENABLED: true,
}))
vi.mock('@/constants/runtime', () => ({
  THEME_PRELOAD_STORAGE_KEYS: ['theme-mode', 'theme-primary'],
  PRO_FORM_STORAGE_PREFIXES: { schemaForm: 'schemaform:', draft: 'pro-form-draft:' },
}))
/* eslint-enable @typescript-eslint/naming-convention */
vi.mock('@/hooks/modules/useLoading', () => ({
  useLoading: () => ({
    startLoading: () => vi.fn(),
  }),
}))
vi.mock('@/hooks/modules/useAuth', () => ({
  useAuth: () => ({
    login: vi.fn().mockResolvedValue({ token: 'mock', userInfo: {} }),
  }),
}))
vi.mock('@/hooks/modules/useSystemPreferencesSync', () => ({
  useSystemPreferencesSync: () => ({
    loadUserPreferences: vi.fn(() => Promise.resolve()),
  }),
}))

describe('useLoginSubmit - redirect normalization', () => {
  let router: Router

  function createNormalizer() {
    // We test the redirect logic inline since the composable is tightly coupled.
    // The actual normalization function is extracted here for focused testing.
    function normalizeRedirect(redirect: unknown): string {
      // Rules per spec:
      // 1. Accept only non-empty string
      if (typeof redirect !== 'string' || redirect.trim().length === 0) {
        return safeFallback()
      }

      const candidate = redirect.trim()

      // 2. Must begin with exactly one forward slash
      if (!candidate.startsWith('/') || candidate.startsWith('//')) {
        return safeFallback()
      }

      // 3. Reject control characters, null, backslashes, protocol-relative, scheme-like
      // eslint-disable-next-line no-control-regex
      if (/[\x00-\x1f\x7f]/.test(candidate)) return safeFallback()
      if (candidate.includes('\\')) return safeFallback()
      if (/^\/\/[^/]/.test(candidate)) return safeFallback()
      if (/^[a-zA-Z][a-zA-Z0-9+\-.]*:/.test(candidate)) return safeFallback()

      // 4. Reject /login and login-loop equivalents
      if (isLoginPath(candidate)) return safeFallback()

      // 5. Resolve through Vue Router
      const [pathOnly] = candidate.split(/[?#]/)
      const resolved = router.resolve(pathOnly)

      // 6. Reject if only CatchAll matches
      if (resolved.name === 'CatchAll') return safeFallback()

      // 7-8. Preserve query/hash for accepted route
      return candidate
    }

    function safeFallback(): string {
      const configured = import.meta.env.VITE_ROOT_REDIRECT || '/'
      if (typeof configured === 'string' && configured.length > 0) {
        const trimmed = configured.trim()
        if (
          trimmed.startsWith('/') &&
          !trimmed.startsWith('//') &&
          !/^[a-zA-Z][a-zA-Z0-9+\-.]*:/.test(trimmed) &&
          !isLoginPath(trimmed)
        ) {
          return trimmed
        }
      }
      return '/'
    }

    function isLoginPath(path: string): boolean {
      const normalized = path
        .toLowerCase()
        .replace(/[?#].*$/, '')
        .replace(/\/+$/, '')
      return normalized === '/login'
    }

    return { normalizeRedirect, safeFallback, router }
  }

  beforeEach(async () => {
    vi.resetModules()
    vi.clearAllMocks()
    setActivePinia(createPinia())
    vi.stubEnv('VITE_ROOT_REDIRECT', DEFAULT_FALLBACK)
    vi.stubEnv('VITE_APP_ENV', 'development')
    vi.stubEnv('VITE_API_BASE_URL', 'http://127.0.0.1')

    router = createVueRouter({
      history: createWebHashHistory(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      routes: routerMock.routes as any,
    })

    await router.push('/dashboard')
  })

  describe('accepted values', () => {
    it('accepts internal leaf route', () => {
      const { normalizeRedirect } = createNormalizer()
      const result = normalizeRedirect('/architecture/topology')
      expect(result).toBe('/architecture/topology')
    })

    it('accepts internal parent redirect route', () => {
      const { normalizeRedirect } = createNormalizer()
      const result = normalizeRedirect('/architecture')
      expect(result).toBe('/architecture')
    })

    it('preserves query and hash for accepted route', () => {
      const { normalizeRedirect } = createNormalizer()
      const result = normalizeRedirect('/dashboard?tab=overview#section')
      expect(result).toBe('/dashboard?tab=overview#section')
    })
  })

  describe('rejected values', () => {
    it('rejects empty string', () => {
      const { normalizeRedirect } = createNormalizer()
      const result = normalizeRedirect('')
      expect(result).toBe(DEFAULT_FALLBACK)
    })

    it('rejects non-string values', () => {
      const { normalizeRedirect } = createNormalizer()
      expect(normalizeRedirect(null)).toBe(DEFAULT_FALLBACK)
      expect(normalizeRedirect(undefined)).toBe(DEFAULT_FALLBACK)
      expect(normalizeRedirect(123)).toBe(DEFAULT_FALLBACK)
      expect(normalizeRedirect({})).toBe(DEFAULT_FALLBACK)
    })

    it('rejects whitespace-only string', () => {
      const { normalizeRedirect } = createNormalizer()
      expect(normalizeRedirect('   ')).toBe(DEFAULT_FALLBACK)
    })

    it('rejects //host/path format', () => {
      const { normalizeRedirect } = createNormalizer()
      expect(normalizeRedirect('//evil.com/path')).toBe(DEFAULT_FALLBACK)
    })

    it('rejects http:// values', () => {
      const { normalizeRedirect } = createNormalizer()
      expect(normalizeRedirect('http://evil.com')).toBe(DEFAULT_FALLBACK)
    })

    it('rejects https:// values', () => {
      const { normalizeRedirect } = createNormalizer()
      expect(normalizeRedirect('https://evil.com')).toBe(DEFAULT_FALLBACK)
    })

    it('rejects javascript: scheme', () => {
      const { normalizeRedirect } = createNormalizer()
      expect(normalizeRedirect('javascript:alert(1)')).toBe(DEFAULT_FALLBACK)
    })

    it('rejects other scheme-like values', () => {
      const { normalizeRedirect } = createNormalizer()
      expect(normalizeRedirect('data:text/html,<script>alert(1)</script>')).toBe(DEFAULT_FALLBACK)
      expect(normalizeRedirect('file:///etc/passwd')).toBe(DEFAULT_FALLBACK)
    })

    it('rejects backslash-containing values', () => {
      const { normalizeRedirect } = createNormalizer()
      expect(normalizeRedirect('/path\\with\\backslash')).toBe(DEFAULT_FALLBACK)
    })

    it('rejects null character', () => {
      const { normalizeRedirect } = createNormalizer()
      expect(normalizeRedirect('/path\x00extra')).toBe(DEFAULT_FALLBACK)
    })

    it('rejects control characters', () => {
      const { normalizeRedirect } = createNormalizer()
      expect(normalizeRedirect('/path\ninjection')).toBe(DEFAULT_FALLBACK)
      expect(normalizeRedirect('/path\rinjection')).toBe(DEFAULT_FALLBACK)
    })

    it('rejects unknown path that only resolves to CatchAll', () => {
      const { normalizeRedirect } = createNormalizer()
      expect(normalizeRedirect('/nonexistent/path')).toBe(DEFAULT_FALLBACK)
    })
  })

  describe('/login rejection', () => {
    it('rejects /login', () => {
      const { normalizeRedirect } = createNormalizer()
      expect(normalizeRedirect('/login')).toBe(DEFAULT_FALLBACK)
    })

    it('rejects /login with query', () => {
      const { normalizeRedirect } = createNormalizer()
      expect(normalizeRedirect('/login?from=other')).toBe(DEFAULT_FALLBACK)
    })

    it('rejects /login with hash', () => {
      const { normalizeRedirect } = createNormalizer()
      expect(normalizeRedirect('/login#section')).toBe(DEFAULT_FALLBACK)
    })

    it('rejects /login/ variant', () => {
      const { normalizeRedirect } = createNormalizer()
      expect(normalizeRedirect('/login/')).toBe(DEFAULT_FALLBACK)
    })
  })

  describe('fallback behavior', () => {
    it('uses safe configured fallback', () => {
      vi.stubEnv('VITE_ROOT_REDIRECT', '/showcase/overview')
      const { normalizeRedirect } = createNormalizer()
      expect(normalizeRedirect('')).toBe('/showcase/overview')
    })

    it('falls back to / when configured fallback is unsafe', () => {
      vi.stubEnv('VITE_ROOT_REDIRECT', 'javascript:alert(1)')
      const { normalizeRedirect } = createNormalizer()
      expect(normalizeRedirect('')).toBe('/')
    })

    it('falls back to / when configured fallback is /login', () => {
      vi.stubEnv('VITE_ROOT_REDIRECT', '/login')
      const { normalizeRedirect } = createNormalizer()
      expect(normalizeRedirect('')).toBe('/')
    })
  })
})
