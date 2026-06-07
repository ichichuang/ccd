import type {
  SafeStorageAdapter,
  SafeStorageMaintenanceAdapter,
  SafeStoragePolicy,
  StorageKeyPredicate,
  StorageScope,
} from '@ccd/contracts'

const localSafeStoragePolicy: SafeStoragePolicy = {
  scope: 'local',
  compression: 'lz-string',
  obfuscation: 'client-visible',
  integrity: 'hmac',
  keyVersion: 'v2',
}

function getBrowserStorage(scope: StorageScope): Storage | undefined {
  if (typeof window === 'undefined') return undefined
  if (scope === 'local') return window.localStorage
  if (scope === 'session') return window.sessionStorage
  return undefined
}

export function createBrowserStorageAdapter(policy: SafeStoragePolicy): SafeStorageAdapter {
  return {
    policy,
    async get(key) {
      return getBrowserStorage(policy.scope)?.getItem(key) ?? null
    },
    async set(key, value) {
      getBrowserStorage(policy.scope)?.setItem(key, value)
    },
    async remove(key) {
      getBrowserStorage(policy.scope)?.removeItem(key)
    },
  }
}

export const browserLocalSafeStorageAdapter = createBrowserStorageAdapter(localSafeStoragePolicy)

/**
 * Safe-storage infrastructure boundary for bulk localStorage maintenance.
 * Business modules should pass predicates here instead of scanning/removing
 * native storage keys themselves.
 */
export function removeLocalStorageKeysWhere(shouldRemove: StorageKeyPredicate): string[] {
  if (typeof localStorage === 'undefined') return []

  const keysToRemove = new Set<string>()

  for (let index = localStorage.length - 1; index >= 0; index -= 1) {
    const key = localStorage.key(index)
    if (key && shouldRemove(key)) {
      keysToRemove.add(key)
    }
  }

  keysToRemove.forEach(key => {
    localStorage.removeItem(key)
  })

  return [...keysToRemove]
}

export function writeLocalStorageValue(key: string, value: string): void {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(key, value)
}

export function readLocalStorageValue(key: string): string | null {
  if (typeof localStorage === 'undefined') return null
  return localStorage.getItem(key)
}

export const browserLocalSafeStorageMaintenance = {
  scope: localSafeStoragePolicy.scope,
  read: readLocalStorageValue,
  write: writeLocalStorageValue,
  removeWhere: removeLocalStorageKeysWhere,
} satisfies SafeStorageMaintenanceAdapter
