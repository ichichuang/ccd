import * as Crypto from './crypto'
import * as LZ from './lzstring'

const DEFAULT_SECRET = import.meta.env.VITE_APP_SECRET

/**
 * 核心序列化流程: Object -> JSON -> Compress(Base64) -> Encrypt(AES)
 */
export function packDataSync(value: unknown, secret?: string): string {
  const actualSecret = secret ?? DEFAULT_SECRET
  try {
    const json = JSON.stringify(value)
    if (!json) return ''
    const compressed = LZ.compress(json)
    if (!compressed) return ''
    return Crypto.encryptSync(compressed, actualSecret)
  } catch (e) {
    console.warn('[SafeStorage] Pack failed:', e)
    return ''
  }
}

/**
 * 核心反序列化流程: Decrypt -> Decompress(Base64) -> JSON -> Object
 */
export function unpackDataSync<T>(value: string, secret?: string): T | null {
  const actualSecret = secret ?? DEFAULT_SECRET
  try {
    if (!value) return null
    const decrypted = Crypto.decryptSync(value, actualSecret)
    if (!decrypted) return null
    const decompressed = LZ.decompress(decrypted)
    if (!decompressed) return null
    return JSON.parse(decompressed) as T
  } catch (e) {
    if (import.meta.env.DEV) {
      console.warn('[SafeStorage] Unpack failed:', e)
    }
    return null
  }
}

/**
 * 异步版核心流程
 */
export async function packData(value: unknown, secret?: string): Promise<string> {
  const actualSecret = secret ?? DEFAULT_SECRET
  try {
    const json = JSON.stringify(value)
    if (!json) return ''
    const compressed = LZ.compress(json)
    if (!compressed) return ''
    return await Crypto.encrypt(compressed, actualSecret)
  } catch (e) {
    console.warn('[SafeStorage] Async Pack failed:', e)
    return ''
  }
}

export async function unpackData<T>(value: string, secret?: string): Promise<T | null> {
  const actualSecret = secret ?? DEFAULT_SECRET
  try {
    if (!value) return null
    const decrypted = await Crypto.decrypt(value, actualSecret)
    if (!decrypted) return null
    const decompressed = LZ.decompress(decrypted)
    if (!decompressed) return null
    return JSON.parse(decompressed) as T
  } catch (e) {
    if (import.meta.env.DEV) {
      console.warn('[SafeStorage] Async Unpack failed:', e)
    }
    return null
  }
}
