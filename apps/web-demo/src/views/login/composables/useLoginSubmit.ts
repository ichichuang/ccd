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
      const redirectPath = typeof redirectQuery === 'string' ? redirectQuery : undefined
      const fallbackPath = import.meta.env.VITE_ROOT_REDIRECT || '/'
      const stopGlobalLoading = startLoading()

      try {
        await router.replace(redirectPath || fallbackPath)
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
