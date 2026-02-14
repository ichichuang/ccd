// @/components/schema-form/hooks/useFormMemory.ts
/**
 * useFormMemory - 表单记忆功能 Hook
 * @description 负责表单值的持久化存储和恢复（IndexedDB + localStorage 双重缓存）
 */

import { deepClone } from '@/utils/lodashes'
import { ref, type Ref } from 'vue'
import type { SchemaColumnsItem } from '../utils/types'

// ==================== 类型定义 ====================

export interface FormMemoryConfig {
  /** 表单唯一ID（默认基于路由路径+字段签名） */
  formId: string
  /** Schema 列配置 */
  columns: SchemaColumnsItem[]
  /** 是否启用记忆功能 */
  enabled: boolean
}

const PINIA_PREFIX = import.meta.env?.VITE_PINIA_PERSIST_KEY_PREFIX ?? 'ccd'
export const FORM_MEMORY_LOCAL_STORAGE_PREFIX = `${PINIA_PREFIX}-__form_cache__:`

// ==================== 工具函数 ====================

/**
 * 生成安全的存储键名
 */
function toSafeKey(input: string): string {
  try {
    return `schemaform:${btoa(unescape(encodeURIComponent(input)))}`
  } catch {
    return `schemaform:${input}`
  }
}

/**
 * 规范化颜色值（移除 # 前缀）
 */
function normalizeColorValue(value: any): any {
  if (typeof value !== 'string') {
    return value
  }
  return value.replace(/^#/, '').toLowerCase()
}

/**
 * 规范化日期值
 * 对 new Date(input) 调用前做类型收窄，避免对象/数组等导致的 Invalid Date
 */
function normalizeDateValue(value: unknown, format: string): unknown {
  if (value === null || value === undefined || value === '') {
    return null
  }

  const toDate = (x: unknown): Date | null => {
    if (x instanceof Date && !isNaN(x.getTime())) {
      return x
    }
    if (typeof x === 'string' || typeof x === 'number') {
      const d = new Date(x)
      return isNaN(d.getTime()) ? null : d
    }
    return null
  }

  const convert = (input: unknown): unknown => {
    if (input === null || input === undefined || input === '') {
      return null
    }
    try {
      if (format === 'timestamp') {
        if (typeof input === 'number' && isFinite(input) && input > 0) {
          return input
        }
        if (input instanceof Date && !isNaN(input.getTime())) {
          return input.getTime()
        }
        const parsedNumber = Number(input)
        if (!Number.isNaN(parsedNumber) && isFinite(parsedNumber) && parsedNumber > 0) {
          return parsedNumber
        }
        const d = toDate(input)
        if (d) {
          return d.getTime()
        }
      }

      if (format === 'iso' || format === 'string') {
        if (typeof input === 'string') {
          const testDate = new Date(input)
          return isNaN(testDate.getTime()) ? null : input
        }
        const date = input instanceof Date ? input : toDate(input)
        if (date) {
          return date.toISOString()
        }
        return null
      }

      if (input instanceof Date && !isNaN(input.getTime())) {
        return input
      }
      const date = toDate(input)
      return date ?? null
    } catch {
      return null
    }
  }

  if (Array.isArray(value)) {
    return value.map(convert).filter(v => v !== null)
  }

  return convert(value)
}

/**
 * 规范化表单值（处理特殊组件的值）
 */
function normalizeFormValues(
  values: Record<string, any>,
  columns: SchemaColumnsItem[]
): Record<string, any> {
  const normalized = deepClone(values)
  try {
    for (const column of columns) {
      const key = column.field
      const rawVal = normalized[key]
      if (column.component === 'ColorPicker') {
        normalized[key] = normalizeColorValue(rawVal)
      } else if (column.component === 'DatePicker') {
        const valueFormat =
          typeof (column.props as any)?.valueFormat === 'string'
            ? (column.props as any).valueFormat
            : 'timestamp'
        normalized[key] = normalizeDateValue(rawVal, valueFormat)
      }
    }
  } catch {
    /* ignore normalization errors */
  }
  return normalized
}

// ==================== useFormMemory Hook ====================

export interface UseFormMemoryReturn {
  /** 当前存储键名 */
  storageKey: Ref<string | null>
  /** 是否正在恢复数据 */
  isRestoring: Ref<boolean>
  /** 同步读取缓存（用于初始化） */
  loadCacheSyncForInit: () => Record<string, any> | null
  /** 异步加载缓存 */
  loadCacheAsync: () => Promise<Record<string, any> | null>
  /** 保存表单值 */
  saveValues: (values: Record<string, any>) => void
  /** 立即保存表单值 */
  saveValuesImmediate: (values: Record<string, any>) => Promise<void>
  /** 强制落盘（清空节流队列） */
  flush: () => void
}

/**
 * useFormMemory - 表单记忆功能 Hook
 */
export function useFormMemory(config: FormMemoryConfig): UseFormMemoryReturn {
  const { formId, columns, enabled } = config

  // ==================== 响应式状态 ====================
  const storageKey = ref<string | null>(enabled ? toSafeKey(formId) : null)
  const isRestoring = ref(false)

  // ==================== 内部方法 ====================

  /**
   * 获取 localStorage 缓存键名
   */
  function getLocalStorageKey(): string {
    return `${FORM_MEMORY_LOCAL_STORAGE_PREFIX}${storageKey.value}`
  }

  /**
   * 从 localStorage 读取缓存（同步）
   */
  function readLocalStorage(): Record<string, any> | null {
    if (!enabled || !storageKey.value) {
      return null
    }

    try {
      const key = getLocalStorageKey()
      const shadow = localStorage.getItem(key)
      if (!shadow) {
        return null
      }

      const cached = JSON.parse(shadow)
      const cachedValues = cached?.values
      if (!cachedValues || typeof cachedValues !== 'object') {
        return null
      }

      // 规范化缓存值
      const normalized: Record<string, any> = {}
      for (const column of columns) {
        const field = column.field
        if (Object.prototype.hasOwnProperty.call(cachedValues, field)) {
          let value = cachedValues[field]
          if (column.component === 'DatePicker') {
            const valueFormat =
              typeof (column.props as any)?.valueFormat === 'string'
                ? (column.props as any).valueFormat
                : 'timestamp'
            value = normalizeDateValue(value, valueFormat)
          } else if (column.component === 'ColorPicker') {
            value = normalizeColorValue(value)
          }
          normalized[field] = value
        }
      }

      return normalized
    } catch (e) {
      console.error('[useFormMemory] localStorage read error:', e)
      return null
    }
  }

  /**
   * 写入 localStorage 缓存（同步）
   */
  function writeLocalStorage(values: Record<string, any>): void {
    if (!enabled || !storageKey.value) {
      return
    }

    try {
      const key = getLocalStorageKey()
      const normalized = normalizeFormValues(values, columns)
      if (Object.keys(normalized).length === 0) {
        localStorage.removeItem(key)
        return
      }
      localStorage.setItem(key, JSON.stringify({ values: normalized, t: Date.now() }))
    } catch {
      /* ignore localStorage errors */
    }
  }

  // ==================== 对外方法 ====================

  /**
   * 同步读取缓存（用于初始化）
   * @description 在组件 setup 阶段调用，确保 Form 初始计算即可拿到默认值
   */
  function loadCacheSyncForInit(): Record<string, any> | null {
    return readLocalStorage()
  }

  /**
   * 异步加载缓存
   * @description 在组件 mounted 后调用，优先使用 IndexedDB，降级到 localStorage
   */
  async function loadCacheAsync(): Promise<Record<string, any> | null> {
    if (!enabled) {
      return null
    }

    isRestoring.value = true

    try {
      return readLocalStorage()
    } finally {
      isRestoring.value = false
    }
  }

  /**
   * 保存表单值（节流）
   * @description 立即写入 localStorage
   */
  function saveValues(values: Record<string, any>): void {
    if (!enabled || isRestoring.value) {
      return
    }

    writeLocalStorage(values)
  }

  /**
   * 立即保存表单值
   * @description 同步写入 localStorage
   */
  async function saveValuesImmediate(values: Record<string, any>): Promise<void> {
    if (!enabled) {
      return
    }

    writeLocalStorage(values)
  }

  /**
   * 强制落盘（清空节流队列）
   * @description 在组件卸载或页面关闭时调用
   */
  function flush(): void {
    // no-op (localStorage already written synchronously)
  }

  return {
    storageKey,
    isRestoring,
    loadCacheSyncForInit,
    loadCacheAsync,
    saveValues,
    saveValuesImmediate,
    flush,
  }
}
