import {
  buildSystemPreferencesGetMethod,
  buildSystemPreferencesSaveMethod,
  type SystemPreferencesSaveReq,
  systemPreferencesResponseSchema,
  systemPreferencesSaveResponseSchema,
} from '@/api/system/preferences.api'
import { DEMO_MOCK_ENABLED } from '@/constants/mock'
import { useHttpRequest } from '@/hooks/modules/useHttpRequest'
import { useUserStore } from '@/stores/modules/session'
import {
  applyRemoteSystemPreferences,
  readLocalSystemPreferences,
  readSystemPreferencesFromStores,
  setupSystemPreferencesSync,
} from '@/sync/systemPreferences'
import type { SystemPreferences } from '@/types/systems/preferences'
import { castValue } from '@ccd/shared-utils'

export interface UseSystemPreferencesSyncReturn {
  loadUserPreferences: () => Promise<SystemPreferences | null>
  saveUserPreferences: (preferences?: SystemPreferences) => Promise<SystemPreferences | null>
  setupSync: () => void
}

export function useSystemPreferencesSync(): UseSystemPreferencesSyncReturn {
  const userStore = useUserStore()
  const getRequest = useHttpRequest<SystemPreferences | null>(
    client => buildSystemPreferencesGetMethod(client),
    {
      immediate: false,
      globalLoading: false,
      globalError: 'silent',
      responseSchema: systemPreferencesResponseSchema,
    }
  )

  const saveRequest = useHttpRequest<SystemPreferences>(
    (client, payload) =>
      buildSystemPreferencesSaveMethod(client, castValue<SystemPreferencesSaveReq>(payload)),
    {
      immediate: false,
      globalLoading: false,
      globalError: 'silent',
      responseSchema: systemPreferencesSaveResponseSchema,
    }
  )

  const loadUserPreferences = async (): Promise<SystemPreferences | null> => {
    if (!userStore.getToken || DEMO_MOCK_ENABLED) {
      return readLocalSystemPreferences()
    }

    const remotePreferences = await getRequest.send()
    if (!remotePreferences) {
      const localPreferences = readLocalSystemPreferences()
      return localPreferences
    }

    const localPreferences = readLocalSystemPreferences()
    if (!localPreferences || remotePreferences.updatedAt >= localPreferences.updatedAt) {
      applyRemoteSystemPreferences(remotePreferences)
      return remotePreferences
    }

    applyRemoteSystemPreferences(localPreferences)
    return localPreferences
  }

  const saveUserPreferences = async (
    preferences = readSystemPreferencesFromStores()
  ): Promise<SystemPreferences | null> => {
    if (!userStore.getToken || DEMO_MOCK_ENABLED) {
      return preferences
    }

    return saveRequest.send({ preferences })
  }

  const setupSync = (): void => {
    setupSystemPreferencesSync({
      onCloudSave: async preferences => {
        await saveUserPreferences(preferences)
      },
    })
  }

  return {
    loadUserPreferences,
    saveUserPreferences,
    setupSync,
  }
}
