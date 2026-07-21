export * from '@ccd/design-tokens'

function resolveSizePersistKey(): string {
  const prefix = import.meta.env?.VITE_PINIA_PERSIST_KEY_PREFIX?.trim()
  if (prefix) {
    return `${prefix}-size`
  }

  const nodePrefix =
    typeof process === 'undefined' ? undefined : process.env.VITE_PINIA_PERSIST_KEY_PREFIX?.trim()
  if (nodePrefix) {
    return `${nodePrefix}-size`
  }

  return import.meta.env?.DEV ? 'ccd-storage-dev-size' : 'ccd-storage-size'
}

/** Size Store 持久化 key（app-owned persisted state adapter） */
export const SIZE_PERSIST_KEY = resolveSizePersistKey()
