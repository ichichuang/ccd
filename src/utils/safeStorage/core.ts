import * as Crypto from './crypto'
import * as LZ from './lzstring'

/**
 * 混淆密钥策略（三级降级）：
 * 1. 优先使用构建时注入的 VITE_APP_SECRET（CI/CD 环境变量）
 * 2. 若为空，使用基于部署环境的运行时指纹（origin + UA 片段）
 * 3. 兜底硬编码值（仅保证不崩溃，安全性最低）
 *
 * ⚠️ 前端加密本质是混淆，非真正安全。此设计仅防止 localStorage 裸奔。
 */
function resolveObfuscationKey(): string {
  const injected = import.meta.env.VITE_APP_SECRET
  if (injected && injected !== '${VITE_APP_SECRET:-}') return injected
  // 运行时指纹：基于 origin 生成，同源同密钥，跨域不同密钥
  if (typeof window !== 'undefined') return `obfs:${window.location.origin}:v1`
  return 'ccd-fallback-key'
}

const DEFAULT_SECRET: string = resolveObfuscationKey()

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
