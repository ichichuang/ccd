export type StorageKeyPredicate = (key: string) => boolean

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
