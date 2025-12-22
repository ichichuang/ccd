// @/components/schema-form/hooks/usePersistence.ts
/**
 * 表单持久化 Hook
 * 处理表单值的 localStorage 持久化
 */

import type { Ref } from 'vue'
import type { PersistConfig } from '../utils/types'

export interface UsePersistenceOptions {
  persist: Ref<PersistConfig | boolean | undefined>
}

export interface UsePersistenceReturn {
  persistValues: (values: Record<string, any>) => string
  loadPersistedValues: (persistConfig: PersistConfig) => Record<string, any>
}

/**
 * 加载持久化数据
 */
function loadPersistedValues(persistConfig: PersistConfig): Record<string, any> {
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
  } catch {
    // 忽略 localStorage 错误
  }
  return {}
}

/**
 * 使用表单持久化 Hook
 */
export function usePersistence(options: UsePersistenceOptions): UsePersistenceReturn {
  const { persist } = options

  let persistTimer: NodeJS.Timeout | null = null

  /**
   * 持久化数据（节流）
   */
  function persistValues(values: Record<string, any>): string {
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
      } catch {
        // 忽略 localStorage 错误
      }
    }, 300)

    return ''
  }

  return {
    persistValues,
    loadPersistedValues,
  }
}
