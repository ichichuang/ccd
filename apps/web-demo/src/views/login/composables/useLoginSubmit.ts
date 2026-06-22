import type { Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useLoading } from '@/hooks/layout/useLoading'
import { useAuth } from '@/hooks/modules/useAuth'
import type { LoginParams } from '@/types/dto/auth.dto'

export interface UseLoginSubmitReturn {
  loading: Ref<boolean>
  submitLogin: (values: Record<string, unknown>, onFailure?: () => void) => Promise<void>
}

function readObjectProperty(source: unknown, key: string): unknown {
  if (typeof source !== 'object' || source === null) return undefined
  if (!Reflect.has(source, key)) return undefined
  return Reflect.get(source, key)
}

function readTrimmedStringProperty(source: unknown, key: string): string {
  const value = readObjectProperty(source, key)
  return typeof value === 'string' && value.trim().length > 0 ? value : ''
}

function getErrorMessage(error: unknown): string {
  const maybeMessage = readTrimmedStringProperty(error, 'message')
  if (maybeMessage) return maybeMessage

  const maybeData = readObjectProperty(error, 'data')
  return readTrimmedStringProperty(maybeData, 'message')
}

function buildPayload(values: Record<string, unknown>): LoginParams {
  const username = typeof values.username === 'string' ? values.username.trim() : ''
  const password = typeof values.password === 'string' ? values.password : ''
  return { username, password }
}

function isLoginPath(path: string): boolean {
  const normalized = path
    .toLowerCase()
    .replace(/[?#].*$/, '')
    .replace(/\/+$/, '')
  return normalized === '/login'
}

function normalizeLoginRedirect(
  rawRedirect: unknown,
  router: ReturnType<typeof useRouter>
): string {
  // 1. Accept only non-empty string
  if (typeof rawRedirect !== 'string' || rawRedirect.trim().length === 0) {
    return safeLoginFallback()
  }

  const candidate = rawRedirect.trim()

  // 2. Must begin with exactly one forward slash
  if (!candidate.startsWith('/') || candidate.startsWith('//')) {
    return safeLoginFallback()
  }

  // 3. Reject control characters, null, backslashes, protocol-relative, scheme-like
  // eslint-disable-next-line no-control-regex
  if (/[\x00-\x1f\x7f]/.test(candidate)) return safeLoginFallback()
  if (candidate.includes('\\')) return safeLoginFallback()
  if (/^\/\/[^/]/.test(candidate)) return safeLoginFallback()
  if (/^[a-zA-Z][a-zA-Z0-9+\-.]*:/.test(candidate)) return safeLoginFallback()

  // 4. Reject /login and login-loop equivalents
  if (isLoginPath(candidate)) return safeLoginFallback()

  // 5-6. Resolve through Vue Router; reject if only CatchAll matches
  const [pathOnly] = candidate.split(/[?#]/)
  const resolved = router.resolve(pathOnly)

  if (resolved.name === 'CatchAll' || resolved.name === undefined) {
    return safeLoginFallback()
  }

  // 7. Preserve query and hash for accepted internal route
  return candidate
}

function safeLoginFallback(): string {
  const configured = import.meta.env.VITE_ROOT_REDIRECT
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

export function useLoginSubmit(): UseLoginSubmitReturn {
  const loading = ref<boolean>(false)
  const route = useRoute()
  const router = useRouter()
  const { login } = useAuth()
  const { startLoading } = useLoading()
  const { t } = useI18n({ useScope: 'global' })

  async function submitLogin(
    values: Record<string, unknown>,
    onFailure?: () => void
  ): Promise<void> {
    if (loading.value) return

    loading.value = true

    try {
      await login(buildPayload(values))

      const redirectQuery = route.query.redirect
      const redirectPath = normalizeLoginRedirect(redirectQuery, router)
      const stopGlobalLoading = startLoading()

      try {
        await router.replace(redirectPath)
        await nextTick()
      } finally {
        stopGlobalLoading()
      }
    } catch (error) {
      const message = getErrorMessage(error) || t('login.errorMessageGeneric')

      if (window.$toast?.dangerIn) {
        window.$toast.dangerIn('top-center', t('login.errorTitle'), message)
      }

      onFailure?.()
    } finally {
      loading.value = false
    }
  }

  return { loading, submitLogin }
}
