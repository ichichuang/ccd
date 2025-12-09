// src/composables/useSafeStorage.ts   （推荐放在 composables 目录，和官方保持一致）
import crypto from '@/utils/modules/safeStorage/crypto'
import lzstring from '@/utils/modules/safeStorage/lzstring'
import { ref, watch, type Ref } from 'vue'
import { env } from '../env'

interface SafeStorageRef<T> extends Ref<T> {
  /** 一键清除本地存储并恢复初始值 */
  clear: () => void
}

/**
 * 2025 年全球最强 Vue3 加密持久化存储
 * 自动完成：JSON ↔ 压缩 ↔ AES 加密 ↔ localStorage + 响应式 ref + .clear()
 */
export function useSafeStorage<T>(
  key: string,
  initialValue: T,
  secret: string = env.appSecret
): SafeStorageRef<T> {
  // === 读取 ===
  const read = (): T | null => {
    if (typeof window === 'undefined') {
      return null
    }
    try {
      const raw = localStorage.getItem(key)
      if (!raw) {
        return null
      }

      const decrypted = crypto.decryptSync(raw, secret)
      if (!decrypted) {
        return null
      }

      const decompressed = lzstring.decompress(decrypted)
      if (decompressed === null) {
        return null
      }

      return JSON.parse(decompressed) as T
    } catch {
      return null
    }
  }

  // === 写入 ===
  const write = async (value: T): Promise<void> => {
    if (typeof window === 'undefined') {
      return
    }
    try {
      const json = JSON.stringify(value)
      const compressed = lzstring.compress(json)
      if (!compressed) {
        return
      }

      const encrypted = await crypto.encrypt(compressed, secret)
      if (encrypted) {
        localStorage.setItem(key, encrypted)
      }
    } catch (err) {
      console.warn(`[useSafeStorage] 写入 ${key} 失败`, err)
    }
  }

  // 初始化
  const rawRef = ref<T>(read() ?? initialValue) as Ref<T>

  // 监听写入（防抖）
  let timer: any
  let skipPersist = false
  watch(
    rawRef,
    newVal => {
      if (skipPersist) {
        // 清除场景只复位内存值，不要立即回写
        skipPersist = false
        return
      }
      clearTimeout(timer)
      timer = setTimeout(() => write(newVal), 100)
    },
    { deep: true }
  )

  // 清除方法
  const clear = () => {
    clearTimeout(timer)
    localStorage.removeItem(key)
    skipPersist = true
    rawRef.value = initialValue
  }

  // 给 ref 加上 clear 方法并正确声明类型
  const result = rawRef as SafeStorageRef<T>
  result.clear = clear

  return result
}

/** 同步版本（小数据量专用） */
export function useSafeStorageSync<T>(
  key: string,
  initialValue: T,
  secret: string = env.appSecret
): SafeStorageRef<T> {
  const read = (): T | null => {
    if (typeof window === 'undefined') {
      return null
    }
    try {
      const raw = localStorage.getItem(key)
      if (!raw) {
        return null
      }
      const decrypted = crypto.decryptSync(raw, secret)
      if (!decrypted) {
        return null
      }
      const decompressed = lzstring.decompress(decrypted)
      if (decompressed === null) {
        return null
      }
      return JSON.parse(decompressed) as T
    } catch {
      return null
    }
  }

  const write = (value: T) => {
    if (typeof window === 'undefined') {
      return
    }
    try {
      const json = JSON.stringify(value)
      const compressed = lzstring.compress(json)
      if (!compressed) {
        return
      }
      const encrypted = crypto.encryptSync(compressed, secret)
      if (encrypted) {
        localStorage.setItem(key, encrypted)
      }
    } catch (err) {
      console.warn(`[useSafeStorageSync] 写入 ${key} 失败`, err)
    }
  }

  const rawRef = ref<T>(read() ?? initialValue) as Ref<T>

  let timer: any
  let skipPersist = false
  watch(
    rawRef,
    newVal => {
      if (skipPersist) {
        skipPersist = false
        return
      }
      clearTimeout(timer)
      timer = setTimeout(() => write(newVal), 100)
    },
    { deep: true }
  )

  const clear = () => {
    clearTimeout(timer)
    localStorage.removeItem(key)
    skipPersist = true
    rawRef.value = initialValue
  }

  const result = rawRef as SafeStorageRef<T>
  result.clear = clear

  return result
}
