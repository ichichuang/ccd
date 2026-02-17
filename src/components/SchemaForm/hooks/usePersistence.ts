// @/components/SchemaForm/hooks/usePersistence.ts
/**
 * 表单持久化 Hook
 * 处理表单值的 localStorage 持久化
 */

import type { Ref } from 'vue'
import type { PersistConfig } from '../utils/types'

export interface UsePersistenceOptions {
  persist: Ref<PersistConfig | boolean | undefined>
  /** 读写失败时回调（可选），DEV 下仍会 console.warn */
  onError?: (op: 'read' | 'write', error: unknown) => void
}

export interface UsePersistenceReturn {
  persistValues: (values: Record<string, unknown>) => string
  loadPersistedValues: (persistConfig: PersistConfig) => Record<string, unknown>
}

/**
 * 使用表单持久化 Hook
 */
export function usePersistence(options: UsePersistenceOptions): UsePersistenceReturn {
  const { persist, onError } = options

  const emitError = (op: 'read' | 'write', error: unknown) => {
    if (import.meta.env.DEV) {
      console.warn(`[SchemaForm][persist] localStorage ${op} failed`, error)
    }
    const config = persist.value && typeof persist.value === 'object' ? persist.value : null
    ;(config as PersistConfig | null)?.onError?.(op, error)
    onError?.(op, error)
  }

  let persistTimer: ReturnType<typeof setTimeout> | null = null

  /**
   * 加载持久化数据
   */
  function loadPersistedValues(persistConfig: PersistConfig): Record<string, unknown> {
    try {
      const key = `schemaform:${persistConfig.key}`
      const raw = localStorage.getItem(key)
      if (!raw) {
        return {}
      }

      const item = JSON.parse(raw)
      if (!item.expires || item.expires > Date.now()) {
        return item.values || {}
      }
    } catch (error) {
      persistConfig.onError?.('read', error)
      emitError('read', error)
    }
    return {}
  }

  /**
   * 持久化数据（节流）
   */
  function persistValues(values: Record<string, unknown>): string {
    if (!persist.value || typeof persist.value !== 'object') {
      return ''
    }

    clearTimeout(persistTimer!)
    persistTimer = setTimeout(() => {
      try {
        const persistConfig = persist.value as PersistConfig
        const ttl = persistConfig.ttl ?? 24 * 60 * 60 * 1000
        const key = `schemaform:${persistConfig.key}`
        localStorage.setItem(
          key,
          JSON.stringify({
            values,
            expires: Date.now() + ttl,
          })
        )
      } catch (error) {
        persistConfig.onError?.('write', error)
        emitError('write', error)
      }
    }, 300)

    return ''
  }

  return {
    persistValues,
    loadPersistedValues,
  }
}
